import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getRiskColorClass(level?: string): {
  badge: string;
  border: string;
  text: string;
  bg: string;
} {
  switch (level) {
    case 'LOW':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
      };
    case 'HIGH':
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
      };
    case 'CRITICAL':
      return {
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        border: 'border-red-500/40',
        text: 'text-red-400',
        bg: 'bg-red-500/20',
      };
    default:
      return {
        badge: 'bg-graphite-800 text-graphite-300 border-graphite-700',
        border: 'border-graphite-700',
        text: 'text-graphite-300',
        bg: 'bg-graphite-800',
      };
  }
}

export function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'AWAITING_APPROVAL':
      return { label: 'Approval Required', className: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' };
    case 'BLOCKED':
      return { label: 'Blocked', className: 'bg-red-600/20 text-red-400 border-red-500/40' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-graphite-800 text-graphite-400 border-graphite-700' };
    case 'PENDING':
      return { label: 'Queued', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'EXECUTING':
    case 'INGESTING':
    case 'RECONCILING':
      return { label: 'Agent Working', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    default:
      return { label: status, className: 'bg-graphite-800 text-graphite-300 border-graphite-700' };
  }
}
