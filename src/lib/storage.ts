import { User, Business, Job, Customer, Product, Notification } from '../types';

// Storage keys with version to prevent conflicts
const STORAGE_KEYS = {
  USERS: 'blindscloud_users_v6',
  BUSINESSES: 'blindscloud_businesses_v6',
  JOBS: 'blindscloud_jobs_v6',
  CUSTOMERS: 'blindscloud_customers_v6',
  NOTIFICATIONS: 'blindscloud_notifications_v6',
  PRODUCTS: 'blindscloud_products_v6'
};

// Migration function to handle domain changes
const migrateOldData = () => {
  console.log('🔄 Checking for data migration...');
  
  // Check for old data with different keys
  const oldKeys = [
    'jobmanager_users_v4',
    'jobmanager_businesses_v4', 
    'jobmanager_jobs_v4',
    'jobmanager_customers_v4',
    'jobmanager_notifications_v4',
    'jobmanager_products_v4'
  ];
  
  const newKeys = [
    STORAGE_KEYS.USERS,
    STORAGE_KEYS.BUSINESSES,
    STORAGE_KEYS.JOBS,
    STORAGE_KEYS.CUSTOMERS,
    STORAGE_KEYS.NOTIFICATIONS,
    STORAGE_KEYS.PRODUCTS
  ];
  
  let migrated = false;
  
  oldKeys.forEach((oldKey, index) => {
    const oldData = localStorage.getItem(oldKey);
    const newKey = newKeys[index];
    const newData = localStorage.getItem(newKey);
    
    if (oldData && !newData) {
      console.log(`📦 Migrating ${oldKey} to ${newKey}`);
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
      migrated = true;
    }
  });
  
  if (migrated) {
    console.log('✅ Data migration completed successfully');
    showMigrationMessage();
  }
};

// Show migration success message
const showMigrationMessage = () => {
  const migrationDiv = document.createElement('div');
  migrationDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  migrationDiv.innerHTML = `
    <div class="flex items-center space-x-2">
      <div class="w-5 h-5 bg-white rounded-full flex items-center justify-center">
        <span class="text-green-500 text-sm">✓</span>
      </div>
      <span>Data migrated to new domain successfully!</span>
    </div>
  `;
  document.body.appendChild(migrationDiv);
  
  setTimeout(() => {
    if (document.body.contains(migrationDiv)) {
      document.body.removeChild(migrationDiv);
    }
  }, 5000);
};

// Default data with proper UUIDs
const DEFAULT_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@platform.com',
    name: 'BlindsCloud Admin',
    role: 'admin',
    permissions: ['all'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'business@company.com',
    name: 'Blinds Business Manager',
    role: 'business',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['manage_employees', 'view_dashboard', 'create_jobs'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'employee@company.com',
    name: 'Blinds Installation Specialist',
    role: 'employee',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    permissions: ['create_jobs', 'manage_tasks', 'capture_signatures', 'ar_camera_access'],
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    emailVerified: true,
    password: 'password'
  },
];

const DEFAULT_BUSINESSES: Business[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'BlindsCloud Solutions Ltd.',
    address: '456 Window Street, Blindfold City, BC 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@blindscloud.com',
    adminId: '550e8400-e29b-41d4-a716-446655440004',
    features: ['job_management', 'calendar', 'reports', 'camera', 'ar_camera', 'vr_view', '3d_models'],
    subscription: 'premium',
    createdAt: '2024-01-01T00:00:00Z',
    vrViewEnabled: true
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Luxury Homes Ltd.',
    email: 'contact@luxuryhomes.com',
    phone: '+1 (555) 111-2222',
    mobile: '+1 (555) 111-3333',
    address: '789 Luxury Lane, Premium District',
    postcode: '12345',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Modern Office Complex',
    email: 'facilities@modernoffice.com',
    phone: '+1 (555) 222-3333',
    mobile: '+1 (555) 222-4444',
    address: '321 Corporate Plaza, Business District',
    postcode: '54321',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Premium Blackout Blinds',
    category: 'Window Blinds',
    description: 'High-quality blackout blinds for complete light control and privacy',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: ['100% Light Blocking', 'Thermal Insulation', 'Easy Installation', 'Custom Sizing Available'],
    price: 299,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Smart Motorized Blinds',
    category: 'Smart Blinds',
    description: 'App-controlled motorized blinds with scheduling and automation features',
    image: 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: ['WiFi Connectivity', 'Voice Control Compatible', 'Solar Panel Option', 'Smartphone App'],
    price: 599,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-44665544000a',
    name: 'Venetian Blinds Collection',
    category: 'Venetian Blinds',
    description: 'Classic venetian blinds in various materials and colors',
    image: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: ['Aluminum Slats', 'Tilt Control', 'Multiple Colors', 'Durable Construction'],
    price: 149,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-44665544000b',
    name: 'Roller Blinds Pro',
    category: 'Roller Blinds',
    description: 'Professional roller blinds for offices and commercial spaces',
    image: 'https://images.pexels.com/photos/6969832/pexels-photo-6969832.jpeg?auto=compress&cs=tinysrgb&w=400',
    specifications: ['Fire Retardant Fabric', 'Commercial Grade', 'Chain Control', 'UV Protection'],
    price: 199,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const DEFAULT_JOBS: Job[] = [
  {
    id: 'JOB-001',
    title: 'Premium Blackout Blinds Installation',
    description: 'Install premium blackout blinds in luxury home master bedroom',
    status: 'completed',
    customerId: '550e8400-e29b-41d4-a716-446655440006',
    employeeId: '550e8400-e29b-41d4-a716-446655440005',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    scheduledDate: '2024-01-15T09:00:00Z',
    completedDate: '2024-01-15T16:30:00Z',
    quotation: 899,
    invoice: 899,
    images: [],
    documents: [],
    checklist: [
      { id: '1', text: 'Window measurements', completed: true },
      { id: '2', text: 'Blinds delivery', completed: true },
      { id: '3', text: 'Professional installation', completed: true },
      { id: '4', text: 'Quality check & demo', completed: true }
    ],
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'JOB-002',
    title: 'Smart Motorized Blinds Setup',
    description: 'Install and configure smart motorized blinds with app integration',
    status: 'in-progress',
    customerId: '550e8400-e29b-41d4-a716-446655440007',
    employeeId: '550e8400-e29b-41d4-a716-446655440005',
    businessId: '550e8400-e29b-41d4-a716-446655440001',
    scheduledDate: '2024-01-18T10:00:00Z',
    quotation: 1299,
    images: [],
    documents: [],
    checklist: [
      { id: '1', text: 'Site survey and WiFi check', completed: true },
      { id: '2', text: 'Smart blinds delivery', completed: true },
      { id: '3', text: 'Motor installation', completed: false },
      { id: '4', text: 'App setup and testing', completed: false }
    ],
    createdAt: '2024-01-15T09:00:00Z'
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '550e8400-e29b-41d4-a716-44665544000a',
    userId: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Welcome to BlindsCloud',
    message: 'Your blinds specialist account has been set up successfully! Start managing installations and AR demonstrations.',
    type: 'system',
    read: false,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-44665544000b',
    name: 'New Blinds Installation Job',
    message: 'Premium blackout blinds installation scheduled for Luxury Homes Ltd.',
    type: 'job',
    read: false,
    createdAt: '2024-01-18T08:00:00Z'
  }
];

// Storage utilities with bulletproof error handling
export const saveToStorage = (key: string, data: any): boolean => {
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

export const loadFromStorage = (key: string, defaultValue: any) => {
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

// Data management functions
export class LocalStorageService {
  
  // Users
  static getUsers(): User[] {
    return loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  static saveUsers(users: User[]): boolean {
    return saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: false
    };
    
    const updatedUsers = [...users, newUser];
    this.saveUsers(updatedUsers);
    
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    );
    const success = this.saveUsers(updatedUsers);
    
    // Update current user session if editing current user
    const currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
    if (currentUser && currentUser.id === id) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      localStorage.setItem('current_user', JSON.stringify(updatedCurrentUser));
    }
    
    return success;
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const updatedUsers = users.filter(user => user.id !== id);
    return this.saveUsers(updatedUsers);
  }

  static updateBusiness(id: string, updates: Partial<Business>): boolean {
    const businesses = this.getBusinesses();
    const updatedBusinesses = businesses.map(business => 
      business.id === id ? { ...business, ...updates } : business
    );
    return this.saveBusinesses(updatedBusinesses);
  }

  static deleteBusiness(id: string): boolean {
    const businesses = this.getBusinesses();
    const updatedBusinesses = businesses.filter(business => business.id !== id);
    return this.saveBusinesses(updatedBusinesses);
  }

  static updateJob(id: string, updates: Partial<Job>): boolean {
    const jobs = this.getJobs();
    const updatedJobs = jobs.map(job => 
      job.id === id ? { ...job, ...updates } : job
    );
    return this.saveJobs(updatedJobs);
  }

  static deleteJob(id: string): boolean {
    const jobs = this.getJobs();
    const updatedJobs = jobs.filter(job => job.id !== id);
    return this.saveJobs(updatedJobs);
  }

  static updateCustomer(id: string, updates: Partial<Customer>): boolean {
    const customers = this.getCustomers();
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    );
    return this.saveCustomers(updatedCustomers);
  }

  static deleteCustomer(id: string): boolean {
    const customers = this.getCustomers();
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    return this.saveCustomers(updatedCustomers);
  }

  static createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    const updatedProducts = [...products, newProduct];
    this.saveProducts(updatedProducts);
    
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): boolean {
    const products = this.getProducts();
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    );
    return this.saveProducts(updatedProducts);
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const updatedProducts = products.filter(product => product.id !== id);
    return this.saveProducts(updatedProducts);
  }

  static createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotifications = [...notifications, newNotification];
    this.saveNotifications(updatedNotifications);
    
    return newNotification;
  }

  static markNotificationRead(id: string): boolean {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    return this.saveNotifications(updatedNotifications);
  }

  // Businesses
  static getBusinesses(): Business[] {
    return loadFromStorage(STORAGE_KEYS.BUSINESSES, DEFAULT_BUSINESSES);
  }

  static saveBusinesses(businesses: Business[]): boolean {
    return saveToStorage(STORAGE_KEYS.BUSINESSES, businesses);
  }

  static createBusiness(businessData: Omit<Business, 'id' | 'createdAt'>): Business {
    const businesses = this.getBusinesses();
    const newBusiness: Business = {
      id: `business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...businessData,
      createdAt: new Date().toISOString()
    };
    
    const updatedBusinesses = [...businesses, newBusiness];
    this.saveBusinesses(updatedBusinesses);
    
    return newBusiness;
  }

  // Jobs
  static getJobs(): Job[] {
    return loadFromStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS);
  }

  static saveJobs(jobs: Job[]): boolean {
    return saveToStorage(STORAGE_KEYS.JOBS, jobs);
  }

  static createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Job {
    const jobs = this.getJobs();
    const newJob: Job = {
      id: `JOB-${Date.now().toString().slice(-6)}`,
      ...jobData,
      createdAt: new Date().toISOString()
    };
    
    const updatedJobs = [...jobs, newJob];
    this.saveJobs(updatedJobs);
    
    return newJob;
  }

  // Customers
  static getCustomers(): Customer[] {
    return loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }

  static saveCustomers(customers: Customer[]): boolean {
    return saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  static createCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...customerData,
      createdAt: new Date().toISOString()
    };
    
    const updatedCustomers = [...customers, newCustomer];
    this.saveCustomers(updatedCustomers);
    
    return newCustomer;
  }

  // Products
  static getProducts(): Product[] {
    return loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  static saveProducts(products: Product[]): boolean {
    return saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  // Notifications
  static getNotifications(): Notification[] {
    return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }

  static saveNotifications(notifications: Notification[]): boolean {
    return saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // Initialize all data
  static initializeData(): void {
    console.log('🚀 Initializing localStorage data...');
    
    // First, try to migrate old data
    migrateOldData();
    
    // Then initialize with defaults if needed
    this.getUsers();
    this.getBusinesses();
    this.getJobs();
    this.getCustomers();
    this.getProducts();
    this.getNotifications();
    console.log('✅ All data initialized successfully');
  }
  
  // Force data refresh - useful after domain changes
  static forceRefresh(): void {
    console.log('🔄 Force refreshing all data...');
    
    // Check if we have any data, if not, reinitialize
    const hasUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const hasBusinesses = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    
    if (!hasUsers || !hasBusinesses) {
      console.log('📝 No data found, reinitializing defaults...');
      this.saveUsers(DEFAULT_USERS);
      this.saveBusinesses(DEFAULT_BUSINESSES);
      this.saveJobs(DEFAULT_JOBS);
      this.saveCustomers(DEFAULT_CUSTOMERS);
      this.saveProducts(DEFAULT_PRODUCTS);
      this.saveNotifications(DEFAULT_NOTIFICATIONS);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Data reinitialized for new domain!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 4000);
    }
  }
}