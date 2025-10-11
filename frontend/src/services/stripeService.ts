/**
 * Stripe Payment Service
 * Client for Stripe payment processing
 */

import axios, { AxiosInstance } from 'axios';

export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CustomerRequest {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CustomerResponse {
  customerId: string;
  email: string;
  name?: string;
  created: number;
}

export interface SubscriptionRequest {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
  status: string;
  currentPeriodEnd: number;
}

export interface CheckoutSessionRequest {
  priceId: string;
  quantity?: number;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription' | 'setup';
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  status: string;
}

class StripeService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    const response = await this.api.post('/payment/create-intent', data);
    return response.data;
  }

  /**
   * Create customer
   */
  async createCustomer(data: CustomerRequest): Promise<CustomerResponse> {
    const response = await this.api.post('/payment/create-customer', data);
    return response.data;
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<CustomerResponse> {
    const response = await this.api.get(`/payment/customer/${customerId}`);
    return response.data;
  }

  /**
   * Create subscription
   */
  async createSubscription(
    data: SubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const response = await this.api.post('/payment/create-subscription', data);
    return response.data;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false
  ): Promise<any> {
    const response = await this.api.post('/payment/cancel-subscription', {
      subscriptionId,
      immediate,
    });
    return response.data;
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(
    data: CheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    const response = await this.api.post(
      '/payment/create-checkout-session',
      data
    );
    return response.data;
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<PaymentIntentResponse> {
    const response = await this.api.get(
      `/payment/payment-intent/${paymentIntentId}`
    );
    return response.data;
  }

  /**
   * Create refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<any> {
    const response = await this.api.post('/payment/create-refund', {
      paymentIntentId,
      amount,
      reason,
    });
    return response.data;
  }

  /**
   * List customer payment methods
   */
  async listPaymentMethods(
    customerId: string,
    type: string = 'card'
  ): Promise<any[]> {
    const response = await this.api.get('/payment/payment-methods', {
      params: { customerId, type },
    });
    return response.data.paymentMethods || [];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.api.get('/payment/health');
    return response.data;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
