/**
 * Security Utilities
 * 
 * Provides functions for escaping user input to prevent injection attacks 
 * in Regular Expressions and SQL-like search queries.
 */

/**
 * Escapes characters that have special meaning in regular expressions.
 * Use this when creating a RegExp from user input.
 * 
 * @param string - The string to escape
 * @returns The escaped string safe for use in RegExp constructor
 * 
 * @example
 * new RegExp(escapeRegExp("user.name")) // matches "user.name" literally, not "userData"
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escapes characters that have special meaning in SQL LIKE clauses.
 * Note: Supabase/Postgres usually handles this if using parameterized queries,
 * but for client-side filtering or raw string manipulation this adds safety.
 * 
 * @param term - The search term
 * @returns The escaped search term
 */
export function escapeSQLSearch(term: string): string {
    return term.replace(/[%_]/g, '\\$&');
}
