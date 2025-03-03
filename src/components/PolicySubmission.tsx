import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { policySubmissionSchema, type PolicySubmissionForm, coverageTypes } from '../types/insurance';
import { policySubmissionService } from '../services/policySubmission';
import LoadingOverlay from './LoadingOverlay';
import { ZodError } from 'zod';
import PageHeader from './PageHeader';

export default function PolicySubmission() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<Partial<PolicySubmissionForm>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateSection = (section: number) => {
    const sectionFields: Record<number, (keyof PolicySubmissionForm)[]> = {
      1: ['insuredName', 'businessName', 'contactEmail', 'phoneNumber'],
      2: ['coverageType', 'effectiveDate', 'expirationDate'],
      3: ['additionalNotes']
    };

    const fieldsToValidate = sectionFields[section];
    const sectionData = Object.fromEntries(
      Object.entries(formData).filter(([key]) => fieldsToValidate.includes(key as keyof PolicySubmissionForm))
    );

    try {
      // Create a partial schema for the current section
      const sectionSchema = policySubmissionSchema.pick(
        fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );
      
      sectionSchema.parse(sectionData);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
      return false;
    }
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = policySubmissionSchema.parse(formData);
      await policySubmissionService.submitPolicy(validatedData);
      setShowSuccess(true);
      setFormData({});
      setErrors({});
      
      // Reset after showing success message
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentSection(1);
      }, 3000);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof PolicySubmissionForm,
    label: string,
    type: string = 'text',
    options?: readonly string[]
  ) => {
    const value = formData[name] || '';
    const error = errors[name];
    const fieldId = `field-${name}`;

    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange: handleInputChange,
      className: `mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm ${
        error ? 'border-red-300' : 'border-gray-300'
      }`
    };

    return (
      <div className="mb-4">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label}
          {type !== 'textarea' && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === 'select' && options ? (
          <select {...commonProps}>
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            {...commonProps}
            rows={4}
            maxLength={1000}
            placeholder="Enter any additional notes or special requirements..."
          />
        ) : (
          <input type={type} {...commonProps} />
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderSection = (section: number) => {
    switch (section) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insured Details</h3>
            {renderField('insuredName', 'Insured Name')}
            {renderField('businessName', 'Business Name')}
            {renderField('contactEmail', 'Contact Email', 'email')}
            {renderField('phoneNumber', 'Phone Number', 'tel')}
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Information</h3>
            {renderField('coverageType', 'Coverage Type', 'select', coverageTypes)}
            {renderField('effectiveDate', 'Policy Effective Date', 'date')}
            {renderField('expirationDate', 'Policy Expiration Date', 'date')}
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            {renderField('additionalNotes', 'Additional Notes', 'textarea')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <LoadingOverlay isVisible={isSubmitting} message="Processing your policy submission..." />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Policy Submission"
        />

        {showSuccess ? (
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-green-900">Submission Successful!</h3>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Your policy submission has been received and is being processed.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  {[1, 2, 3].map(step => (
                    <div
                      key={step}
                      className={`flex items-center ${
                        step < currentSection
                          ? 'text-accent'
                          : step === currentSection
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                          step <= currentSection
                            ? 'border-accent bg-accent text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {step}
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {step === 1
                          ? 'Insured Details'
                          : step === 2
                          ? 'Coverage'
                          : 'Additional Info'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {renderSection(currentSection)}

              <div className="mt-8 flex justify-between">
                {currentSection > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousSection}
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Previous
                  </button>
                )}
                {currentSection < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="ml-auto bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Policy
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}