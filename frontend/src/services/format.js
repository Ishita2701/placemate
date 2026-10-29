export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
export const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];
export const GRADUATION_YEARS = [2025, 2026, 2027, 2028];

// Dates are shown in a fixed format (e.g. 05 Nov 2026) so tests can rely on them.
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_REGEX = /^\d{10}$/;
