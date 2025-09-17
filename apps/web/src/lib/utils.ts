import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

export function shareTrip(tripId: string, tripCode: string, tripTitle: string) {
  const url = `${window.location.origin}/trip/${tripId}?code=${tripCode}`;
  
  if (navigator.share) {
    navigator.share({
      title: `Viagem: ${tripTitle}`,
      text: `Participe da viagem "${tripTitle}". Use o código: ${tripCode}`,
      url: url,
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  }
}