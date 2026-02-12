# 🚀 Quick Setup Guide - Hyundai Admin Dashboard

## Installation Steps

### 1. Navigate to Project Directory
```bash
cd hyundai-admin
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Framer Motion (for animations)
- Socket.io Client (for real-time updates)
- Axios (for API calls)
- Tailwind CSS (for styling)
- TypeScript

### 3. Configure Environment Variables
The `.env.local` file is already created. Update if needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Start Development Server
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 5. Default Login Route
- Navigate to `http://localhost:3000` (automatically redirects to `/login`)
- Enter your admin credentials from your backend

## 📋 Available Routes

- `/` - Redirects to login
- `/login` - Admin login page
- `/dashboard` - Dashboard home (requires auth)
- `/dashboard/products` - Products management page
- `/dashboard/orders` - Orders page (structure ready)
- `/dashboard/customers` - Customers page (structure ready)
- `/dashboard/analytics` - Analytics page (structure ready)
- `/dashboard/categories` - Categories page (structure ready)
- `/dashboard/settings` - Settings page (structure ready)

## 🎨 Key Features Implemented

### ✅ Login Page
- Smooth form animations
- Password visibility toggle
- Animated background orbs
- Glass-morphism design
- Error handling with toast notifications

### ✅ Dashboard Home
- 4 animated stats cards with number counting
- Revenue, Orders, Products, Customers metrics
- Low stock alerts section
- Pending orders widget
- Quick action buttons
- Real-time data from API

### ✅ Products Page
- Fully functional products table
- Search by name/part number
- Category filtering
- Stock status indicators
- Product images
- CRUD action buttons
- Smooth hover animations on rows

### ✅ Layout Components
- **Sidebar**: Animated navigation with active state
- **Header**: Search bar and notification bell
- **Page Transitions**: Fade out/slide up between routes
- **Real-time Notifications**: Socket.io integration for new orders

## 🔧 Backend Requirements

Your backend should provide these endpoints:

### Authentication
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: object }
```

### Dashboard Stats
```
GET /api/dashboard/stats
Response: {
  totalRevenue: number,
  totalOrders: number,
  totalProducts: number,
  totalCustomers: number,
  revenueGrowth: number,
  ordersGrowth: number,
  lowStockProducts: number,
  pendingOrders: number
}
```

### Products
```
GET /api/products
Response: { products: Product[] }
```

### Socket.io Event
```javascript
// Your backend should emit this when a new order is created
io.emit('newOrder', orderData);
```

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Start development server
3. 🔄 Connect to your backend (ensure it's running on port 5000)
4. 🔄 Test login functionality
5. 🔄 Verify Socket.io connection
6. 🔄 Add remaining pages (Orders, Customers, etc.)
7. 🔄 Customize colors/branding if needed
8. 🔄 Add form validation for product creation
9. 🔄 Implement product edit/delete functionality
10. 🔄 Build for production

## 🐛 Common Issues

**Issue**: Can't connect to API
- **Solution**: Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled on backend

**Issue**: Socket.io not working
- **Solution**: Verify Socket.io server is initialized on backend
- Check console for connection errors

**Issue**: Page shows "Failed to fetch"
- **Solution**: API endpoints might be different, check backend routes
- Verify authentication token is being sent

## 📦 Production Build

When ready to deploy:
```bash
npm run build
npm start
```

## 🎨 Customization

All animation timings and colors can be customized in:
- `app/globals.css` - Color palette and CSS animations
- `tailwind.config.js` - Tailwind theme
- `components/PageTransition.tsx` - Page transition settings
- Individual component files for specific animations

---

**Enjoy your premium admin dashboard! 🚀**
