import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStripeConfig();
  }, []);

  const loadStripeConfig = async () => {
    try {
      const response = await paymentAPI.getConfig();
      if (response.data.enabled && response.data.publishable_key) {
        setStripePromise(loadStripe(response.data.publishable_key));
        setPaymentEnabled(true);
      } else {
        setPaymentEnabled(false);
        setError('Payment processing is not configured on this server.');
      }
    } catch (err) {
      setPaymentEnabled(false);
      setError('Payment processing is not available.');
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await paymentAPI.createCheckoutSession({
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      });

      const stripe = await stripePromise;
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  if (!paymentEnabled) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Not Available</h1>
            <p className="text-gray-600 mb-6">
              Payment processing is not configured on this server. You can still use the free tier!
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Go to My Songs
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.is_paid) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Already Premium!</h1>
            <p className="text-gray-600 mb-6">
              You're currently enjoying all premium features.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Go to My Songs
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600">
            Unlock unlimited creativity with longer songs and more control
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Plan</h2>
            <p className="text-3xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-6" role="list">
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Unlimited song creation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Up to 256 tokens per song</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2" aria-hidden="true">✗</span>
                <span className="text-gray-500">Configurable token limits</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2" aria-hidden="true">✗</span>
                <span className="text-gray-500">Longer songs</span>
              </li>
            </ul>
            <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          <div className="card border-2 border-primary-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Plan</h2>
            <p className="text-3xl font-bold text-gray-900 mb-6">$9.99<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-6" role="list">
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Unlimited song creation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Up to 4096 tokens per song</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Configurable token limits</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Much longer songs</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full btn-primary"
              aria-busy={loading}
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription at any time from your settings page.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit cards through Stripe's secure payment processing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What happens to my songs if I downgrade?</h4>
              <p className="text-sm text-gray-600">
                All your existing songs will remain accessible. New songs will be limited to free tier specifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
