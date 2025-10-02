import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DatabaseService {
  static isAvailable(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  }

  static hasValidCredentials(): boolean {
    return !!(supabaseUrl && supabaseAnonKey);
  }
}