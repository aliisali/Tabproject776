import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, Job, Customer, Notification, Product } from '../types';
import { EmailService } from '../services/EmailService';
import ApiService from '../services/api';
import { LocalStorageService } from '../lib/storage';

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Businesses
  businesses: Business[];
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => Promise<void>;
  updateBusiness: (id: string, business: Partial<Business>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  
  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    console.log('🚀 DataProvider: Initializing...');
    
    // Force refresh data to handle domain changes
    LocalStorageService.forceRefresh();
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📊 Loading data from multiple sources...');
      
      // Use localStorage for data
      console.log('📝 Using localStorage data...');
      LocalStorageService.initializeData();
      
      setUsers(LocalStorageService.getUsers());
      setBusinesses(LocalStorageService.getBusinesses());
      setJobs(LocalStorageService.getJobs());
      setCustomers(LocalStorageService.getCustomers());
      setProducts(LocalStorageService.getProducts());
      setNotifications(LocalStorageService.getNotifications());
      
      console.log('✅ localStorage data loaded:', {
        users: LocalStorageService.getUsers().length,
        businesses: LocalStorageService.getBusinesses().length,
        jobs: LocalStorageService.getJobs().length,
        customers: LocalStorageService.getCustomers().length,
        products: LocalStorageService.getProducts().length
      });
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Initialize localStorage as final fallback
      LocalStorageService.initializeData();
      setUsers(LocalStorageService.getUsers());
      setBusinesses(LocalStorageService.getBusinesses());
      setJobs(LocalStorageService.getJobs());
      setCustomers(LocalStorageService.getCustomers());
      setProducts(LocalStorageService.getProducts());
      setNotifications(LocalStorageService.getNotifications());
    }
    
    setLoading(false);
  };

  // Enhanced data persistence with multiple backends
  const saveToMultipleSources = async (
    operation: 'create' | 'update' | 'delete',
    type: 'user' | 'business' | 'job' | 'customer' | 'product',
    data: any,
    id?: string
  ) => {
    // Try API if Supabase fails
    const operations = [];
    try {
      switch (operation) {
        case 'create':
          if (type === 'user') operations.push(ApiService.createUser(data));
          else if (type === 'business') operations.push(ApiService.createBusiness(data));
          else if (type === 'job') operations.push(ApiService.createJob(data));
          else if (type === 'customer') operations.push(ApiService.createCustomer(data));
          else if (type === 'product') operations.push(ApiService.createProduct(data));
          break;
        case 'update':
          if (id) {
            if (type === 'user') operations.push(ApiService.updateUser(id, data));
            else if (type === 'business') operations.push(ApiService.updateBusiness(id, data));
            else if (type === 'job') operations.push(ApiService.updateJob(id, data));
            else if (type === 'customer') operations.push(ApiService.updateCustomer(id, data));
            else if (type === 'product') operations.push(ApiService.updateProduct(id, data));
          }
          break;
        case 'delete':
          if (id) {
            if (type === 'user') operations.push(ApiService.deleteUser(id));
            else if (type === 'business') operations.push(ApiService.deleteBusiness(id));
            else if (type === 'job') operations.push(ApiService.deleteJob(id));
            else if (type === 'customer') operations.push(ApiService.deleteCustomer(id));
            else if (type === 'product') operations.push(ApiService.deleteProduct(id));
          }
          break;
      }
      
      // Execute API operation
      if (operations.length > 0) {
        await Promise.all(operations);
        console.log(`✅ ${operation} ${type} via API successful`);
        return;
      }
    } catch (apiError) {
      console.log(`API ${operation} failed, using localStorage:`, apiError);
    }
    
    // Final fallback to localStorage
    switch (operation) {
      case 'create':
        if (type === 'user') LocalStorageService.createUser(data);
        else if (type === 'business') LocalStorageService.createBusiness(data);
        else if (type === 'job') LocalStorageService.createJob(data);
        else if (type === 'customer') LocalStorageService.createCustomer(data);
        else if (type === 'product') LocalStorageService.createProduct(data);
        break;
      case 'update':
        if (id) {
          if (type === 'user') LocalStorageService.updateUser(id, data);
          else if (type === 'business') LocalStorageService.updateBusiness(id, data);
          else if (type === 'job') LocalStorageService.updateJob(id, data);
          else if (type === 'customer') LocalStorageService.updateCustomer(id, data);
          else if (type === 'product') LocalStorageService.updateProduct(id, data);
        }
        break;
      case 'delete':
        if (id) {
          if (type === 'user') LocalStorageService.deleteUser(id);
          else if (type === 'business') LocalStorageService.deleteBusiness(id);
          else if (type === 'job') LocalStorageService.deleteJob(id);
          else if (type === 'customer') LocalStorageService.deleteCustomer(id);
          else if (type === 'product') LocalStorageService.deleteProduct(id);
        }
        break;
    }
    console.log(`✅ ${operation} ${type} via localStorage successful`);
  };

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    await loadData();
  };

  // User management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('👤 Creating user:', userData.name);
      
      let newUser = null;
      
      // Try Supabase first
      // TODO: Implement Supabase integration
      // if (DatabaseService.isAvailable() && DatabaseService.hasValidCredentials()) {
      //   try {
      //     console.log('🗄️ Creating user via Supabase...');
      //     const supabaseUser = await DatabaseService.createUser(userData);
      //
      //     if (supabaseUser) {
      //       newUser = supabaseUser;
      //       console.log('✅ User created via Supabase');
      //     }
      //   } catch (supabaseError) {
      //     console.log('⚠️ Supabase user creation failed, using localStorage:', supabaseError);
      //   }
      // }
      
      // Fallback to localStorage
      if (!newUser) {
        newUser = LocalStorageService.createUser(userData);
        console.log('✅ User created via localStorage');
      }
      
      setUsers(prev => [...prev, newUser]);
      
      // Send welcome email with credentials
      try {
        const businessName = newUser.businessId 
          ? businesses.find(b => b.id === newUser.businessId)?.name 
          : undefined;
          
        await EmailService.sendWelcomeEmail({
          name: newUser.name,
          email: newUser.email,
          password: userData.password, // Use original password from form
          role: newUser.role,
          businessName
        });
        
        console.log('✅ Welcome email sent to:', newUser.email);
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't fail user creation if email fails
      }
      
      showSuccessMessage(`User "${userData.name}" created successfully!`);
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      showErrorMessage('Failed to create user. Please try again.');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      console.log('📝 Updating user:', id);
      
      let success = false;
      
      // Try Supabase first
      // TODO: Implement Supabase integration
      // if (DatabaseService.isAvailable() && DatabaseService.hasValidCredentials()) {
      //   try {
      //     await DatabaseService.updateUser(id, userData);
      //     console.log('✅ User updated via Supabase');
      //     success = true;
      //   } catch (supabaseError) {
      //     console.log('⚠️ Supabase update failed, using localStorage:', supabaseError);
      //   }
      // }
      
      // Fallback to localStorage
      if (!success) {
        LocalStorageService.updateUser(id, userData);
        console.log('✅ User updated via localStorage');
      }
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      
      // Send password reset email if password was changed
      const originalUser = users.find(u => u.id === id);
      if (userData.password && originalUser) {
        try {
          await EmailService.sendPasswordResetEmail({
            name: originalUser.name,
            email: originalUser.email,
            newPassword: userData.password
          });
          console.log('✅ Password reset email sent to:', originalUser.email);
        } catch (emailError) {
          console.error('⚠️ Failed to send password reset email:', emailError);
        }
      }
      
      showSuccessMessage('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorMessage('Failed to update user.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log('🗑️ Deleting user:', id);
      
      let success = false;
      
      // Try Supabase first
      // TODO: Implement Supabase integration
      // if (DatabaseService.isAvailable() && DatabaseService.hasValidCredentials()) {
      //   try {
      //     await DatabaseService.deleteUser(id);
      //     console.log('✅ User deleted via Supabase');
      //     success = true;
      //   } catch (supabaseError) {
      //     console.log('⚠️ Supabase delete failed, using localStorage:', supabaseError);
      //   }
      // }
      
      // Fallback to localStorage
      if (!success) {
        LocalStorageService.deleteUser(id);
        console.log('✅ User deleted via localStorage');
      }
      
      setUsers(prev => prev.filter(user => user.id !== id));
      showSuccessMessage('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      showErrorMessage('Failed to delete user.');
    }
  };

  // Business management
  const addBusiness = async (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    try {
      // Create business via multiple backends
      await saveToMultipleSources('create', 'business', businessData);
      
      const newBusiness = LocalStorageService.createBusiness(businessData);
      
      setBusinesses(prev => [...prev, newBusiness]);
      
      showSuccessMessage('Business created successfully!');
    } catch (error) {
      console.error('Error creating business:', error);
      showErrorMessage('Failed to create business.');
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      // Update business via multiple backends
      await saveToMultipleSources('update', 'business', businessData, id);
      
      setBusinesses(prev => prev.map(business => 
        business.id === id ? { ...business, ...businessData } : business
      ));
      
      showSuccessMessage('Business updated successfully!');
    } catch (error) {
      console.error('Error updating business:', error);
      showErrorMessage('Failed to update business.');
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      // Delete business via multiple backends
      await saveToMultipleSources('delete', 'business', null, id);
      
      setBusinesses(prev => prev.filter(business => business.id !== id));
      showSuccessMessage('Business deleted successfully!');
    } catch (error) {
      console.error('Error deleting business:', error);
      showErrorMessage('Failed to delete business.');
    }
  };

  // Job management
  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    try {
      // Create job via multiple backends
      await saveToMultipleSources('create', 'job', jobData);
      
      const newJob = LocalStorageService.createJob(jobData);
      
      setJobs(prev => [...prev, newJob]);
      
      showSuccessMessage('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      showErrorMessage('Failed to create job.');
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      // Update job via multiple backends
      await saveToMultipleSources('update', 'job', jobData, id);
      
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, ...jobData } : job
      ));
      
      showSuccessMessage('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      showErrorMessage('Failed to update job.');
    }
  };

  const deleteJob = async (id: string) => {
    try {
      // Delete job via multiple backends
      await saveToMultipleSources('delete', 'job', null, id);
      
      setJobs(prev => prev.filter(job => job.id !== id));
      showSuccessMessage('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      showErrorMessage('Failed to delete job.');
    }
  };

  // Customer management
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      // Create customer via multiple backends
      await saveToMultipleSources('create', 'customer', customerData);
      
      const newCustomer = LocalStorageService.createCustomer(customerData);
      
      setCustomers(prev => [...prev, newCustomer]);
      
      showSuccessMessage('Customer added successfully!');
    } catch (error) {
      console.error('Error creating customer:', error);
      showErrorMessage('Failed to create customer.');
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      // Update customer via multiple backends
      await saveToMultipleSources('update', 'customer', customerData, id);
      
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? { ...customer, ...customerData } : customer
      ));
      
      showSuccessMessage('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      showErrorMessage('Failed to update customer.');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      // Delete customer via multiple backends
      await saveToMultipleSources('delete', 'customer', null, id);
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      showSuccessMessage('Customer deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showErrorMessage('Failed to delete customer.');
    }
  };

  // Product management
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      // Create product via multiple backends
      await saveToMultipleSources('create', 'product', productData);
      
      const newProduct = LocalStorageService.createProduct(productData);
      
      setProducts(prev => [...prev, newProduct]);
      
      showSuccessMessage('Product added successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      showErrorMessage('Failed to create product.');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      // Update product via multiple backends
      await saveToMultipleSources('update', 'product', productData, id);
      
      const originalProduct = products.find(p => p.id === id);
      if (originalProduct) {
        const updatedProduct = { ...originalProduct, ...productData };

        setProducts(prev => prev.map(product =>
          product.id === id ? updatedProduct : product
        ));
      }
      
      showSuccessMessage('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      showErrorMessage('Failed to update product.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete product via multiple backends
      await saveToMultipleSources('delete', 'product', null, id);
      
      setProducts(prev => prev.filter(product => product.id !== id));
      showSuccessMessage('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      showErrorMessage('Failed to delete product.');
    }
  };

  // Notification management
  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = LocalStorageService.createNotification(notificationData);
      setNotifications(prev => [...prev, newNotification]);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      // Try database first, then localStorage
      // TODO: Implement Supabase integration
      // if (DatabaseService.isAvailable()) {
      //   try {
      //     await DatabaseService.markNotificationRead(id);
      //   } catch (error) {
      //     LocalStorageService.markNotificationRead(id);
      //   }
      // } else {
        LocalStorageService.markNotificationRead(id);
      // }
      
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Helper functions for notifications
  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      successDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      errorDiv.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 300);
    }, 3000);
  };

  return (
    <DataContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      businesses,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      jobs,
      addJob,
      updateJob,
      deleteJob,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      notifications,
      addNotification,
      markNotificationRead,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      loading,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}