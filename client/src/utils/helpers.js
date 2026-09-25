export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const getVerificationBadgeClass = (level) => {
  switch (level) {
    case 'Expert':
      return 'badge-verified-expert';
    case 'Advanced':
      return 'badge-verified-advanced';
    case 'Intermediate':
      return 'badge-verified-intermediate';
    default:
      return 'badge-unverified';
  }
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Trial Task':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Proposal Review':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Assigned':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Submitted':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Approved':
    case 'Completed':
    case 'Accepted':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Revision Required':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Rejected':
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
