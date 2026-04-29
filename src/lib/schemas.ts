// Firestore Collection Schemas for Auto One MVP
// This file defines the data models and validation rules

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'user' | 'partner' | 'admin';
  language: 'en' | 'ar' | 'de';
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export interface Workshop {
  id: string;
  ownerId: string; // Partner user ID
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  workingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkshopService {
  id: string;
  workshopId: string;
  name: string;
  description: string;
  category: 'oil_change' | 'tire_service' | 'brake_service' | 'engine_repair' | 'diagnostic' | 'maintenance' | 'other';
  price: number; // in AED
  duration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarWashService {
  id: string;
  name: string;
  description: string;
  type: 'express' | 'standard' | 'premium';
  price: number; // in AED
  duration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'workshop' | 'car_wash';
  serviceId: string; // workshop service ID or car wash service ID
  workshopId?: string; // only for workshop bookings
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  totalPrice: number;
  currency: 'AED';
  notes?: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  location?: { // for car wash at home
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: 'AED';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  workshopId?: string;
  rating: number; // 1-5
  comment?: string;
  serviceQuality: number; // 1-5
  valueForMoney: number; // 1-5
  timeliness: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'payment_success' | 'payment_failed' | 'review_request';
  title: string;
  message: string;
  isRead: boolean;
  data?: any; // additional context data
  createdAt: Date;
}

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone) && phone.length <= 20;
};

export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 10000 && Number.isFinite(price);
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

export const validateWorkingHours = (hours: any): boolean => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.every(day => {
    const dayHours = hours[day];
    return dayHours &&
           typeof dayHours.isOpen === 'boolean' &&
           typeof dayHours.open === 'string' &&
           typeof dayHours.close === 'string' &&
           /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dayHours.open) &&
           /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dayHours.close);
  });
};