import { supabase } from './supabase';
import { User, Business, Job, Customer, Product, Notification } from '../types';

// User Management with Database
export class DatabaseService {
  
  // Create user with hierarchy
  static async createUser(userData: {
    email: string;
    name: string;
    role: 'admin' | 'business' | 'employee';
    parentId?: string;
    permissions?: string[];
    businessId?: string;
    password?: string;
  }): Promise<User> {
    try {
      console.log('🔄 Creating user in database:', userData);
      
      // Use the database function for proper hierarchy
      const { data, error } = await supabase.rpc('create_user_with_hierarchy', {
        p_email: userData.email,
        p_name: userData.name,
        p_role: userData.role,
        p_parent_id: userData.parentId || null,
        p_permissions: userData.permissions || []
      });

      if (error) {
        console.error('❌ Database user creation error:', error);
        throw error;
      }

      // Fetch the created user
      const { data: newUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching created user:', fetchError);
        throw fetchError;
      }

      console.log('✅ User created in database:', newUser);
      return this.transformUser(newUser);
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  // Get all users with hierarchy
  static async getUsers(): Promise<User[]> {
    try {
      console.log('🔄 Fetching users from database...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Fetched users from database:', data?.length || 0, 'users');
      
      // Transform users without complex relationships for now
      return data?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        password: 'password', // Don't expose real password
        role: user.role,
        businessId: user.business_id,
        permissions: user.permissions || [],
        createdAt: user.created_at,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        verificationToken: user.verification_token
      })) || [];
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      return [];
    }
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          permissions: updates.permissions,
          business_id: updates.businessId,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }

      // Log activity
      await this.logActivity('user_updated', 'user', id, { updates });
      console.log('✅ User updated in database:', id);
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  // Delete user (soft delete)
  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
      }

      // Log activity
      await this.logActivity('user_deleted', 'user', id);
      console.log('✅ User deleted from database:', id);
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  // Module Access Management
  static async grantModuleAccess(
    userId: string, 
    moduleName: string, 
    canGrant: boolean = false
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('grant_module_access', {
        p_user_id: userId,
        p_module_name: moduleName,
        p_can_grant: canGrant
      });

      if (error) {
        console.error('❌ Error granting module access:', error);
        throw error;
      }

      console.log('✅ Module access granted:', { userId, moduleName, canGrant });
    } catch (error) {
      console.error('❌ Failed to grant module access:', error);
      throw error;
    }
  }

  static async revokeModuleAccess(userId: string, moduleName: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('revoke_module_access', {
        p_user_id: userId,
        p_module_name: moduleName
      });

      if (error) {
        console.error('❌ Error revoking module access:', error);
        throw error;
      }

      console.log('✅ Module access revoked:', { userId, moduleName });
    } catch (error) {
      console.error('❌ Failed to revoke module access:', error);
      throw error;
    }
  }

  static async getUserModuleAccess(userId: string, moduleName: string): Promise<{
    canAccess: boolean;
    canGrant: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .from('module_access')
        .select('can_access, can_grant_access')
        .eq('user_id', userId)
        .eq('module_name', moduleName)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('❌ Error checking module access:', error);
        throw error;
      }

      return {
        canAccess: data?.can_access || false,
        canGrant: data?.can_grant_access || false
      };
    } catch (error) {
      console.error('❌ Failed to check module access:', error);
      return { canAccess: false, canGrant: false };
    }
  }

  // Business Management
  static async createBusiness(businessData: Omit<Business, 'id' | 'createdAt'>): Promise<Business> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          name: businessData.name,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          admin_id: businessData.adminId,
          features: businessData.features,
          subscription: businessData.subscription
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating business:', error);
        throw error;
      }

      await this.logActivity('business_created', 'business', data.id);
      console.log('✅ Business created in database:', data);
      return this.transformBusiness(data);
    } catch (error) {
      console.error('❌ Failed to create business:', error);
      throw error;
    }
  }

  static async getBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching businesses:', error);
        throw error;
      }

      return data?.map(this.transformBusiness) || [];
    } catch (error) {
      console.error('❌ Failed to fetch businesses:', error);
      return [];
    }
  }

  // Job Management
  static async createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    try {
      const jobId = `JOB-${Date.now().toString().slice(-6)}`;
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          id: jobId,
          title: jobData.title,
          description: jobData.description,
          status: jobData.status,
          customer_id: jobData.customerId,
          employee_id: jobData.employeeId,
          business_id: jobData.businessId,
          scheduled_date: jobData.scheduledDate,
          completed_date: jobData.completedDate,
          quotation: jobData.quotation,
          invoice: jobData.invoice,
          signature: jobData.signature,
          images: jobData.images,
          documents: jobData.documents,
          checklist: jobData.checklist
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating job:', error);
        throw error;
      }

      await this.logActivity('job_created', 'job', data.id);
      console.log('✅ Job created in database:', data);
      return this.transformJob(data);
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    }
  }

  static async getJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching jobs:', error);
        throw error;
      }

      return data?.map(this.transformJob) || [];
    } catch (error) {
      console.error('❌ Failed to fetch jobs:', error);
      return [];
    }
  }

  // Activity Logging
  static async logActivity(
    action: string,
    targetType: string,
    targetId: string,
    details: any = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          ip_address: null, // Could be populated from request
          user_agent: navigator.userAgent
        }]);

      if (error) {
        console.error('❌ Error logging activity:', error);
        // Don't throw - logging shouldn't break main functionality
      }
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
    }
  }

  // Transform database objects to app types
  private static transformUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      password: 'password', // Don't expose real password
      role: dbUser.role,
      businessId: dbUser.business_id,
      permissions: dbUser.permissions || [],
      createdAt: dbUser.created_at,
      isActive: dbUser.is_active,
      emailVerified: dbUser.email_verified,
      verificationToken: dbUser.verification_token,
      parent: dbUser.parent ? {
        id: dbUser.parent.id,
        name: dbUser.parent.name,
        email: dbUser.parent.email,
        role: dbUser.parent.role
      } : undefined,
      createdBy: dbUser.created_by_user ? {
        id: dbUser.created_by_user.id,
        name: dbUser.created_by_user.name,
        email: dbUser.created_by_user.email
      } : undefined
    };
  }

  private static transformBusiness(dbBusiness: any): Business {
    return {
      id: dbBusiness.id,
      name: dbBusiness.name,
      address: dbBusiness.address,
      phone: dbBusiness.phone,
      email: dbBusiness.email,
      adminId: dbBusiness.admin_id,
      features: dbBusiness.features || [],
      subscription: dbBusiness.subscription,
      createdAt: dbBusiness.created_at,
      vrViewEnabled: dbBusiness.features?.includes('ar-camera') || false
    };
  }

  private static transformJob(dbJob: any): Job {
    return {
      id: dbJob.id,
      title: dbJob.title,
      description: dbJob.description,
      status: dbJob.status,
      customerId: dbJob.customer_id,
      employeeId: dbJob.employee_id,
      businessId: dbJob.business_id,
      scheduledDate: dbJob.scheduled_date,
      completedDate: dbJob.completed_date,
      quotation: dbJob.quotation,
      invoice: dbJob.invoice,
      signature: dbJob.signature,
      images: dbJob.images || [],
      documents: dbJob.documents || [],
      checklist: dbJob.checklist || [],
      createdAt: dbJob.created_at
    };
  }
}