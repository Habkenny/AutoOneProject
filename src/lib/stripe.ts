// Stripe configuration for Auto One
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
// In production, this should come from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export { stripePromise };
export default stripePromise;