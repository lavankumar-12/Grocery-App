# FreshBasket — Full-Stack Online Grocery Store

A full-stack online grocery e-commerce platform built with **React, Tailwind CSS, Node.js, Express, and MongoDB**, featuring passwordless Email OTP customer authentication, live product search and filtering, persistent MongoDB-backed cart management, and a JWT-protected Admin inventory dashboard.

**Live Demo:** https://grocery-app-kjhx.onrender.com

---

## Features

- **Responsive Grocery Storefront**
  - Browse products across **Vegetables**, **Fruits**, and **Food Grains**
  - Debounced live search (`GET /api/search`), category filters, pack-size filters (`500g`, `1kg`, `2kg`, `5kg`), and price/name sorting
  - Product quick-view modal with inline quantity controls
- **Passwordless Customer Auth (Email OTP)**
  - Dedicated **Sign In** (`/login`) and **Register User** (`/register`) flows
  - 6-digit expiring OTP verification with JWT sessions
  - Cloud-ready OTP email delivery via **Brevo** or **Resend** HTTP APIs (with Gmail SMTP fallback for local development)
- **Persistent Shopping Basket**
  - Slide-over basket drawer + full cart page (`/cart`) synced with MongoDB
  - Add, increment, decrement, and remove items with free-delivery progress tracking
- **Protected Admin Portal & Inventory Dashboard**
  - Role-separated Admin registration & login (`bcrypt` password hashing + JWT)
  - Backend-verified route protection (`GET /admin/verify`)
  - Live inventory KPIs, searchable catalog list, and drag-and-drop image upload (`Multer`) for adding products

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Lucide React |
| **Backend** | Node.js, Express 5, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `multer`, `cors` |
| **Database** | MongoDB / MongoDB Atlas |
| **Email Delivery** | Brevo Transactional Email API (HTTPS), Resend API, Nodemailer (SMTP) |
| **Deployment** | Render (single-service Express + built React SPA) |

---

## Project Structure

```text
Grocery App/
├── backend/
│   ├── controllers/        # Admin, Cart, Email OTP, Product, Search controllers
│   ├── email/              # OTP generator & Brevo / Resend / SMTP sender
│   ├── middleware/         # Admin JWT, Customer JWT, and Multer image upload
│   ├── models/             # Admin, Cart, Product, User Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── uploads/            # Uploaded product images
│   ├── .env.example        # Backend environment variable template
│   └── server.js           # Express server + production SPA static serving
├── frontend/
│   ├── public/             # Static assets & _redirects for SPA routing
│   ├── src/
│   │   ├── api/            # Fetch API client & endpoint wrappers
│   │   ├── components/     # Navbar, ProductCard, ProductModal, CartDrawer, Footer, ProtectedAdminRoute
│   │   ├── constants/      # Categories, units, INR price formatting
│   │   ├── context/        # Auth, Cart, and Toast contexts
│   │   └── pages/          # Home, Login/Register, Cart, AdminAuth, AdminDashboard
│   ├── vercel.json         # SPA rewrite rules (for optional Vercel deploys)
│   └── vite.config.js      # Tailwind v4 plugin & local API proxy
├── package.json            # Root build & start scripts for single-service deploy
└── README.md
```

---

## API Endpoints

### Products (`/api`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/show-products` | Public | Fetch all grocery products |
| `GET` | `/api/search?search=<q>` | Public | Search products by name |
| `POST` | `/api/add-product` | Admin JWT | Create a product with image upload (`multipart/form-data`) |

### Customer Auth (`/email`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/email/send-otp` | Public | Register/sign in user and send 6-digit OTP email |
| `POST` | `/email/verify-otp` | Public | Verify 6-digit OTP and issue customer JWT |

### Cart (`/cart`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/cart/cart-details` | Customer JWT | Get current user's populated cart |
| `POST` | `/cart/add-to-cart` | Customer JWT | Add product / increment quantity |
| `DELETE` | `/cart/remove-item/:productId` | Customer JWT | Remove item from cart |

### Admin Auth (`/admin`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/admin/admin-register` | Public | Register a new admin account |
| `POST` | `/admin/admin-login` | Public | Authenticate admin and issue admin JWT |
| `GET` | `/admin/verify` | Admin JWT | Verify active admin session |

### Health
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Server and MongoDB connection status |

---

## Local Development Setup

### Prerequisites
- Node.js `>= 20`
- MongoDB Atlas URI (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/lavankumar-12/Grocery-App.git
cd Grocery-App
```

### 2. Configure environment variables
Copy `backend/.env.example` to `backend/.env` and fill in your credentials:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
EMAIL_USER=your_verified_sender_email
EMAIL_PASS=your_gmail_app_password
BREVO_API_KEY=your_brevo_api_key
```

### 3. Install dependencies
```bash
npm --prefix backend install
npm --prefix frontend install
```

### 4. Run locally
Start the backend (port `3000`):
```bash
npm --prefix backend run dev
```

In a second terminal, start the Vite frontend (proxies `/api`, `/admin`, `/email`, `/cart`, and `/uploads` to `http://localhost:3000`):
```bash
npm --prefix frontend run dev
```

---

## Deployment (Render)

1. Connect the repository root on [Render](https://render.com) as a **Web Service**:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
2. Configure environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET_KEY`
   - `EMAIL_USER`
   - `BREVO_API_KEY` *(recommended on Render Free Tier since outbound SMTP ports 465/587 are blocked)*
3. Whitelist `0.0.0.0/0` in **MongoDB Atlas -> Network Access**.
