# Phase 1 Implementation Roadmap

**Target Launch Date**: 6-8 weeks  
**Current Status**: Pre-Alpha (UI Foundation Complete)

---

## Sprint Breakdown

### 🔴 SPRINT 1 & 2 (Weeks 1-2): Core Booking Infrastructure

#### Sprint 1 Focus: Database & Backend Setup

**Objective**: Establish the backend foundation for all booking operations

**Tasks**:

1. **Firestore Collection Schema** (4 hours)
   ```typescript
   // Collections to create:
   - workshops/
     └─ {workshopId}
        ├─ name: string
        ├─ ownerId: string (partner)
        ├─ address: string
        ├─ phone: string
        ├─ email: string
        ├─ services: array (optional - or separate subcollection)
        ├─ rating: number
        ├─ createdAt: timestamp
        └─ updatedAt: timestamp
   
   - workshops/{workshopId}/services/
     └─ {serviceId}
        ├─ name: string
        ├─ description: string
        ├─ price: number
        ├─ duration: number (minutes)
        └─ category: string
   
   - bookings/
     └─ {bookingId}
        ├─ userId: string
        ├─ workshopId: string
        ├─ serviceId: string
        ├─ status: enum (pending, confirmed, completed, cancelled)
        ├─ scheduledAt: timestamp
        ├─ createdAt: timestamp
        ├─ updatedAt: timestamp
        ├─ totalPrice: number
        └─ notes: string
   
   - car_wash_services/
     └─ {serviceId}
        ├─ name: string
        ├─ price: number
        ├─ duration: number
        └─ description: string
   
   - car_wash_bookings/
     └─ {bookingId}
        ├─ userId: string
        ├─ serviceId: string
        ├─ status: enum
        ├─ scheduledAt: timestamp
        ├─ location: {lat, lng, address}
        ├─ serviceType: enum (home, station)
        └─ totalPrice: number
   
   - payments/
     └─ {paymentId}
        ├─ bookingId: string
        ├─ userId: string
        ├─ amount: number
        ├─ currency: string
        ├─ status: enum (pending, success, failed)
        ├─ stripePaymentIntentId: string
        ├─ createdAt: timestamp
        └─ completedAt: timestamp
   ```

2. **Firebase Cloud Functions Setup** (6 hours)
   - `onCreate_booking` - Create booking → call payment
   - `onUpdate_payment` - Payment success → update booking status
   - `onCreate_workshop` - Validate workshop data
   - `onDelete_booking` - Handle cancellations

3. **Firestore Security Rules Update** (4 hours)
   - Complete validation for bookings
   - Add payment collection rules
   - Test rule engine

4. **TypeScript Interfaces** (3 hours)
   ```typescript
   interface Workshop {
     id: string;
     ownerId: string;
     name: string;
     address: string;
     phone: string;
     email: string;
     rating: number;
     createdAt: Date;
   }
   
   interface Workshop Service {
     id: string;
     workshopId: string;
     name: string;
     price: number;
     duration: number;
   }
   
   interface Booking {
     id: string;
     userId: string;
     workshopId: string;
     serviceId: string;
     scheduledAt: Date;
     status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
     totalPrice: number;
   }
   
   interface Payment {
     id: string;
     bookingId: string;
     amount: number;
     status: 'pending' | 'success' | 'failed';
     stripePaymentIntentId: string;
   }
   ```

**Deliverable**: Working Firestore schema with security rules and TypeScript types

---

#### Sprint 2 Focus: Workshop Booking Flow

**Objective**: Implement complete workshop booking (UI + backend)

**Tasks**:

1. **Workshop Detail Page** (8 hours)
   - Route: `/workshops/:id`
   - Display workshop info
   - List available services
   - Show ratings & reviews
   - Add "Book Service" button

2. **Service Selection Modal** (6 hours)
   - Modal showing service details
   - Price & duration
   - Service description
   - "Next" button → date picker

3. **Time Slot Selection** (10 hours)
   - Calendar component (date picker)
   - Available time slots for selected service
   - Backend query for availability (Cloud Function)
   - Time slot state management

4. **Booking Confirmation Page** (8 hours)
   - Review selected service, time, price
   - Add optional notes
   - Display total
   - "Confirm Booking" button

5. **Booking Creation Logic** (6 hours)
   - Firestore write with transaction
   - Error handling
   - Success confirmation
   - Redirect to payment

**UI Components**:
- `WorkshopDetail.tsx`
- `ServiceSelector.tsx`
- `TimeSlotPicker.tsx`
- `BookingConfirmation.tsx`
- `BookingSuccess.tsx`

**Deliverable**: End-to-end workshop booking flow (UI + Firestore writes)

---

### 🔴 SPRINT 3 (Week 3): Payments & Car Wash Booking

#### Payments Integration (Stripe)

**Tasks**:

1. **Stripe Setup** (4 hours)
   - Create Stripe account
   - Get API keys
   - Setup webhook
   - Environment config

2. **Backend Payment Processing** (12 hours)
   - `POST /api/payments/create-intent` - Create payment intent
   - `POST /api/payments/confirm` - Confirm payment
   - `POST /webhook/stripe` - Handle webhooks
   - Error handling & logging
   - Idempotency keys

3. **Frontend Checkout UI** (8 hours)
   - Stripe Elements integration
   - Card input form
   - Error displays
   - Loading states
   - Success/failure handling

4. **Payment Status Tracking** (4 hours)
   - Listen for Firestore payment status updates
   - Auto-update booking status on payment success
   - Send confirmation emails

**Deliverable**: Complete payment flow integrated with bookings

---

#### Car Wash Booking Flow

**Tasks**:

1. **Car Wash Service Selection** (6 hours)
   - Modal/page showing services (already has UI)
   - Add "Select" button → date picker

2. **Date & Time Picker** (8 hours)
   - Calendar component
   - Time slot selection (1-hour slots)
   - Location-based availability check

3. **Location Input** (6 hours)
   - Google Maps autocomplete integration
   - Address validation
   - Service availability check for location
   - Store coordinates for provider dispatch

4. **Confirmation & Payment** (6 hours)
   - Summary of selected service/time/location
   - Proceed to payment flow

**Deliverable**: Car wash booking flow comparable to workshops

---

### 🟠 SPRINT 4 (Week 4): Admin & Partner Dashboards

#### Admin Dashboard (8-10 hours)

**Components**:
- `AdminLayout.tsx`
- `UserManagement.tsx` - List, ban, promote users
- `ServiceManagement.tsx` - Add/edit/remove services
- `BookingOverview.tsx` - View all bookings, filter, export
- `Analytics.tsx` - Charts: daily bookings, revenue, top services
- `SettingsPanel.tsx`

**Features**:
- User list with actions (ban, promote to partner, delete)
- Service CRUD operations
- Booking status overview & manual status updates
- Revenue & booking metrics
- System settings

**Route**: `/admin/*`

---

#### Partner Dashboard (8-10 hours)

**Components**:
- `PartnerLayout.tsx`
- `PartnerDashboard.tsx` - Overview & stats
- `BookingsList.tsx` - Upcoming & past bookings
- `ServiceManagement.tsx` - Manage own services
- `AvailabilityCalendar.tsx` - Set working hours
- `EarningsPage.tsx` - Revenue tracking
- `ProfileSettings.tsx`

**Features**:
- View upcoming bookings
- Accept/decline bookings
- Manage service list
- Set availability hours
- View earnings
- Edit profile

**Route**: `/partner/*`

---

### 🟡 SPRINT 5 (Week 5): Additional Auth & Notifications

**Tasks**:

1. **Email/Password Authentication** (6 hours)
   - Sign up form
   - Email verification
   - Password reset flow
   - Integration with existing auth context

2. **Email Notifications** (8 hours)
   - Use Firebase Cloud Functions + SendGrid/Mailgun
   - Templates: booking confirmed, payment successful, reminder
   - User settings for notification preferences

3. **Push Notifications** (optional, 6 hours)
   - One Signal or Firebase Cloud Messaging
   - Booking reminders
   - Offer promotions

4. **User Profile Page** (4 hours)
   - View/edit profile
   - Booking history
   - Payment methods
   - Preferences

---

### 🟡 SPRINT 6-7 (Weeks 6-7): Mobile & Testing

**Mobile Strategy** (Choose One):

**Option A: PWA First** (6 hours)
- Manifest file
- Service worker
- Offline capability
- Home screen installation

**Option B: Flutter** (40+ hours - parallel track)
- Project setup
- Firebase integration
- Mirror existing features
- Platform-specific UX adjustments

**Option C: React Native** (35+ hours - parallel track)
- Shared component logic
- Native Firebase integration
- iOS/Android build setup

---

### 🟡 SPRINT 8 (Week 8): QA & Launch Prep

**Tasks**:

1. **Testing** (20 hours)
   - Unit tests for payment logic
   - Integration tests for booking flow
   - E2E tests for critical paths
   - Security testing

2. **Performance** (8 hours)
   - Lighthouse audit
   - Bundle size optimization
   - Image optimization
   - CDN setup

3. **Security** (8 hours)
   - OWASP audit
   - Firestore rules validation
   - Stripe PCI compliance check
   - Privacy policy & ToS

4. **Documentation** (4 hours)
   - Deployment guide
   - Admin manual
   - Partner onboarding guide
   - User FAQ

5. **Pilot Onboarding** (Ongoing)
   - Contact 5-10 workshops
   - Data import
   - Partner setup
   - Training

---

## Development Priorities

### High Priority (Do First)
```
1. Firestore schema + security rules
2. Workshop booking flow (UI + backend)
3. Stripe integration
4. Car wash booking flow
5. Admin dashboard
6. Partner dashboard
```

### Medium Priority (Do Next)
```
7. Email/password auth
8. Email notifications
9. User profile page
10. Booking history
```

### Lower Priority (Later)
```
11. Apple Sign-In
12. Advanced filtering
13. User reviews
14. Promo codes
15. Mobile app (if web is working)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Firestore cost overruns | Set up quotas & budget alerts |
| Payment processing delays | Use Stripe test mode during dev |
| Security vulnerabilities | Penetration testing before launch |
| Pilot partner resistance | Clear support + dedicated account manager |
| Mobile performance issues | Start with PWA, improve iteratively |
| Booking volume handling | Load test with Cloud Load Testing |

---

## Success Metrics for MVP Launch

- [ ] Booking flow works end-to-end (workshop + car wash)
- [ ] Payment processing reliable (99%+ success rate)
- [ ] Lighthouse score > 80
- [ ] < 500ms page load time
- [ ] 5-10 pilot partners onboarded
- [ ] Admin can manage users & services
- [ ] Partner dashboard functional
- [ ] Zero critical security issues
- [ ] Mobile responsive (mobile score > 70)
- [ ] 95% Firestore query performance < 100ms

---

## Resource Allocation

Suggested team composition for 6-8 week sprint:

- **1-2 Full-stack developers** (Firestore, Cloud Functions, payments)
- **1 Frontend developer** (React UI & state management)
- **1 DevOps/QA engineer** (Testing, deployment, monitoring)
- **1 Product manager** (Partner communication, prioritization)

---

## Budget Estimate

| Service | Cost/Month | Notes |
|---------|-----------|-------|
| Firebase (Firestore, Functions, Hosting) | $25-100 | Pay-as-you-go |
| Stripe (payment processing) | 2.9% + $0.30 per transaction | Varies with volume |
| SendGrid (email) | $20-100 | Free tier available |
| Cloud Storage | $5-20 | For images |
| Monitoring (e.g., Sentry) | $30-50 | Optional but recommended |
| **Total** | **$80-270/month** | Scale with usage |

