import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { insuranceSubmissionService, Submission } from '../services/insuranceSubmission';
import PageHeader from './PageHeader';

export default function SavedQuotes() {
  const [quotes, setQuotes] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Load quotes from firebase first, then get from local storage
      await insuranceSubmissionService.loadSavedQuotesFromFirebase();
      setQuotes(insuranceSubmissionService.getSavedQuoteSubmissions());
    } catch (error) {
      console.error("Error loading quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = (id: string) => {
    insuranceSubmissionService.deleteSavedQuote(id);
    setQuotes(insuranceSubmissionService.getSavedQuoteSubmissions());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Saved Quotes"
          subtitle="View and manage your saved insurance quotes"
        />

        {quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500 mb-4">No saved quotes yet.</p>
            <Link
              to="/quote"
              className="inline-flex items-center text-accent hover:text-accent-dark"
            >
              Get your first quote
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {quote.insuranceType} Insurance Quote
                    </h2>
                    <p className="text-sm text-gray-500">
                      Generated on {format(new Date(quote.timestamp), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuote(quote.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete quote"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Monthly Premium</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(quote.premium.monthlyPremium)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Annual Premium</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(quote.premium.annualPremium)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {quote.customerInfo.contactName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/quote/${quote.id}`}
                    className="flex-1 bg-accent text-white text-center py-3 px-4 rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => navigate(`/policy-payment/${quote.id}`)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Bind Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}