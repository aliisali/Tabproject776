import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database service with full CRUD operations
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

  static async signUp(email: string, password: string, userData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: undefined // Disable email confirmation for demo
      }
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

  // Users CRUD
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
    
    // Transform data to match frontend interface
    return data.map(user => ({
      ...user,
      businessId: user.business_id,
      parentId: user.parent_id,
      createdBy: user.created_by,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      password: 'password' // Don't expose real password hash
    }));
  }

  static async createUser(userData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: false // Skip email confirmation
      });
      
      if (authError) throw authError;
      
      // Create user record
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          business_id: userData.businessId,
          permissions: userData.permissions,
          is_active: userData.isActive,
          email_verified: userData.emailVerified
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        businessId: data.business_id,
        isActive: data.is_active,
        emailVerified: data.email_verified,
        createdAt: data.created_at,
        password: userData.password
      };
    } catch (error) {
      console.error('Error creating user in Supabase:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...userData };
    
    // Handle field mapping
    if (userData.businessId !== undefined) {
      updateData.business_id = userData.businessId;
      delete updateData.businessId;
    }
    if (userData.isActive !== undefined) {
      updateData.is_active = userData.isActive;
      delete updateData.isActive;
    }
    if (userData.emailVerified !== undefined) {
      updateData.email_verified = userData.emailVerified;
      delete updateData.emailVerified;
    }
    
    // Update password in auth if provided
    if (userData.password) {
      try {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          password: userData.password
        });
        if (authError) console.warn('Failed to update auth password:', authError);
      } catch (error) {
        console.warn('Auth password update failed:', error);
      }
      delete updateData.password;
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      businessId: data.business_id,
      isActive: data.is_active,
      emailVerified: data.email_verified,
      createdAt: data.created_at
    };
  }

  static async deleteUser(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Delete from auth
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (error) {
      console.warn('Failed to delete auth user:', error);
    }
    
    // Delete from users table
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Businesses CRUD
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
    
    return data.map(business => ({
      ...business,
      adminId: business.admin_id,
      createdAt: business.created_at,
      updatedAt: business.updated_at
    }));
  }

  static async createBusiness(businessData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
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
    
    if (error) throw error;
    
    return {
      ...data,
      adminId: data.admin_id,
      createdAt: data.created_at
    };
  }

  static async updateBusiness(id: string, businessData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...businessData };
    if (businessData.adminId !== undefined) {
      updateData.admin_id = businessData.adminId;
      delete updateData.adminId;
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      adminId: data.admin_id,
      createdAt: data.created_at
    };
  }

  static async deleteBusiness(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Jobs CRUD
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
    
    return data.map(job => ({
      ...job,
      customerId: job.customer_id,
      employeeId: job.employee_id,
      businessId: job.business_id,
      scheduledDate: job.scheduled_date,
      completedDate: job.completed_date,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }));
  }

  static async createJob(jobData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        id: jobData.id || `JOB-${Date.now().toString().slice(-6)}`,
        title: jobData.title,
        description: jobData.description,
        customer_id: jobData.customerId,
        employee_id: jobData.employeeId,
        business_id: jobData.businessId,
        scheduled_date: jobData.scheduledDate,
        quotation: jobData.quotation,
        checklist: jobData.checklist,
        status: jobData.status || 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      customerId: data.customer_id,
      employeeId: data.employee_id,
      businessId: data.business_id,
      scheduledDate: data.scheduled_date,
      completedDate: data.completed_date,
      createdAt: data.created_at
    };
  }

  static async updateJob(id: string, jobData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...jobData };
    if (jobData.customerId !== undefined) {
      updateData.customer_id = jobData.customerId;
      delete updateData.customerId;
    }
    if (jobData.employeeId !== undefined) {
      updateData.employee_id = jobData.employeeId;
      delete updateData.employeeId;
    }
    if (jobData.businessId !== undefined) {
      updateData.business_id = jobData.businessId;
      delete updateData.businessId;
    }
    if (jobData.scheduledDate !== undefined) {
      updateData.scheduled_date = jobData.scheduledDate;
      delete updateData.scheduledDate;
    }
    if (jobData.completedDate !== undefined) {
      updateData.completed_date = jobData.completedDate;
      delete updateData.completedDate;
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      customerId: data.customer_id,
      employeeId: data.employee_id,
      businessId: data.business_id,
      scheduledDate: data.scheduled_date,
      completedDate: data.completed_date,
      createdAt: data.created_at
    };
  }

  static async deleteJob(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Customers CRUD
  static async getCustomers() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(customer => ({
      ...customer,
      businessId: customer.business_id,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    }));
  }

  static async createCustomer(customerData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        mobile: customerData.mobile,
        address: customerData.address,
        postcode: customerData.postcode,
        business_id: customerData.businessId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      businessId: data.business_id,
      createdAt: data.created_at
    };
  }

  static async updateCustomer(id: string, customerData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...customerData };
    if (customerData.businessId !== undefined) {
      updateData.business_id = customerData.businessId;
      delete updateData.businessId;
    }
    
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      businessId: data.business_id,
      createdAt: data.created_at
    };
  }

  static async deleteCustomer(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Products CRUD
  static async getProducts() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(product => ({
      ...product,
      model3d: product.model_3d,
      arModel: product.ar_model,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));
  }

  static async createProduct(productData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        category: productData.category,
        description: productData.description,
        image: productData.image,
        model_3d: productData.model3d,
        ar_model: productData.arModel,
        specifications: productData.specifications,
        price: productData.price,
        is_active: productData.isActive
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      model3d: data.model_3d,
      arModel: data.ar_model,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  }

  static async updateProduct(id: string, productData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const updateData = { ...productData };
    if (productData.model3d !== undefined) {
      updateData.model_3d = productData.model3d;
      delete updateData.model3d;
    }
    if (productData.arModel !== undefined) {
      updateData.ar_model = productData.arModel;
      delete updateData.arModel;
    }
    if (productData.isActive !== undefined) {
      updateData.is_active = productData.isActive;
      delete updateData.isActive;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      model3d: data.model_3d,
      arModel: data.ar_model,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  }

  static async deleteProduct(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }

  // Notifications CRUD
  static async getNotifications(userId?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(notification => ({
      ...notification,
      userId: notification.user_id,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at
    }));
  }

  static async createNotification(notificationData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        read: notificationData.read || false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      userId: data.user_id,
      createdAt: data.created_at
    };
  }

  static async markNotificationRead(id: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      userId: data.user_id,
      createdAt: data.created_at
    };
  }

  // 3D Models CRUD
  static async get3DModels() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('models_3d')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(model => ({
      ...model,
      originalImage: model.original_image,
      modelUrl: model.model_url,
      createdBy: model.created_by,
      createdAt: model.created_at,
      updatedAt: model.updated_at
    }));
  }

  static async create3DModel(modelData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('models_3d')
      .insert([{
        name: modelData.name,
        original_image: modelData.originalImage,
        model_url: modelData.modelUrl,
        thumbnail: modelData.thumbnail,
        status: modelData.status,
        settings: modelData.settings,
        created_by: modelData.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      originalImage: data.original_image,
      modelUrl: data.model_url,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  // Model Permissions
  static async getModelPermissions() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('model_permissions')
      .select('*');
    
    if (error) throw error;
    
    return data.map(permission => ({
      ...permission,
      businessId: permission.business_id,
      canView3DModels: permission.can_view_3d_models,
      canUseInAR: permission.can_use_in_ar,
      grantedBy: permission.granted_by,
      grantedAt: permission.granted_at,
      isActive: permission.is_active
    }));
  }

  static async grantModelPermission(permissionData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('model_permissions')
      .upsert([{
        business_id: permissionData.businessId,
        can_view_3d_models: permissionData.canView3DModels,
        can_use_in_ar: permissionData.canUseInAR,
        granted_by: permissionData.grantedBy,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      businessId: data.business_id,
      canView3DModels: data.can_view_3d_models,
      canUseInAR: data.can_use_in_ar,
      grantedBy: data.granted_by,
      grantedAt: data.granted_at
    };
  }

  // Module Permissions
  static async getModulePermissions() {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('module_access')
      .select('*');
    
    if (error) throw error;
    
    return data.map(permission => ({
      ...permission,
      userId: permission.user_id,
      moduleName: permission.module_name,
      canAccess: permission.can_access,
      canGrantAccess: permission.can_grant_access,
      grantedBy: permission.granted_by,
      grantedAt: permission.granted_at,
      isActive: permission.is_active
    }));
  }

  static async grantModulePermission(permissionData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('module_access')
      .upsert([{
        user_id: permissionData.userId,
        module_name: permissionData.moduleName,
        can_access: permissionData.canAccess,
        can_grant_access: permissionData.canGrantAccess,
        granted_by: permissionData.grantedBy,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      userId: data.user_id,
      moduleName: data.module_name,
      canAccess: data.can_access,
      canGrantAccess: data.can_grant_access,
      grantedBy: data.granted_by,
      grantedAt: data.granted_at
    };
  }

  // Activity Logs
  static async logActivity(activityData: any) {
    if (!supabase) return; // Don't throw error for logging
    
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: activityData.userId,
        action: activityData.action,
        target_type: activityData.targetType,
        target_id: activityData.targetId,
        details: activityData.details,
        ip_address: activityData.ipAddress,
        user_agent: activityData.userAgent
      }]);
    
    if (error) console.error('Failed to log activity:', error);
  }

  // Session Management
  static async createSession(sessionData: any) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([{
        user_id: sessionData.userId,
        session_token: sessionData.sessionToken,
        expires_at: sessionData.expiresAt,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteSession(sessionToken: string) {
    if (!supabase) return;
    
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken);
    
    if (error) console.error('Failed to delete session:', error);
  }
}