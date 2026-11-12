import type { AppUserRole } from './types';

/**
 * Frontend Role-Based Rate Limiter Engine
 *
 * Implements per-role sliding-window quotas, burst cooldowns, and temporary lockouts
 * keyed by `${scope}:${role}:${actorId}` with O(1) in-memory Map lookup + sessionStorage persistence.
 */

export type RateLimitRole = AppUserRole | 'guest';

export type RateLimitScope =
  | 'auth:login'
  | 'auth:register'
  | 'auth:forgot_password'
  | 'auth:google'
  | 'approval:status_check'
  | 'ai:mcq_generate'
  | 'ai:chatbot'
  | 'community:post'
  | 'community:reply'
  | 'content:upload_resource'
  | 'content:create_quiz'
  | 'comms:announcement'
  | 'comms:notification'
  | 'admin:bulk_action';

export interface RateLimitPolicy {
  /** Maximum attempts allowed inside `windowMs`. Set 0 to forbid the role completely. */
  maxRequests: number;
  /** Sliding window length in milliseconds. */
  windowMs: number;
  /** Optional minimum spacing between requests to guard accidental double-clicks. */
  minIntervalMs?: number;
  /** Optional lockout penalty applied once `maxRequests` is exceeded. */
  blockDurationMs?: number;
  /** Short human-readable label surfaced in role quota badges. */
  label: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  scope: RateLimitScope;
  role: RateLimitRole;
  limit: number;
  remaining: number;
  used: number;
  resetAt: number;
  retryAfterMs: number;
  retryAfterSeconds: number;
  reason?: 'role_forbidden' | 'cooldown' | 'window_exceeded' | 'blocked';
  message: string;
  policyLabel: string;
}

interface StoredBucket {
  timestamps: number[];
  blockedUntil: number;
  lastActionAt: number;
}

const STORAGE_KEY = 'lms_role_rate_limits_v1';
const memoryBuckets = new Map<string, StoredBucket>();
let storageHydrated = false;

const MINUTE = 60_000;
const FIVE_MINUTES = 5 * MINUTE;
const TEN_MINUTES = 10 * MINUTE;

const STANDARD_LOGIN_POLICY: RateLimitPolicy = {
  maxRequests: 5,
  windowMs: MINUTE,
  blockDurationMs: 20_000,
  label: '5 attempts / min',
};

const STANDARD_REGISTER_POLICY: RateLimitPolicy = {
  maxRequests: 3,
  windowMs: FIVE_MINUTES,
  minIntervalMs: 3_000,
  blockDurationMs: 60_000,
  label: '3 signups / 5 min',
};

/**
 * Authoritative role-tiered rate limit configuration across all frontend capabilities.
 */
export const ROLE_RATE_LIMIT_POLICIES: Record<RateLimitScope, Record<RateLimitRole, RateLimitPolicy>> = {
  'auth:login': {
    guest: STANDARD_LOGIN_POLICY,
    student: STANDARD_LOGIN_POLICY,
    faculty: { ...STANDARD_LOGIN_POLICY, maxRequests: 6, label: '6 attempts / min' },
    consultant: { ...STANDARD_LOGIN_POLICY, maxRequests: 6, label: '6 attempts / min' },
    admin: { maxRequests: 8, windowMs: MINUTE, blockDurationMs: 15_000, label: '8 attempts / min' },
  },
  'auth:register': {
    guest: STANDARD_REGISTER_POLICY,
    student: STANDARD_REGISTER_POLICY,
    faculty: STANDARD_REGISTER_POLICY,
    consultant: STANDARD_REGISTER_POLICY,
    admin: { maxRequests: 2, windowMs: TEN_MINUTES, minIntervalMs: 3_000, blockDurationMs: 60_000, label: '2 admin setups / 10 min' },
  },
  'auth:forgot_password': {
    guest: { maxRequests: 10, windowMs: FIVE_MINUTES, minIntervalMs: 2_000, label: '10 mails / 5 min' },
    student: { maxRequests: 10, windowMs: FIVE_MINUTES, minIntervalMs: 2_000, label: '10 mails / 5 min' },
    faculty: { maxRequests: 10, windowMs: FIVE_MINUTES, minIntervalMs: 2_000, label: '10 mails / 5 min' },
    consultant: { maxRequests: 10, windowMs: FIVE_MINUTES, minIntervalMs: 2_000, label: '10 mails / 5 min' },
    admin: { maxRequests: 10, windowMs: FIVE_MINUTES, minIntervalMs: 2_000, label: '10 mails / 5 min' },
  },
  'auth:google': {
    guest: { maxRequests: 5, windowMs: MINUTE, minIntervalMs: 2_000, blockDurationMs: 20_000, label: '5 attempts / min' },
    student: { maxRequests: 5, windowMs: MINUTE, minIntervalMs: 2_000, blockDurationMs: 20_000, label: '5 attempts / min' },
    faculty: { maxRequests: 6, windowMs: MINUTE, minIntervalMs: 1_500, blockDurationMs: 15_000, label: '6 attempts / min' },
    consultant: { maxRequests: 6, windowMs: MINUTE, minIntervalMs: 1_500, blockDurationMs: 15_000, label: '6 attempts / min' },
    admin: { maxRequests: 8, windowMs: MINUTE, label: '8 attempts / min' },
  },
  'approval:status_check': {
    guest: { maxRequests: 3, windowMs: MINUTE, minIntervalMs: 5_000, label: '3 checks / min' },
    student: { maxRequests: 5, windowMs: MINUTE, minIntervalMs: 5_000, label: '5 checks / min' },
    faculty: { maxRequests: 6, windowMs: MINUTE, minIntervalMs: 4_000, label: '6 checks / min' },
    consultant: { maxRequests: 6, windowMs: MINUTE, minIntervalMs: 4_000, label: '6 checks / min' },
    admin: { maxRequests: 15, windowMs: MINUTE, minIntervalMs: 1_000, label: '15 checks / min' },
  },
  'ai:mcq_generate': {
    guest: { maxRequests: 0, windowMs: MINUTE, label: 'Not permitted' },
    student: { maxRequests: 0, windowMs: MINUTE, label: 'Faculty & Admin only' },
    consultant: { maxRequests: 0, windowMs: MINUTE, label: 'Faculty & Admin only' },
    faculty: { maxRequests: 8, windowMs: MINUTE, minIntervalMs: 3_000, label: '8 generations / min' },
    admin: { maxRequests: 20, windowMs: MINUTE, minIntervalMs: 1_000, label: '20 generations / min' },
  },
  'ai:chatbot': {
    guest: { maxRequests: 0, windowMs: MINUTE, label: 'Sign in required' },
    student: { maxRequests: 10, windowMs: MINUTE, minIntervalMs: 1_500, label: '10 prompts / min' },
    consultant: { maxRequests: 15, windowMs: MINUTE, minIntervalMs: 1_000, label: '15 prompts / min' },
    faculty: { maxRequests: 20, windowMs: MINUTE, minIntervalMs: 500, label: '20 prompts / min' },
    admin: { maxRequests: 30, windowMs: MINUTE, label: '30 prompts / min' },
  },
  'community:post': {
    guest: { maxRequests: 0, windowMs: MINUTE, label: 'Sign in required' },
    student: { maxRequests: 4, windowMs: MINUTE, minIntervalMs: 4_000, label: '4 posts / min' },
    consultant: { maxRequests: 8, windowMs: MINUTE, minIntervalMs: 2_000, label: '8 posts / min' },
    faculty: { maxRequests: 10, windowMs: MINUTE, minIntervalMs: 2_000, label: '10 posts / min' },
    admin: { maxRequests: 25, windowMs: MINUTE, label: '25 posts / min' },
  },
  'community:reply': {
    guest: { maxRequests: 0, windowMs: MINUTE, label: 'Sign in required' },
    student: { maxRequests: 8, windowMs: MINUTE, minIntervalMs: 2_000, label: '8 replies / min' },
    consultant: { maxRequests: 14, windowMs: MINUTE, minIntervalMs: 1_000, label: '14 replies / min' },
    faculty: { maxRequests: 18, windowMs: MINUTE, minIntervalMs: 1_000, label: '18 replies / min' },
    admin: { maxRequests: 40, windowMs: MINUTE, label: '40 replies / min' },
  },
  'content:upload_resource': {
    guest: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    student: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    consultant: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    faculty: { maxRequests: 8, windowMs: FIVE_MINUTES, minIntervalMs: 3_000, label: '8 uploads / 5 min' },
    admin: { maxRequests: 25, windowMs: FIVE_MINUTES, label: '25 uploads / 5 min' },
  },
  'content:create_quiz': {
    guest: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty only' },
    student: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty only' },
    consultant: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty only' },
    faculty: { maxRequests: 6, windowMs: FIVE_MINUTES, minIntervalMs: 3_000, label: '6 quizzes / 5 min' },
    admin: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty authoring only' },
  },
  'comms:announcement': {
    guest: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    student: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    consultant: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Faculty & Admin only' },
    faculty: { maxRequests: 5, windowMs: FIVE_MINUTES, minIntervalMs: 4_000, label: '5 announcements / 5 min' },
    admin: { maxRequests: 20, windowMs: FIVE_MINUTES, minIntervalMs: 1_000, label: '20 announcements / 5 min' },
  },
  'comms:notification': {
    guest: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Admin only' },
    student: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Admin only' },
    consultant: { maxRequests: 0, windowMs: FIVE_MINUTES, label: 'Admin only' },
    faculty: { maxRequests: 4, windowMs: FIVE_MINUTES, minIntervalMs: 4_000, label: '4 alerts / 5 min' },
    admin: { maxRequests: 20, windowMs: FIVE_MINUTES, minIntervalMs: 1_000, label: '20 alerts / 5 min' },
  },
  'admin:bulk_action': {
    guest: { maxRequests: 0, windowMs: MINUTE, label: 'Admin only' },
    student: { maxRequests: 0, windowMs: MINUTE, label: 'Admin only' },
    faculty: { maxRequests: 0, windowMs: MINUTE, label: 'Admin only' },
    consultant: { maxRequests: 0, windowMs: MINUTE, label: 'Admin only' },
    admin: { maxRequests: 8, windowMs: MINUTE, minIntervalMs: 2_000, label: '8 bulk actions / min' },
  },
};

function getSessionStorageSafe(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch {
    // Ignore restricted storage environments
  }
  return null;
}

function hydrateBucketsFromStorage(): void {
  if (storageHydrated) return;
  storageHydrated = true;
  const storage = getSessionStorageSafe();
  if (!storage) return;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, StoredBucket>;
    for (const [k, v] of Object.entries(parsed)) {
      if (v && Array.isArray(v.timestamps)) {
        memoryBuckets.set(k, {
          timestamps: v.timestamps.filter((n) => typeof n === 'number'),
          blockedUntil: typeof v.blockedUntil === 'number' ? v.blockedUntil : 0,
          lastActionAt: typeof v.lastActionAt === 'number' ? v.lastActionAt : 0,
        });
      }
    }
  } catch {
    // Ignore malformed persisted data
  }
}

function persistBuckets(): void {
  const storage = getSessionStorageSafe();
  if (!storage) return;
  try {
    const obj: Record<string, StoredBucket> = {};
    for (const [key, bucket] of memoryBuckets.entries()) {
      if (bucket.timestamps.length > 0 || bucket.blockedUntil > Date.now()) {
        obj[key] = bucket;
      }
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore quota errors
  }
}

export function normalizeRateLimitRole(role?: string | null): RateLimitRole {
  if (role === 'admin' || role === 'faculty' || role === 'student' || role === 'consultant') {
    return role;
  }
  return 'guest';
}

export function getRoleRateLimitPolicy(scope: RateLimitScope, role?: string | null): RateLimitPolicy {
  const normalizedRole = normalizeRateLimitRole(role);
  return ROLE_RATE_LIMIT_POLICIES[scope][normalizedRole];
}

function buildBucketKey(scope: RateLimitScope, role: RateLimitRole, actorId?: string | null): string {
  const cleanActor = (actorId || 'anonymous').trim().toLowerCase() || 'anonymous';
  return `${scope}:${role}:${cleanActor}`;
}

function pruneBucket(bucket: StoredBucket, windowMs: number, now: number): StoredBucket {
  const cutoff = now - windowMs;
  const activeTimestamps = bucket.timestamps.filter((ts) => ts > cutoff);
  const blockedUntil = bucket.blockedUntil > now ? bucket.blockedUntil : 0;
  return {
    timestamps: activeTimestamps,
    blockedUntil,
    lastActionAt: bucket.lastActionAt,
  };
}

export function formatRoleDisplayName(role: RateLimitRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'faculty':
      return 'Faculty';
    case 'consultant':
      return 'Consultant Agent';
    case 'student':
      return 'Student';
    default:
      return 'Guest';
  }
}

export function formatRateLimitMessage(
  scope: RateLimitScope,
  role: RateLimitRole,
  reason: RateLimitCheckResult['reason'],
  retryAfterSeconds: number,
  policy: RateLimitPolicy
): string {
  const roleName = formatRoleDisplayName(role);
  if (reason === 'role_forbidden') {
    return `${roleName} role is not permitted for this action (${policy.label}).`;
  }
  if (reason === 'cooldown') {
    return `Please wait ${retryAfterSeconds}s before trying again.`;
  }
  if (scope.startsWith('auth:')) {
    return `Too many attempts for ${roleName} (${policy.label}). Please wait ${retryAfterSeconds}s before retrying.`;
  }
  return `Rate limit reached for ${roleName} (${policy.label}). Try again in ${retryAfterSeconds}s.`;
}

function evaluateBucket(
  scope: RateLimitScope,
  role: RateLimitRole,
  actorId: string | null | undefined,
  now: number,
  consume: boolean
): RateLimitCheckResult {
  hydrateBucketsFromStorage();

  const policy = getRoleRateLimitPolicy(scope, role);
  const key = buildBucketKey(scope, role, actorId);

  if (policy.maxRequests <= 0) {
    return {
      allowed: false,
      scope,
      role,
      limit: 0,
      remaining: 0,
      used: 0,
      resetAt: now,
      retryAfterMs: 0,
      retryAfterSeconds: 0,
      reason: 'role_forbidden',
      message: formatRateLimitMessage(scope, role, 'role_forbidden', 0, policy),
      policyLabel: policy.label,
    };
  }

  const existing = memoryBuckets.get(key) || { timestamps: [], blockedUntil: 0, lastActionAt: 0 };
  const bucket = pruneBucket(existing, policy.windowMs, now);

  if (bucket.blockedUntil > now) {
    const retryAfterMs = bucket.blockedUntil - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    memoryBuckets.set(key, bucket);
    return {
      allowed: false,
      scope,
      role,
      limit: policy.maxRequests,
      remaining: 0,
      used: bucket.timestamps.length,
      resetAt: bucket.blockedUntil,
      retryAfterMs,
      retryAfterSeconds,
      reason: 'blocked',
      message: formatRateLimitMessage(scope, role, 'blocked', retryAfterSeconds, policy),
      policyLabel: policy.label,
    };
  }

  if (policy.minIntervalMs && bucket.lastActionAt > 0) {
    const elapsed = now - bucket.lastActionAt;
    if (elapsed >= 0 && elapsed < policy.minIntervalMs) {
      const retryAfterMs = policy.minIntervalMs - elapsed;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      memoryBuckets.set(key, bucket);
      return {
        allowed: false,
        scope,
        role,
        limit: policy.maxRequests,
        remaining: Math.max(0, policy.maxRequests - bucket.timestamps.length),
        used: bucket.timestamps.length,
        resetAt: now + retryAfterMs,
        retryAfterMs,
        retryAfterSeconds,
        reason: 'cooldown',
        message: formatRateLimitMessage(scope, role, 'cooldown', retryAfterSeconds, policy),
        policyLabel: policy.label,
      };
    }
  }

  if (bucket.timestamps.length >= policy.maxRequests) {
    const oldest = bucket.timestamps[0];
    const windowResetAt = oldest + policy.windowMs;
    const penaltyUntil = policy.blockDurationMs ? Math.max(windowResetAt, now + policy.blockDurationMs) : windowResetAt;
    if (consume && policy.blockDurationMs) {
      bucket.blockedUntil = penaltyUntil;
    }
    const effectiveResetAt = bucket.blockedUntil > now ? bucket.blockedUntil : windowResetAt;
    const retryAfterMs = Math.max(250, effectiveResetAt - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    memoryBuckets.set(key, bucket);
    if (consume) persistBuckets();

    return {
      allowed: false,
      scope,
      role,
      limit: policy.maxRequests,
      remaining: 0,
      used: bucket.timestamps.length,
      resetAt: effectiveResetAt,
      retryAfterMs,
      retryAfterSeconds,
      reason: 'window_exceeded',
      message: formatRateLimitMessage(scope, role, 'window_exceeded', retryAfterSeconds, policy),
      policyLabel: policy.label,
    };
  }

  if (consume) {
    bucket.timestamps.push(now);
    bucket.lastActionAt = now;
    memoryBuckets.set(key, bucket);
    persistBuckets();
  }

  const used = bucket.timestamps.length;
  const remaining = Math.max(0, policy.maxRequests - used);
  const resetAt = bucket.timestamps.length > 0 ? bucket.timestamps[0] + policy.windowMs : now + policy.windowMs;

  return {
    allowed: true,
    scope,
    role,
    limit: policy.maxRequests,
    remaining,
    used,
    resetAt,
    retryAfterMs: 0,
    retryAfterSeconds: 0,
    message: '',
    policyLabel: policy.label,
  };
}

export function getRateLimitStatus(
  scope: RateLimitScope,
  role?: string | null,
  actorId?: string | null,
  now = Date.now()
): RateLimitCheckResult {
  return evaluateBucket(scope, normalizeRateLimitRole(role), actorId, now, false);
}

export function consumeRateLimit(
  scope: RateLimitScope,
  role?: string | null,
  actorId?: string | null,
  now = Date.now()
): RateLimitCheckResult {
  return evaluateBucket(scope, normalizeRateLimitRole(role), actorId, now, true);
}

export function resetRateLimit(
  scope: RateLimitScope,
  role?: string | null,
  actorId?: string | null
): void {
  hydrateBucketsFromStorage();
  const key = buildBucketKey(scope, normalizeRateLimitRole(role), actorId);
  memoryBuckets.delete(key);
  persistBuckets();
}

export function clearAllRateLimits(): void {
  memoryBuckets.clear();
  storageHydrated = true;
  const storage = getSessionStorageSafe();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
  }
}

