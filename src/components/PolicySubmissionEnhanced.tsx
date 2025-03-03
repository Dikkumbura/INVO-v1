import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { ZodError, z } from 'zod';
import { PolicySubmissionFormData as PolicySubmissionFormEnhanced } from '../types/insurance';

// Mock service for policy submission
const policySubmissionService = {
  submitPolicy: async (
    data: PolicySubmissionFormEnhanced, 
    asDraft: boolean = false
  ): Promise<{ id: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: 'policy-' + Math.random().toString(36).substr(2, 9) };
  }
};

// Function to generate appropriate schema based on form data
const getConditionalSchema = (data: Partial<PolicySubmissionFormEnhanced>) => {
  // This is a simplified implementation - expand as needed with your validation rules
  return z.object({
    // Core fields
    applicantType: z.enum(['business', 'individual']),
    // Add more validation rules as needed
  }).partial();
};

// Add this utility function 
function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

const steps = [
  { number: 1, name: 'Pre-qualification' },
  { number: 2, name: 'Applicant Information' },
  { number: 3, name: 'Location Information' },
  { number: 4, name: 'Coverage Details' },
  { number: 5, name: 'Risk Information' },
  { number: 6, name: 'Claims History' },
  { number: 7, name: 'Additional Information' },
  { number: 8, name: 'Review & Submit' }
];

// Form options
const insuranceTypes = ['General Liability', 'Professional Liability', 'Property Insurance', 'Workers Compensation', 'Cyber Insurance', 'Business Owners Policy'];
const businessTypes = ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Non-Profit'];
const industrySectors = ['Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Construction', 'Finance', 'Education', 'Food Service', 'Transportation', 'Other'];
const yearsInBusinessOptions = ['Less than 1 year', '1-3 years', '4-10 years', 'More than 10 years'];
const annualRevenueOptions = ['Less than $100,000', '$100,000 - $500,000', '$500,001 - $1,000,000', '$1,000,001 - $5,000,000', 'More than $5,000,000'];
const numberOfEmployeesOptions = ['1-5', '6-25', '26-100', '101-500', 'More than 500'];

export default function PolicySubmissionEnhanced() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PolicySubmissionFormEnhanced>>({
    applicantType: 'business',
    additionalLocations: [],
    claimsHistory: [],
    hasPriorClaims: false,
    currentlyInsured: false,
    mailingAddressSameAsPhysical: true,
    coverageLimits: {},
    deductibles: {},
    riskDetails: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [savedProgress, setSavedProgress] = useState(false);
  // Define files state
  const [files, setFiles] = useState<File[]>([]);

  // Define the total number of steps
  const totalSteps = 8;

  // Load saved draft if available
  useEffect(() => {
    const savedDraft = localStorage.getItem('policy_submission_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft.formData);
        setCurrentStep(parsedDraft.currentStep);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem('policy_submission_draft', JSON.stringify({
        formData,
        currentStep
      }));
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [formData, currentStep]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox input
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Handle special case for mailingAddress.sameAsPhysical
      if (name === 'mailingAddressSameAsPhysical') {
        setFormData(prev => ({
          ...prev,
          mailingAddressSameAsPhysical: checked
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } 
    // Handle nested object paths (e.g., physicalAddress.street)
    else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } 
    // Handle regular inputs
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateStep = useCallback((step: number) => {
    // Define which fields to validate for each step
    const stepFields: Record<number, string[]> = {
      1: ['applicantType', 'insuranceType'],
      2: formData.applicantType === 'business' 
          ? ['businessName', 'businessType', 'industrySector', 'yearsInBusiness', 'annualRevenue', 'numberOfEmployees', 'contactEmail', 'contactPhone'] 
          : ['firstName', 'lastName', 'contactEmail', 'contactPhone'],
      3: ['physicalAddress.street', 'physicalAddress.city', 'physicalAddress.state', 'physicalAddress.zipCode'],
      4: ['effectiveDate', 'expirationDate'],
      // For steps 5-8, we'll validate in separate functions as they're more dynamic
      5: [],
      6: ['hasPriorClaims'],
      7: ['currentlyInsured'],
      8: [] // Final review step
    };

    try {
      // For general validation of defined fields
      const fieldsToValidate = stepFields[step];
      
      // Create a nested path validator that works with dot notation
      const getNestedValue = (obj: any, path: string) => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
          if (value === undefined || value === null) return undefined;
          value = value[key];
        }
        return value;
      };

      // Check if required fields are filled based on the step
      const missingFields: string[] = [];
      fieldsToValidate.forEach(field => {
        const value = getNestedValue(formData, field);
        if (value === undefined || value === '' || value === null) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        const newErrors: Record<string, string> = {};
        missingFields.forEach(field => {
          const fieldName = field.includes('.') ? field.split('.').pop()! : field;
          newErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        });
        setErrors(newErrors);
        return false;
      }

      // Additional custom validation for specific steps
      if (step === 2 && formData.applicantType === 'business' && !formData.businessName) {
        setErrors({ businessName: 'Business name is required' });
        return false;
      }

      if (step === 3) {
        // Validate zip code format
        const zipCode = formData.physicalAddress?.zipCode;
        if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
          setErrors({ 'physicalAddress.zipCode': 'Please enter a valid ZIP code' });
          return false;
        }
      }

      // Clear errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          newErrors[err.path.join('.')] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      // Save progress before moving to next step
      saveDraft();
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  }, [currentStep, saveDraft, validateStep]);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const handleAddLocation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      additionalLocations: [
        ...(prev.additionalLocations || []),
        { street: '', unit: '', city: '', state: '', zipCode: '' }
      ]
    }));
  }, []);

  const handleRemoveLocation = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalLocations: prev.additionalLocations?.filter((_, i) => i !== index)
    }));
  }, []);

  const handleLocationChange = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalLocations: prev.additionalLocations?.map((location, i) => 
        i === index ? { ...location, [field]: value } : location
      )
    }));
  }, []);

  const handleAddClaim = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      claimsHistory: [
        ...(prev.claimsHistory || []),
        { date: '', description: '', amount: '', status: 'Open' }
      ]
    }));
  }, []);

  const handleRemoveClaim = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      claimsHistory: prev.claimsHistory?.filter((_, i) => i !== index)
    }));
  }, []);

  const handleClaimChange = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      claimsHistory: prev.claimsHistory?.map((claim, i) => 
        i === index ? { ...claim, [field]: value } : claim
      )
    }));
  }, []);

  const handleCoverageLimitChange = useCallback((coverage: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      coverageLimits: {
        ...(prev.coverageLimits || {}),
        [coverage]: value
      }
    }));
  }, []);

  const handleDeductibleChange = useCallback((coverage: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      deductibles: {
        ...(prev.deductibles || {}),
        [coverage]: value
      }
    }));
  }, []);

  const handleRiskDetailChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      riskDetails: {
        ...(prev.riskDetails || {}),
        [field]: value
      }
    }));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (asDraft: boolean = false) => {
    // For final submission, validate the entire form
    if (!asDraft) {
      // Validate the current step first
      if (!validateStep(currentStep)) {
        return;
      }
      
      try {
        // Validate the entire form using the conditional schema
        getConditionalSchema(formData).parse(formData);
      } catch (error) {
        if (error instanceof ZodError) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach(err => {
            const fieldPath = err.path.join('.');
            newErrors[fieldPath] = err.message;
          });
          setErrors(newErrors);
          
          // Find which step has the first error and go to that step
          // This helps users quickly find what they need to fix
          const errorField = error.errors[0].path.join('.');
          const errorStep = findStepWithField(errorField);
          if (errorStep !== currentStep) {
            setCurrentStep(errorStep);
          }
          
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the service to save as draft or submit the policy
      const result = await policySubmissionService.submitPolicy(
        formData as PolicySubmissionFormEnhanced,
        asDraft
      );
      
      setSubmissionId(result.id);
      
      if (asDraft) {
        // For drafts, just show a temporary success message
        setSavedProgress(true);
        setTimeout(() => setSavedProgress(false), 2000);
      } else {
        // For final submissions, clear the draft and show the success screen
        localStorage.removeItem('policy_submission_draft');
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting policy:', error);
      setErrors({ submit: 'Failed to submit policy. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, validateStep]);

  // Helper function to find which step contains a given field
  const findStepWithField = useCallback((fieldPath: string): number => {
    // Define which fields belong to which step
    const step1Fields = ['applicantType', 'insuranceType'];
    const step2Fields = ['businessName', 'dba', 'businessType', 'industrySector', 
                        'yearsInBusiness', 'annualRevenue', 'numberOfEmployees',
                        'firstName', 'lastName', 'contactEmail', 'contactPhone'];
    const step3Fields = ['physicalAddress', 'mailingAddress', 'additionalLocations'];
    const step4Fields = ['effectiveDate', 'expirationDate', 'coverageLimits', 'deductibles'];
    const step5Fields = ['riskDetails'];
    const step6Fields = ['hasPriorClaims', 'claimsHistory'];
    const step7Fields = ['currentlyInsured', 'currentCarrier', 'currentPremium', 
                       'reasonForShopping', 'additionalComments'];
    
    // Check which step the field belongs to
    if (step1Fields.some(field => fieldPath.startsWith(field))) return 1;
    if (step2Fields.some(field => fieldPath.startsWith(field))) return 2;
    if (step3Fields.some(field => fieldPath.startsWith(field))) return 3;
    if (step4Fields.some(field => fieldPath.startsWith(field))) return 4;
    if (step5Fields.some(field => fieldPath.startsWith(field))) return 5;
    if (step6Fields.some(field => fieldPath.startsWith(field))) return 6;
    if (step7Fields.some(field => fieldPath.startsWith(field))) return 7;
    
    // Default to the last step if we can't determine
    return 8;
  }, []);

  // Extracted outside the main render function to prevent recreation on each render
  const renderStepper = useCallback(() => {
    return (
      <div className="mb-8">
        <nav className="flex justify-between border-b border-gray-200 max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isPrevious = stepNumber < currentStep;
            
            return (
              <button
                key={step.name}
                type="button"
                onClick={() => {
                  if (isPrevious || validateStep(currentStep)) {
                    setCurrentStep(stepNumber);
                  }
                }}
                className={classNames(
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : isPrevious
                      ? 'border-green-500 text-green-600' 
                      : 'border-transparent text-gray-400',
                  'group flex flex-col items-center py-3 px-1 border-b-2 font-medium'
                )}
                disabled={!isPrevious && currentStep !== stepNumber}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={classNames(
                  isActive 
                    ? 'bg-blue-100 text-blue-600 border-blue-600' 
                    : isPrevious 
                      ? 'bg-green-50 text-green-600 border-green-500' 
                      : 'bg-gray-100 text-gray-500 border-gray-300',
                  'flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full border'
                )}>
                  {isPrevious ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }, [currentStep, validateStep]);

  // Render form field with label and error handling
  const renderField = useCallback((
    name: string,
    label: string,
    type: string = 'text',
    options?: readonly string[] | string[],
    placeholder: string = '',
    required: boolean = true,
    disabled: boolean = false
  ) => {
    // Format field ID for nested properties
    const fieldId = name.replace(/\./g, '_');
    
    // Check if there's an error for this field
    const hasError = Object.keys(errors).some(key => key === name);
    const errorMessage = hasError ? errors[name] : '';
    
    // Get field value, handling nested properties
    const getValue = () => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        // @ts-ignore - We know this nested path exists
        return formData[parent]?.[child] ?? '';
      }
      // @ts-ignore - We know this path exists
      return formData[name] ?? '';
    };
    
    const value = getValue();
    
    return (
      <div className="mb-4">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1 relative">
          {type === 'textarea' ? (
            <textarea
              id={fieldId}
              name={name}
              rows={4}
              className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${
                hasError ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder={placeholder}
              value={value as string}
              onChange={handleInputChange}
              disabled={disabled}
            />
          ) : type === 'select' ? (
            <select
              id={fieldId}
              name={name}
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                hasError ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              value={value as string}
              onChange={handleInputChange}
              disabled={disabled}
            >
              <option value="">Select {label}</option>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : type === 'checkbox' ? (
            <div className="flex items-center h-5 mt-2">
              <input
                id={fieldId}
                name={name}
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={value as boolean}
                onChange={handleInputChange}
                disabled={disabled}
              />
              <label htmlFor={fieldId} className="ml-2 block text-sm text-gray-900">
                {label}
              </label>
            </div>
          ) : (
            <input
              type={type}
              id={fieldId}
              name={name}
              className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md ${
                hasError ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder={placeholder}
              value={value as string}
              onChange={handleInputChange}
              disabled={disabled}
            />
          )}
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {hasError && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  }, [errors, formData, handleInputChange]);

  // The rest of your component remains mostly the same...
  // Dynamic content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Pre-qualification
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Pre-qualification</h3>
            <p className="text-sm text-gray-500">
              Let's start by understanding your basic needs so we can guide you through the most relevant insurance options.
            </p>
            
            <div className="mt-6">
              <label className="text-base font-medium text-gray-900">Applicant Type</label>
              <p className="text-sm text-gray-500">Are you applying as a business or individual?</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="applicant-business"
                    name="applicantType"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    value="business"
                    checked={formData.applicantType === 'business'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="applicant-business" className="ml-3 block text-sm font-medium text-gray-700">
                    Business
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="applicant-individual"
                    name="applicantType"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    value="individual"
                    checked={formData.applicantType === 'individual'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="applicant-individual" className="ml-3 block text-sm font-medium text-gray-700">
                    Individual
                  </label>
                </div>
              </div>
              {errors.applicantType && (
                <p className="mt-2 text-sm text-red-600">{errors.applicantType}</p>
              )}
            </div>
            
            {renderField('insuranceType', 'Insurance Type', 'select', insuranceTypes)}
            
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    Your selection will determine which coverage options and information we'll need in the following steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2: // Applicant Information
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {formData.applicantType === 'business' ? 'Business Information' : 'Personal Information'}
            </h3>
            
            {formData.applicantType === 'business' ? (
              // Business applicant fields
              <>
                {renderField('businessName', 'Business Name')}
                {renderField('dba', 'DBA (Doing Business As)', 'text', undefined, '', false)}
                {renderField('businessType', 'Business Type', 'select', businessTypes)}
                {renderField('industrySector', 'Industry Sector', 'select', industrySectors)}
                {renderField('yearsInBusiness', 'Years in Business', 'select', yearsInBusinessOptions)}
                {renderField('annualRevenue', 'Annual Revenue', 'select', annualRevenueOptions)}
                {renderField('numberOfEmployees', 'Number of Employees', 'select', numberOfEmployeesOptions)}
              </>
            ) : (
              // Individual applicant fields
              <>
                {renderField('firstName', 'First Name')}
                {renderField('lastName', 'Last Name')}
              </>
            )}
            
            <h4 className="text-base font-medium text-gray-900 pt-4">Contact Information</h4>
            {renderField('contactEmail', 'Email Address', 'email')}
            {renderField('contactPhone', 'Phone Number', 'tel', undefined, '(123) 456-7890')}
          </div>
        );
        
      case 3: // Location Information
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Location Information</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Physical Address</h4>
              {renderField('physicalAddress.street', 'Street Address')}
              {renderField('physicalAddress.unit', 'Unit/Suite/Apt', 'text', undefined, '', false)}
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  {renderField('physicalAddress.city', 'City')}
                </div>
                <div className="sm:col-span-2">
                  {renderField('physicalAddress.state', 'State')}
                </div>
                <div className="sm:col-span-2">
                  {renderField('physicalAddress.zipCode', 'ZIP Code')}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="mailingAddress_sameAsPhysical"
                    name="mailingAddressSameAsPhysical"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={formData.mailingAddressSameAsPhysical || false}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="mailingAddress_sameAsPhysical" className="font-medium text-gray-700">
                    Mailing address is the same as physical address
                  </label>
                </div>
              </div>
              
              {!formData.mailingAddressSameAsPhysical && (
                <>
                  <h4 className="text-base font-medium text-gray-900 mb-4">Mailing Address</h4>
                  {renderField('mailingAddress.street', 'Street Address')}
                  {renderField('mailingAddress.unit', 'Unit/Suite/Apt', 'text', undefined, '', false)}
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      {renderField('mailingAddress.city', 'City')}
                    </div>
                    <div className="sm:col-span-2">
                      {renderField('mailingAddress.state', 'State')}
                    </div>
                    <div className="sm:col-span-2">
                      {renderField('mailingAddress.zipCode', 'ZIP Code')}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Additional Locations</h4>
              <p className="text-sm text-gray-500 mb-4">
                If your business operates from multiple locations, please add them below.
              </p>
              
              {formData.additionalLocations && formData.additionalLocations.length > 0 && (
                <div className="space-y-6 mb-6">
                  {formData.additionalLocations.map((location, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Remove location</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Location {index + 1}</h5>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                          value={location.street}
                          onChange={(e) => handleLocationChange(index, 'street', e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700">Unit/Suite/Apt</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                          value={location.unit}
                          onChange={(e) => handleLocationChange(index, 'unit', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                            value={location.city}
                            onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                            value={location.state}
                            onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                            value={location.zipCode}
                            onChange={(e) => handleLocationChange(index, 'zipCode', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                type="button"
                onClick={handleAddLocation}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Location
              </button>
            </div>
          </div>
        );
        
      case 4: // Coverage Details
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Coverage Details</h3>
            <p className="text-sm text-gray-500">
              Specify when you need coverage to begin and customize your coverage limits.
            </p>
            
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              {renderField('effectiveDate', 'Policy Effective Date', 'date')}
              {renderField('expirationDate', 'Policy Expiration Date', 'date')}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Coverage Limits</h4>
              
              {/* Dynamically render coverage limits based on insurance type */}
              {formData.insuranceType === 'General Liability' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Each Occurrence Limit
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.coverageLimits?.eachOccurrence || ''}
                        onChange={(e) => handleCoverageLimitChange('eachOccurrence', e.target.value)}
                      >
                        <option value="">Select a limit</option>
                        <option value="$500,000">$500,000</option>
                        <option value="$1,000,000">$1,000,000</option>
                        <option value="$2,000,000">$2,000,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        General Aggregate Limit
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.coverageLimits?.generalAggregate || ''}
                        onChange={(e) => handleCoverageLimitChange('generalAggregate', e.target.value)}
                      >
                        <option value="">Select a limit</option>
                        <option value="$1,000,000">$1,000,000</option>
                        <option value="$2,000,000">$2,000,000</option>
                        <option value="$3,000,000">$3,000,000</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Products-Completed Operations Aggregate
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.coverageLimits?.productsAggregate || ''}
                        onChange={(e) => handleCoverageLimitChange('productsAggregate', e.target.value)}
                      >
                        <option value="">Select a limit</option>
                        <option value="$1,000,000">$1,000,000</option>
                        <option value="$2,000,000">$2,000,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Personal & Advertising Injury
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.coverageLimits?.personalInjury || ''}
                        onChange={(e) => handleCoverageLimitChange('personalInjury', e.target.value)}
                      >
                        <option value="">Select a limit</option>
                        <option value="$500,000">$500,000</option>
                        <option value="$1,000,000">$1,000,000</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {formData.insuranceType === 'Workers Compensation' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Employers Liability Each Accident
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={formData.coverageLimits?.employersLiability || ''}
                      onChange={(e) => handleCoverageLimitChange('employersLiability', e.target.value)}
                    >
                      <option value="">Select a limit</option>
                      <option value="$100,000">$100,000</option>
                      <option value="$500,000">$500,000</option>
                      <option value="$1,000,000">$1,000,000</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500">
                    Workers Compensation limits are set by state statutes for work-related injuries.
                  </p>
                </div>
              )}
              
              {/* Add similar sections for other insurance types */}
              
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Deductibles</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.insuranceType === 'General Liability' ? 'General Liability Deductible' : 
                     formData.insuranceType === 'Workers Compensation' ? 'Workers Compensation Deductible' : 
                     'Policy Deductible'}
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={formData.deductibles?.standard || ''}
                    onChange={(e) => handleDeductibleChange('standard', e.target.value)}
                  >
                    <option value="">Select a deductible</option>
                    <option value="$0">$0</option>
                    <option value="$500">$500</option>
                    <option value="$1,000">$1,000</option>
                    <option value="$2,500">$2,500</option>
                    <option value="$5,000">$5,000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5: // Risk Information
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Risk Information</h3>
            <p className="text-sm text-gray-500">
              Please provide specific details about your operations that help us assess your risk profile.
            </p>
            
            {/* Workers Compensation specific questions */}
            {formData.insuranceType === 'Workers Compensation' && (
              <div className="space-y-6">
                <h4 className="text-base font-medium text-gray-900">Workers Compensation Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Full-Time Employees
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    value={(formData.riskDetails?.fullTimeEmployees as string) || ''}
                    onChange={(e) => handleRiskDetailChange('fullTimeEmployees', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Part-Time Employees
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                    value={(formData.riskDetails?.partTimeEmployees as string) || ''}
                    onChange={(e) => handleRiskDetailChange('partTimeEmployees', e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estimated Annual Payroll
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={(formData.riskDetails?.annualPayroll as string) || ''}
                      onChange={(e) => handleRiskDetailChange('annualPayroll', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have safety programs in place?
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="safety-programs-yes"
                        name="safetyPrograms"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="yes"
                        checked={(formData.riskDetails?.safetyPrograms as string) === 'yes'}
                        onChange={() => handleRiskDetailChange('safetyPrograms', 'yes')}
                      />
                      <label htmlFor="safety-programs-yes" className="ml-3 block text-sm font-medium text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="safety-programs-no"
                        name="safetyPrograms"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="no"
                        checked={(formData.riskDetails?.safetyPrograms as string) === 'no'}
                        onChange={() => handleRiskDetailChange('safetyPrograms', 'no')}
                      />
                      <label htmlFor="safety-programs-no" className="ml-3 block text-sm font-medium text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                
                {(formData.riskDetails?.safetyPrograms as string) === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Describe your safety programs
                    </label>
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={(formData.riskDetails?.safetyProgramsDescription as string) || ''}
                      onChange={(e) => handleRiskDetailChange('safetyProgramsDescription', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* General Liability specific questions */}
            {formData.insuranceType === 'General Liability' && (
              <div className="space-y-6">
                <h4 className="text-base font-medium text-gray-900">General Liability Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Describe your business operations
                  </label>
                  <textarea
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={(formData.riskDetails?.operationsDescription as string) || ''}
                    onChange={(e) => handleRiskDetailChange('operationsDescription', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you work as a subcontractor for others?
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="subcontractor-yes"
                        name="subcontractor"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="yes"
                        checked={(formData.riskDetails?.subcontractor as string) === 'yes'}
                        onChange={() => handleRiskDetailChange('subcontractor', 'yes')}
                      />
                      <label htmlFor="subcontractor-yes" className="ml-3 block text-sm font-medium text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="subcontractor-no"
                        name="subcontractor"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="no"
                        checked={(formData.riskDetails?.subcontractor as string) === 'no'}
                        onChange={() => handleRiskDetailChange('subcontractor', 'no')}
                      />
                      <label htmlFor="subcontractor-no" className="ml-3 block text-sm font-medium text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you hire subcontractors?
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="hire-subcontractors-yes"
                        name="hireSubcontractors"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="yes"
                        checked={(formData.riskDetails?.hireSubcontractors as string) === 'yes'}
                        onChange={() => handleRiskDetailChange('hireSubcontractors', 'yes')}
                      />
                      <label htmlFor="hire-subcontractors-yes" className="ml-3 block text-sm font-medium text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="hire-subcontractors-no"
                        name="hireSubcontractors"
                        type="radio"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        value="no"
                        checked={(formData.riskDetails?.hireSubcontractors as string) === 'no'}
                        onChange={() => handleRiskDetailChange('hireSubcontractors', 'no')}
                      />
                      <label htmlFor="hire-subcontractors-no" className="ml-3 block text-sm font-medium text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add risk details for other insurance types */}
          </div>
        );
        
      case 6: // Claims History
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Claims History</h3>
            <p className="text-sm text-gray-500">
              Your claims history helps underwriters assess your risk profile.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have you had any claims in the past 5 years?
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="prior-claims-yes"
                    name="hasPriorClaims"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.hasPriorClaims === true}
                    onChange={() => setFormData(prev => ({ ...prev, hasPriorClaims: true }))}
                  />
                  <label htmlFor="prior-claims-yes" className="ml-3 block text-sm font-medium text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="prior-claims-no"
                    name="hasPriorClaims"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.hasPriorClaims === false}
                    onChange={() => setFormData(prev => ({ ...prev, hasPriorClaims: false }))}
                  />
                  <label htmlFor="prior-claims-no" className="ml-3 block text-sm font-medium text-gray-700">
                    No
                  </label>
                </div>
              </div>
              {errors.hasPriorClaims && (
                <p className="mt-2 text-sm text-red-600">{errors.hasPriorClaims}</p>
              )}
            </div>
            
            {formData.hasPriorClaims && (
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Claim Details</h4>
                
                {formData.claimsHistory && formData.claimsHistory.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {formData.claimsHistory.map((claim, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveClaim(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Remove claim</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Claim {index + 1}</h5>
                        
                        <div className="grid grid-cols-1 gap-y-3 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Loss</label>
                            <input
                              type="date"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                              value={claim.date}
                              onChange={(e) => handleClaimChange(index, 'date', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Claim Amount</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="text"
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="0.00"
                                value={claim.amount}
                                onChange={(e) => handleClaimChange(index, 'amount', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            rows={2}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={claim.description}
                            onChange={(e) => handleClaimChange(index, 'description', e.target.value)}
                          />
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={claim.status}
                            onChange={(e) => handleClaimChange(index, 'status', e.target.value)}
                          >
                            <option>Open</option>
                            <option>Closed</option>
                            <option>Pending</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleAddClaim}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Claim
                </button>
              </div>
            )}
          </div>
        );
      
      case 7: // Additional Information
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are you currently insured?
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="currently-insured-yes"
                    name="currentlyInsured"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.currentlyInsured === true}
                    onChange={() => setFormData(prev => ({ ...prev, currentlyInsured: true }))}
                  />
                  <label htmlFor="currently-insured-yes" className="ml-3 block text-sm font-medium text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="currently-insured-no"
                    name="currentlyInsured"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.currentlyInsured === false}
                    onChange={() => setFormData(prev => ({ ...prev, currentlyInsured: false }))}
                  />
                  <label htmlFor="currently-insured-no" className="ml-3 block text-sm font-medium text-gray-700">
                    No
                  </label>
                </div>
              </div>
              {errors.currentlyInsured && (
                <p className="mt-2 text-sm text-red-600">{errors.currentlyInsured}</p>
              )}
            </div>
            
            {formData.currentlyInsured && (
              <div className="space-y-4">
                {renderField('currentCarrier', 'Current Insurance Carrier')}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Annual Premium
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      name="currentPremium"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      value={formData.currentPremium || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Shopping
                  </label>
                  <select
                    name="reasonForShopping"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={formData.reasonForShopping || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a reason</option>
                    <option value="Price">Better Price</option>
                    <option value="Coverage">Better Coverage</option>
                    <option value="Service">Better Service</option>
                    <option value="Renewal">Policy Renewal</option>
                    <option value="Cancellation">Policy Cancellation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Additional Comments or Information
              </label>
              <textarea
                name="additionalComments"
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Please provide any additional information that might be helpful for your submission."
                value={formData.additionalComments || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-2">Document Upload</h4>
              <p className="text-sm text-gray-500 mb-4">
                You can upload supporting documents in the final review step.
              </p>
            </div>
          </div>
        );
      
      case 8: // Review & Submit
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Review & Submit</h3>
            <p className="text-sm text-gray-500">
              Please review your information before submitting. You can go back to any section to make changes.
            </p>
            
            <div className="bg-gray-50 shadow overflow-hidden sm:rounded-md">
              {/* Summary Section 1: Applicant Information */}
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h4 className="text-base font-medium text-gray-900">
                  {formData.applicantType === 'business' ? 'Business Information' : 'Personal Information'}
                </h4>
                <div className="mt-2 text-sm text-gray-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {formData.applicantType === 'business' ? (
                      <>
                        <div>
                          <span className="font-medium">Business Name:</span> {formData.businessName}
                        </div>
                        <div>
                          <span className="font-medium">Business Type:</span> {formData.businessType}
                        </div>
                        <div>
                          <span className="font-medium">Federal EIN:</span> {formData.federalEIN}
                        </div>
                        <div>
                          <span className="font-medium">Years in Business:</span> {formData.yearsInBusiness}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">First Name:</span> {formData.firstName}
                        </div>
                        <div>
                          <span className="font-medium">Last Name:</span> {formData.lastName}
                        </div>
                      </>
                    )}
                    <div>
                      <span className="font-medium">Email:</span> {formData.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {formData.phone}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Summary Section 2: Insurance Type */}
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h4 className="text-base font-medium text-gray-900">Insurance Information</h4>
                <div className="mt-2 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Insurance Type:</span> {formData.insuranceType}
                  </div>
                  {formData.effectiveDate && (
                    <div className="mt-2">
                      <span className="font-medium">Policy Period:</span> {formData.effectiveDate} to {formData.expirationDate}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Summary Section 3: Location Information */}
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h4 className="text-base font-medium text-gray-900">Location Information</h4>
                <div className="mt-2 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Primary Location:</span> 
                    {formData.physicalAddress && `${formData.physicalAddress.street}, ${formData.physicalAddress.city}, ${formData.physicalAddress.state} ${formData.physicalAddress.zipCode}`}
                  </div>
                  {formData.additionalLocations && formData.additionalLocations.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Additional Locations:</span> {formData.additionalLocations.length}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Summary Section 4: Risk Details */}
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h4 className="text-base font-medium text-gray-900">Risk Information</h4>
                <div className="mt-2 text-sm text-gray-500">
                  {formData.insuranceType === 'Workers Compensation' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      <div>
                        <span className="font-medium">Full-Time Employees:</span> {formData.riskDetails?.fullTimeEmployees}
                      </div>
                      <div>
                        <span className="font-medium">Part-Time Employees:</span> {formData.riskDetails?.partTimeEmployees}
                      </div>
                      <div>
                        <span className="font-medium">Annual Payroll:</span> ${formData.riskDetails?.annualPayroll}
                      </div>
                      <div>
                        <span className="font-medium">Safety Programs:</span> {formData.riskDetails?.safetyPrograms === 'yes' ? 'Yes' : 'No'}
                      </div>
                    </div>
                  )}
                  
                  {formData.insuranceType === 'General Liability' && (
                    <div>
                      <div>
                        <span className="font-medium">Operations Description:</span>
                      </div>
                      <div className="mt-1">{formData.riskDetails?.operationsDescription}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Summary Section 5: Claims History */}
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900">Claims History</h4>
                <div className="mt-2 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Prior Claims:</span> {formData.hasPriorClaims ? 'Yes' : 'No'}
                  </div>
                  {formData.hasPriorClaims && formData.claimsHistory && formData.claimsHistory.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Number of Claims:</span> {formData.claimsHistory.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">Upload Supporting Documents</h4>
              <p className="text-sm text-gray-500 mb-4">
                You can upload supporting documents to expedite the quoting process.
              </p>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileUpload} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h5>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {files.map((file, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            className="font-medium text-red-600 hover:text-red-500"
                            onClick={() => handleRemoveFile(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <div className="relative flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={formData.termsAccepted || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">I agree to the terms and conditions</label>
                  <p className="text-gray-500">
                    I understand that the information provided will be used to generate an insurance quote. I certify that the information is accurate to the best of my knowledge.
                  </p>
                </div>
              </div>
              {errors.termsAccepted && (
                <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Initial form state
  const initialFormState: Partial<PolicySubmissionFormEnhanced> = {
    applicantType: 'business',
    insuranceType: '',
    additionalLocations: [],
    claimsHistory: [],
    hasPriorClaims: false,
    currentlyInsured: false,
    mailingAddressSameAsPhysical: true,
    coverageLimits: {},
    deductibles: {},
    riskDetails: {}
  };

  // Keep the main render function clean
  return (
    <div className="bg-gray-50 min-h-screen">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing your submission</h3>
            <p className="text-gray-500">Please wait while we process your information...</p>
          </div>
        </div>
      )}
      
      {showSuccess ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Submission Successful!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your submission has been received. You'll receive a confirmation email shortly.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  // Reset form data
                  setFormData({
                    applicantType: 'business',
                    insuranceType: '',
                    additionalLocations: [],
                    claimsHistory: []
                  });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start a New Submission
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Business Insurance Application</h1>
            <p className="mb-8 text-gray-600">Please complete all required fields to receive an accurate quote.</p>
            
            {renderStepper()}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}>
                <div className="px-4 py-5 sm:p-6">
                  {renderStepContent()}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200 flex justify-between">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Previous
                    </button>
                  )}
                  <div>
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Submit Application
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 