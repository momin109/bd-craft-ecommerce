<div align="center">

# 🛍️ BD Craft — E-Commerce Platform

**A full-stack, production-ready e-commerce solution built for the Bangladesh market.**

Local payment gateways · Courier automation · Facebook conversion tracking · AI-assisted operations

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)

</div>

---

## 📖 Overview

**BD Craft** is a complete e-commerce platform purpose-built for Bangladeshi businesses. Beyond a standard storefront and checkout, it ships with deep local integrations that most global platforms lack — **bKash / Nagad / Rocket payments**, **Steadfast & Pathao courier automation**, **customer fraud/success-rate scoring**, and **Facebook Conversion API (server-side) tracking** for accurate ad optimization.

The project is organized as a **three-app monorepo**:

| App                  | Purpose                                                  | Stack                                           |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| **`backend`**        | REST API, business logic, integrations, background jobs  | Node.js · Express · TypeScript · Prisma         |
| **`frontend-admin`** | Admin dashboard (orders, inventory, reports, automation) | Next.js (App Router) · TypeScript               |
| **`frontend-user`**  | Customer-facing storefront                               | Next.js · TypeScript · Tailwind CSS · shadcn/ui |

> ℹ️ Some backend specifics (database engine, ORM, queue) are inferred from the project structure. Adjust the relevant sections to match your exact implementation.

---

## 🏗️ Architecture

```
                        ┌─────────────────────┐
                        │   frontend-user      │  Next.js · Tailwind · shadcn/ui
                        │   (Storefront)       │
                        └──────────┬──────────┘
                                   │  REST / API_INTEGRATION.md
                        ┌──────────▼──────────┐
                        │      backend         │  Express · TypeScript
   Admin actions ──────▶│   (REST API + Jobs)  │◀────── Webhooks
                        └──────────┬──────────┘
                                   │
        ┌──────────────┬──────────┼──────────┬──────────────┐
        ▼              ▼          ▼          ▼              ▼
   ┌─────────┐   ┌──────────┐ ┌───────┐ ┌─────────┐   ┌──────────┐
   │ Database│   │ Payments │ │Courier│ │Facebook │   │ Notify   │
   │(Prisma) │   │SSLCommerz│ │Steadfast│ CAPI    │   │SMS/Email │
   │         │   │aamarPay  │ │Pathao │ │Pixel    │   │WhatsApp  │
   └─────────┘   │ShurjoPay │ └───────┘ └─────────┘   └──────────┘
                 └──────────┘
                        ▲
             ┌──────────┴──────────┐
             │   frontend-admin     │  Next.js (App Router)
             │   (Dashboard)        │
             └─────────────────────┘
```

---

## 🧰 Tech Stack

### Backend (`/backend`)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM / Database:** Prisma (PostgreSQL / MySQL)
- **Architecture:** Modular (`modules`, `routes`, `middleware`, `services`)
- **Background Jobs:** Scheduled/queued jobs (`jobs/`) — courier sync, notifications, abandoned-cart recovery
- **File Storage:** Local / cloud storage layer (`storage/`)

### Admin Panel (`/frontend-admin`)

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **State:** React Context (`context/`) + custom hooks (`hooks/`)
- **API Layer:** Service modules (`services/`)

### Storefront (`/frontend-user`)

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (`components.json`)

---

## 📂 Project Structure

```
BD-CRAFT-ECOMMERCE/
│
├── backend/                    # Express + TypeScript API
│   ├── dist/                   # Compiled output
│   ├── src/
│   │   ├── config/             # App, DB, third-party config
│   │   ├── constants/          # Shared constants & enums
│   │   ├── errors/             # Custom error classes & handlers
│   │   ├── jobs/               # Background / scheduled jobs
│   │   ├── middleware/         # Auth, validation, rate-limit, etc.
│   │   ├── modules/            # Feature modules (products, orders, payments…)
│   │   ├── routes/             # API route definitions
│   │   ├── types/              # Shared TypeScript types
│   │   ├── utils/              # Helpers & utilities
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server entry point
│   ├── storage/                # Uploaded files / invoices
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-admin/             # Next.js admin dashboard
│   └── src/
│       ├── app/                # App Router pages
│       ├── components/         # Reusable UI components
│       ├── context/            # Global state providers
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities & clients
│       ├── services/           # API service layer
│       └── types/              # Type definitions
│
└── frontend-user/              # Next.js storefront
    └── src/                    # App, components, lib, etc.
        API_INTEGRATION.md      # Storefront ↔ backend API guide
```

---

## ✨ Features

### 1. Core E-Commerce

- Product categories, search & advanced filters
- Product variants (size, color)
- Wishlist & shopping cart
- Checkout & order tracking
- Customer accounts with order history
- Reviews & ratings

### 2. 🇧🇩 Bangladesh Payment Gateways

Integrated through **SSLCommerz**, **aamarPay**, and **ShurjoPay**, supporting:

- **bKash**, **Nagad**, **Rocket**
- **Visa / MasterCard**
- **Cash on Delivery (COD)**

### 3. 🚚 Courier Automation

**Steadfast**

- Auto consignment creation
- Auto tracking updates & delivery status sync
- Delivery success-rate checks

**Pathao**

- Order push, rider tracking, delivery status updates

**Workflow:**

```
Customer Order → Admin Approve → Auto-send to Steadfast/Pathao
              → Tracking Number Generated → Customer Notification
```

### 4. 🔐 Customer Verification & Fraud Control

Before an order is confirmed:

- Mobile **OTP verification**
- **Duplicate order** detection
- Previous order-history check
- **Customer success rate (%)**

> **Example:** 10 orders → 8 delivered, 2 returned → **80% success rate.**
> Customers with a low success rate can be automatically **restricted from COD**.

### 5. 📊 Facebook Marketing Automation

- **Facebook Pixel:** ViewContent, AddToCart, InitiateCheckout, Purchase
- **Conversion API (CAPI):** server-side tracking for higher event match quality and better ad optimization

### 6. 📦 Inventory Management

- Stock management with low-stock alerts
- Purchase price vs. selling price tracking
- SKU system & warehouse management
- Stock adjustment & return management

### 7. 📈 Sales Reports

- Daily / weekly / monthly sales
- Product-wise, customer-wise, courier-wise reports
- Return report & profit report
- Export to **Excel · CSV · PDF**

### 8. 🎯 Marketing Automation

- Coupon, discount, flash sale & bundle offers
- Referral system
- **Abandoned-cart recovery**
- **SMS · Email · WhatsApp** notifications

### 9. 🖥️ Admin Dashboard

At-a-glance metrics:

- Today's & monthly sales
- Pending / delivered / returned orders
- Top products & top customers
- Revenue graph

### 10. 🤖 Advanced Automation (AI)

- Product description generator
- SEO meta & product tag generator
- Auto invoice generation + PDF invoice email
- Auto courier booking, auto customer SMS
- Auto Facebook conversion events

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** / **pnpm** / **yarn**
- A database (**PostgreSQL** or **MySQL**)
- API credentials for the integrations you plan to enable

### 1. Clone the repository

```bash
git clone <your-repo-url> BD-CRAFT-ECOMMERCE
cd BD-CRAFT-ECOMMERCE
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in your values
npx prisma migrate dev      # run DB migrations
npm run dev                 # start API in dev mode
```

### 3. Admin Panel

```bash
cd frontend-admin
npm install
cp .env.local.example .env.local
npm run dev
```

### 4. Storefront

```bash
cd frontend-user
npm install
cp .env.local.example .env.local
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bdcraft"

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Payment Gateways
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
AAMARPAY_STORE_ID=
AAMARPAY_SIGNATURE_KEY=
SHURJOPAY_USERNAME=
SHURJOPAY_PASSWORD=

# Courier
STEADFAST_API_KEY=
STEADFAST_SECRET_KEY=
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=

# Facebook
FB_PIXEL_ID=
FB_CAPI_ACCESS_TOKEN=

# Notifications
SMS_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
WHATSAPP_API_TOKEN=
```

### Frontend (`frontend-*/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FB_PIXEL_ID=
```

---

## 📜 Available Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start in development mode         |
| `npm run build`     | Build for production              |
| `npm run start`     | Run the production build          |
| `npm run lint`      | Run ESLint                        |
| `npx prisma studio` | _(backend)_ Open the database GUI |

---

## 🔌 API Integration

The storefront communicates with the backend through documented REST endpoints.
See **[`frontend-user/API_INTEGRATION.md`](frontend-user/API_INTEGRATION.md)** for the full endpoint reference and request/response contracts.

---

## 🗺️ Roadmap

- [ ] Multi-vendor / marketplace support
- [ ] Loyalty & reward points
- [ ] Progressive Web App (PWA) storefront
- [ ] Advanced analytics & cohort reports
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ for the Bangladesh e-commerce ecosystem.**

</div>
