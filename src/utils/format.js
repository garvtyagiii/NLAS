/**
 * Formatting utilities for NLAS frontend
 */

// Indian currency formatting
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact currency (₹12.5 Cr, ₹4.5 L)
export function formatCurrencyCompact(amount) {
  if (amount == null || isNaN(amount)) return '—';
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  return formatCurrency(amount);
}

// Area in hectares
export function formatArea(ha) {
  if (ha == null || isNaN(ha)) return '—';
  return `${Number(ha).toFixed(2)} ha`;
}

// Date formatting
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// Progress percentage
export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function calcPercent(value, total) {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

// Status labels
export const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_SCRUTINY: 'Under Scrutiny',
  APPROVED: 'Approved',
  NOTIFICATION: 'Notification',
  AWARD: 'Award',
  COMPENSATION: 'Compensation',
  POSSESSION: 'Possession',
  'R&R': 'R&R',
  CLOSED: 'Closed',
  // Parcel statuses
  ACQUIRED: 'Acquired',
  PENDING: 'Pending',
  DISPUTED: 'Disputed',
  POSSESSION_TAKEN: 'Possession Taken',
  NOTIFIED: 'Notified',
  // Payment statuses
  PAID: 'Paid',
  PARTIAL: 'Partial',
  PENDING_PAYMENT: 'Pending',
  // Alert severities
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_SCRUTINY: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  NOTIFICATION: 'bg-purple-100 text-purple-700',
  AWARD: 'bg-indigo-100 text-indigo-700',
  COMPENSATION: 'bg-orange-100 text-orange-700',
  POSSESSION: 'bg-teal-100 text-teal-700',
  'R&R': 'bg-cyan-100 text-cyan-700',
  CLOSED: 'bg-green-100 text-green-700',
  // Parcel
  ACQUIRED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  DISPUTED: 'bg-red-100 text-red-700',
  POSSESSION_TAKEN: 'bg-teal-100 text-teal-700',
  NOTIFIED: 'bg-purple-100 text-purple-700',
  // Payment
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PENDING_PAYMENT: 'bg-slate-100 text-slate-600',
  // Alert severity
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-blue-100 text-blue-700',
};

export const ALERT_SEVERITY_DOT = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-blue-400',
};

// Workflow order
export const WORKFLOW_STAGES = [
  'DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'APPROVED',
  'NOTIFICATION', 'AWARD', 'COMPENSATION', 'POSSESSION', 'R&R', 'CLOSED',
];

export const WORKFLOW_NEXT = {
  DRAFT: 'SUBMITTED',
  SUBMITTED: 'UNDER_SCRUTINY',
  UNDER_SCRUTINY: 'APPROVED',
  APPROVED: 'NOTIFICATION',
  NOTIFICATION: 'AWARD',
  AWARD: 'COMPENSATION',
  COMPENSATION: 'POSSESSION',
  POSSESSION: 'R&R',
  'R&R': 'CLOSED',
  CLOSED: null,
};

export const WORKFLOW_NEXT_LABEL = {
  DRAFT: 'Submit for Review',
  SUBMITTED: 'Begin Scrutiny',
  UNDER_SCRUTINY: 'Approve Project',
  APPROVED: 'Issue Notification',
  NOTIFICATION: 'Issue Award',
  AWARD: 'Begin Compensation',
  COMPENSATION: 'Take Possession',
  POSSESSION: 'Begin R&R',
  'R&R': 'Close Project',
  CLOSED: null,
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
}

// Truncate text
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
