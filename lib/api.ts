// import axios, { AxiosResponse } from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor for adding auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// // Response interceptor for handling errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

// // ============================================================================
// // ADMIN AUTHENTICATION SERVICE
// // ============================================================================
// export const AdminAuthService = {
//   login: (credentials: { email: string; password: string }) =>
//     api.post("/admin/auth/login", credentials),

//   refreshToken: () => api.post("/admin/auth/refresh-token"),

//   getProfile: () => api.get("/admin/auth/profile"),

//   updateProfile: (data: any) => {
//     return api.put("/admin/auth/profile", data, {
//       headers: {
//         "Content-Type": "multipart/form-data", // ఇది పాత JSON హెడర్ ని ఓవర్‌రైడ్ చేస్తుంది
//       },
//     });
//   },

//   changePassword: (data: { currentPassword: string; newPassword: string }) =>
//     api.put("/admin/auth/change-password", data),

//   logout: () => api.post("/admin/auth/logout"),

//   // 1. Logout from all devices (Fixes the error in Settings page)
//   logoutAllDevices: () => api.post("/admin/auth/logout-all"),

//   // 2. Forgot Password (Optional - for future use)
//   forgotPassword: (email: string) =>
//     api.post("/admin/auth/forgot-password", { email }),

//   // 3. Reset Password (Optional - for future use)
//   resetPassword: (data: { token: string; newPassword: string }) =>
//     api.post("/admin/auth/reset-password", data),
// };

// // ============================================================================
// // PRODUCT SERVICE
// // ============================================================================
// export const ProductService = {
//   // Get all products with filters
//   // getAll: (params?: {
//   //   page?: number;
//   //   limit?: number;
//   //   category?: string;
//   //   search?: string;
//   //   sortBy?: string;
//   //   order?: "asc" | "desc";
//   // }) => api.get("/products", { params }),

//   getAll: () => api.get("/products"),

//   // Get single product
//   getById: (id: string) => api.get(`/products/${id}`),

//   // Get featured products
//   getFeatured: () => api.get("/products/featured"),

//   // Get products by category
//   getByCategory: (category: string) =>
//     api.get(`/products/category/${category}`),

//   // Create new product (Admin)
//   create: (data: FormData) =>
//     api.post("/products", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),

//   // Update product (Admin)
//   update: (id: string, data: FormData) =>
//     api.put(`/products/${id}`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),

//   // Update stock only (Admin)
//   updateStock: (id: string, stock: number) =>
//     api.patch(`/products/${id}/stock`, { stock }),

//   // Delete product (Admin)
//   delete: (id: string) => api.delete(`/products/${id}`),

//   // Delete product image (Admin)
//   deleteImage: (productId: string, imageId: string) =>
//     api.delete(`/products/${productId}/images/${imageId}`),

//   // Get low stock products (Admin)
//   getLowStock: () => api.get("/products/low-stock"),
// };

// // ============================================================================
// // ORDER SERVICE
// // ============================================================================
// export const OrderService = {
//   // Get all orders (Admin)
//   getAllOrders: (params?: {
//     page?: number;
//     limit?: number;
//     status?: string;
//     sortBy?: string;
//     order?: "asc" | "desc";
//   }) => api.get("/orders/admin/all", { params }),

//   // Get single order
//   getById: (id: string) => api.get(`/orders/${id}`),

//   // Update order status (Admin)
//   updateStatus: (
//     id: string,
//     data: {
//       orderStatus: "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
//       note?: string;
//     },
//   ) => api.put(`/orders/${id}/status`, data),

//   // Download invoice (Blob response)
//   getInvoice: async (orderId: string): Promise<Blob> => {
//     const response = await api.get(`/orders/${orderId}/invoice`, {
//       responseType: "blob",
//     });
//     return response.data;
//   },

//   // Cancel order
//   cancelOrder: (id: string, reason?: string) =>
//     api.put(`/orders/${id}/cancel`, { cancellationReason: reason }),
// };

// // ============================================================================
// // PAYMENT SERVICE
// // ============================================================================
// export const PaymentService = {
//   // Get all payments (Admin)
//   getAllPayments: (params?: {
//     page?: number;
//     limit?: number;
//     status?: string;
//   }) => api.get("/payments/admin/all", { params }),

//   // Get payment details
//   getByOrderId: (orderId: string) => api.get(`/payments/${orderId}`),

//   // Get payment method statistics (Admin)
//   getPaymentMethods: () => api.get("/dashboard/payments/methods"),
// };

// // ============================================================================
// // DASHBOARD SERVICE
// // ============================================================================
// // export const DashboardService = {
// //   // Existing methods (Optional, kept for compatibility)
// //   getStats: () => api.get("/dashboard/stats"),
// //   getMonthlyRevenue: (params?: { year?: number }) =>
// //     api.get("/dashboard/revenue/monthly", { params }),
// //   getDailyRevenue: (params?: { month?: number; year?: number }) =>
// //     api.get("/dashboard/revenue/daily", { params }),
// //   getRecentOrders: (limit?: number) =>
// //     api.get("/dashboard/orders/recent", { params: { limit } }),
// //   getLowStockProducts: () => api.get("/dashboard/products/low-stock"),
// //   getTopSellingProducts: (limit?: number) =>
// //     api.get("/dashboard/products/top-selling", { params: { limit } }),

// //   // ✅ NEW METHODS FOR ANALYTICS PAGE
// //   getAdvancedAnalytics: (params?: { startDate?: string; endDate?: string }) =>
// //     api.get("/dashboard/advanced-analytics", { params }),

// //   getInventoryHealth: () => api.get("/dashboard/inventory-health"),

// //   getCustomerGrowth: (params?: { startDate?: string; endDate?: string }) =>
// //     api.get("/dashboard/customers/growth", { params }),

// //   getSalesByCategory: (params?: { startDate?: string; endDate?: string }) =>
// //     api.get("/dashboard/sales/by-category", { params }),

// //   getExportData: (params?: { startDate?: string; endDate?: string }) =>
// //     api.get("/dashboard/export-data", { params }),
// // };

// export const DashboardService = {
//   // 1. Basic Stats (Used in Main Dashboard)
//   getStats: () => api.get("/dashboard/stats"),

//   getMonthlyRevenue: (params?: { year?: number }) =>
//     api.get("/dashboard/revenue/monthly", { params }),

//   getDailyRevenue: (params?: { month?: number; year?: number }) =>
//     api.get("/dashboard/revenue/daily", { params }),

//   getRecentOrders: (limit?: number) =>
//     api.get("/dashboard/orders/recent", { params: { limit } }),

//   getLowStockProducts: () => api.get("/dashboard/products/low-stock"),

//   getTopSellingProducts: (limit?: number) =>
//     api.get("/dashboard/products/top-selling", { params: { limit } }),

//   // ✅ Fix: Added Missing Method (Used in Main Dashboard)
//   getPaymentMethodStats: () => api.get("/dashboard/payments/methods"),

//   // 2. Advanced Analytics (Used in Analytics Page)
//   getSalesByCategory: (params?: { startDate?: string; endDate?: string }) =>
//     api.get("/dashboard/sales/by-category", { params }),

//   getCustomerGrowth: (params?: { startDate?: string; endDate?: string }) =>
//     api.get("/dashboard/customers/growth", { params }),

//   getAdvancedAnalytics: (params?: { startDate?: string; endDate?: string }) =>
//     api.get("/dashboard/advanced-analytics", { params }),

//   getInventoryHealth: () => api.get("/dashboard/inventory-health"),

//   getExportData: (params?: { startDate?: string; endDate?: string }) =>
//     api.get("/dashboard/export-data", { params }),
//   getHeatmapData: () => api.get("/analytics/heatmap"),

//   getInventoryForecast: () => api.get("/analytics/inventory-forecast"),

//   triggerAICalculation: () => api.post("/analytics/calculate-inventory"),
// };

// // ============================================================================
// // HELPER FUNCTION FOR INVOICE DOWNLOAD
// // ============================================================================
// export const downloadInvoice = async (orderId: string, orderNumber: string) => {
//   try {
//     const blob = await OrderService.getInvoice(orderId);
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `Invoice_${orderNumber}.pdf`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Failed to download invoice:", error);
//     throw error;
//   }
// };

// export const ChatService = {
//   // అడ్మిన్ తో చాట్ చేసిన యూజర్ల లిస్ట్
//   getChatUsers: () => api.get("/admin/auth/chat-users"),

//   // ఒక రూమ్ యొక్క మెసేజ్ హిస్టరీ
//   getMessages: (roomId: string, page = 1) =>
//     api.get(`/chat/history/${roomId}`, { params: { page } }),

//   // ఫైల్ అప్‌లోడ్ (Image/Video)
//   uploadFile: (formData: FormData) =>
//     api.post("/chat/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),

//   // మెసేజ్‌లను చదివినట్లు మార్చడం
//   markAsRead: (roomId: string) => api.put(`/chat/read/${roomId}`),
//   getChatRooms: () => api.get("/chat/rooms"),
// };

// export const CartService = {
//   // 1. Get List
//   getAbandonedCarts: () => api.get("/cart/admin/abandoned"),

//   // 2. Send Email Trigger
//   sendRecoveryEmail: (cartId: string) =>
//     api.post(`/cart/admin/send-recovery/${cartId}`),
// };

import axios, { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ⭐ చాల ముఖ్యం: ఇది ఉంటేనే కుకీలు సర్వర్‌కి వెళ్తాయి
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR (UPDATED)
// ============================================================================
api.interceptors.request.use(
  (config) => {
    // ❌ OLD LOGIC REMOVED:
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    // ✅ NEW LOGIC:
    // కుకీలు ఆటోమేటిక్‌గా వెళ్తాయి కాబట్టి, ఇక్కడ మనం హెడర్స్ యాడ్ చేయాల్సిన పని లేదు.
    // కావాలంటే ఫ్యూచర్‌లో ఏవైనా కస్టమ్ హెడర్స్ (Language/AppVersion) ఇక్కడ యాడ్ చేసుకోవచ్చు.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================================
// RESPONSE INTERCEPTOR (UPDATED)
// ============================================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 Unauthorized వస్తే (Token Expire అయితే)
      if (typeof window !== "undefined") {
        // ❌ OLD LOGIC REMOVED: localStorage.removeItem("token");

        // ✅ NEW LOGIC: Just redirect to login
        // మనం ఏ పేజీలో ఉన్నా సరే, సెషన్ పోతే లాగిన్ పేజీకి పంపిస్తాం.
        // (Optional: ప్రస్తుతం ఉన్న పేజీలోనే ఉండాలంటే ఈ లైన్ తీసేయొచ్చు, కానీ Admin Panel కి ఇది బెటర్)
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ============================================================================
// ADMIN AUTHENTICATION SERVICE
// ============================================================================
export const AdminAuthService = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/admin/auth/login", credentials),

  // Refresh Token ఇప్పుడు కుకీలో ఉంటుంది, బాడీలో పంపాల్సిన పని లేదు
  refreshToken: () => api.post("/admin/auth/refresh-token"),

  getProfile: () => api.get("/admin/auth/profile"),

  updateProfile: (data: any) => {
    return api.put("/admin/auth/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/admin/auth/change-password", data),

  logout: () => api.post("/admin/auth/logout"),

  logoutAllDevices: () => api.post("/admin/auth/logout-all"),

  forgotPassword: (email: string) =>
    api.post("/admin/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post("/admin/auth/reset-password", data),
};

// ============================================================================
// PRODUCT SERVICE (No Changes Needed)
// ============================================================================
export const ProductService = {
  getAll: (params?: any) => api.get("/products"),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get("/products/featured"),
  getByCategory: (category: string) =>
    api.get(`/products/category/${category}`),
  create: (data: FormData) =>
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateStock: (id: string, stock: number) =>
    api.patch(`/products/${id}/stock`, { stock }),
  delete: (id: string) => api.delete(`/products/${id}`),
  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/${imageId}`),
  getLowStock: () => api.get("/products/low-stock"),
};

// ============================================================================
// ORDER SERVICE (No Changes Needed)
// ============================================================================
export const OrderService = {
  getAllOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  }) => api.get("/orders/admin/all", { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  updateStatus: (
    id: string,
    data: {
      orderStatus: "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
      note?: string;
    },
  ) => api.put(`/orders/${id}/status`, data),

  getInvoice: async (orderId: string): Promise<Blob> => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },

  cancelOrder: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { cancellationReason: reason }),
};

// ============================================================================
// PAYMENT SERVICE (No Changes Needed)
// ============================================================================
export const PaymentService = {
  getAllPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get("/payments/admin/all", { params }),

  getByOrderId: (orderId: string) => api.get(`/payments/${orderId}`),

  getPaymentMethods: () => api.get("/dashboard/payments/methods"),
};

// ============================================================================
// DASHBOARD SERVICE (No Changes Needed)
// ============================================================================
export const DashboardService = {
  getStats: () => api.get("/dashboard/stats"),
  getMonthlyRevenue: (params?: { year?: number }) =>
    api.get("/dashboard/revenue/monthly", { params }),
  getDailyRevenue: (params?: { month?: number; year?: number }) =>
    api.get("/dashboard/revenue/daily", { params }),
  getRecentOrders: (limit?: number) =>
    api.get("/dashboard/orders/recent", { params: { limit } }),
  getLowStockProducts: () => api.get("/dashboard/products/low-stock"),
  getTopSellingProducts: (limit?: number) =>
    api.get("/dashboard/products/top-selling", { params: { limit } }),
  getPaymentMethodStats: () => api.get("/dashboard/payments/methods"),
  getSalesByCategory: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/dashboard/sales/by-category", { params }),
  getCustomerGrowth: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/dashboard/customers/growth", { params }),
  getAdvancedAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/dashboard/advanced-analytics", { params }),
  getInventoryHealth: () => api.get("/dashboard/inventory-health"),
  getExportData: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/dashboard/export-data", { params }),
  getHeatmapData: () => api.get("/analytics/heatmap"),
  getInventoryForecast: () => api.get("/analytics/inventory-forecast"),
  triggerAICalculation: () => api.post("/analytics/calculate-inventory"),
};

// ============================================================================
// HELPER FUNCTION (No Changes Needed)
// ============================================================================
export const downloadInvoice = async (orderId: string, orderNumber: string) => {
  try {
    const blob = await OrderService.getInvoice(orderId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download invoice:", error);
    throw error;
  }
};

// ============================================================================
// CHAT & CART SERVICES (No Changes Needed)
// ============================================================================
export const ChatService = {
  getChatUsers: () => api.get("/admin/auth/chat-users"),
  getMessages: (roomId: string, page = 1) =>
    api.get(`/chat/history/${roomId}`, { params: { page } }),
  uploadFile: (formData: FormData) =>
    api.post("/chat/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  markAsRead: (roomId: string) => api.put(`/chat/read/${roomId}`),
  getChatRooms: () => api.get("/chat/rooms"),
};

export const CartService = {
  getAbandonedCarts: () => api.get("/cart/admin/abandoned"),
  sendRecoveryEmail: (cartId: string) =>
    api.post(`/cart/admin/send-recovery/${cartId}`),
};

// NOTIFICATION SERVICE
// ============================================================================
export const NotificationService = {
  // అన్ని నోటిఫికేషన్స్ తెచ్చుకోవడం
  getAll: (page = 1, limit = 10) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),

  // ఒక నోటిఫికేషన్ ని Read గా మార్చడం
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  // అన్నింటినీ Read గా మార్చడం
  markAllAsRead: () => api.put(`/notifications/read-all`),
};
