import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
};

export const formatCompactNumber = (number: number) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
};
