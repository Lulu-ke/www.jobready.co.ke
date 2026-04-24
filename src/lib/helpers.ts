import { formatDistanceToNow } from 'date-fns';

export function formatSalary(min?: number | null, max?: number | null, currency: string = 'KSh'): string {
  if (!min && !max) return 'Not specified';
  const fmt = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${Math.round(v / 1000)}K`;
    return v.toString();
  };
  if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${currency} ${fmt(min)}`;
  if (max) return `Up to ${currency} ${fmt(max)}`;
  return 'Not specified';
}

export function formatRelativeDate(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCategoryColor(name: string | null | undefined): string {
  const colors: Record<string, string> = {
    'IT & Technology': 'bg-cyan-100 text-cyan-700',
    'Finance & Accounting': 'bg-emerald-100 text-emerald-700',
    'Engineering': 'bg-orange-100 text-orange-700',
    'Healthcare': 'bg-rose-100 text-rose-700',
    'Education': 'bg-amber-100 text-amber-700',
    'Marketing & Sales': 'bg-violet-100 text-violet-700',
    'Human Resources': 'bg-pink-100 text-pink-700',
    'Administration': 'bg-slate-100 text-slate-700',
    'Legal': 'bg-indigo-100 text-indigo-700',
    'Creative & Design': 'bg-fuchsia-100 text-fuchsia-700',
    'Customer Service': 'bg-lime-100 text-lime-700',
    'Logistics': 'bg-teal-100 text-teal-700',
    'Agriculture': 'bg-green-100 text-green-700',
    'Manufacturing': 'bg-stone-100 text-stone-700',
    'Hospitality': 'bg-yellow-100 text-yellow-700',
    'NGO & Development': 'bg-purple-100 text-purple-700',
  };
  return (name && colors[name]) || 'bg-gray-100 text-gray-700';
}

export function getCompanyColor(name: string | null | undefined): string {
  const colors = [
    'bg-teal-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-lime-500',
    'bg-fuchsia-500',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function formatClosingDate(date: string | Date | null | undefined): string {
  if (!date) return 'No deadline';
  try {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0) return 'Closed';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 3) return `Closes in ${days} day${days !== 1 ? 's' : ''}`;
    return `Closes ${formatDistanceToNow(d)}`;
  } catch {
    return 'No deadline';
  }
}

export function experienceLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    entry: 'Entry Level',
    internship: 'Internship',
    casual: 'Casual',
    mid: 'Mid Level',
    senior: 'Senior',
  };
  return labels[level] || level;
}

export function orgTypeLabel(orgType: string): string {
  const labels: Record<string, string> = {
    PRIVATE: 'Private Company',
    SMALL_BUSINESS: 'Small Business',
    STARTUP: 'Startup',
    NGO: 'NGO',
    INTERNATIONAL_ORG: 'International Org',
    NATIONAL_GOV: 'National Government',
    COUNTY_GOV: 'County Government',
    STATE_CORPORATION: 'State Corporation',
    EDUCATION: 'Education',
    FOUNDATION: 'Foundation',
    RELIGIOUS_ORG: 'Religious Org',
  };
  return labels[orgType] || orgType;
}

export function opportunityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    internship: 'Internship',
    sponsorship: 'Sponsorship',
    bursary: 'Bursary',
    university_admission: 'University Admission',
    scholarship: 'Scholarship',
    certification: 'Certification',
  };
  return labels[type] || type;
}
