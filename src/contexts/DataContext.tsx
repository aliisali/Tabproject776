import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, Job, Customer, Notification, Product } from '../types';
import { DatabaseService } from '../lib/supabase';
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
  const [useDatabase, setUseDatabase] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    console.log('🚀 DataProvider: Initializing...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try database first
      console.log('🔄 Trying database connection...');
      const dbUsers = await DatabaseService.getUsers();
      
      if (dbUsers && dbUsers.length > 0) {
        console.log('✅ Database connected, loading from Supabase');
        setUseDatabase(true);
        
        // Load all data from database
        const [dbBusinesses, dbJobs, dbCustomers, dbNotifications, dbProducts] = await Promise.all([
          DatabaseService.getBusinesses(),
          DatabaseService.getJobs(),
          DatabaseService.getCustomers(),
          DatabaseService.getNotifications(),
          DatabaseService.getProducts()
        ]);
        
        setUsers(dbUsers);
        setBusinesses(dbBusinesses);
        setJobs(dbJobs);
        setCustomers(dbCustomers);
        setNotifications(dbNotifications);
        setProducts(dbProducts);
      } else {
        throw new Error('No database data found');
      }
    } catch (error) {
      console.log('⚠️ Database not available, using localStorage');
      setUseDatabase(false);
      
      // Fallback to localStorage
      LocalStorageService.initializeData();
      setUsers(LocalStorageService.getUsers());
      setBusinesses(LocalStorageService.getBusinesses());
      setJobs(LocalStorageService.getJobs());
      setCustomers(LocalStorageService.getCustomers());
      setNotifications(LocalStorageService.getNotifications());
      setProducts(LocalStorageService.getProducts());
    }
    
    setLoading(false);
    console.log('✅ DataProvider: Initialization complete');
  };

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    await loadData();
  };

  // User management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('👤 Creating user:', userData.name);
      
      if (useDatabase) {
        const newUser = await DatabaseService.createUser(userData);
        setUsers(prev => [...prev, newUser]);
      } else {
        const newUser = LocalStorageService.createUser(userData);
        setUsers(prev => [...prev, newUser]);
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
      if (useDatabase) {
        await DatabaseService.updateUser(id, userData);
      } else {
        LocalStorageService.updateUser(id, userData);
      }
      
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
      if (useDatabase) {
        await DatabaseService.deleteUser(id);
      } else {
        LocalStorageService.deleteUser(id);
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
      if (useDatabase) {
        const newBusiness = await DatabaseService.createBusiness(businessData);
        setBusinesses(prev => [...prev, newBusiness]);
      } else {
        const newBusiness = LocalStorageService.createBusiness(businessData);
        setBusinesses(prev => [...prev, newBusiness]);
      }
      
      showSuccessMessage('Business created successfully!');
    } catch (error) {
      console.error('Error creating business:', error);
      showErrorMessage('Failed to create business.');
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      if (useDatabase) {
        await DatabaseService.updateBusiness(id, businessData);
      }
      
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
      if (useDatabase) {
        await DatabaseService.deleteBusiness(id);
      }
      
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
      if (useDatabase) {
        const newJob = await DatabaseService.createJob(jobData);
        setJobs(prev => [...prev, newJob]);
      } else {
        const newJob = LocalStorageService.createJob(jobData);
        setJobs(prev => [...prev, newJob]);
      }
      
      showSuccessMessage('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      showErrorMessage('Failed to create job.');
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      if (useDatabase) {
        await DatabaseService.updateJob(id, jobData);
      }
      
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
      if (useDatabase) {
        await DatabaseService.deleteJob(id);
      }
      
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
      if (useDatabase) {
        const newCustomer = await DatabaseService.createCustomer(customerData);
        setCustomers(prev => [...prev, newCustomer]);
      } else {
        const newCustomer = LocalStorageService.createCustomer(customerData);
        setCustomers(prev => [...prev, newCustomer]);
      }
      
      showSuccessMessage('Customer added successfully!');
    } catch (error) {
      console.error('Error creating customer:', error);
      showErrorMessage('Failed to create customer.');
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      if (useDatabase) {
        await DatabaseService.updateCustomer(id, customerData);
      }
      
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
      if (useDatabase) {
        await DatabaseService.deleteCustomer(id);
      }
      
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
      if (useDatabase) {
        const newProduct = await DatabaseService.createProduct(productData);
        setProducts(prev => [...prev, newProduct]);
      } else {
        const newProduct: Product = {
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...productData,
          createdAt: new Date().toISOString()
        };
        setProducts(prev => [...prev, newProduct]);
      }
      
      showSuccessMessage('Product added successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      showErrorMessage('Failed to create product.');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      if (useDatabase) {
        await DatabaseService.updateProduct(id, productData);
      }
      
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...productData } : product
      ));
      
      showSuccessMessage('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      showErrorMessage('Failed to update product.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (useDatabase) {
        await DatabaseService.deleteProduct(id);
      }
      
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
      if (useDatabase) {
        const newNotification = await DatabaseService.createNotification(notificationData);
        setNotifications(prev => [...prev, newNotification]);
      } else {
        const newNotification: Notification = {
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...notificationData,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [...prev, newNotification]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      if (useDatabase) {
        await DatabaseService.markNotificationRead(id);
      }
      
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