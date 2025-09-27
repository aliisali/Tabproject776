import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database service with Supabase integration
export class DatabaseService {
  // Check if Supabase is available
  static isAvailable(): boolean {
    return supabase !== null;
  }

  // Authentication
  static async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    if (!supabase) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Users
  static async getUsers() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        business:businesses(name),
        parent:users!parent_id(name, email, role),
        created_by_user:users!created_by(name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createUser(userData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Hash password
    const passwordHash = await this.hashPassword(userData.password);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        password_hash: passwordHash,
        role: userData.role,
        business_id: userData.businessId,
        permissions: userData.permissions,
        is_active: userData.isActive,
        email_verified: userData.emailVerified
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, userData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...userData };
    
    // Hash password if provided
    if (userData.password) {
      updateData.password_hash = await this.hashPassword(userData.password);
      delete updateData.password;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Businesses
  static async getBusinesses() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        admin:users!admin_id(name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createBusiness(businessData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Jobs
  static async getJobs() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customers(name, email, phone, address),
        employee:users!employee_id(name, email),
        business:businesses(name)
      `)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createJob(jobData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Customers
  static async getCustomers() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createCustomer(customerData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Products
  static async getProducts() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createProduct(productData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 3D Models
  static async get3DModels() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('models_3d')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create3DModel(modelData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('models_3d')
      .insert([modelData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Module Permissions
  static async getModulePermissions() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('module_permissions')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async grantModulePermission(permissionData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('module_permissions')
      .upsert([permissionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Model Permissions
  static async getModelPermissions() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('model_permissions')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async grantModelPermission(permissionData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('model_permissions')
      .upsert([permissionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Activity Logs
  static async logActivity(activityData: any) {
    if (!supabase) return; // Don't throw error for logging
    
    const { error } = await supabase
      .from('activity_logs')
      .insert([activityData]);
    
    if (error) console.error('Failed to log activity:', error);
  }

  // Helper function to hash passwords
  private static async hashPassword(password: string): Promise<string> {
    // In a real implementation, this would use bcrypt or similar
    // For now, we'll use a simple hash (not secure for production)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}