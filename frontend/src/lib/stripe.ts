import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Singleton to load Stripe.js once
 */
export const getStripe = () => {
  if (!stripePromise) {
    // This key is safe to be exposed in the frontend
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
  }
  return stripePromise;
};
