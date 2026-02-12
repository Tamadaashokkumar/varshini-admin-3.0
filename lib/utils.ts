import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'In Stock':
      return 'text-green-500'
    case 'Low Stock':
      return 'text-yellow-500'
    case 'Out of Stock':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'Placed':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'Confirmed':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    case 'Packed':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'Shipped':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    case 'Delivered':
      return 'bg-green-500/10 text-green-400 border-green-500/20'
    case 'Cancelled':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

// src/lib/utils.ts

// ... మీ ఇతర కోడ్ ...

export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }

  // 1. Headers (Keys) తీయడం
  const headers = Object.keys(data[0]);
  
  // 2. CSV Content తయారు చేయడం
  const csvContent = [
    headers.join(','), // Header Row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // FIX: 0 ఉన్నప్పుడు అది ఖాళీ కాకూడదు. undefined/null ఉంటేనే ఖాళీ రావాలి.
        const safeValue = (value !== null && value !== undefined) ? value : '';
        // డేటాలో కామా (,) ఉంటే సమస్య రాకుండా Quotes (" ") వాడాలి
        return JSON.stringify(safeValue);
      }).join(',')
    )
  ].join('\n');

  // 3. Blob క్రియేట్ చేసి డౌన్‌లోడ్ చేయడం
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};