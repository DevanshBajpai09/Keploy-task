import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getTypeVariant(type) {
  switch (type) {
    case 'email':
      return 'secondary';
    case 'sms':
      return 'outline';
    default:
      return 'default';
  }
}
