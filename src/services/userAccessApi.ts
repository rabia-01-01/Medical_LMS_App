import type { AccountStatus, AppUserRole, UserAccessPermissions } from '../features/auth';

export interface BackendUserDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  avatar: string;
  department?: string;
  batch?: string;
  targetExam?: string;
  status: AccountStatus;
  accessPermissions?: UserAccessPermissions;
  createdAt: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  networkError?: boolean;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    const text = await res.text();
    let parsed: any = undefined;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = undefined;
    }
    if (!res.ok) {
      const isProxyOrUnreachable =
        Boolean(parsed?.proxyUnavailable) ||
        (!parsed?.error && (res.status >= 500 || res.status === 404));
      if (isProxyOrUnreachable) {
        return {
          ok: false,
          status: res.status,
          networkError: true,
        };
      }
      return {
        ok: false,
        status: res.status,
        error: parsed?.error || `Request failed with status ${res.status}`,
      };
    }
    if (parsed === undefined) {
      return {
        ok: false,
        status: res.status,
        networkError: true,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: parsed as T,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      networkError: true,
    };
  }
}

function getStoredAdminIdentity(): { adminEmail?: string; adminId?: string } {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === 'admin') {
        return { adminEmail: parsed.email, adminId: parsed.id };
      }
    }
  } catch {}
  return {};
}

export async function fetchBackendUsers(): Promise<BackendUserDTO[] | null> {
  const res = await requestJson<{ users: BackendUserDTO[] }>('/api/users');
  if (!res.ok || !Array.isArray(res.data?.users)) return null;
  return res.data.users;
}

export async function fetchBackendUserStatus(params: {
  email?: string;
  id?: string;
}): Promise<BackendUserDTO | null> {
  const qs = new URLSearchParams();
  if (params.email) qs.set('email', params.email.trim().toLowerCase());
  if (params.id) qs.set('id', params.id);
  const res = await requestJson<{ user: BackendUserDTO }>(`/api/users/status?${qs.toString()}`);
  if (!res.ok || !res.data?.user) return null;
  return res.data.user;
}

export async function fetchAdminRegistrationOpen(): Promise<boolean | null> {
  const res = await requestJson<{ adminRegistrationOpen: boolean }>('/api/users/admin-registration-status');
  if (!res.ok || typeof res.data?.adminRegistrationOpen !== 'boolean') return null;
  return res.data.adminRegistrationOpen;
}

export async function registerBackendSelfUser(payload: {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'student' | 'faculty' | 'consultant' | 'admin';
  department?: string;
  targetExam?: string;
}): Promise<ApiResponse<{ user: BackendUserDTO }>> {
  return requestJson<{ user: BackendUserDTO }>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function authenticateBackendUser(
  email: string,
  password: string
): Promise<ApiResponse<{ user: BackendUserDTO }>> {
  return requestJson<{ user: BackendUserDTO }>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function googleAuthBackendSync(payload: {
  email: string;
  name?: string;
  role?: 'student' | 'faculty' | 'consultant';
}): Promise<ApiResponse<{ user: BackendUserDTO; isNew?: boolean }>> {
  return requestJson<{ user: BackendUserDTO; isNew?: boolean }>('/api/users/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createBackendUserAsAdmin(
  payload: Record<string, any>,
  actor?: { adminEmail?: string; adminId?: string }
): Promise<ApiResponse<{ user: BackendUserDTO }>> {
  const identity = actor?.adminEmail || actor?.adminId ? actor : getStoredAdminIdentity();
  return requestJson<{ user: BackendUserDTO }>('/api/users/admin-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(identity.adminEmail ? { 'x-admin-email': identity.adminEmail } : {}),
      ...(identity.adminId ? { 'x-admin-id': identity.adminId } : {}),
    },
    body: JSON.stringify({ ...payload, ...identity }),
  });
}

export async function updateBackendUserAccess(
  userId: string,
  patch: Record<string, any>,
  actor?: { adminEmail?: string; adminId?: string }
): Promise<ApiResponse<{ user: BackendUserDTO }>> {
  const identity = actor?.adminEmail || actor?.adminId ? actor : getStoredAdminIdentity();
  return requestJson<{ user: BackendUserDTO }>(`/api/users/${encodeURIComponent(userId)}/access`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(identity.adminEmail ? { 'x-admin-email': identity.adminEmail } : {}),
      ...(identity.adminId ? { 'x-admin-id': identity.adminId } : {}),
    },
    body: JSON.stringify({ ...patch, ...identity }),
  });
}

export async function allowAllBackendUsers(
  onlyPending = false,
  actor?: { adminEmail?: string; adminId?: string }
): Promise<ApiResponse<{ users: BackendUserDTO[]; updatedCount: number }>> {
  const identity = actor?.adminEmail || actor?.adminId ? actor : getStoredAdminIdentity();
  return requestJson<{ users: BackendUserDTO[]; updatedCount: number }>('/api/users/allow-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(identity.adminEmail ? { 'x-admin-email': identity.adminEmail } : {}),
      ...(identity.adminId ? { 'x-admin-id': identity.adminId } : {}),
    },
    body: JSON.stringify({ onlyPending, ...identity }),
  });
}

export async function deleteBackendUser(
  userId: string,
  actor?: { adminEmail?: string; adminId?: string }
): Promise<ApiResponse<{ success: boolean }>> {
  const identity = actor?.adminEmail || actor?.adminId ? actor : getStoredAdminIdentity();
  return requestJson<{ success: boolean }>(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(identity.adminEmail ? { 'x-admin-email': identity.adminEmail } : {}),
      ...(identity.adminId ? { 'x-admin-id': identity.adminId } : {}),
    },
    body: JSON.stringify(identity),
  });
}

