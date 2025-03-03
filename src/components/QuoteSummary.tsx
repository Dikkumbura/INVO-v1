import React, { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeftIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { insuranceSubmissionService } from '../services/insuranceSubmission';

interface QuoteSummaryProps {
  formData: Record<string, any>;
  insuranceType: string;
  onEdit: () => void;
  submission: {
    id: string;
    premium: {
      monthlyPremium: number;
      annualPremium: number;
      factors: Array<{
        name: string;
        impact: number;
      }>;
    };
  };
}

export default function QuoteSummary({ formData, insuranceType, onEdit, submission }: QuoteSummaryProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSaveQuote = async () => {
    setIsSaving(true);
    try {
      await insuranceSubmissionService.saveQuote(submission.id);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBindQuote = () => {
    // Implement quote binding logic
    console.log('Binding quote:', submission.id);
  };

  const renderSection = (title: string, data: Record<string, any>) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        <div className="bg-gray-50 rounded-lg p-4">
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
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Premium Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600 mb-1">Monthly Premium</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(submission.premium.monthlyPremium)}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 mb-1">Annual Premium</div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(submission.premium.annualPremium)}
            </div>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Premium Factors</h4>
          <ul className="space-y-2">
            {submission.premium.factors.map((factor, index) => (
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

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Quote Summary</h2>
              <p className="mt-1 text-sm text-gray-600">
                {insuranceType} Insurance Quote - {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Edit Details
          </button>
        </div>
      </div>

      <div className="p-6">
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Quote saved successfully! View it in your Saved Quotes.
          </div>
        )}

        {renderPremiumDetails()}
        
        <div className="md:grid md:grid-cols-2 md:gap-x-8">
          {insuranceType === "Workers' Comp" && (
            <>
              <div className="mb-6 md:mb-0">
                {renderSection('Business Information', {
                  businessName: formData.businessName,
                  industryType: formData.industryType,
                  businessLocation: formData.businessLocation,
                  yearsInBusiness: formData.yearsInBusiness
                })}
              </div>
              <div>
                {renderSection('Payroll & Employees', {
                  annualPayroll: formData.annualPayroll,
                  numberOfEmployees: formData.numberOfEmployees,
                  safetyTraining: formData.safetyTraining,
                  useHeavyMachinery: formData.useHeavyMachinery
                })}
              </div>
            </>
          )}

          {insuranceType === 'Temp Staffing' && (
            <>
              <div className="mb-6 md:mb-0">
                {renderSection('Agency Information', {
                  staffingAgencyName: formData.staffingAgencyName,
                  primaryIndustry: formData.primaryIndustry,
                  businessLocation: formData.businessLocation,
                  yearsInBusiness: formData.yearsInBusiness
                })}
              </div>
              <div>
                {renderSection('Workforce & Payroll', {
                  totalTempEmployees: formData.totalTempEmployees,
                  annualTempPayroll: formData.annualTempPayroll,
                  averageContractLength: formData.averageContractLength,
                  providesHealthBenefits: formData.providesHealthBenefits,
                  usesHeavyMachinery: formData.usesHeavyMachinery
                })}
              </div>
            </>
          )}

          {insuranceType === 'Trucking' && (
            <>
              <div className="mb-6 md:mb-0">
                {renderSection('Company Information', {
                  truckingCompanyName: formData.truckingCompanyName || formData.companyName,
                  businessLocation: formData.businessLocation,
                  yearsInOperation: formData.yearsInOperation || formData.yearsInBusiness,
                  usdotNumber: formData.usdotNumber || formData.mcNumber
                })}
              </div>
              <div>
                {renderSection('Fleet & Operations', {
                  numberOfTrucks: formData.numberOfTrucks,
                  numberOfDrivers: formData.numberOfDrivers,
                  operatesInterstate: formData.operatesInterstate,
                  annualMilesPerTruck: formData.annualMilesPerTruck || formData.operatingRadius,
                  primaryCargoType: formData.primaryCargoType
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 md:grid md:grid-cols-2 md:gap-x-8">
          <div className={insuranceType === 'Trucking' ? '' : 'md:col-span-2'}>
            {insuranceType === 'Trucking' && (
              <div className="mb-6 md:mb-0">
                {renderSection('Safety & Compliance', {
                  hasFleetSafetyProgram: formData.hasFleetSafetyProgram,
                  hasDrugTesting: formData.hasDrugTesting,
                  hasAccidents: formData.hasAccidents || formData.hasAccidentsLast3Years,
                  accidentCount: formData.accidentCount || formData.numberOfAccidents
                })}
              </div>
            )}
          </div>

          <div className={insuranceType === 'Trucking' ? '' : 'md:col-span-2'}>
            {renderSection('Contact Information', {
              contactName: formData.contactName,
              contactEmail: formData.contactEmail,
              contactPhone: formData.contactPhone
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSaveQuote}
            disabled={isSaving}
            className={`flex-1 bg-accent text-white py-3 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-150 ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Quote'}
          </button>
          <button
            onClick={handleBindQuote}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
          >
            Bind Quote
          </button>
        </div>
      </div>
    </div>
  );
}