import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// రీఫ్రెష్ లాజిక్ కోసం స్టేట్ వేరియబుల్స్
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * క్యూలో ఆగిపోయిన రిక్వెస్ట్‌లను మళ్ళీ ప్రాసెస్ చేసే ఫంక్షన్
 */
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ============================================================================
// AXIOS INSTANCE
// ============================================================================
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // ⭐ CRITICAL: కుకీలు పంపడానికి ఇది ముఖ్యం
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // కుకీలు ఆటోమేటిక్‌గా వెళ్తాయి కాబట్టి హెడర్స్ అవసరం లేదు.
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// // ============================================================================
// // RESPONSE INTERCEPTOR (With Auto Refresh Logic)
// // ============================================================================
// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (!originalRequest) return Promise.reject(error);

//     // 401 Unauthorized వస్తే (Token Expire అయితే)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // లాగిన్ లేదా రిఫ్రెష్ కాల్స్ ఫెయిల్ అయితే వదిలేయ్
//       if (
//         originalRequest.url?.includes("/auth/login") ||
//         originalRequest.url?.includes("/auth/refresh-token")
//       ) {
//         return Promise.reject(error);
//       }

//       // Queue Logic
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => api(originalRequest))
//           .catch((err) => Promise.reject(err));
//       }

//       // రిఫ్రెష్ ప్రాసెస్ స్టార్ట్
//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // 🔥 FIX: 400 Bad Request రాకుండా {} (Empty Body) పంపిస్తున్నాం
//         await api.post("/admin/auth/refresh-token", {});

//         // సక్సెస్! క్యూలో ఉన్నవాటిని రన్ చేయి
//         processQueue(null);

//         // ఒరిజినల్ రిక్వెస్ట్ మళ్ళీ పంపు
//         return api(originalRequest);
//       } catch (refreshError) {
//         // రిఫ్రెష్ ఫెయిల్ అయితే (నిజంగానే సెషన్ పోయింది)
//         processQueue(refreshError);

//         // AuthContext లో దీన్ని హ్యాండిల్ చేద్దాం.
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// ============================================================================
// RESPONSE INTERCEPTOR (With Auto Refresh Logic)
// ============================================================================
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    // 401 Unauthorized వస్తే (Token Expire అయితే)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // లాగిన్ లేదా రిఫ్రెష్ కాల్స్ ఫెయిల్ అయితే వదిలేయ్ (లూప్ ఆపడానికి)
      // 🔥 FIX 1: "/auth/check-session" ని ఇక్కడ బ్లాక్ చేయకూడదు
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh-token")
      ) {
        return Promise.reject(error);
      }

      // Queue Logic
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 🔥 FIX 2: క్యూలో ఉన్నవి మళ్ళీ పంపేటప్పుడు కూడా _retry=true పెట్టాలి
            originalRequest._retry = true;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // రిఫ్రెష్ ప్రాసెస్ స్టార్ట్
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔥 400 Bad Request రాకుండా {} (Empty Body) పంపిస్తున్నాం
        // గమనిక: ఇక్కడ "axios" (Global axios) వాడటం బెటర్, ఎందుకంటే మళ్ళీ ఇదే ఇంటర్సెప్టర్ లోకి రాకుండా ఉంటుంది
        await axios.post(
          `${API_BASE_URL}/admin/auth/refresh-token`,
          {},
          {
            withCredentials: true, // కుకీస్ వెళ్ళడానికి
          },
        );

        // సక్సెస్! క్యూలో ఉన్నవాటిని రన్ చేయి
        processQueue(null);

        // ఒరిజినల్ రిక్వెస్ట్ మళ్ళీ పంపు
        return api(originalRequest);
      } catch (refreshError) {
        // రిఫ్రెష్ ఫెయిల్ అయితే (నిజంగానే సెషన్ పోయింది)
        processQueue(refreshError);

        // 🔥 FIX 3: టోకెన్ నిజంగా ఎక్స్‌పైర్ అయితే డైరెక్ట్ గా లాగిన్ కి పంపించేయాలి
        if (typeof window !== "undefined") {
          console.error(
            "Admin session expired permanently. Redirecting to login.",
          );
          // కావాలంటే localStorage క్లీన్ చేయొచ్చు
          // window.location.href = "/login"; // Next.js కాబట్టి AuthProvider లో హ్యాండిల్ చేయడం బెస్ట్.
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

  // Refresh Token కుకీ ద్వారా ఆటోమేటిక్‌గా వెళ్తుంది
  refreshToken: () => api.post("/admin/auth/refresh-token", {}),

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
// PRODUCT SERVICE (Same as before)
// ============================================================================
export const ProductService = {
  getAll: (params?: any) => api.get("/products", { params }),
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
// ORDER SERVICE (Same as before)
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
// PAYMENT SERVICE
// ============================================================================
export const PaymentService = {
  getAllPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string; // Added sortBy param
  }) => api.get("/payments/admin/all", { params }),

  getByOrderId: (orderId: string) => api.get(`/payments/${orderId}`),

  getPaymentMethods: () => api.get("/dashboard/payments/methods"),
};

// ============================================================================
// DASHBOARD SERVICE
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
// CHAT & CART SERVICES
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

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================
export const NotificationService = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/notifications`, { params: { page, limit } }),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put(`/notifications/read-all`),
};

// ============================================================================
// HELPER FUNCTION (Invoice)
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
