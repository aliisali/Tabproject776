// Removed - Using Render PostgreSQL backend instead
export const supabase = null;

export class DatabaseService {
  static isAvailable(): boolean {
    return false; // Disabled - using Render backend
  }

  static hasValidCredentials(): boolean {
    return false; // Disabled - using Render backend
  }
}