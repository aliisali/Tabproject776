export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'business' | 'employee';
  businessId?: string;
  permissions: string[];
  createdAt: string;
  isActive: boolean;
  emailVerified: boolean;
  verificationToken?: string;
  parent?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'business' | 'employee';
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminId: string;
  createdAt: string;
  features: string[];
  subscription: 'basic' | 'premium' | 'enterprise';
  vrViewEnabled?: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  customerId: string;
  employeeId: string;
  businessId: string;
  scheduledDate: string;
  completedDate?: string;
  quotation?: number;
  invoice?: number;
  signature?: string;
  images: string[];
  documents: string[];
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  postcode: string;
  businessId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'job' | 'system';
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  totalRevenue: number;
  activeEmployees: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  model3d?: string;
  arModel?: string;
  specifications: string[];
  price: number;
  isActive: boolean;
  createdAt: string;
}