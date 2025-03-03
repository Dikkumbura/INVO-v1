import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeftIcon, CheckCircleIcon, PencilSquareIcon, ClockIcon } from '@heroicons/react/24/outline';
import { insuranceSubmissionService, Submission } from '../services/insuranceSubmission';
import PageHeader from './PageHeader';
import QuoteModification from './QuoteModification';
import { useAuth } from '../context/AuthContext';
import { quoteService } from '../services/firestore';

export default function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');
  const [showModification, setShowModification] = useState(false);

  useEffect(() => {
    loadQuoteData();
  }, [quoteId]);

  const loadQuoteData = async () => {
    if (quoteId) {
      setLoading(true);
      try {
        // Try to get from local storage first
        let quoteData = insuranceSubmissionService.getSubmission(quoteId);
        
        // If not found locally, try to fetch from Firebase
        if (!quoteData) {
          const auth = useAuth();
          if (auth.currentUser) {
            const firebaseQuoteData = await quoteService.getById(quoteId);
            if (firebaseQuoteData) {
              // Convert to Submission format
              quoteData = {
                id: quoteId,
                timestamp: Date.parse(firebaseQuoteData.timestamp as string) || Date.now(),
                insuranceType: firebaseQuoteData.insuranceType,
                customerInfo: firebaseQuoteData.customerInfo,
                policyDetails: firebaseQuoteData.policyDetails,
                premium: firebaseQuoteData.premium,
                status: firebaseQuoteData.status || 'new',
                modificationHistory: firebaseQuoteData.modificationHistory || []
              };
              
              // Save to local storage for future use
              insuranceSubmissionService.addSubmission(quoteData);
            }
          }
        }
        
        if (quoteData) {
          setQuote(quoteData);
        } else {
          setError('Quote not found');
        }
      } catch (err) {
        setError('Error loading quote details');
        console.error('Error loading quote:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSaveQuote = async () => {
    if (!quoteId) return;
    
    setIsSaving(true);
    try {
      await insuranceSubmissionService.saveQuote(quoteId);
      setSuccessMessageText('Quote saved successfully! View it in your Saved Quotes.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!quoteId) return;
    
    setIsAccepting(true);
    try {
      await insuranceSubmissionService.acceptQuote(quoteId);
      setSuccessMessageText('Quote accepted! You can now proceed to bind this policy.');
      setShowSuccessMessage(true);
      
      // Reload quote data to get updated status
      loadQuoteData();
      
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error accepting quote:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleBindQuote = () => {
    // Only allow binding if quote is accepted
    if (quote && quote.status === 'accepted') {
      // Navigate to the payment page
      navigate(`/policy-payment/${quoteId}`);
    } else {
      setSuccessMessageText('Please accept the quote before binding.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleModifyQuote = () => {
    setShowModification(true);
  };

  const handleModificationCancel = () => {
    setShowModification(false);
  };

  const handleModificationSuccess = (updatedQuote: Submission) => {
    setQuote(updatedQuote);
    setShowModification(false);
    setSuccessMessageText('Quote modified successfully! Please review the updated details.');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const renderSection = (title: string, data: Record<string, any>) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                   typeof value === 'number' ? (key.toLowerCase().includes('amount') ? formatCurrency(value) : value) :
                   value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  };

  const renderPremiumDetails = () => {
    if (!quote) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Premium Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-blue-50 rounded-lg p-4 sm:p-5">
            <div className="text-sm font-medium text-blue-600 mb-1">Monthly Premium</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(quote.premium.monthlyPremium)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 sm:p-5">
            <div className="text-sm font-medium text-green-600 mb-1">Annual Premium</div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(quote.premium.annualPremium)}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-4 sm:p-5">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Premium Factors</h4>
          <ul className="space-y-2">
            {quote.premium.factors.map((factor: any, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {factor.name}: {(factor.impact * 100).toFixed(1)}% impact
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderQuoteStatus = () => {
    if (!quote) return null;
    
    let statusColor = '';
    let statusText = '';
    let statusIcon = null;
    
    switch (quote.status) {
      case 'new':
        statusColor = 'bg-blue-50 text-blue-700';
        statusText = 'New Quote - Please review and accept';
        statusIcon = <ClockIcon className="h-5 w-5 mr-2" />;
        break;
      case 'modified':
        statusColor = 'bg-purple-50 text-purple-700';
        statusText = 'Modified Quote - Please review changes and accept';
        statusIcon = <PencilSquareIcon className="h-5 w-5 mr-2" />;
        break;
      case 'accepted':
        statusColor = 'bg-green-50 text-green-700';
        statusText = 'Accepted Quote - Ready to bind';
        statusIcon = <CheckCircleIcon className="h-5 w-5 mr-2" />;
        break;
    }
    
    return (
      <div className={`mb-6 ${statusColor} p-4 rounded-lg flex items-center`}>
        {statusIcon}
        {statusText}
      </div>
    );
  };

  const renderModificationHistory = () => {
    if (!quote || !quote.modificationHistory || quote.modificationHistory.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Modification History</h3>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
          {quote.modificationHistory.map((mod, index) => (
            <div key={index} className={index > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {format(new Date(mod.timestamp), 'MMMM d, yyyy h:mm a')}
                </span>
              </div>
              {mod.notes && (
                <p className="mt-1 text-sm text-gray-600">
                  Notes: {mod.notes}
                </p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-medium text-gray-500">Previous Monthly Premium</span>
                  <p className="text-sm text-gray-900">{formatCurrency(mod.premium.monthlyPremium)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Previous Annual Premium</span>
                  <p className="text-sm text-gray-900">{formatCurrency(mod.premium.annualPremium)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading quote details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-red-500">{error || 'Quote not found'}</p>
            <Link 
              to="/saved-quotes" 
              className="mt-4 inline-flex items-center text-accent hover:text-accent-dark"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Saved Quotes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showModification) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuoteModification 
            quoteId={quoteId || ''}
            onCancel={handleModificationCancel}
            onSuccess={handleModificationSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title={`${quote.insuranceType} Insurance Quote`}
          subtitle={`Generated on ${format(new Date(quote.timestamp), 'MMMM d, yyyy')}`}
        />
        
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {successMessageText}
            </div>
          )}

          {renderQuoteStatus()}
          {renderPremiumDetails()}
          {renderModificationHistory()}
          
          <div className="md:grid md:grid-cols-2 md:gap-x-8">
            {quote.insuranceType === "Workers' Comp" && (
              <>
                <div className="mb-6 md:mb-0">
                  {renderSection('Business Information', {
                    businessName: quote.policyDetails.businessName,
                    industryType: quote.policyDetails.industryType,
                    businessLocation: quote.policyDetails.businessLocation,
                    yearsInBusiness: quote.policyDetails.yearsInBusiness
                  })}
                </div>
                <div>
                  {renderSection('Payroll & Employees', {
                    annualPayroll: quote.policyDetails.annualPayroll,
                    numberOfEmployees: quote.policyDetails.numberOfEmployees,
                    safetyTraining: quote.policyDetails.safetyTraining,
                    useHeavyMachinery: quote.policyDetails.useHeavyMachinery
                  })}
                </div>
              </>
            )}

            {quote.insuranceType === 'Temp Staffing' && (
              <>
                <div className="mb-6 md:mb-0">
                  {renderSection('Agency Information', {
                    staffingAgencyName: quote.policyDetails.staffingAgencyName,
                    primaryIndustry: quote.policyDetails.primaryIndustry,
                    businessLocation: quote.policyDetails.businessLocation,
                    yearsInBusiness: quote.policyDetails.yearsInBusiness
                  })}
                </div>
                <div>
                  {renderSection('Workforce & Payroll', {
                    totalTempEmployees: quote.policyDetails.totalTempEmployees,
                    annualTempPayroll: quote.policyDetails.annualTempPayroll,
                    averageContractLength: quote.policyDetails.averageContractLength,
                    providesHealthBenefits: quote.policyDetails.providesHealthBenefits,
                    usesHeavyMachinery: quote.policyDetails.usesHeavyMachinery
                  })}
                </div>
              </>
            )}

            {quote.insuranceType === 'Trucking' && (
              <>
                <div className="mb-6 md:mb-0">
                  {renderSection('Company Information', {
                    truckingCompanyName: quote.policyDetails.truckingCompanyName || quote.policyDetails.companyName,
                    businessLocation: quote.policyDetails.businessLocation,
                    yearsInOperation: quote.policyDetails.yearsInOperation || quote.policyDetails.yearsInBusiness,
                    usdotNumber: quote.policyDetails.usdotNumber || quote.policyDetails.mcNumber
                  })}
                </div>
                <div>
                  {renderSection('Fleet & Operations', {
                    numberOfTrucks: quote.policyDetails.numberOfTrucks,
                    numberOfDrivers: quote.policyDetails.numberOfDrivers,
                    operatesInterstate: quote.policyDetails.operatesInterstate,
                    annualMilesPerTruck: quote.policyDetails.annualMilesPerTruck || quote.policyDetails.operatingRadius,
                    primaryCargoType: quote.policyDetails.primaryCargoType
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 md:grid md:grid-cols-2 md:gap-x-8">
            <div className={quote.insuranceType === 'Trucking' ? '' : 'md:col-span-2'}>
              {quote.insuranceType === 'Trucking' && (
                <div className="mb-6 md:mb-0">
                  {renderSection('Safety & Compliance', {
                    hasFleetSafetyProgram: quote.policyDetails.hasFleetSafetyProgram,
                    hasDrugTesting: quote.policyDetails.hasDrugTesting,
                    hasAccidents: quote.policyDetails.hasAccidents || quote.policyDetails.hasAccidentsLast3Years,
                    accidentCount: quote.policyDetails.accidentCount || quote.policyDetails.numberOfAccidents
                  })}
                </div>
              )}
            </div>

            <div className={quote.insuranceType === 'Trucking' ? '' : 'md:col-span-2'}>
              {renderSection('Contact Information', {
                contactName: quote.customerInfo.contactName,
                contactEmail: quote.customerInfo.contactEmail,
                contactPhone: quote.customerInfo.contactPhone
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              to="/saved-quotes"
              className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Saved Quotes
            </Link>
            
            <button
              onClick={handleSaveQuote}
              disabled={isSaving}
              className={`relative bg-accent/80 text-white py-3 px-6 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent text-center ${
                isSaving ? 'cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <span className="opacity-0">Save Quote</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : (
                'Save Quote'
              )}
            </button>

            <button
              onClick={handleModifyQuote}
              className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              <PencilSquareIcon className="h-4 w-4 inline mr-2" />
              Modify Quote
            </button>
            
            {quote.status !== 'accepted' ? (
              <button
                onClick={handleAcceptQuote}
                disabled={isAccepting}
                className={`flex-1 relative bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150 ${
                  isAccepting ? 'cursor-not-allowed' : ''
                }`}
              >
                {isAccepting ? (
                  <>
                    <span className="opacity-0">Accept Quote</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Accept Quote
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleBindQuote}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
              >
                Bind Quote
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 