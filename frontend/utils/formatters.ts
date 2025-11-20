export const formatDuration = (minutes?: number) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return '$0.00';
  return `$${amount.toFixed(2)}`;
};