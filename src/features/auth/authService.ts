import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserRole as DbUserRole } from '../../types/database';
import type { AuthUser, AppUserRole, SignInPayload, SignUpPayload, AuthResult } from './types';

/**
 * Normalizes PostgreSQL ENUM role to application lowercase role.
 */
export function mapDbRoleToAppRole(dbRole?: string | null): AppUserRole {
  if (!dbRole) return 'student';
  const upper = dbRole.toUpperCase();
  if (upper === 'ADMIN') return 'admin';
  if (upper === 'FACULTY') return 'faculty';
  return 'student';
}

/**
 * Normalizes application lowercase role to PostgreSQL ENUM role.
 */
export function mapAppRoleToDbRole(appRole: AppUserRole): DbUserRole {
  if (appRole === 'admin') return 'ADMIN';
  if (appRole === 'faculty') return 'FACULTY';
  return 'STUDENT';
}

function getDefaultAvatar(role: AppUserRole): string {
  switch (role) {
    case 'admin':
      return '👨‍💼';
    case 'faculty':
      return '👨‍⚕️';
    default:
      return '👩‍🎓';
  }
}

/**
 * Fetches user profile from Supabase `profiles` table and role-specific extension tables.
 * Auto-creates the profile row if missing (self-healing for external auth signups).
 */
export async function fetchUserProfile(
  userId: string,
  userEmail?: string,
  metadata?: Record<string, any>
): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('[authService] Error fetching profile:', error.message);
    }

    if (profile) {
      const appRole = mapDbRoleToAppRole(profile.role);
      let studentId: string | undefined;
      let facultyId: string | undefined;

      if (appRole === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle();
        studentId = student?.id;
      } else if (appRole === 'faculty') {
        const { data: faculty } = await supabase
          .from('faculty')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle();
        facultyId = faculty?.id;
      }

      return {
        id: profile.id,
        name: profile.full_name,
        email: userEmail || metadata?.email || '',
        phone: profile.phone || '',
        role: appRole,
        avatar: profile.avatar_url || getDefaultAvatar(appRole),
        department: metadata?.department,
        status: 'active',
        createdAt: profile.created_at,
        targetExam: metadata?.target_exam || metadata?.targetExam,
        dbRole: profile.role,
        studentId,
        facultyId,
      };
    }

    // Auto-heal profile if row doesn't exist yet
    const rawRole = metadata?.role ? mapDbRoleToAppRole(metadata.role) : 'student';
    const dbRole = mapAppRoleToDbRole(rawRole);
    const fullName = metadata?.full_name || metadata?.name || userEmail?.split('@')[0] || 'Medical User';
    const avatar = metadata?.avatar_url || getDefaultAvatar(rawRole);
    const phone = metadata?.phone || null;

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        phone: phone,
        role: dbRole,
        avatar_url: avatar,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn('[authService] Could not auto-heal profile:', insertError.message);
    }

    // Ensure student or faculty extension table record
    if (rawRole === 'student') {
      await supabase.from('students').upsert({ profile_id: userId }, { onConflict: 'profile_id' });
    } else if (rawRole === 'faculty') {
      await supabase.from('faculty').upsert(
        { profile_id: userId, designation: metadata?.department || 'Faculty' },
        { onConflict: 'profile_id' }
      );
    }

    return {
      id: userId,
      name: fullName,
      email: userEmail || '',
      phone: phone || '',
      role: rawRole,
      avatar: avatar,
      department: metadata?.department,
      status: 'active',
      createdAt: inserted?.created_at || new Date().toISOString(),
      targetExam: metadata?.target_exam || metadata?.targetExam,
      dbRole,
    };
  } catch (err: any) {
    console.error('[authService] Unexpected profile fetch error:', err);
    return null;
  }
}

/**
 * Sign in existing user using email & password against Supabase Auth.
 */
export async function signInUser({ email, password }: SignInPayload): Promise<AuthResult<AuthUser>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase credentials are not configured in your environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to authenticate with Supabase.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No user returned from Supabase Auth.',
      };
    }

    const userProfile = await fetchUserProfile(
      data.user.id,
      data.user.email,
      data.user.user_metadata
    );

    if (!userProfile) {
      return {
        success: false,
        error: 'Failed to retrieve or initialize user profile.',
      };
    }

    return {
      success: true,
      data: userProfile,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unexpected network error during sign-in.',
    };
  }
}

/**
 * Register a new user in Supabase Auth, profiles, and role tables.
 */
export async function signUpUser({
  email,
  password,
  fullName,
  phone,
  role,
  department,
  targetExam,
}: SignUpPayload): Promise<AuthResult<AuthUser>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase credentials are not configured in your environment.',
    };
  }

  try {
    const dbRole = mapAppRoleToDbRole(role);
    const avatar = getDefaultAvatar(role);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone?.trim() || '',
          role: dbRole,
          department: department?.trim() || '',
          target_exam: targetExam || '',
          avatar_url: avatar,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Registration failed in Supabase Auth.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'User creation failed: No user ID returned.',
      };
    }

    // Explicitly write profile record (in case trigger is delayed or not installed)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        role: dbRole,
        avatar_url: avatar,
      });

    if (profileError) {
      console.warn('[authService] Profile upsert notice:', profileError.message);
    }

    // Role-specific records
    if (role === 'student') {
      await supabase.from('students').upsert({ profile_id: data.user.id }, { onConflict: 'profile_id' });
    } else if (role === 'faculty') {
      await supabase.from('faculty').upsert(
        { profile_id: data.user.id, designation: department || 'Faculty' },
        { onConflict: 'profile_id' }
      );
    }

    // Build the user profile
    const userProfile: AuthUser = {
      id: data.user.id,
      name: fullName.trim(),
      email: data.user.email || email.trim(),
      phone: phone?.trim() || '',
      role,
      avatar,
      department,
      status: 'active',
      createdAt: new Date().toISOString(),
      targetExam,
      dbRole,
    };

    return {
      success: true,
      data: userProfile,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unexpected network error during registration.',
    };
  }
}

/**
 * Sign out user and terminate Supabase session.
 */
export async function signOutUser(): Promise<AuthResult<void>> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send password recovery email via Supabase.
 */
export async function resetPassword(email: string): Promise<AuthResult<void>> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is offline.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
