/**
 * Database Module
 * Phase 1: Exports schema for future use
 * Phase 2: SQLite + Supabase integration
 */

export * from './schema';

/**
 * Initialize the database
 * Phase 1: No-op (using in-memory storage)
 * Phase 2: Initialize SQLite and sync with Supabase
 */
export async function initializeDatabase(): Promise<void> {
  // Phase 1: Using in-memory storage
  // Phase 2: Initialize SQLite here
}
