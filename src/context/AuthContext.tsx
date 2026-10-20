import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchUserProfile,
  signInUser,
  signUpUser,
  signOutUser,
  type AuthUser,
  type SignInPayload,
  type SignUpPayload,
  type AuthResult,
} from '../features/auth';
import type { User } from './DataContext';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isViewingAs: boolean;
  viewingAsUser: User | null;
  signIn: (payload: SignInPayload) => Promise<AuthResult<AuthUser>>;
  signUp: (payload: SignUpPayload) => Promise<AuthResult<AuthUser>>;
  signOut: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  startViewingAs: (targetUser: User, reason: string) => void;
  stopViewingAs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingAs, setIsViewingAs] = useState(false);
  const [viewingAsUser, setViewingAsUser] = useState<User | null>(null);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[AuthContext] Session retrieval notice:', error.message);
        }

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );

          if (profile && mounted) {
            setAuthUser(profile);
            const legacyUser: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              password: '',
              role: profile.role,
              avatar: profile.avatar,
              department: profile.department,
              status: profile.status,
              createdAt: profile.createdAt,
              targetExam: profile.targetExam,
            };
            setUser(legacyUser);
            localStorage.setItem('currentUser', JSON.stringify(legacyUser));
          }
        }
      } catch (err) {
        console.error('[AuthContext] Init auth error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await fetchUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata
            );
            if (profile && mounted) {
              setAuthUser(profile);
              const legacyUser: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                password: '',
                role: profile.role,
                avatar: profile.avatar,
                department: profile.department,
                status: profile.status,
                createdAt: profile.createdAt,
                targetExam: profile.targetExam,
              };
              setUser(legacyUser);
              localStorage.setItem('currentUser', JSON.stringify(legacyUser));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setUser(null);
          setIsViewingAs(false);
          setViewingAsUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (payload: SignInPayload): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    try {
      const result = await signInUser(payload);
      if (result.success && result.data) {
        setAuthUser(result.data);
        const legacyUser: User = {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          password: '',
          role: result.data.role,
          avatar: result.data.avatar,
          department: result.data.department,
          status: result.data.status,
          createdAt: result.data.createdAt,
          targetExam: result.data.targetExam,
        };
        setUser(legacyUser);
        localStorage.setItem('currentUser', JSON.stringify(legacyUser));
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (payload: SignUpPayload): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    try {
      const result = await signUpUser(payload);
      if (result.success && result.data) {
        setAuthUser(result.data);
        const legacyUser: User = {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          password: '',
          role: result.data.role,
          avatar: result.data.avatar,
          department: result.data.department,
          status: result.data.status,
          createdAt: result.data.createdAt,
          targetExam: result.data.targetExam,
        };
        setUser(legacyUser);
        localStorage.setItem('currentUser', JSON.stringify(legacyUser));
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setAuthUser(null);
      setUser(null);
      setIsViewingAs(false);
      setViewingAsUser(null);
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronous legacy compatibility handlers
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    signOut();
  };

  const startViewingAs = (targetUser: User, reason: string) => {
    setIsViewingAs(true);
    setViewingAsUser(targetUser);
    console.log(`[AUDIT] Admin ${user?.name} started viewing as ${targetUser.name}. Reason: ${reason}`);
  };

  const stopViewingAs = () => {
    console.log(`[AUDIT] Admin ${user?.name} stopped viewing as ${viewingAsUser?.name}`);
    setIsViewingAs(false);
    setViewingAsUser(null);
  };

  const effectiveUser = isViewingAs && viewingAsUser ? viewingAsUser : user;

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        authUser,
        isAuthenticated: !!effectiveUser,
        isLoading,
        isViewingAs,
        viewingAsUser,
        signIn,
        signUp,
        signOut,
        login,
        logout,
        startViewingAs,
        stopViewingAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
