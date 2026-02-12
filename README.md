# 🚗 Hyundai Spares E-commerce - Premium Admin Dashboard

A modern, production-ready admin dashboard built with Next.js 14, featuring smooth animations powered by Framer Motion, real-time updates via Socket.io, and seamless integration with your Node.js backend.

## ✨ Features

### 🎨 Premium Design & Animations
- **Smooth Page Transitions**: Fade-out and slide-up effects between pages
- **Animated Statistics Cards**: Numbers count up from 0 with smooth easing
- **Micro-interactions**: Button hover/tap effects with scale animations
- **Skeleton Loaders**: Shimmer effect loading states (no boring spinners!)
- **Glass-morphism UI**: Modern backdrop blur effects throughout
- **Real-time Toast Notifications**: Animated slide-in with shake effect for new orders

### 🔧 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Custom components with premium design
- **API Client**: Axios with interceptors
- **Real-time**: Socket.io Client
- **Notifications**: Sonner (toast notifications)
- **Charts**: Recharts (for revenue analytics)

### 📱 Pages & Features

#### 1. **Login Page** (`/login`)
- ✨ Smooth form entry animations
- 👁️ Password visibility toggle
- 🌈 Gradient backgrounds with animated orbs
- 🔒 JWT-based authentication
- 💎 Glass-morphism card design

#### 2. **Dashboard Home** (`/dashboard`)
- 📊 **4 Animated Statistics Cards**
  - Total Revenue (with growth %)
  - Total Orders (with trend)
  - Total Products
  - Total Customers
- 📈 **Monthly Revenue Chart** (Recharts AreaChart)
  - Last 6 months performance
  - Interactive tooltips
  - Gradient fill effects
- 📋 **Recent Orders Widget**
  - Latest 5 orders
  - Customer details
  - Order status badges
  - Quick access to view all
- 🏆 **Top 5 Selling Products**
  - Ranked display
  - Sales count and revenue
  - Animated cards
- ⚠️ **Alert Widgets**
  - Low stock products alert
  - Pending orders count
- 🎯 **Quick Action Buttons**

#### 3. **Orders Management** (`/dashboard/orders`) ⭐ NEW
- 📋 **Complete Order Table**
  - Order number, customer, amount, payment, status, date
  - Inline status updates with dropdown
  - Color-coded status badges
- 🔄 **Order Status Flow**
  - Placed → Packed → Shipped → Delivered
  - Separate Cancelled flow
  - Status icons (Package, Truck, CheckCircle, etc.)
- 🔍 **Advanced Filtering**
  - Search by order number, customer name, email
  - Filter by status (All, Placed, Packed, Shipped, Delivered, Cancelled)
  - Quick status counts
- 📥 **Invoice Download**
  - One-click PDF invoice download
  - Proper filename generation
  - Toast notifications for success/error
- 🔴 **Live Updates**
  - Real-time connection indicator
  - Auto-updates when status changes via Socket.io
  - No page refresh needed!
- 📊 **Status Statistics**

#### 4. **Products Table** (`/dashboard/products`)
- 📦 Animated table rows with hover effects
- 🔍 Search by name or part number
- 🏷️ Category filtering
- 📊 Stock status indicators with color coding
- 🖼️ Product images and details
- ⚡ CRUD action buttons (View, Edit, Delete)

### 🔔 Real-Time Features (Socket.io)

#### Server Events Handled:
1. **`new_order`** (Admin Only)
   - 🔊 Sound notification plays
   - ✨ Animated toast with shake effect
   - 📦 Shows order number and amount
   - 🎨 Green gradient styling

2. **`order_status_updated`**
   - 🔄 Automatically updates order list
   - 📦 Status-specific icons and colors
   - 🔔 Toast notification
   - 💫 Smooth animations

3. **`payment_success`**
   - ✅ Success notification
   - 💳 Payment amount displayed
   - ✨ Rotating icon animation

4. **`payment_failed`**
   - ❌ Error notification
   - 🚨 Alert styling

5. **`low_stock_alert`**
   - ⚠️ Warning toast
   - 📊 Remaining stock count

### 🔌 Backend Integration

Complete API service with 5 main modules:
- **AdminAuthService** - Authentication & profile management
- **ProductService** - Complete CRUD with image upload
- **OrderService** - Order management & invoice download
- **PaymentService** - Payment tracking & analytics
- **DashboardService** - Statistics & analytics data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Your Hyundai backend running on `http://localhost:5000`
- MongoDB running and connected

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to `http://localhost:3000`

### Default Admin Credentials
```
Email: admin@hyundaispares.com
Password: Admin@12345
```

## 📁 Project Structure

```
hyundai-admin/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout with Socket Provider
│   │   ├── page.tsx                # Dashboard home with stats & charts
│   │   ├── products/
│   │   │   └── page.tsx           # Products management
│   │   └── orders/
│   │       └── page.tsx           # Orders management ⭐ NEW
│   ├── login/
│   │   └── page.tsx                # Admin login page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles & animations
│   └── page.tsx                    # Root redirect
├── components/
│   ├── providers/
│   │   └── SocketProvider.tsx     # Socket.io context provider ⭐ NEW
│   ├── ui/
│   │   ├── Button.tsx             # Animated button component
│   │   ├── Skeleton.tsx           # Shimmer skeleton loaders
│   │   └── Toaster.tsx            # Toast notification provider
│   ├── Sidebar.tsx                # Navigation sidebar
│   ├── Header.tsx                 # Top header with search
│   ├── PageTransition.tsx         # Page transition wrapper
│   └── StatsCard.tsx              # Animated stats card
├── lib/
│   ├── api.ts                     # Complete API service ⭐ UPDATED
│   └── utils.ts                   # Utility functions
├── types/
│   └── index.ts                   # TypeScript definitions
└── [config files]
```

## 🎯 Key Animation Highlights

#### Page Transitions
```typescript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -20 }
```

#### Number Counter Animation
```typescript
const count = useMotionValue(0);
animate(count, value, { duration: 2, ease: 'easeOut' });
```

#### Shimmer Loading
```css
.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 2s infinite;
}
```

## 🔐 Authentication Flow

1. User enters credentials on `/login`
2. POST request to `/api/admin/auth/login`
3. JWT token stored in localStorage
4. Token sent in `Authorization` header for all requests
5. Socket.io authenticated with same token
6. Automatic redirect to login on 401 responses

## 🔌 Backend Requirements

### Required API Endpoints
```
POST   /api/admin/auth/login
GET    /api/dashboard/stats
GET    /api/dashboard/revenue/monthly
GET    /api/dashboard/orders/recent
GET    /api/dashboard/products/top-selling
GET    /api/orders/admin/all
GET    /api/orders/:id
GET    /api/orders/:id/invoice          # Returns PDF blob
PUT    /api/orders/:id/status
GET    /api/products
```

### Required Socket.io Events (Server → Client)
```javascript
socket.on('new_order', (orderData) => {})
socket.on('order_status_updated', (data) => {})
socket.on('payment_success', (data) => {})
socket.on('payment_failed', (data) => {})
socket.on('low_stock_alert', (data) => {})
```

## 🧪 Testing Checklist

After setup, verify:
- [ ] Admin login works
- [ ] Dashboard loads with real data
- [ ] Revenue chart displays correctly
- [ ] Recent orders appear
- [ ] Products page loads
- [ ] **Orders page displays all orders**
- [ ] **Can update order status**
- [ ] **Can download invoice (PDF)**
- [ ] Socket.io connects (check console for `✅ Socket connected`)
- [ ] **Real-time notifications work**
- [ ] **Notification sound plays**
- [ ] **Orders update in real-time**

## 🐛 Troubleshooting

### API Connection Issues
- ✅ Verify backend is running on port 5000
- ✅ Check CORS settings on backend
- ✅ Confirm API_URL in `.env.local`

### Socket.io Not Connecting
- ✅ Ensure Socket.io server is initialized on backend
- ✅ Check SOCKET_URL matches backend
- ✅ Verify JWT token is valid
- ✅ Check browser console for: `✅ Socket connected`

### Invoice Download Not Working
- ✅ Verify backend endpoint returns PDF blob
- ✅ Check `Content-Type: application/pdf` header
- ✅ Test endpoint with Postman first

## 📚 Additional Documentation

- **CHANGELOG.md** - Complete version history and updates
- **API_INTEGRATION_GUIDE.md** - Comprehensive API reference
- **SETUP_GUIDE.md** - Quick start and setup instructions

## 🎯 Roadmap

### Completed ✅
- [x] Admin authentication
- [x] Dashboard with real-time stats
- [x] Revenue analytics chart
- [x] Products management (view)
- [x] **Complete orders management**
- [x] **Order status updates**
- [x] **Invoice downloads**
- [x] **Real-time notifications**
- [x] **Socket.io integration**

### Coming Soon 🚧
- [ ] Product CRUD (create/edit forms)
- [ ] Customer management
- [ ] Advanced analytics pages
- [ ] Category management
- [ ] Settings page

## 📦 Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## 📄 License

Proprietary - Hyundai Spares E-commerce Platform

## 🙏 Credits

- **Design Inspiration**: Modern SaaS dashboards
- **Animations**: Framer Motion library
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Sora, JetBrains Mono)
- **Charts**: Recharts library

---

**Built with ❤️ for Hyundai Spares E-commerce**

*Premium animations • Real-time updates • Production-ready code*

**Version 2.0** - Complete Backend Integration
