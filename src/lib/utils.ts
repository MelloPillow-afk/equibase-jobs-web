import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  const mb = bytes / (1024 * 1024)
  // Show 1 decimal place, but remove .0 if it's a whole number
  // Actually user said "decimal up to show only tenth place (.1, .4) only for mb"
  // and "10mb" example suggests removing .0
  const formatted = mb.toFixed(1)
  return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted} MB`
}
