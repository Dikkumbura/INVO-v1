import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon, DocumentTextIcon, PhotoIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';
import LoadingScreen from './LoadingScreen';
import useClaimProcessing, { ClaimType } from '../hooks/useClaimProcessing';
import { useClaims, Claim } from '../context/ClaimContext';

// Define the types for our form data
type ClaimFormData = {
  policyNumber: string;
  claimType: string;
  incidentDate: string;
  description: string;
  estimatedAmount: string;
  contactPhone: string;
  contactEmail: string;
  documents: File[];
};

// Define risk levels
type RiskLevel = 'low' | 'medium' | 'high';

// Define claim result type
type ClaimResult = {
  approved: boolean;
  referenceNumber: string;
  message: string;
  nextSteps: string[];
  paymentAmount?: string;
};

const FileClaimPage: React.FC = () => {
  const navigate = useNavigate();
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Use our custom hook for claim processing
  const {
    formData,
    uploadedFiles,
    claimResult,
    isProcessing,
    handleInputChange,
    handleFileUpload,
    handleRemoveFile,
    processClaimSubmission,
    isFormValid,
    resetForm
  } = useClaimProcessing();

  // Use claims context to save new claims
  const { addClaim } = useClaims();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await processClaimSubmission();
    
    // Save the claim to our context
    if (result) {
      const newClaim: Claim = {
        referenceNumber: result.referenceNumber,
        policyNumber: formData.policyNumber,
        claimType: formData.claimType as ClaimType,
        dateSubmitted: new Date().toISOString(),
        description: formData.description,
        amount: formData.estimatedAmount,
        status: result.approved ? 'approved' : 'under_review',
        paymentStatus: result.paymentStatus || 'pending',
        paymentAmount: result.paymentAmount,
        riskLevel: result.riskLevel || 'medium',
        documents: uploadedFiles,
        nextSteps: result.nextSteps,
        claimantInfo: {
          phone: formData.contactPhone,
          email: formData.contactEmail
        }
      };
      
      addClaim(newClaim);
    }
    
    setCurrentStep(4); // Move to results step
  };

  // Go to next step
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  // Go to previous step
  const goToPrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Start a new claim
  const startNewClaim = () => {
    resetForm();
    setCurrentStep(1);
  };
  
  // Go to claim tracking
  const goToClaimTracking = () => {
    navigate('/claim-tracking');
  };

  // Render stepper navigation
  const renderStepper = () => {
    const steps = [
      { name: 'Policy Info', number: 1 },
      { name: 'Incident Details', number: 2 },
      { name: 'Documentation', number: 3 },
      { name: 'Results', number: 4 }
    ];

    return (
      <nav aria-label="Progress" className="mb-12">
        <ol className="flex items-center">
          {steps.map((step) => (
            <li key={step.name} className={`relative ${step.number !== steps.length ? 'pr-8 sm:pr-20' : ''} ${step.number !== 1 ? 'pl-8 sm:pl-20' : ''}`}>
              {step.number < currentStep ? (
                // Completed step
                <div className="flex items-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-accent" />
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (step.number < currentStep) {
                        setCurrentStep(step.number);
                      }
                    }}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent group"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </div>
              ) : step.number === currentStep ? (
                // Current step
                <div className="flex items-center">
                  {step.number !== 1 && (
                    <div className="absolute inset-0 right-8 sm:right-20 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                  )}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent bg-white"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </div>
              ) : (
                // Upcoming step
                <div className="flex items-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </div>
              )}
              <div className={`absolute top-12 mt-1 transform ${step.number === 1 ? 'left-0' : (step.number === steps.length ? 'right-0 -translate-x-full' : '-translate-x-1/2')}`}>
                <span className="text-xs sm:text-sm font-medium text-gray-500">{step.name}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Render step 1: Policy information
  const renderStep1 = () => (
    <div className="space-y-6 pt-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Policy Number</p>
        <input
          type="text"
          id="policyNumber"
          name="policyNumber"
          value={formData.policyNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          placeholder="Enter your policy number"
          required
        />
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Claim Type</p>
        <select
          id="claimType"
          name="claimType"
          value={formData.claimType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          required
        >
          <option value="">Select claim type</option>
          <option value="property">Property Damage</option>
          <option value="liability">Liability</option>
          <option value="workers_comp">Workers' Compensation</option>
          <option value="auto">Auto</option>
          <option value="professional">Professional Liability</option>
          <option value="cyber">Cyber Incident</option>
        </select>
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Contact Phone</p>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          placeholder="(555) 555-5555"
        />
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Contact Email</p>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          placeholder="email@example.com"
        />
      </div>
    </div>
  );

  // Render step 2: Incident details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700">
            Date of Incident
          </label>
          <input
            type="date"
            id="incidentDate"
            name="incidentDate"
            value={formData.incidentDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="estimatedAmount" className="block text-sm font-medium text-gray-700">
            Estimated Amount ($)
          </label>
          <input
            type="number"
            id="estimatedAmount"
            name="estimatedAmount"
            value={formData.estimatedAmount}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Incident Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          placeholder="Please provide details about the incident..."
          required
        />
      </div>
    </div>
  );

  // Render step 3: Document upload
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex justify-center">
          <PhotoIcon className="h-12 w-12 text-gray-400" />
        </div>
        <p className="mt-2 text-sm text-gray-600">Upload supporting documents for your claim</p>
        <p className="text-xs text-gray-500">Photos, receipts, reports, or any relevant documents</p>
        <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="sr-only"
          />
          Select files
        </label>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
          <ul className="space-y-2">
            {uploadedFiles.map((fileName, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Render step 4: Results
  const renderStep4 = () => {
    if (isProcessing) {
      return (
        <div className="text-center py-10">
          <LoadingScreen />
          <p className="mt-4 text-lg text-gray-700">Processing your claim...</p>
        </div>
      );
    }

    if (!claimResult) return null;

    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          {claimResult.approved ? (
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {claimResult.approved ? "Claim Approved" : "Claim Submitted for Review"}
        </h3>
        <p className="text-md text-gray-600 mb-4">{claimResult.message}</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-700">Claim Reference Number:</p>
          <p className="text-lg font-bold text-accent">{claimResult.referenceNumber}</p>
        </div>
        {claimResult.approved && claimResult.paymentAmount && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700">Payment Amount:</p>
            <p className="text-lg font-bold text-green-600">${claimResult.paymentAmount}</p>
          </div>
        )}
        <div className="text-left mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-2">Next Steps:</h4>
          <ul className="space-y-2">
            {claimResult.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-accent mr-2">•</span>
                <span className="text-sm text-gray-600">{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 space-x-4">
          <button
            type="button"
            onClick={startNewClaim}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            File Another Claim
          </button>
          <button
            type="button"
            onClick={goToClaimTracking}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            View All Claims
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg max-w-3xl mx-auto">
      <div className="px-6 py-6">
        <PageHeader
          title="File a Claim"
          subtitle="Submit a new insurance claim"
          showBackButton={true}
          icon={<ShieldExclamationIcon className="h-8 w-8 text-accent" />}
        />
        
        {renderStepper()}
        
        <form onSubmit={handleSubmit} className="mt-4">
          {currentStep === 1 && (
            <>
              <div className="mb-8">
                {/* We don't need a header here since the stepper already shows Policy Information */}
              </div>
              {renderStep1()}
            </>
          )}
          {currentStep === 2 && (
            <>
              <h3 className="text-base font-medium text-gray-700 mb-4">Incident Details</h3>
              {renderStep2()}
            </>
          )}
          {currentStep === 3 && (
            <>
              <h3 className="text-base font-medium text-gray-700 mb-4">Documentation</h3>
              {renderStep3()}
            </>
          )}
          {currentStep === 4 && renderStep4()}
          
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={goToPrevStep}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                Back
              </button>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!isFormValid(currentStep)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent ${
                    isFormValid(currentStep) ? 'hover:bg-accent/90' : 'opacity-50 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isFormValid(currentStep)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent ${
                    isFormValid(currentStep) ? 'hover:bg-accent/90' : 'opacity-50 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
                >
                  Submit Claim
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FileClaimPage; 