import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * 
 * This is the ONLY way to allow consuming components to strictly override
 * styles without CSS specificity wars (e.g., ensuring `p-4` overrides `p-2`
 * regardless of CSS order).
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 wins)
 * cn('text-red-500', isActive && 'text-blue-500') // conditional
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
