# KrishiSetu (कृषिसेतु) — Agricultural Marketplace

> **Tagline:** “Connect. Compare. Sell Smarter.”

KrishiSetu is a full-stack MERN agricultural marketplace designed to connect farmers directly with commercial buyers (wholesalers, retailers, food processors, and institutional aggregators).

The core differentiator of KrishiSetu is **Realized Net Earnings Comparison**: rather than choosing a buyer based only on the highest gross bid, farmers can calculate and compare their expected net earnings after deducting estimated transportation freight, loading labor, and packaging expenses.

---

## 🌾 Core Features

- **Net Realized Earnings Comparison (Core Differentiator):** Side-by-side offer comparison showing Gross Sale Value, Transportation, Packaging, and Loading expenses to highlight the deal with the true highest net profit. Includes live interactive cost recalculation.
- **Atomic Stock Reservation:** Accepting an offer automatically reserves inventory, preventing conflicting bids from overselling farm stock.
- **Logistics & Road Freight Estimator:** Built-in regional road distance and commercial vehicle haulage calculation across Karnataka districts with clear estimate disclaimers.
- **Separation of Estimated vs. Actual Expenses:** Pre-sale freight estimates are recorded separately from post-sale actual verified receipts.
- **Direct Negotiations & Counter-Offers:** Full negotiation history preserved between producers and buyers.
- **Role-Based Authorization & Security:** Server-side role protection for Farmer, Buyer, and Admin accounts. Strict prevention of public admin account registration.
- **In-Platform Messaging:** Contextual communication between farmers and buyers linked to crop listings and sales orders.
- **Admin Moderation & Analytics:** Centralized dashboard for user identity verification, listing moderation, dispute investigation, and transaction auditing.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (v18) with Vite
- **Styling:** Tailwind CSS with custom agricultural theme palette
- **Routing:** React Router DOM (v6) with Protected & Role-Based guards
- **Icons:** Lucide React
- **Data Visualizations:** Recharts (Gross vs. Net Realized Earnings comparison & regional trade distribution)
- **HTTP Client:** Axios with credential cookies & Bearer fallback

### Backend
- **Runtime:** Node.js (v24 / v20 / v18)
- **Web Framework:** Express.js
- **Database:** MongoDB & Mongoose (supports local MongoDB, MongoDB Atlas, and zero-config dev `mongodb-memory-server`)
- **Authentication:** JSON Web Tokens (JWT) in secure HttpOnly cookies + Bearer token support
- **Hashing:** bcryptjs
- **File Uploads:** Multer with file type & size validation
- **Testing:** Node.js native test runner (`node --test`)

---

## 📂 Project Structure

```text
krishisetu/
├── client/
│   ├── public/
│   │   └── logo.svg                 # KrishiSetu Leaf & Bridge SVG Logo
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              # CropCard, StatusBadge, PriceDisplay, LoadingSpinner, EmptyState
│   │   │   ├── layout/              # Navbar, Footer, DashboardLayout (collapsible sidebars)
│   │   │   └── marketplace/         # FilterSidebar, OfferModal, TransportEstimatorModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication session & role management
│   │   ├── pages/
│   │   │   ├── public/              # HomePage, MarketplacePage, CropDetailsPage, TransportEstimatorPage, HowItWorksPage, AboutUsPage, ContactPage, NotFoundPage, UnauthorizedPage
│   │   │   ├── auth/                # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   ├── farmer/              # FarmerDashboard, AddCropPage, MyListingsPage, FarmerOffersPage, CompareOffersPage, FarmerSalesPage, FarmerSaleDetailsPage, FarmerMessagesPage, FarmerProfilePage
│   │   │   ├── buyer/               # BuyerDashboard, BuyerOffersPage, SavedCropsPage, BuyerPurchasesPage, BuyerOrderDetailPage, BuyerProfilePage
│   │   │   └── admin/               # AdminDashboard, AdminUsersPage, AdminListingsPage, AdminTransactionsPage, AdminReportsPage
│   │   ├── routes/                  # ProtectedRoute, RoleBasedRoute
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with interceptors
│   │   ├── utils/
│   │   │   └── formatters.js        # Rupee currency formatting, units, Karnataka districts
│   │   ├── App.jsx                  # Main route hierarchy
│   │   ├── index.css                # Tailwind directives & design tokens
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── server/
│   ├── config/
│   │   └── db.js                    # Database connection with MongoMemoryServer dev fallback
│   ├── controllers/                 # Auth, User, Listing, Offer, Sale, Transport, Messaging, Support, Admin
│   ├── middleware/
│   │   ├── auth.js                  # Protect & Authorize middlewares
│   │   └── upload.js                # Multer image upload middleware
│   ├── models/                      # User, CropListing, Offer, Sale, Conversation, Message, SavedListing, Notification, SupportTicket, VerificationRequest
│   ├── routes/                      # Modular REST API routes
│   ├── scripts/
│   │   └── seed.js                  # Karnataka agricultural demo data seeder
│   ├── services/
│   │   ├── calculationService.js    # Net earnings & unit conversion engine
│   │   └── transportService.js      # Freight calculation & distance matrix
│   ├── tests/
│   │   └── calculation.test.js      # Unit tests for calculations and freight logic
│   ├── uploads/                     # Uploaded crop photographs
│   ├── app.js                       # Express application setup
│   ├── server.js                    # Server entry point
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start & Prerequisites

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone the repository
```bash
cd KrishiSetu
```

### 2. Configure Environment Files

**Server configuration (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/krishisetu
USE_MEMORY_DB=true
JWT_SECRET=krishisetu_jwt_dev_secret_key_change_in_production_992384
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
*(Setting `USE_MEMORY_DB=true` automatically spins up a zero-config in-memory database and auto-seeds Karnataka demo data, eliminating the need to install or run a standalone MongoDB service locally).*

**Client configuration (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application

### Terminal 1: Backend Server (Port 5000)

**Windows PowerShell:**
```powershell
cd server
npm.cmd install
npm.cmd start
```

**Linux / macOS:**
```bash
cd server
npm install
npm start
```

### Terminal 2: Frontend Client (Port 5173)

**Windows PowerShell:**
```powershell
cd client
npm.cmd install
npm.cmd run dev
```

**Linux / macOS:**
```bash
cd client
npm install
npm run dev
```

Visit the application in your browser at: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

The development database is automatically pre-seeded with realistic Karnataka agricultural records (Mandya, Hassan, Kolar, Bengaluru Urban). You can log in using:

| Role | Email | Password | Primary Feature Access |
|---|---|---|---|
| 👨‍🌾 **Farmer** | `farmer@krishisetu.com` | `password123` | Crop listings, offer comparisons, stock management, sales timeline |
| 🛒 **Buyer** | `buyer@krishisetu.com` | `password123` | Marketplace browsing, offer bidding, order tracking, bookmarks |
| 🛡️ **Admin** | `admin@krishisetu.com` | `adminpass123` | User verification, listing moderation, dispute investigation |

*(Quick 1-click login buttons are also provided directly on the Login page for rapid demonstration).*

---

## 🧪 Running Automated Tests

Run the unit test suite verifying net earnings arithmetic, unit conversions, and freight calculation logic:

```bash
cd server
npm.cmd test
```

Test Results:
```text
▶ KrishiSetu Unit Conversion & Calculation Service
  ✔ correctly converts quintals and tonnes to kilograms
  ✔ correctly converts kilograms to target units
  ✔ accurately converts prices per unit
  ✔ computes Gross Sale Value accurately across units
  ✔ calculates total expenses without double-counting
  ✔ computes Estimated Net Earnings = Gross - Total Expenses
  ✔ proves core differentiator: Buyer A provides higher net earnings than Buyer B despite lower gross offer
✔ KrishiSetu Unit Conversion & Calculation Service
▶ KrishiSetu Transport Logistics Estimator
  ✔ correctly looks up regional road distances
  ✔ recommends appropriate vehicle capacity based on payload weight
  ✔ calculates realistic transportation estimate with breakdown and disclaimer
✔ KrishiSetu Transport Logistics Estimator
ℹ tests 10 | pass 10 | fail 0
```

---

## 📊 Core Calculation Formulas

### 1. Gross Sale Value
$$\text{Gross Sale Value} = \text{Offered Price Per Unit} \times \text{Accepted Quantity}$$

### 2. Total Deductions
$$\text{Total Expenses} = \text{Freight} + \text{Packaging} + \text{Labor/Loading} + \text{Platform Fees} + \text{Other}$$

### 3. Estimated Net Realized Earnings
$$\text{Estimated Net Earnings} = \text{Gross Sale Value} - \text{Total Expenses}$$

### 4. Demonstrating the Net Earnings Differentiator
For 10 quintals of produce:
- **Buyer A (Nearby Hub):**
  - Gross bid: ₹2,500/quintal = ₹25,000 gross
  - Short haul freight: ₹2,000
  - **Estimated Net Earnings: ₹23,000** ⭐ *(Winner)*
- **Buyer B (Distant Mandi):**
  - Gross bid: ₹2,700/quintal = ₹27,000 gross
  - Long haul freight: ₹5,000
  - **Estimated Net Earnings: ₹22,000**

KrishiSetu flags Buyer A as yielding **+₹1,000 higher net profit** despite having a lower gross offer.

---

## 📡 REST API Summary

### Authentication & Users
- `POST /api/auth/register` — Register as Farmer or Buyer
- `POST /api/auth/login` — Sign in and receive secure cookie / token
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/me` — Get current authenticated user profile
- `POST /api/auth/forgot-password` — Generate reset token
- `POST /api/auth/reset-password` — Reset password using token
- `PATCH /api/users/profile` — Update farm or business details
- `PATCH /api/users/password` — Change password
- `POST /api/users/verify` — Submit verification documents

### Crop Listings
- `GET /api/listings` — Search, filter by category/district/price, sort, and paginate
- `GET /api/listings/featured` — Get featured produce
- `GET /api/listings/:id` — Get single listing details
- `POST /api/listings` — Publish new harvest listing (Farmer only)
- `PATCH /api/listings/:id` — Update or pause listing
- `DELETE /api/listings/:id` — Archive listing
- `GET /api/farmer/listings` — Get authenticated farmer's listings with offer counts

### Offers & Negotiations
- `POST /api/offers` — Submit buyer purchase offer
- `GET /api/offers/sent` — View buyer sent offers
- `GET /api/offers/received` — View farmer received offers with net earnings rankings
- `GET /api/offers/:id` — View single offer negotiation history
- `PATCH /api/offers/:id/counter` — Propose counter-offer price
- `PATCH /api/offers/:id/accept` — Accept offer, atomically reserve stock, create sale order
- `PATCH /api/offers/:id/reject` — Decline offer
- `PATCH /api/offers/:id/withdraw` — Withdraw pending offer

### Sales & Order Fulfillment
- `GET /api/sales` — List orders
- `GET /api/sales/:id` — Order timeline, carrier details, estimated vs actual expenses
- `PATCH /api/sales/:id/status` — Progress delivery status (Scheduled, Picked Up, In Transit, Delivered)
- `PATCH /api/sales/:id/expenses` — Record verified actual expenses
- `POST /api/sales/:id/report-issue` — Report order dispute

### Logistics & Estimator
- `POST /api/transport/estimate` — Calculate road distance, transit time, and freight cost

### Admin Operations
- `GET /api/admin/dashboard` — Platform KPIs & category distribution
- `GET /api/admin/users` — Moderate accounts
- `PATCH /api/admin/users/:id/status` — Suspend or verify user
- `GET /api/admin/listings` — Listing moderation queue
- `PATCH /api/admin/listings/:id/moderation` — Hide or restore listings
- `GET /api/admin/reports` — Trading volume analytics by district

---

## ⚖️ License & Ethical Agricultural Trade Disclaimer
This software is built for educational, academic, and practical development demonstration. Transport freight calculations and net earnings presented within the platform are indicative guidelines based on regional benchmarks to support informed agricultural commerce. Final haulage agreements and sales contracts are governed directly between negotiating farmers, buyers, and logistics carriers.
