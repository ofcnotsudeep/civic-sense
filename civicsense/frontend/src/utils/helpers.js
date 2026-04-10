export const SEVERITY_COLOR = (s) => {
  if (s >= 9) return '#ff4d6d';
  if (s >= 7) return '#ff8c42';
  if (s >= 4) return '#ffb830';
  return '#00c875';
};

export const SEVERITY_LABEL = (s) => {
  if (s >= 9) return 'CRITICAL';
  if (s >= 7) return 'HIGH';
  if (s >= 4) return 'MEDIUM';
  return 'LOW';
};

export const TYPE_ICON = {
  pothole: '🕳️',
  garbage: '🗑️',
  streetlight: '💡',
  waterlogging: '🌊',
  other: '⚠️',
};

export const TYPE_COLOR = {
  pothole: '#ff8c42',
  garbage: '#9b59ff',
  streetlight: '#ffb830',
  waterlogging: '#0099ff',
  other: '#8892a4',
};

export const DEPT_COLOR = {
  'PWD': '#ff8c42',
  'Sanitation': '#9b59ff',
  'Electricity': '#ffb830',
  'Drainage': '#0099ff',
  'Municipal': '#00c875',
};

export const STATUS_COLOR = {
  open: '#ff4d6d',
  'in-progress': '#ffb830',
  resolved: '#00c875',
};

export const STATUS_LABEL = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
