import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales de Tailwind resolviendo conflictos con tailwind-merge */
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}
