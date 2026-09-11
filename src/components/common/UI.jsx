import React from 'react';

// Badge
export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

// Card
export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Skeleton
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-12 w-full ${i === 0 ? 'bg-slate-100' : ''}`} />
      ))}
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// Error State
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span className="text-red-500 text-xl">⚠</span>
      </div>
      <h3 className="text-sm font-semibold text-red-700 mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-400 mb-4 max-w-xs">{message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn">
          Retry
        </button>
      )}
    </div>
  );
}

// Progress bar
export function ProgressBar({ value, max = 100, className = '', colorClass = 'bg-navy-700' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Divider
export function Divider({ className = '' }) {
  return <hr className={`border-slate-200 ${className}`} />;
}

// Stat Card
export function StatCard({ label, value, sub, icon: Icon, colorClass = 'text-navy-700', loading = false }) {
  if (loading) return <SkeletonCard />;
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${colorClass} leading-tight truncate`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ml-3`}>
            <Icon className={`w-4.5 h-4.5 ${colorClass}`} />
          </div>
        )}
      </div>
    </Card>
  );
}

// Section header
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
      {action}
    </div>
  );
}
