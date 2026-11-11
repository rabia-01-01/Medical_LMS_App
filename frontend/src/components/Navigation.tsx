import React from 'react';
import { useRbac } from '../hooks/useRbac';
import type { PermissionCapability } from '../features/auth/rbac';
import type { AccessModuleKey } from '../features/auth/accessControl';

interface BottomNavProps {
  items: { icon: string; label: string; id: string; locked?: boolean }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  notificationCount?: number;
}

export function BottomNav({ items, activeTab, onTabChange, notificationCount = 0 }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      {items.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''} ${item.locked ? 'opacity-65' : ''}`}
          onClick={() => onTabChange(item.id)}
          title={item.locked ? `${item.label} (Locked until Admin grants access)` : item.label}
        >
          {item.id === 'notifications' && notificationCount > 0 && !item.locked && (
            <span className="notification-dot" />
          )}
          <div className="relative inline-flex items-center justify-center">
            <i className={`fas ${item.icon}`} />
            {item.locked && (
              <i
                className="fas fa-lock text-[8px] text-amber-500 absolute -top-1 -right-2 bg-white rounded-full p-0.5 shadow-2xs"
                aria-hidden="true"
              />
            )}
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  gradient?: boolean;
}

export function Header({ title, subtitle, showBack, onBack, rightAction, gradient = true }: HeaderProps) {
  return (
    <>
      <div className={`px-4 py-3 flex items-center gap-3 ${gradient ? 'gradient-header' : 'bg-white border-b border-gray-100'}`}>
        {showBack && (
          <button onClick={onBack} className={`text-lg ${gradient ? 'text-white' : 'text-gray-700'} z-10 relative`}>
            <i className="fas fa-arrow-left" />
          </button>
        )}
        <div className="flex-1">
          <h1 className={`text-lg font-bold ${gradient ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {subtitle && <p className={`text-xs ${gradient ? 'text-gray-300' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
        {rightAction && (
          <div className="relative z-10">
            {rightAction}
          </div>
        )}
      </div>
      <div className="italy-accent">
        <div className="green" />
        <div className="white" />
        <div className="red" />
      </div>
    </>
  );
}

export function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <i className={`fas ${icon} text-2xl text-gray-400`} />
      </div>
      <h3 className="text-gray-700 font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm mt-3">Loading...</p>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="px-4 py-3">
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
        />
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    active: { class: 'badge-teal', label: 'Active' },
    upcoming: { class: 'badge-orange', label: 'Upcoming' },
    completed: { class: 'badge-navy', label: 'Completed' },
    published: { class: 'badge-green', label: 'Published' },
    draft: { class: 'badge-red', label: 'Draft' },
    pending: { class: 'badge-orange', label: 'Pending Approval' },
    suspended: { class: 'badge-red', label: 'Suspended' },
  };
  const c = config[status] || config.active;
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}

export function AccessRestrictedScreen({
  moduleName,
  onBack,
  message,
}: {
  moduleName: string;
  onBack?: () => void;
  message?: string;
}) {
  return (
    <div>
      <Header title={moduleName} showBack={Boolean(onBack)} onBack={onBack} gradient={false} />
      <div className="p-6">
        <div className="card border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 text-center py-8 px-5 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl border border-amber-200 shadow-2xs">
            <i className="fas fa-lock" />
          </div>
          <h3 className="text-base font-bold text-gray-900">{moduleName} Access Restricted</h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
            {message || `Your account does not currently have Administrator permission to access ${moduleName}. Please ask the Administrator to allow access to this resource.`}
          </p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <i className="fas fa-arrow-left text-[10px]" />
              <span>Go Back</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Declarative O(1) Role + Capability / Module guard powered by useRbac().
 */
export function RoleGuard({
  capability,
  module,
  moduleName,
  onBack,
  deniedMessage,
  children,
}: {
  capability?: PermissionCapability;
  module?: AccessModuleKey;
  moduleName: string;
  onBack?: () => void;
  deniedMessage?: string;
  children: React.ReactNode;
}) {
  const rbac = useRbac();
  const allowedByModule = module ? rbac.hasModule(module) : true;
  const allowedByCap = capability ? rbac.can(capability) : true;

  if (!allowedByModule || !allowedByCap) {
    return (
      <AccessRestrictedScreen
        moduleName={moduleName}
        onBack={onBack}
        message={deniedMessage}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Shared countdown alert surfaced when a role-based rate limit or cooldown triggers.
 */
export function RateLimitAlert({
  message,
  retryAfterSeconds = 0,
  policyLabel,
  variant = 'light',
}: {
  message?: string | null;
  retryAfterSeconds?: number;
  policyLabel?: string;
  variant?: 'light' | 'dark';
}) {
  if (!message) return null;

  const isDark = variant === 'dark';
  return (
    <div
      role="alert"
      className={`rounded-xl px-3 py-2.5 text-xs border flex items-start gap-2 animate-fade-in ${
        isDark
          ? 'bg-amber-500/20 border-amber-400/50 text-amber-100'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <i
        className={`fas fa-hourglass-half mt-0.5 text-xs shrink-0 ${
          isDark ? 'text-amber-300' : 'text-amber-600'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold">
            Rate Limit Active{retryAfterSeconds > 0 ? ` • ${retryAfterSeconds}s` : ''}
          </span>
          {policyLabel && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isDark ? 'bg-white/10 text-amber-200' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {policyLabel}
            </span>
          )}
        </div>
        <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-amber-100/90' : 'text-amber-800'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
