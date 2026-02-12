// ============================================================================
// USER & ADMIN TYPES
// ============================================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  _id: string;
  name: string;
  partNumber: string;
  sanitizedPartNumber: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  compatibleModels: CompatibleModel[];
  price: number;
  discountPrice?: number;
  stock: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lowStockThreshold: number;
  images: ProductImage[];
  specifications?: Record<string, string>;
  warrantyPeriod: string;
  manufacturer: string;
  isActive: boolean;
  isDeleted: boolean;
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 
  | 'Engine' 
  | 'Brake' 
  | 'Electrical' 
  | 'Body' 
  | 'Accessories' 
  | 'Suspension' 
  | 'Transmission' 
  | 'Interior' 
  | 'Exterior' 
  | 'Service Parts';

export interface CompatibleModel {
  modelName: string;
  yearFrom: number;
  yearTo?: number;
  variant?: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  _id?: string;
}

export interface ProductFormData {
  name: string;
  partNumber: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  compatibleModels: CompatibleModel[];
  price: number;
  discountPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  warrantyPeriod?: string;
  manufacturer?: string;
  tags?: string[];
  weight?: number;
  specifications?: Record<string, string>;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  shippingCharges: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'Razorpay';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  paymentDetails?: PaymentDetails;
  orderStatus: OrderStatus;
  statusHistory: StatusHistory[];
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  invoicePath?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  product: string | Product;
  name: string;
  partNumber: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface PaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface Payment {
  _id: string;
  order: string | Order;
  user: string | User;
  amount: number;
  currency: string;
  paymentMethod: 'COD' | 'Razorpay';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS TYPES
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  lowStockProducts: number;
  pendingOrders: number;
}

export interface RevenueData {
  month: string;
  year?: number;
  revenue: number;
  orders: number;
  date?: string;
}

export interface TopProduct {
  _id: string;
  name: string;
  partNumber: string;
  totalSales: number;
  revenue: number;
  stock: number;
  images: ProductImage[];
  category?: string;
}

export interface CategorySales {
  _id: string;
  category: string;
  totalSales: number;
  revenue: number;
  productCount: number;
}

export interface CustomerGrowth {
  month: string;
  year: number;
  newCustomers: number;
  totalCustomers: number;
}

export interface PaymentMethodStats {
  method: 'COD' | 'Razorpay';
  count: number;
  totalAmount: number;
  percentage: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  phone?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  _id: string;
  user: string;
  type: 'order' | 'payment' | 'stock' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ============================================================================
// CART TYPES (for reference)
// ============================================================================

export interface CartItem {
  product: string | Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCharges: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}
