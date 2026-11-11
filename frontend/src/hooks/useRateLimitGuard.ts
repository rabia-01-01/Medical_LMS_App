import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type RateLimitScope,
  type RateLimitCheckResult,
  consumeRateLimit,
  getRateLimitStatus,
  getRoleRateLimitPolicy,
  normalizeRateLimitRole,
  resetRateLimit,
} from '../features/auth/rateLimiter';

interface UseRateLimitGuardOptions {
  roleOverride?: string | null;
  actorIdOverride?: string | null;
}

/**
 * Hook wrapping role-based sliding-window rate limiting with live countdown updates
 * while throttled (zero timers running when idle/unblocked).
 */
export function useRateLimitGuard(
  scope: RateLimitScope,
  options?: UseRateLimitGuardOptions
) {
  const { user } = useAuth();
  const effectiveRole = normalizeRateLimitRole(
    options?.roleOverride !== undefined ? options.roleOverride : user?.role
  );
  const effectiveActorId =
    options?.actorIdOverride !== undefined
      ? options.actorIdOverride
      : user?.id || user?.email || 'guest';

  const [status, setStatus] = useState<RateLimitCheckResult>(() =>
    getRateLimitStatus(scope, effectiveRole, effectiveActorId)
  );
  const [limitError, setLimitError] = useState<string>('');

  // Keep status synchronized when scope, role, or actor changes
  useEffect(() => {
    const next = getRateLimitStatus(scope, effectiveRole, effectiveActorId);
    setStatus(next);
    setLimitError(next.allowed ? '' : next.message);
  }, [scope, effectiveRole, effectiveActorId]);

  // Run a 1s countdown ticker only while currently throttled or cooling down
  useEffect(() => {
    if (status.allowed || status.reason === 'role_forbidden' || status.retryAfterMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      const updated = getRateLimitStatus(scope, effectiveRole, effectiveActorId);
      setStatus(updated);
      if (updated.allowed) {
        setLimitError('');
      } else {
        setLimitError(updated.message);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [scope, effectiveRole, effectiveActorId, status.allowed, status.reason, status.retryAfterMs]);

  const tryConsume = useCallback(
    (customActorId?: string | null, customRole?: string | null): RateLimitCheckResult => {
      const targetRole = normalizeRateLimitRole(customRole ?? effectiveRole);
      const targetActor = customActorId ?? effectiveActorId;
      const res = consumeRateLimit(scope, targetRole, targetActor);
      setStatus(res);
      setLimitError(res.allowed ? '' : res.message);
      return res;
    },
    [scope, effectiveRole, effectiveActorId]
  );

  const reset = useCallback(
    (customActorId?: string | null, customRole?: string | null) => {
      const targetRole = normalizeRateLimitRole(customRole ?? effectiveRole);
      const targetActor = customActorId ?? effectiveActorId;
      resetRateLimit(scope, targetRole, targetActor);
      const next = getRateLimitStatus(scope, targetRole, targetActor);
      setStatus(next);
      setLimitError('');
    },
    [scope, effectiveRole, effectiveActorId]
  );

  const clearError = useCallback(() => {
    setLimitError('');
  }, []);

  const policy = getRoleRateLimitPolicy(scope, effectiveRole);

  return {
    status,
    role: effectiveRole,
    policy,
    policyLabel: policy.label,
    isBlocked: !status.allowed,
    isRoleForbidden: status.reason === 'role_forbidden',
    remaining: status.remaining,
    limit: status.limit,
    retryAfterSeconds: status.retryAfterSeconds,
    limitError,
    tryConsume,
    reset,
    clearError,
  };
}

