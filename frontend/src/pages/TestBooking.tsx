/**
 * Test Booking Page
 * Quick test page to try the booking flow with payments
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, Users, DollarSign, CreditCard, Check } from 'lucide-react';

export default function TestBooking() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    origin: 'CAI',
    destination: 'DXB',
    departureDate: '2025-12-01',
    returnDate: '2025-12-08',
    travelers: 2,
    totalPrice: 850
  });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [bookingId, setBookingId] = useState('');

  const createBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flightData: {
            airline: 'Emirates',
            flightNumber: 'EK924',
            departure: bookingData.origin,
            arrival: bookingData.destination
          },
          origin: bookingData.origin,
          destination: bookingData.destination,
          departureDate: bookingData.departureDate,
          returnDate: bookingData.returnDate,
          travelers: [
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }
          ],
          totalPrice: bookingData.totalPrice,
          currency: 'USD'
        })
      });

      const data = await response.json();
      if (data.success) {
        setBookingId(data.booking.id);
        setStep(2);
      } else {
        alert('Booking failed: ' + data.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  const processPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (paymentMethod === 'stripe') {
        // Stripe payment
        const response = await fetch('http://localhost:5000/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bookingId,
            amount: bookingData.totalPrice * 100, // cents
            currency: 'usd'
          })
        });

        const data = await response.json();
        if (data.clientSecret) {
          alert('Stripe payment initiated! Client Secret: ' + data.clientSecret);
          setStep(3);
        }
      } else {
        // PayPal payment
        const response = await fetch('http://localhost:5000/api/paypal/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bookingId })
        });

        const data = await response.json();
        if (data.success && data.approvalUrl) {
          window.open(data.approvalUrl, '_blank');
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Test Booking Flow
          </h1>
          <p className="text-slate-400 text-lg">
            Quick test of the complete booking and payment system
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                animate={{
                  scale: step === s ? 1.2 : 1,
                  backgroundColor: step >= s ? '#06b6d4' : '#334155'
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
              >
                {step > s ? <Check className="w-6 h-6" /> : s}
              </motion.div>
              {s < 3 && (
                <div className={`w-20 h-1 ${step > s ? 'bg-cyan-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Plane className="w-8 h-8 text-cyan-400" />
              Flight Details
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-slate-400 mb-2">From</label>
                <input
                  type="text"
                  value={bookingData.origin}
                  onChange={(e) => setBookingData({...bookingData, origin: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">To</label>
                <input
                  type="text"
                  value={bookingData.destination}
                  onChange={(e) => setBookingData({...bookingData, destination: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Departure</label>
                <input
                  type="date"
                  value={bookingData.departureDate}
                  onChange={(e) => setBookingData({...bookingData, departureDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Return</label>
                <input
                  type="date"
                  value={bookingData.returnDate}
                  onChange={(e) => setBookingData({...bookingData, returnDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Travelers</label>
                <input
                  type="number"
                  value={bookingData.travelers}
                  onChange={(e) => setBookingData({...bookingData, travelers: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Total Price (USD)</label>
                <input
                  type="number"
                  value={bookingData.totalPrice}
                  onChange={(e) => setBookingData({...bookingData, totalPrice: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createBooking}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg"
            >
              Create Booking
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-cyan-400" />
              Choose Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaymentMethod('stripe')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="text-4xl mb-3">💳</div>
                <h3 className="font-bold text-lg mb-2">Stripe</h3>
                <p className="text-sm text-slate-400">Credit/Debit Card</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaymentMethod('paypal')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="text-4xl mb-3">🅿️</div>
                <h3 className="font-bold text-lg mb-2">PayPal</h3>
                <p className="text-sm text-slate-400">PayPal Account</p>
              </motion.button>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono text-sm">{bookingId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-2xl font-bold text-cyan-400">${bookingData.totalPrice}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={processPayment}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-lg"
            >
              Proceed to Payment
            </motion.button>
          </motion.div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360, 0]
              }}
              transition={{ duration: 1 }}
              className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4">Payment Initiated!</h2>
            <p className="text-slate-400 text-lg mb-8">
              Your booking has been created and payment is being processed.
            </p>

            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <div className="text-sm text-slate-400 mb-2">Booking Reference</div>
              <div className="text-2xl font-bold text-cyan-400 mb-4">{bookingId}</div>
              <div className="text-sm text-slate-400">
                {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} payment in progress
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold"
            >
              Back to Home
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
