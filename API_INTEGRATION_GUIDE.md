# 🔌 API Integration Guide

## Overview
This document explains how the Hyundai Admin Dashboard integrates with your Node.js backend.

## Authentication Flow

### Admin Login
```typescript
import { AdminAuthService } from '@/lib/api';

// Login
const response = await AdminAuthService.login({
  email: 'admin@hyundaispares.com',
  password: 'Admin@12345'
});

// Store token
localStorage.setItem('token', response.data.data.token);
```

### Token Management
- Tokens are stored in `localStorage`
- Automatically added to all API requests via axios interceptor
- On 401 response, user is redirected to login page

## API Services

### 1. AdminAuthService
```typescript
AdminAuthService.login(credentials)
AdminAuthService.getProfile()
AdminAuthService.updateProfile(data)
AdminAuthService.changePassword(data)
AdminAuthService.logout()
```

### 2. ProductService
```typescript
// Get all products with filters
ProductService.getAll({
  page: 1,
  limit: 20,
  category: 'Brake',
  search: 'brake pad',
  sortBy: 'createdAt',
  order: 'desc'
})

// CRUD operations
ProductService.getById(id)
ProductService.create(formData) // FormData for images
ProductService.update(id, formData)
ProductService.updateStock(id, stock)
ProductService.delete(id)
ProductService.deleteImage(productId, imageId)
ProductService.getLowStock()
```

### 3. OrderService
```typescript
// Get all orders (Admin)
OrderService.getAllOrders({
  page: 1,
  limit: 20,
  status: 'Placed',
  sortBy: 'createdAt',
  order: 'desc'
})

// Order management
OrderService.getById(id)
OrderService.updateStatus(id, {
  orderStatus: 'Packed',
  note: 'Order has been packed'
})

// Invoice download (returns Blob)
const blob = await OrderService.getInvoice(orderId)
// Helper function for download
downloadInvoice(orderId, orderNumber)
```

### 4. PaymentService
```typescript
PaymentService.getAllPayments({ page: 1, limit: 20 })
PaymentService.getByOrderId(orderId)
PaymentService.getPaymentMethods() // Stats
```

### 5. DashboardService
```typescript
// Statistics
DashboardService.getStats()

// Revenue analytics
DashboardService.getMonthlyRevenue({ year: 2024 })
DashboardService.getDailyRevenue({ month: 12, year: 2024 })

// Recent data
DashboardService.getRecentOrders(5)
DashboardService.getLowStockProducts()
DashboardService.getTopSellingProducts(5)

// Analytics
DashboardService.getSalesByCategory()
DashboardService.getCustomerGrowth()
```

## Real-time Features (Socket.io)

### Socket Provider Setup
The dashboard uses a global `SocketProvider` that handles all real-time events:

```typescript
import { useSocket } from '@/components/providers/SocketProvider';

function MyComponent() {
  const { socket, isConnected, joinOrderRoom, leaveOrderRoom } = useSocket();
  
  // Join specific order room for updates
  useEffect(() => {
    if (orderId) {
      joinOrderRoom(orderId);
      return () => leaveOrderRoom(orderId);
    }
  }, [orderId]);
}
```

### Events Listened By Dashboard

#### 1. new_order (Admin Only)
Triggered when a customer places a new order.
```typescript
// Automatically handled by SocketProvider
// Shows animated toast with sound effect
{
  orderNumber: 'ORD20241226001',
  totalAmount: 7078,
  user: { name: 'Customer Name' }
}
```

#### 2. order_status_updated
Triggered when order status changes.
```typescript
{
  orderId: '...',
  orderNumber: 'ORD20241226001',
  orderStatus: 'Packed',
  previousStatus: 'Placed'
}
```

#### 3. payment_success
Triggered when payment is completed.
```typescript
{
  orderNumber: 'ORD20241226001',
  amount: 7078,
  paymentMethod: 'Razorpay'
}
```

#### 4. payment_failed
Triggered when payment fails.
```typescript
{
  orderNumber: 'ORD20241226001',
  reason: 'Payment declined'
}
```

#### 5. low_stock_alert
Triggered when product stock goes below threshold.
```typescript
{
  productId: '...',
  productName: 'Brake Pad Set',
  stock: 3,
  threshold: 10
}
```

### Socket Authentication
The socket connection is automatically authenticated using the JWT token from localStorage:

```typescript
const socketInstance = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket']
});
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Error Handling

All API calls are wrapped in try-catch blocks:

```typescript
try {
  const response = await ProductService.getAll();
  setProducts(response.data.data || response.data);
} catch (error: any) {
  console.error('API Error:', error);
  toast.error(error.response?.data?.message || 'Operation failed');
  
  // Optional: Fallback to mock data for development
  setProducts(mockData);
}
```

## Invoice Download Implementation

The invoice download uses blob response type:

```typescript
// In api.ts
getInvoice: async (orderId: string): Promise<Blob> => {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  });
  return response.data;
}

// Helper function
export const downloadInvoice = async (orderId: string, orderNumber: string) => {
  const blob = await OrderService.getInvoice(orderId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${orderNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Testing API Integration

### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/health
```

### 2. Test Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hyundaispares.com","password":"Admin@12345"}'
```

### 3. Test Protected Route
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Socket Connection
Open browser console in dashboard and check for:
```
✅ Socket connected: <socket-id>
🎉 Connected to server: { userId: '...', role: 'admin' }
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Ensure backend has CORS configured for `http://localhost:3000`

### Issue: 401 Unauthorized
**Solution:** 
- Check token is stored: `localStorage.getItem('token')`
- Verify token format in request headers
- Token may have expired (15 min default)

### Issue: Socket Not Connecting
**Solution:**
- Verify backend Socket.io server is running
- Check NEXT_PUBLIC_SOCKET_URL is correct
- Ensure token is valid for socket authentication

### Issue: Invoice Download Fails
**Solution:**
- Check backend invoice generation is working
- Verify `/orders/:id/invoice` endpoint returns PDF
- Check browser console for blob creation errors

## Development vs Production

### Development
- Uses mock data fallbacks if API fails
- Detailed error logging in console
- CORS typically allows localhost

### Production
- Remove mock data fallbacks
- Configure proper error tracking (Sentry, etc.)
- Set up proper CORS origins
- Use environment-specific API URLs

## API Rate Limiting

Your backend may have rate limiting. Handle it:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait and try again.');
    }
    return Promise.reject(error);
  }
);
```

## Next Steps

1. ✅ Ensure your backend is running on port 5000
2. ✅ Test admin login with default credentials
3. ✅ Verify Socket.io connection in browser console
4. ✅ Test each API endpoint individually
5. ✅ Check real-time notifications are working
6. ✅ Test invoice download functionality
7. ✅ Monitor network tab for API calls

---

**Need Help?**
- Check browser console for errors
- Verify network tab shows correct API calls
- Ensure backend logs don't show errors
- Test API endpoints with Postman/Thunder Client first
