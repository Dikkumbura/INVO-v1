import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import { ArrowLeftIcon, ShieldCheckIcon, ChevronRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { insuranceSubmissionService } from '../services/insuranceSubmission';

export default function PolicyPayment() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    name: '',
    email: '',
    saveCard: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get quote details if available
  const quote = quoteId ? insuranceSubmissionService.getSubmission(quoteId) : null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiration date is required';
    if (!formData.cardCvc.trim()) newErrors.cardCvc = 'CVC is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate payment processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaymentSuccess(true);

      // After showing success message, navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  // Format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1/$2');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value.substring(0, 19));
    setFormData(prev => ({ ...prev, cardNumber: formattedValue }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiry(e.target.value.substring(0, 5));
    setFormData(prev => ({ ...prev, cardExpiry: formattedValue }));
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader title="Payment Successful" />
        <div className="max-w-3xl mx-auto mt-6 bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your policy has been bound!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your policy is now in effect and you will receive your documents via email shortly.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader title="Policy Payment" />
      
      <div className="max-w-3xl mx-auto mt-6">
        {/* Quote Summary */}
        {quote && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Policy Summary</h3>
                <p className="text-blue-700">{quote.insuranceType} Insurance</p>
                <p className="text-blue-700">
                  for {quote.customerInfo.companyName || quote.customerInfo.firstName + ' ' + quote.customerInfo.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Premium</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${quote.premium.annualPremium.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700">USD / Year</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Form */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Details</h3>
            
            {/* Payment Method Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                className={`${
                  paymentMethod === 'card'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setPaymentMethod('card')}
              >
                Credit Card
              </button>
              <button
                type="button"
                className={`${
                  paymentMethod === 'ach'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setPaymentMethod('ach')}
              >
                ACH Bank Transfer
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="cardNumber"
                        id="cardNumber"
                        className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                          errors.cardNumber
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="4242 4242 4242 4242"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.cardNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                        Expiration Date
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="cardExpiry"
                          id="cardExpiry"
                          className={`block w-full focus:outline-none sm:text-sm rounded-md ${
                            errors.cardExpiry
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                        />
                        {errors.cardExpiry && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-red-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.cardExpiry && (
                        <p className="mt-2 text-sm text-red-600">{errors.cardExpiry}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700">
                        CVC
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="cardCvc"
                          id="cardCvc"
                          className={`block w-full focus:outline-none sm:text-sm rounded-md ${
                            errors.cardCvc
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="123"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          maxLength={4}
                        />
                        {errors.cardCvc && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-red-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.cardCvc && (
                        <p className="mt-2 text-sm text-red-600">{errors.cardCvc}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                      Account Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="accountNumber"
                        id="accountNumber"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter your account number"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700">
                      Routing Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="routingNumber"
                        id="routingNumber"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter your routing number"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name on Card
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`block w-full focus:outline-none sm:text-sm rounded-md ${
                        errors.name
                          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={`block w-full focus:outline-none sm:text-sm rounded-md ${
                        errors.email
                          ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-red-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="saveCard"
                      name="saveCard"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={formData.saveCard}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="saveCard" className="font-medium text-gray-700">
                      Save payment information for future use
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate(`/quote/${quoteId}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Back to Quote
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Pay ${quote?.premium.annualPremium.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <div className="flex items-center justify-center">
                  <LockClosedIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 