# PRIME SYSTEM - Business All-in-One Platform

## Project Overview

Build a comprehensive business management system for a **tech services company** (CCTV installation, WiFi setup, network infrastructure) based in Tacloban City, Philippines. The system handles **enterprise-scale operations (200+ employees)** across **multiple locations**.

## Tech Stack

- **Framework:** Next.js (App Router, server components)
- **React:** 19
- **Database:** PostgreSQL via Prisma
- **Styling:** Tailwind CSS v4 (uses `@import "tailwindcss"` and `@theme inline`, NOT `@tailwind` directives)
- **Auth:** Cookie-based sessions (bcrypt + SHA-256 token hash), role-based access
- **Currency:** PHP (en-PH locale) — use `formatCurrency()` from `@/lib/format`
- **Language:** TypeScript

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:seed      # Seed DB
npx tsc --noEmit     # Type checking
```

## Path Aliases

`@/*` maps to `./src/*`

## Core Modules

### 1. HR & Payroll
- Employee 201 records (personal info, contracts, salary history)
- Time & attendance (bundy clock with location tracking)
- Leave management (VL, SL, SPL, etc.)
- Shift scheduling (multi-location support)
- Payroll processing (SSS, PhilHealth, PAG-IBIG, BIR deductions)
- Employee self-service portal
- Role-based access: SUPER_ADMIN, ADMIN, HR, PAYROLL, MANAGER, EMPLOYEE

### 2. Inventory
- Product catalog (CCTV cameras, WiFi equipment, cables, tools)
- Stock management per location/warehouse
- Stock in/out with audit trail
- Low stock alerts
- Supplier management
- Purchase orders
- Equipment lending/return tracking

### 3. Sales/POS & Quotations
- Customer management (residential, commercial, enterprise)
- Quotation generation (itemized services + materials)
- Convert quotations to invoices
- Invoice generation (BIR-compliant format)
- Payment tracking (full, partial, installment)
- Service packages (CCTV packages, WiFi plans)
- Sales reports per location

### 4. Accounting
- Chart of accounts
- Journal entries
- Income tracking (from invoices)
- Expense tracking (operational, payroll, inventory purchases)
- Profit & Loss statements
- Balance sheet
- Cash flow reports
- Tax reports (VAT, withholding)
- Multi-location consolidated reports

### 5. Scheduling
- Technician/crew scheduling
- Job assignment with location mapping
- Calendar view (daily, weekly, monthly)
- Recurring maintenance schedules
- Conflict detection
- Drag-and-drop rescheduling
- Mobile-friendly schedule viewing

### 6. CRM
- Customer database with interaction history
- Lead capture and tracking
- Sales pipeline (Lead → Quote → Won/Lost)
- Customer communication log
- Customer portal (project status, invoices, service history)
- Customer satisfaction feedback
- Referral tracking

### 7. Project Management
- Project creation (installations, upgrades, maintenance)
- Task assignment with deadlines
- Progress tracking (To Do → In Progress → Done)
- Time tracking per task
- File attachments (site photos, documents)
- Project cost tracking (labor + materials)
- Client approval workflows
- Project milestones and deliverables

### 8. Service Tickets
- Ticket creation (phone, email, portal, walk-in)
- Ticket categories (installation, repair, maintenance, complaint)
- Priority levels (low, medium, high, critical)
- Assignment to technicians/crews
- SLA tracking
- Status updates and resolution tracking
- Customer notifications
- Ticket history and audit trail

### 9. Asset Maintenance
- Equipment registry (company vehicles, tools, test equipment)
- Maintenance schedules
- Maintenance history
- Assignment to employees/locations
- Depreciation tracking
- Barcode/QR code scanning
- Alert for upcoming maintenance

### 10. Location Tracking
- GPS/geofence for field technicians
- Check-in/check-out at job sites
- Route history
- Attendance with location verification
- Real-time technician location dashboard
- Geofence alerts

### 11. Dashboard
- Overview widgets per role
- Real-time metrics (active jobs, pending tickets, inventory alerts)
- Quick actions
- Recent activity feed
- Charts and graphs (sales, attendance, project status)
- Multi-location comparison

### 12. Settings & System
- Company profile (branches, departments)
- System preferences
- Notification settings (email, SMS, in-app)
- Audit trail for all actions
- User management with granular permissions
- Backup and export functionality

## Database Design Guidelines

- Use UUIDs for primary keys
- Include `createdAt`, `updatedAt` timestamps on all models
- Soft deletes (`deletedAt`) for critical data
- Proper foreign key relationships
- Index frequently queried fields
- Use enums for fixed values (status, type, role)

## Architecture

```
src/
├── app/
│   ├── (auth)/           # Login, register, forgot password
│   ├── (app)/            # Authenticated routes
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── leaves/
│   │   ├── schedules/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── accounting/
│   │   ├── projects/
│   │   ├── tickets/
│   │   ├── assets/
│   │   ├── customers/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/              # API routes
│   └── portal/           # Customer portal
├── components/
│   ├── ui/               # Shared UI components
│   ├── dashboard/        # Dashboard widgets
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/
│   ├── actions/          # Server actions
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # Auth utilities
│   └── format.ts         # Formatting utilities
└── prisma/
    └── schema.prisma     # Database schema
```

## Conventions

- Server components by default; `"use client"` only when needed
- Server actions for mutations
- UI components use `class-variance-authority` (cva) for variants
- Philippine locale (`en-PH`) for all formatting
- Employee numbers: auto-generated format (e.g., `EMP0001`)
- All monetary values in PHP (₱)

## Build Order

1. **Phase 1 - Foundation**
   - Database schema (all models)
   - Authentication & authorization
   - Layout, navigation, and UI components
   - Dashboard shell

2. **Phase 2 - Core HR**
   - Employee management
   - Attendance & time tracking
   - Leave management
   - Scheduling

3. **Phase 3 - Operations**
   - Inventory management
   - Asset maintenance
   - Project management
   - Service tickets

4. **Phase 4 - Sales & Finance**
   - CRM & customer management
   - Quotations & invoicing
   - Accounting
   - Payroll processing

5. **Phase 5 - Advanced**
   - Location tracking
   - Customer portal
   - Reports & analytics
   - Notifications

6. **Phase 6 - Polish**
   - Performance optimization
   - Mobile responsiveness
   - Testing
   - Deployment setup
