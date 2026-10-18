import React from 'react';

interface BottomNavProps {
  items: { icon: string; label: string; id: string }[];
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
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          {item.id === 'notifications' && notificationCount > 0 && (
            <span className="notification-dot" />
          )}
          <i className={`fas ${item.icon}`} />
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
  };
  const c = config[status] || config.active;
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}
