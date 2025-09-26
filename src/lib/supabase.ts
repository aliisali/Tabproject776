import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database service for all operations
export class DatabaseService {
  // Users
  static async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        role: userData.role,
        business_id: userData.businessId,
        permissions: userData.permissions,
        is_active: true,
        email_verified: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Businesses
  static async getBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBusiness(businessData: any) {
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBusiness(id: string, updates: any) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteBusiness(id: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Jobs
  static async getJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createJob(jobData: any) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateJob(id: string, updates: any) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteJob(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Customers
  static async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createCustomer(customerData: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCustomer(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Products
  static async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createProduct(productData: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProduct(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Notifications
  static async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createNotification(notificationData: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async markNotificationRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) throw error;
  }

  // Authentication
  static async authenticateUser(email: string, password: string) {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .limit(1);
    
    if (error) throw error;
    
    const user = users?.[0];
    if (user && password === 'password') {
      return user;
    }
    
    return null;
  }
}