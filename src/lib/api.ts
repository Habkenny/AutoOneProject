import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Types for API responses
export interface BookingData {
  userId: string;
  type: 'workshop' | 'car_wash';
  serviceId: string;
  workshopId?: string;
  scheduledAt: string; // ISO string
  totalPrice: number;
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
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  bookingData: BookingData;
  bookingId?: string;
}

export interface ConfirmBookingData {
  bookingId: string;
  paymentIntentId: string;
}

export interface ConfirmBookingResponse {
  success: boolean;
  message?: string;
}

export interface AvailableSlotsData {
  type: 'workshop' | 'car_wash';
  serviceId: string;
  workshopId?: string;
  date: string; // ISO date string
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  bookingId?: string;
  error?: string;
}

export interface AvailableSlotsResponse {
  success: boolean;
  availableSlots?: string[];
  serviceDuration?: number;
}

export interface UserBookingsResponse {
  success: boolean;
  bookings?: any[];
}

export interface CancelBookingData {
  bookingId: string;
  reason?: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message?: string;
}

// API Service Class
class ApiService {
  // Create a new booking
  async createBooking(data: BookingData): Promise<BookingResponse> {
    try {
      const createBookingFunction = httpsCallable<BookingData, BookingResponse>(functions, 'createBooking');
      const result = await createBookingFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  // Get available time slots for a service
  async getAvailableSlots(data: AvailableSlotsData): Promise<AvailableSlotsResponse> {
    try {
      const getAvailableSlotsFunction = httpsCallable<AvailableSlotsData, AvailableSlotsResponse>(functions, 'getAvailableSlots');
      const result = await getAvailableSlotsFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('Error getting available slots:', error);
      throw new Error(error.message || 'Failed to get available slots');
    }
  }

  // Create a Stripe payment intent
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
    try {
      const createPaymentIntentFunction = httpsCallable<PaymentIntentData, PaymentIntentResponse>(functions, 'createPaymentIntent');
      const result = await createPaymentIntentFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }
  }

  // Confirm a booking after successful payment
  async confirmBooking(bookingId: string, paymentIntentId: string): Promise<ConfirmBookingResponse> {
    try {
      const confirmBookingFunction = httpsCallable<ConfirmBookingData, ConfirmBookingResponse>(functions, 'confirmBooking');
      const result = await confirmBookingFunction({ bookingId, paymentIntentId });
      return result.data;
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      throw new Error(error.message || 'Failed to confirm booking');
    }
  }

  // Get user's bookings
  async getUserBookings(): Promise<UserBookingsResponse> {
    try {
      const getUserBookingsFunction = httpsCallable<void, UserBookingsResponse>(functions, 'getUserBookings');
      const result = await getUserBookingsFunction();
      return result.data;
    } catch (error: any) {
      console.error('Error getting user bookings:', error);
      throw new Error(error.message || 'Failed to get bookings');
    }
  }

  // Cancel a booking
  async cancelBooking(data: CancelBookingData): Promise<CancelBookingResponse> {
    try {
      const cancelBookingFunction = httpsCallable<CancelBookingData, CancelBookingResponse>(functions, 'cancelBooking');
      const result = await cancelBookingFunction(data);
      return result.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.message || 'Failed to cancel booking');
    }
  }

  // Utility function to format booking data for API
  formatBookingData(
    type: 'workshop' | 'car_wash',
    serviceId: string,
    workshopId: string | undefined,
    scheduledAt: Date,
    totalPrice: number,
    customerInfo: BookingData['customerInfo'],
    vehicleInfo?: BookingData['vehicleInfo'],
    location?: BookingData['location'],
    notes?: string
  ): BookingData {
    return {
      userId: '', // Will be set by the authenticated user
      type,
      serviceId,
      workshopId,
      scheduledAt: scheduledAt.toISOString(),
      totalPrice,
      customerInfo,
      vehicleInfo,
      location,
      notes,
    };
  }

  // Utility function to format payment data
  formatPaymentData(bookingId: string, amount: number, currency: string = 'AED', bookingData: BookingData): PaymentIntentData {
    return {
      bookingId,
      amount,
      currency,
      bookingData,
    };
  }

  // Utility function to format available slots request
  formatAvailableSlotsData(
    type: 'workshop' | 'car_wash',
    serviceId: string,
    date: Date,
    workshopId?: string
  ): AvailableSlotsData {
    return {
      type,
      serviceId,
      workshopId,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;