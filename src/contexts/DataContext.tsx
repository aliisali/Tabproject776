import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, Job, Customer, Notification, Product } from '../types';
import { DatabaseService } from '../lib/database';
import { supabase } from '../lib/supabase';

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

// Storage keys with version to prevent conflicts
const STORAGE_KEYS = {
  USERS: 'jobmanager_users_v3',
  BUSINESSES: 'jobmanager_businesses_v3',
  JOBS: 'jobmanager_jobs_v3',
  CUSTOMERS: 'jobmanager_customers_v3',
  NOTIFICATIONS: 'jobmanager_notifications_v3',
  PRODUCTS: 'jobmanager_products_v3'
};

// Default data
const DEFAULT_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@platform.com',
    name: 'Platform Admin',
    role: 'admin',
    permissions: ['all'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'business@company.com',
    name: 'Business Manager',
    role: 'business',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['manage_employees', 'view_dashboard', 'create_jobs'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'employee@company.com',
    name: 'Field Employee',
    role: 'employee',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['create_jobs', 'manage_tasks', 'capture_signatures'],
    createdAt: '2024-01-01',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
];

const DEFAULT_BUSINESSES: Business[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'ABC Construction Co.',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@abcconstruction.com',
    adminId: '550e8400-e29b-41d4-a716-446655440004',
    features: ['job_management', 'calendar', 'reports', 'camera'],
    subscription: 'premium',
    createdAt: '2024-01-01'
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'ABC Corp',
    email: 'contact@abccorp.com',
    phone: '+1 (555) 111-2222',
    mobile: '+1 (555) 111-3333',
    address: '123 Business Ave, City, State',
    postcode: '12345',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2024-01-01'
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Industrial HVAC Unit',
    category: 'HVAC Systems',
    description: 'High-efficiency commercial HVAC system',
    image: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: ['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'],
    price: 2500,
    isActive: true,
    createdAt: '2024-01-01'
  }
];

const DEFAULT_JOBS: Job[] = [
  {
    id: 'JOB-001',
    title: 'HVAC Installation',
    description: 'Install new HVAC system in office building',
    status: 'completed',
    customerId: '550e8400-e29b-41d4-a716-446655440006',
    employeeId: '550e8400-e29b-41d4-a716-446655440005',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    scheduledDate: '2024-01-15T09:00:00Z',
    completedDate: '2024-01-15T16:30:00Z',
    quotation: 2500,
    invoice: 2500,
    images: [],
    documents: [],
    checklist: [
      { id: '1', text: 'Site inspection', completed: true },
      { id: '2', text: 'Equipment delivery', completed: true },
      { id: '3', text: 'Installation', completed: true },
      { id: '4', text: 'Testing', completed: true }
    ],
    createdAt: '2024-01-15T09:00:00Z'
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '550e8400-e29b-41d4-a716-44665544000a',
    userId: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Welcome to JobManager Pro',
    message: 'Your account has been set up successfully!',
    type: 'system',
    read: false,
    createdAt: '2024-01-01T10:00:00Z'
  }
];

// Storage utilities with immediate persistence
const saveToStorage = (key: string, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    console.log(`✅ SAVED ${key}:`, data.length || Object.keys(data).length, 'items');
    
    // Verify save worked
    const verification = localStorage.getItem(key);
    if (!verification) {
      throw new Error('Save verification failed');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ FAILED TO SAVE ${key}:`, error);
    return false;
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored && stored !== 'undefined' && stored !== 'null') {
      const parsed = JSON.parse(stored);
      console.log(`✅ LOADED ${key}:`, parsed.length || Object.keys(parsed).length, 'items');
      return parsed;
    }
  } catch (error) {
    console.error(`❌ FAILED TO LOAD ${key}:`, error);
  }
  
  console.log(`📝 USING DEFAULT ${key}:`, defaultValue.length || Object.keys(defaultValue).length, 'items');
  // Save defaults immediately
  saveToStorage(key, defaultValue);
  return defaultValue;
};

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
    loadDataFromDatabase();
  }, []);

  const loadDataFromDatabase = async () => {
    console.log('🚀 DataProvider: Loading data from database...');
    setLoading(true);
    
    try {
      // Test basic connection first
      console.log('🔄 Testing basic Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Basic connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('✅ Basic connection successful');
      
      // Load data from database with individual error handling
      let loadedUsers = [];
      let loadedBusinesses = [];
      let loadedJobs = [];
      
      try {
        loadedUsers = await DatabaseService.getUsers();
        console.log('✅ Users loaded:', loadedUsers.length);
      } catch (error) {
        console.error('❌ Failed to load users:', error);
      }
      
      try {
        loadedBusinesses = await DatabaseService.getBusinesses();
        console.log('✅ Businesses loaded:', loadedBusinesses.length);
      } catch (error) {
        console.error('❌ Failed to load businesses:', error);
      }
      
      try {
        loadedJobs = await DatabaseService.getJobs();
        console.log('✅ Jobs loaded:', loadedJobs.length);
      } catch (error) {
        console.error('❌ Failed to load jobs:', error);
      }

      // Fallback to localStorage for data not yet migrated
      const loadedCustomers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
      const loadedNotifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
      const loadedProducts = loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);

      // Set state
      setUsers(loadedUsers.length > 0 ? loadedUsers : loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS));
      setBusinesses(loadedBusinesses.length > 0 ? loadedBusinesses : loadFromStorage(STORAGE_KEYS.BUSINESSES, DEFAULT_BUSINESSES));
      setJobs(loadedJobs.length > 0 ? loadedJobs : loadFromStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS));
      setCustomers(loadedCustomers);
      setNotifications(loadedNotifications);
      setProducts(loadedProducts);
      
      console.log('✅ DataProvider: Database data loaded successfully');
    } catch (error) {
      console.error('❌ DataProvider: Failed to load from database, using localStorage:', error);
      
      // Fallback to localStorage
      const loadedUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      const loadedBusinesses = loadFromStorage(STORAGE_KEYS.BUSINESSES, DEFAULT_BUSINESSES);
      const loadedJobs = loadFromStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS);
      const loadedCustomers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
      const loadedNotifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
      const loadedProducts = loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);

      setUsers(loadedUsers);
      setBusinesses(loadedBusinesses);
      setJobs(loadedJobs);
      setCustomers(loadedCustomers);
      setNotifications(loadedNotifications);
      setProducts(loadedProducts);
    }
    
    setLoading(false);
  };
  // Auto-save users whenever they change
  useEffect(() => {
    if (!loading && users.length > 0) {
      const saved = saveToStorage(STORAGE_KEYS.USERS, users);
      if (saved) {
        // Dispatch event for AuthContext
        window.dispatchEvent(new CustomEvent('usersUpdated', { detail: users }));
      }
    }
  }, [users, loading]);

  // Auto-save other data when they change
  useEffect(() => {
    if (!loading && businesses.length > 0) {
      saveToStorage(STORAGE_KEYS.BUSINESSES, businesses);
    }
  }, [businesses, loading]);

  useEffect(() => {
    if (!loading && jobs.length > 0) {
      saveToStorage(STORAGE_KEYS.JOBS, jobs);
    }
  }, [jobs, loading]);

  useEffect(() => {
    if (!loading && customers.length > 0) {
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }
  }, [customers, loading]);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }, [notifications, loading]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    }
  }, [products, loading]);

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    const loadedUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setUsers(loadedUsers);
  };

  // User management with immediate persistence
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('👤 Creating user in database:', userData);
      
      // Get current user from auth context
      const currentUserData = JSON.parse(localStorage.getItem('current_user') || '{}');
      
      // Create user in database
      const newUser = await DatabaseService.createUser({
        email: userData.email.trim().toLowerCase(),
        name: userData.name.trim(),
        role: userData.role,
        parentId: currentUserData?.id, // Set current user as parent
        permissions: userData.permissions || [],
        businessId: userData.businessId,
        password: userData.password || 'password'
      });

      // Update local state
      setUsers(prev => [...prev, newUser]);
      
      showSuccessMessage(`User "${newUser.name}" created successfully!`);
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showErrorMessage(`Failed to create user: ${errorMessage}`);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      // Update in database
      await DatabaseService.updateUser(id, userData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...userData } : user
      ));
      
      showSuccessMessage('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorMessage('Failed to update user.');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Delete from database (soft delete)
      await DatabaseService.deleteUser(id);
      
      // Update local state
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
      // Create in database
      const newBusiness = await DatabaseService.createBusiness(businessData);
      
      // Update local state
      setBusinesses(prev => [...prev, newBusiness]);
      
      showSuccessMessage(`Business "${newBusiness.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating business:', error);
      showErrorMessage('Failed to create business. Please try again.');
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      const updatedBusinesses = businesses.map(business => 
        business.id === id ? { ...business, ...businessData } : business
      );
      setBusinesses(updatedBusinesses);
      
      showSuccessMessage('Business updated successfully!');
    } catch (error) {
      console.error('Error updating business:', error);
      showErrorMessage('Failed to update business.');
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      const updatedBusinesses = businesses.filter(business => business.id !== id);
      setBusinesses(updatedBusinesses);
      
      showSuccessMessage('Business deleted successfully!');
    } catch (error) {
      console.error('Error deleting business:', error);
      showErrorMessage('Failed to delete business.');
    }
  };

  // Job management
  const addJob = async (jobData: Omit<Job, 'id' | 'createdAt'>) => {
    try {
      // Create in database
      const newJob = await DatabaseService.createJob(jobData);
      
      // Update local state
      setJobs(prev => [...prev, newJob]);
      
      showSuccessMessage(`Job "${newJob.title}" created successfully!`);
    } catch (error) {
      console.error('Error creating job:', error);
      showErrorMessage('Failed to create job. Please try again.');
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      const updatedJobs = jobs.map(job => 
        job.id === id ? { ...job, ...jobData } : job
      );
      setJobs(updatedJobs);
      
      showSuccessMessage('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      showErrorMessage('Failed to update job.');
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const updatedJobs = jobs.filter(job => job.id !== id);
      setJobs(updatedJobs);
      
      showSuccessMessage('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      showErrorMessage('Failed to delete job.');
    }
  };

  // Customer management
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer: Customer = {
        id: `customer-${Date.now()}`,
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || '',
        mobile: customerData.mobile || '',
        address: customerData.address,
        postcode: customerData.postcode,
        businessId: customerData.businessId,
        createdAt: new Date().toISOString()
      };
      
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      
      showSuccessMessage(`Customer "${newCustomer.name}" added successfully!`);
    } catch (error) {
      console.error('Error creating customer:', error);
      showErrorMessage('Failed to create customer. Please try again.');
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const updatedCustomers = customers.map(customer => 
        customer.id === id ? { ...customer, ...customerData } : customer
      );
      setCustomers(updatedCustomers);
      
      showSuccessMessage('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      showErrorMessage('Failed to update customer.');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      
      showSuccessMessage('Customer deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showErrorMessage('Failed to delete customer.');
    }
  };

  // Product management
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: productData.name,
        category: productData.category,
        description: productData.description,
        image: productData.image,
        model3d: productData.model3d,
        arModel: productData.arModel,
        specifications: productData.specifications || [],
        price: productData.price,
        isActive: productData.isActive !== false,
        createdAt: new Date().toISOString()
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      
      showSuccessMessage(`Product "${newProduct.name}" added successfully!`);
    } catch (error) {
      console.error('Error creating product:', error);
      showErrorMessage('Failed to create product. Please try again.');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updatedProducts = products.map(product => 
        product.id === id ? { ...product, ...productData } : product
      );
      setProducts(updatedProducts);
      
      showSuccessMessage('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      showErrorMessage('Failed to update product.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      
      showSuccessMessage('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      showErrorMessage('Failed to delete product.');
    }
  };

  // Notification management
  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        read: notificationData.read || false,
        createdAt: new Date().toISOString()
      };
      
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
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