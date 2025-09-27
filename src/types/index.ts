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
  jobType: 'measurement' | 'installation';
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'tbd' | 'awaiting-deposit' | 'awaiting-payment';
  customerId: string;
  employeeId: string;
  businessId: string;
  scheduledDate: string;
  scheduledTime: string;
  completedDate?: string;
  startTime?: string;
  endTime?: string;
  quotation?: number;
  invoice?: number;
  deposit?: number;
  depositPaid?: boolean;
  paymentMethod?: 'card' | 'cash' | 'bank-transfer';
  customerReference?: string;
  signature?: string;
  images: string[];
  documents: string[];
  checklist: ChecklistItem[];
  measurements?: JobMeasurement[];
  selectedProducts?: SelectedProduct[];
  jobHistory: JobHistoryEntry[];
  parentJobId?: string; // For linking measurement to installation
  createdAt: string;
}

export interface JobMeasurement {
  id: string;
  windowId: string;
  width: number;
  height: number;
  notes: string;
  location: string;
  createdAt: string;
}

export interface SelectedProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  arScreenshot?: string;
  customerApproved: boolean;
  createdAt: string;
}

export interface JobHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  data?: any;
}

export interface EmployeeWorkingHours {
  userId: string;
  monday: { start: string; end: string; available: boolean };
  tuesday: { start: string; end: string; available: boolean };
  wednesday: { start: string; end: string; available: boolean };
  thursday: { start: string; end: string; available: boolean };
  friday: { start: string; end: string; available: boolean };
  saturday: { start: string; end: string; available: boolean };
  sunday: { start: string; end: string; available: boolean };
}

export interface BusinessSettings {
  id: string;
  businessId: string;
  bookingMode: 'automated' | 'manual';
  quotationTemplates: QuotationTemplate[];
  invoiceTemplates: InvoiceTemplate[];
  paymentGatewayEnabled: boolean;
  depositPercentage: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  htmlContent: string;
  isDefault: boolean;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  htmlContent: string;
  isDefault: boolean;
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