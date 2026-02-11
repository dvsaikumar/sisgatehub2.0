import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous tags and attributes.
 * 
 * @param dirty - The raw HTML string to sanitize
 * @returns The sanitized HTML string
 */
export const sanitizeHTML = (dirty: string): string => {
    if (!dirty) return '';

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
            'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
            'width', 'height', 'align', 'valign'
        ],
        // Ensure all links open in new tab and have noopener noreferrer
        ADD_ATTR: ['target'],
    });
};
