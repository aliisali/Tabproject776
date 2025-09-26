import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Business, Job, Customer, Notification, Product } from '../types';
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
    
    // Initialize localStorage data
    LocalStorageService.initializeData();
    
    // Load all data
    setUsers(LocalStorageService.getUsers());
    setBusinesses(LocalStorageService.getBusinesses());
    setJobs(LocalStorageService.getJobs());
    setCustomers(LocalStorageService.getCustomers());
    setNotifications(LocalStorageService.getNotifications());
    setProducts(LocalStorageService.getProducts());
    
    setLoading(false);
    console.log('✅ DataProvider: Initialization complete');
  }, []);

  // Auto-save users whenever they change
  useEffect(() => {
    if (!loading && users.length > 0) {
      const saved = LocalStorageService.saveUsers(users);
      if (saved) {
        // Dispatch event for AuthContext
        window.dispatchEvent(new CustomEvent('usersUpdated', { detail: users }));
      }
    }
  }, [users, loading]);

  // Auto-save other data when they change
  useEffect(() => {
    if (!loading && businesses.length > 0) {
      LocalStorageService.saveBusinesses(businesses);
    }
  }, [businesses, loading]);

  useEffect(() => {
    if (!loading && jobs.length > 0) {
      LocalStorageService.saveJobs(jobs);
    }
  }, [jobs, loading]);

  useEffect(() => {
    if (!loading && customers.length > 0) {
      LocalStorageService.saveCustomers(customers);
    }
  }, [customers, loading]);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      LocalStorageService.saveNotifications(notifications);
    }
  }, [notifications, loading]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      LocalStorageService.saveProducts(products);
    }
  }, [products, loading]);

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    setUsers(LocalStorageService.getUsers());
    setBusinesses(LocalStorageService.getBusinesses());
    setJobs(LocalStorageService.getJobs());
    setCustomers(LocalStorageService.getCustomers());
    setNotifications(LocalStorageService.getNotifications());
    setProducts(LocalStorageService.getProducts());
  };

  // User management with immediate persistence
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      console.log('👤 Creating user:', userData.name);
      
      const newUser = LocalStorageService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      
      showSuccessMessage(`User "${userData.name}" created successfully!`);
      
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      showErrorMessage('Failed to create user. Please try again.');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      LocalStorageService.updateUser(id, userData);
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
      LocalStorageService.deleteUser(id);
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
      const newBusiness = LocalStorageService.createBusiness(businessData);
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
      const newJob = LocalStorageService.createJob(jobData);
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
      const newCustomer = LocalStorageService.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      
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
        id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...productData,
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
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...notificationData,
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