import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with ETB (Ethiopian Birr)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "ETB 1,500")
 */
export function formatCurrency(amount: number): string {
  return `ETB ${amount.toLocaleString()}`;
}
