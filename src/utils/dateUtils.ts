/**
 * Date and currency helper utilities for RightsFlow
 */

export const formatDate = (dateObj: Date | string | number): string => {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const getDaysDiffFromToday = (targetDateStr: string | null): number | null => {
  if (!targetDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = targetDateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const formatRM = (amount: number): string => {
  const rounded = Math.round(Number(amount) || 0);
  return `RM ${rounded.toLocaleString('en-US')}`;
};

export const formatExactRM = (amount: number): string => {
  const val = Number(amount) || 0;
  return `RM ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Aliases for seamless compatibility across existing components
export const formatCurrency = formatRM;
export const formatUSD = formatRM;
export const formatExactUSD = formatExactRM;
