import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Firestore reference
const db = admin.firestore();

// Helper function to validate booking data
function validateBookingData(data: any): boolean {
  return (
    data.userId &&
    data.type &&
    ['workshop', 'car_wash'].includes(data.type) &&
    data.serviceId &&
    data.scheduledAt &&
    data.totalPrice &&
    data.customerInfo &&
    data.customerInfo.name &&
    data.customerInfo.phone &&
    data.customerInfo.email
  );
}

// Helper function to check workshop availability
async function checkWorkshopAvailability(workshopId: string, serviceId: string, scheduledAt: Date): Promise<boolean> {
  try {
    // Get workshop working hours
    const workshopDoc = await db.collection('workshops').doc(workshopId).get();
    if (!workshopDoc.exists) return false;

    const workshop = workshopDoc.data()!;
    const dayOfWeek = scheduledAt.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = workshop.workingHours[dayOfWeek];

    if (!workingHours || !workingHours.isOpen) return false;

    // Check if scheduled time is within working hours
    const scheduledTime = scheduledAt.toTimeString().slice(0, 5); // HH:MM format
    if (scheduledTime < workingHours.open || scheduledTime > workingHours.close) return false;

    // Get service duration
    const serviceDoc = await db.collection('workshops').doc(workshopId).collection('services').doc(serviceId).get();
    if (!serviceDoc.exists) return false;

    const service = serviceDoc.data()!;
    const endTime = new Date(scheduledAt.getTime() + service.duration * 60000);

    // Check for conflicting bookings
    const conflictingBookings = await db.collection('bookings')
      .where('workshopId', '==', workshopId)
      .where('status', 'in', ['pending', 'confirmed', 'in_progress'])
      .where('scheduledAt', '>=', scheduledAt)
      .where('scheduledAt', '<', endTime)
      .get();

    return conflictingBookings.empty;
  } catch (error) {
    console.error('Error checking workshop availability:', error);
    return false;
  }
}

// Helper function to check car wash availability
async function checkCarWashAvailability(serviceId: string, scheduledAt: Date, location?: { lat: number; lng: number }): Promise<boolean> {
  try {
    // For car wash, we assume availability if within business hours (8 AM - 8 PM)
    const hour = scheduledAt.getHours();
    if (hour < 8 || hour > 20) return false;

    // Get service duration
    const serviceDoc = await db.collection('car_wash_services').doc(serviceId).get();
    if (!serviceDoc.exists) return false;

    const service = serviceDoc.data()!;
    const endTime = new Date(scheduledAt.getTime() + service.duration * 60000);

    // Check for conflicting bookings in the same time slot
    // For car wash, we allow multiple bookings but limit to prevent overload
    const conflictingBookings = await db.collection('bookings')
      .where('type', '==', 'car_wash')
      .where('serviceId', '==', serviceId)
      .where('status', 'in', ['pending', 'confirmed', 'in_progress'])
      .where('scheduledAt', '>=', scheduledAt)
      .where('scheduledAt', '<', endTime)
      .get();

    // Allow maximum 3 concurrent car wash bookings
    return conflictingBookings.size < 3;
  } catch (error) {
    console.error('Error checking car wash availability:', error);
    return false;
  }
}

// Cloud Function: Create booking
export const createBooking = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Validate input data
  if (!validateBookingData(data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid booking data');
  }

  const scheduledAt = new Date(data.scheduledAt);
  const now = new Date();

  // Check if booking is in the future
  if (scheduledAt <= now) {
    throw new functions.https.HttpsError('invalid-argument', 'Booking must be scheduled in the future');
  }

  // Check availability based on type
  let isAvailable = false;
  if (data.type === 'workshop') {
    if (!data.workshopId) {
      throw new functions.https.HttpsError('invalid-argument', 'Workshop ID required for workshop booking');
    }
    isAvailable = await checkWorkshopAvailability(data.workshopId, data.serviceId, scheduledAt);
  } else if (data.type === 'car_wash') {
    isAvailable = await checkCarWashAvailability(data.serviceId, scheduledAt, data.location);
  }

  if (!isAvailable) {
    throw new functions.https.HttpsError('unavailable', 'Service not available at requested time');
  }

  try {
    // Create booking document
    const bookingRef = db.collection('bookings').doc();
    const bookingData = {
      id: bookingRef.id,
      userId: context.auth.uid,
      type: data.type,
      serviceId: data.serviceId,
      workshopId: data.workshopId || null,
      status: 'pending',
      scheduledAt: admin.firestore.Timestamp.fromDate(scheduledAt),
      totalPrice: data.totalPrice,
      currency: 'AED',
      customerInfo: data.customerInfo,
      vehicleInfo: data.vehicleInfo || null,
      location: data.location || null,
      notes: data.notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await bookingRef.set(bookingData);

    // Create notification
    await db.collection('notifications').add({
      userId: context.auth.uid,
      type: 'booking_confirmed',
      title: 'Booking Created',
      message: `Your ${data.type} booking has been created and is pending confirmation.`,
      isRead: false,
      data: { bookingId: bookingRef.id },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      message: 'Booking created successfully',
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create booking');
  }
});

// Cloud Function: Get available time slots
export const getAvailableSlots = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { type, serviceId, workshopId, date } = data;
  const requestedDate = new Date(date);

  if (!type || !serviceId || !date) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  if (type === 'workshop' && !workshopId) {
    throw new functions.https.HttpsError('invalid-argument', 'Workshop ID required for workshop bookings');
  }

  try {
    let availableSlots: string[] = [];
    let serviceDuration = 60; // default 1 hour

    // Get service duration
    if (type === 'workshop') {
      const serviceDoc = await db.collection('workshops').doc(workshopId).collection('services').doc(serviceId).get();
      if (serviceDoc.exists) {
        serviceDuration = serviceDoc.data()!.duration;
      }
    } else {
      const serviceDoc = await db.collection('car_wash_services').doc(serviceId).get();
      if (serviceDoc.exists) {
        serviceDuration = serviceDoc.data()!.duration;
      }
    }

    // Generate time slots (every 30 minutes)
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    // Check availability for each slot
    for (const slot of slots) {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotDate = new Date(requestedDate);
      slotDate.setHours(hours, minutes, 0, 0);

      let isAvailable = false;
      if (type === 'workshop') {
        isAvailable = await checkWorkshopAvailability(workshopId, serviceId, slotDate);
      } else {
        isAvailable = await checkCarWashAvailability(serviceId, slotDate);
      }

      if (isAvailable) {
        availableSlots.push(slot);
      }
    }

    return {
      success: true,
      availableSlots,
      serviceDuration,
    };
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get available slots');
  }
});

// Cloud Function: Create payment intent
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount, currency = 'aed', bookingData } = data;

  if (!amount || !bookingData) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  // Validate booking data
  if (!validateBookingData(bookingData)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid booking data');
  }

  const scheduledAt = new Date(bookingData.scheduledAt);
  const now = new Date();

  // Check if booking is in the future
  if (scheduledAt <= now) {
    throw new functions.https.HttpsError('invalid-argument', 'Booking must be scheduled in the future');
  }

  // Check availability based on type
  let isAvailable = false;
  if (bookingData.type === 'workshop') {
    if (!bookingData.workshopId) {
      throw new functions.https.HttpsError('invalid-argument', 'Workshop ID required for workshop booking');
    }
    isAvailable = await checkWorkshopAvailability(bookingData.workshopId, bookingData.serviceId, scheduledAt);
  } else if (bookingData.type === 'car_wash') {
    isAvailable = await checkCarWashAvailability(bookingData.serviceId, scheduledAt, bookingData.location);
  }

  if (!isAvailable) {
    throw new functions.https.HttpsError('unavailable', 'Service not available at requested time');
  }

  try {
    // Create booking document first
    const bookingRef = db.collection('bookings').doc();
    const bookingDocData = {
      id: bookingRef.id,
      userId: context.auth.uid,
      type: bookingData.type,
      serviceId: bookingData.serviceId,
      workshopId: bookingData.workshopId || null,
      status: 'pending_payment',
      scheduledAt: admin.firestore.Timestamp.fromDate(scheduledAt),
      totalPrice: bookingData.totalPrice,
      currency: currency.toUpperCase(),
      customerInfo: bookingData.customerInfo,
      vehicleInfo: bookingData.vehicleInfo || null,
      location: bookingData.location || null,
      notes: bookingData.notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await bookingRef.set(bookingDocData);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount already in cents
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingRef.id,
        userId: context.auth.uid,
      },
    });

    // Store payment record
    await db.collection('payments').doc(paymentIntent.id).set({
      id: paymentIntent.id,
      bookingId: bookingRef.id,
      userId: context.auth.uid,
      amount: amount / 100, // Store in AED
      currency: currency.toUpperCase(),
      status: 'pending',
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingId: bookingRef.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
  }
});

// Cloud Function: Confirm booking after successful payment
export const confirmBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { bookingId, paymentIntentId } = data;

  if (!bookingId || !paymentIntentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    // Verify booking exists and belongs to user
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const booking = bookingDoc.data()!;
    if (booking.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Verify payment was successful
    const paymentDoc = await db.collection('payments').doc(paymentIntentId).get();
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data()!;
    if (payment.status !== 'succeeded') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    }

    // Update booking status to confirmed
    await db.collection('bookings').doc(bookingId).update({
      status: 'confirmed',
      paymentId: paymentIntentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create success notification
    await db.collection('notifications').add({
      userId: context.auth.uid,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your ${booking.type} booking has been confirmed and payment processed successfully.`,
      isRead: false,
      data: { bookingId, paymentId: paymentIntentId },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Booking confirmed successfully',
    };
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to confirm booking');
  }
});

// Cloud Function: Handle Stripe webhook
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send('Webhook Error');
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Helper function to handle successful payments
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const paymentId = paymentIntent.id;
  const bookingId = paymentIntent.metadata.bookingId;

  try {
    // Update payment status
    await db.collection('payments').doc(paymentId).update({
      status: 'succeeded',
      stripeChargeId: paymentIntent.latest_charge as string,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update booking status
    await db.collection('bookings').doc(bookingId).update({
      status: 'confirmed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    const booking = bookingDoc.data()!;

    await db.collection('notifications').add({
      userId: booking.userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully. Your booking is now confirmed.',
      isRead: false,
      data: { bookingId, paymentId },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Payment ${paymentId} succeeded for booking ${bookingId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Helper function to handle failed payments
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const paymentId = paymentIntent.id;
  const bookingId = paymentIntent.metadata.bookingId;

  try {
    // Update payment status
    await db.collection('payments').doc(paymentId).update({
      status: 'failed',
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    const booking = bookingDoc.data()!;

    await db.collection('notifications').add({
      userId: booking.userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or contact support.',
      isRead: false,
      data: { bookingId, paymentId },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Payment ${paymentId} failed for booking ${bookingId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Cloud Function: Get user bookings
export const getUserBookings = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const bookingsSnapshot = await db.collection('bookings')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      bookings,
    };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get bookings');
  }
});

// Cloud Function: Cancel booking
export const cancelBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { bookingId, reason } = data;

  if (!bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'Booking ID required');
  }

  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const booking = bookingDoc.data()!;
    if (booking.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Check if booking can be cancelled (not in progress or completed)
    if (['in_progress', 'completed'].includes(booking.status)) {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot cancel booking in progress or completed');
    }

    // Update booking status
    await bookingRef.update({
      status: 'cancelled',
      cancelReason: reason || null,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification
    await db.collection('notifications').add({
      userId: context.auth.uid,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled successfully.',
      isRead: false,
      data: { bookingId },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Booking cancelled successfully',
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel booking');
  }
});