import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Quote a value for CSV and defuse spreadsheet formula injection (=, +, @,
// or a leading - followed by content) by prefixing a apostrophe.
export function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[=+@]/.test(s) || (/^-./.test(s) && s !== "-")) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
