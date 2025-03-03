import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { insuranceSubmissionService, Submission } from '../services/insuranceSubmission';
import PageHeader from './PageHeader';
import { useAuth } from '../context/AuthContext';

interface QuoteModificationProps {
  quoteId: string;
  onCancel: () => void;
  onSuccess: (updatedQuote: Submission) => void;
}

export default function QuoteModification({ quoteId, onCancel, onSuccess }: QuoteModificationProps) {
  const { currentUser } = useAuth();
  const [quote, setQuote] = useState<Submission | null>(null);
  const [modifiedPolicyDetails, setModifiedPolicyDetails] = useState<Record<string, any>>({});
  const [modificationNotes, setModificationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  const loadQuote = async () => {
    setIsLoading(true);
    try {
      const quoteData = insuranceSubmissionService.getSubmission(quoteId);
      if (quoteData) {
        setQuote(quoteData);
        setModifiedPolicyDetails({ ...quoteData.policyDetails });
      } else {
        setError('Quote not found');
      }
    } catch (err) {
      setError('Error loading quote details');
      console.error('Error loading quote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setModifiedPolicyDetails(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setModifiedPolicyDetails(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setModifiedPolicyDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (quote?.insuranceType === "Workers' Comp") {
      if (!modifiedPolicyDetails.businessName?.trim()) {
        errors.businessName = 'Business name is required';
      }
      if (!modifiedPolicyDetails.industryType?.trim()) {
        errors.industryType = 'Industry type is required';
      }
      if (!modifiedPolicyDetails.businessLocation?.trim()) {
        errors.businessLocation = 'Business location is required';
      }
      if (!modifiedPolicyDetails.annualPayroll || modifiedPolicyDetails.annualPayroll <= 0) {
        errors.annualPayroll = 'Valid annual payroll is required';
      }
      if (!modifiedPolicyDetails.numberOfEmployees || modifiedPolicyDetails.numberOfEmployees <= 0) {
        errors.numberOfEmployees = 'Valid number of employees is required';
      }
    } else if (quote?.insuranceType === 'Temp Staffing') {
      if (!modifiedPolicyDetails.staffingAgencyName?.trim()) {
        errors.staffingAgencyName = 'Agency name is required';
      }
      if (!modifiedPolicyDetails.primaryIndustry?.trim()) {
        errors.primaryIndustry = 'Primary industry is required';
      }
      if (!modifiedPolicyDetails.businessLocation?.trim()) {
        errors.businessLocation = 'Business location is required';
      }
      if (!modifiedPolicyDetails.totalTempEmployees || modifiedPolicyDetails.totalTempEmployees <= 0) {
        errors.totalTempEmployees = 'Valid number of temp employees is required';
      }
      if (!modifiedPolicyDetails.annualTempPayroll || modifiedPolicyDetails.annualTempPayroll <= 0) {
        errors.annualTempPayroll = 'Valid annual temp payroll is required';
      }
    } else if (quote?.insuranceType === 'Trucking') {
      if (!modifiedPolicyDetails.truckingCompanyName?.trim() && !modifiedPolicyDetails.companyName?.trim()) {
        errors.truckingCompanyName = 'Company name is required';
      }
      if (!modifiedPolicyDetails.businessLocation?.trim()) {
        errors.businessLocation = 'Business location is required';
      }
      if (!modifiedPolicyDetails.numberOfTrucks || modifiedPolicyDetails.numberOfTrucks <= 0) {
        errors.numberOfTrucks = 'Valid number of trucks is required';
      }
      if (!modifiedPolicyDetails.numberOfDrivers || modifiedPolicyDetails.numberOfDrivers <= 0) {
        errors.numberOfDrivers = 'Valid number of drivers is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedQuote = await insuranceSubmissionService.modifyQuote(
        quoteId,
        modifiedPolicyDetails,
        modificationNotes,
        currentUser
      );
      
      if (updatedQuote) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          onSuccess(updatedQuote);
        }, 1500);
      } else {
        setError('Failed to update quote');
      }
    } catch (err) {
      console.error('Error modifying quote:', err);
      setError('Error modifying quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWorkersCompForm = () => {
    return (
      <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={modifiedPolicyDetails.businessName || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.businessName ? 'border-red-500' : ''
              }`}
            />
            {formErrors.businessName && (
              <p className="mt-1 text-sm text-red-500">{formErrors.businessName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="industryType" className="block text-sm font-medium text-gray-700">
              Industry Type
            </label>
            <select
              id="industryType"
              name="industryType"
              value={modifiedPolicyDetails.industryType || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.industryType ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Industry</option>
              <option value="Construction">Construction</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Office/Clerical">Office/Clerical</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.industryType && (
              <p className="mt-1 text-sm text-red-500">{formErrors.industryType}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700">
              Business Location
            </label>
            <input
              type="text"
              id="businessLocation"
              name="businessLocation"
              value={modifiedPolicyDetails.businessLocation || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.businessLocation ? 'border-red-500' : ''
              }`}
            />
            {formErrors.businessLocation && (
              <p className="mt-1 text-sm text-red-500">{formErrors.businessLocation}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700">
              Years in Business
            </label>
            <input
              type="number"
              id="yearsInBusiness"
              name="yearsInBusiness"
              min="1"
              value={modifiedPolicyDetails.yearsInBusiness || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="annualPayroll" className="block text-sm font-medium text-gray-700">
              Annual Payroll ($)
            </label>
            <input
              type="number"
              id="annualPayroll"
              name="annualPayroll"
              min="0"
              value={modifiedPolicyDetails.annualPayroll || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.annualPayroll ? 'border-red-500' : ''
              }`}
            />
            {formErrors.annualPayroll && (
              <p className="mt-1 text-sm text-red-500">{formErrors.annualPayroll}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700">
              Number of Employees
            </label>
            <input
              type="number"
              id="numberOfEmployees"
              name="numberOfEmployees"
              min="1"
              value={modifiedPolicyDetails.numberOfEmployees || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.numberOfEmployees ? 'border-red-500' : ''
              }`}
            />
            {formErrors.numberOfEmployees && (
              <p className="mt-1 text-sm text-red-500">{formErrors.numberOfEmployees}</p>
            )}
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="safetyTraining"
                  name="safetyTraining"
                  type="checkbox"
                  checked={modifiedPolicyDetails.safetyTraining || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="safetyTraining" className="font-medium text-gray-700">
                  Safety Training Program
                </label>
                <p className="text-gray-500">Do you have a formal safety training program?</p>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="useHeavyMachinery"
                  name="useHeavyMachinery"
                  type="checkbox"
                  checked={modifiedPolicyDetails.useHeavyMachinery || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="useHeavyMachinery" className="font-medium text-gray-700">
                  Heavy Machinery Use
                </label>
                <p className="text-gray-500">Do your employees use heavy machinery?</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTempStaffingForm = () => {
    return (
      <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="staffingAgencyName" className="block text-sm font-medium text-gray-700">
              Staffing Agency Name
            </label>
            <input
              type="text"
              id="staffingAgencyName"
              name="staffingAgencyName"
              value={modifiedPolicyDetails.staffingAgencyName || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.staffingAgencyName ? 'border-red-500' : ''
              }`}
            />
            {formErrors.staffingAgencyName && (
              <p className="mt-1 text-sm text-red-500">{formErrors.staffingAgencyName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="primaryIndustry" className="block text-sm font-medium text-gray-700">
              Primary Industry
            </label>
            <select
              id="primaryIndustry"
              name="primaryIndustry"
              value={modifiedPolicyDetails.primaryIndustry || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.primaryIndustry ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select Industry</option>
              <option value="Construction">Construction</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Office/Clerical">Office/Clerical</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.primaryIndustry && (
              <p className="mt-1 text-sm text-red-500">{formErrors.primaryIndustry}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700">
              Business Location
            </label>
            <input
              type="text"
              id="businessLocation"
              name="businessLocation"
              value={modifiedPolicyDetails.businessLocation || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.businessLocation ? 'border-red-500' : ''
              }`}
            />
            {formErrors.businessLocation && (
              <p className="mt-1 text-sm text-red-500">{formErrors.businessLocation}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700">
              Years in Business
            </label>
            <input
              type="number"
              id="yearsInBusiness"
              name="yearsInBusiness"
              min="1"
              value={modifiedPolicyDetails.yearsInBusiness || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="totalTempEmployees" className="block text-sm font-medium text-gray-700">
              Total Temporary Employees
            </label>
            <input
              type="number"
              id="totalTempEmployees"
              name="totalTempEmployees"
              min="1"
              value={modifiedPolicyDetails.totalTempEmployees || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.totalTempEmployees ? 'border-red-500' : ''
              }`}
            />
            {formErrors.totalTempEmployees && (
              <p className="mt-1 text-sm text-red-500">{formErrors.totalTempEmployees}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="annualTempPayroll" className="block text-sm font-medium text-gray-700">
              Annual Temporary Payroll ($)
            </label>
            <input
              type="number"
              id="annualTempPayroll"
              name="annualTempPayroll"
              min="0"
              value={modifiedPolicyDetails.annualTempPayroll || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.annualTempPayroll ? 'border-red-500' : ''
              }`}
            />
            {formErrors.annualTempPayroll && (
              <p className="mt-1 text-sm text-red-500">{formErrors.annualTempPayroll}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="averageContractLength" className="block text-sm font-medium text-gray-700">
              Average Contract Length (months)
            </label>
            <input
              type="number"
              id="averageContractLength"
              name="averageContractLength"
              min="1"
              value={modifiedPolicyDetails.averageContractLength || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="providesHealthBenefits"
                  name="providesHealthBenefits"
                  type="checkbox"
                  checked={modifiedPolicyDetails.providesHealthBenefits || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="providesHealthBenefits" className="font-medium text-gray-700">
                  Health Benefits
                </label>
                <p className="text-gray-500">Do you provide health benefits to temporary employees?</p>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="usesHeavyMachinery"
                  name="usesHeavyMachinery"
                  type="checkbox"
                  checked={modifiedPolicyDetails.usesHeavyMachinery || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="usesHeavyMachinery" className="font-medium text-gray-700">
                  Heavy Machinery Use
                </label>
                <p className="text-gray-500">Do your temporary employees use heavy machinery?</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTruckingForm = () => {
    return (
      <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="truckingCompanyName" className="block text-sm font-medium text-gray-700">
              Trucking Company Name
            </label>
            <input
              type="text"
              id="truckingCompanyName"
              name="truckingCompanyName"
              value={modifiedPolicyDetails.truckingCompanyName || modifiedPolicyDetails.companyName || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.truckingCompanyName ? 'border-red-500' : ''
              }`}
            />
            {formErrors.truckingCompanyName && (
              <p className="mt-1 text-sm text-red-500">{formErrors.truckingCompanyName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700">
              Business Location
            </label>
            <input
              type="text"
              id="businessLocation"
              name="businessLocation"
              value={modifiedPolicyDetails.businessLocation || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.businessLocation ? 'border-red-500' : ''
              }`}
            />
            {formErrors.businessLocation && (
              <p className="mt-1 text-sm text-red-500">{formErrors.businessLocation}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="yearsInOperation" className="block text-sm font-medium text-gray-700">
              Years in Operation
            </label>
            <input
              type="number"
              id="yearsInOperation"
              name="yearsInOperation"
              min="1"
              value={modifiedPolicyDetails.yearsInOperation || modifiedPolicyDetails.yearsInBusiness || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="usdotNumber" className="block text-sm font-medium text-gray-700">
              USDOT Number
            </label>
            <input
              type="text"
              id="usdotNumber"
              name="usdotNumber"
              value={modifiedPolicyDetails.usdotNumber || modifiedPolicyDetails.mcNumber || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="numberOfTrucks" className="block text-sm font-medium text-gray-700">
              Number of Trucks
            </label>
            <input
              type="number"
              id="numberOfTrucks"
              name="numberOfTrucks"
              min="1"
              value={modifiedPolicyDetails.numberOfTrucks || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.numberOfTrucks ? 'border-red-500' : ''
              }`}
            />
            {formErrors.numberOfTrucks && (
              <p className="mt-1 text-sm text-red-500">{formErrors.numberOfTrucks}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="numberOfDrivers" className="block text-sm font-medium text-gray-700">
              Number of Drivers
            </label>
            <input
              type="number"
              id="numberOfDrivers"
              name="numberOfDrivers"
              min="1"
              value={modifiedPolicyDetails.numberOfDrivers || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm ${
                formErrors.numberOfDrivers ? 'border-red-500' : ''
              }`}
            />
            {formErrors.numberOfDrivers && (
              <p className="mt-1 text-sm text-red-500">{formErrors.numberOfDrivers}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="annualMilesPerTruck" className="block text-sm font-medium text-gray-700">
              Annual Miles per Truck
            </label>
            <input
              type="number"
              id="annualMilesPerTruck"
              name="annualMilesPerTruck"
              min="1"
              value={modifiedPolicyDetails.annualMilesPerTruck || modifiedPolicyDetails.operatingRadius || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="primaryCargoType" className="block text-sm font-medium text-gray-700">
              Primary Cargo Type
            </label>
            <select
              id="primaryCargoType"
              name="primaryCargoType"
              value={modifiedPolicyDetails.primaryCargoType || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            >
              <option value="">Select Cargo Type</option>
              <option value="General Freight">General Freight</option>
              <option value="Household Goods">Household Goods</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Food/Beverages">Food/Beverages</option>
              <option value="Hazardous Materials">Hazardous Materials</option>
              <option value="Livestock">Livestock</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="operatesInterstate"
                  name="operatesInterstate"
                  type="checkbox"
                  checked={modifiedPolicyDetails.operatesInterstate || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="operatesInterstate" className="font-medium text-gray-700">
                  Interstate Operations
                </label>
                <p className="text-gray-500">Do you operate across state lines?</p>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="hasFleetSafetyProgram"
                  name="hasFleetSafetyProgram"
                  type="checkbox"
                  checked={modifiedPolicyDetails.hasFleetSafetyProgram || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hasFleetSafetyProgram" className="font-medium text-gray-700">
                  Fleet Safety Program
                </label>
                <p className="text-gray-500">Do you have a formal fleet safety program?</p>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="hasDrugTesting"
                  name="hasDrugTesting"
                  type="checkbox"
                  checked={modifiedPolicyDetails.hasDrugTesting || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hasDrugTesting" className="font-medium text-gray-700">
                  Drug Testing Program
                </label>
                <p className="text-gray-500">Do you have a drug testing program for drivers?</p>
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="hasAccidents"
                  name="hasAccidents"
                  type="checkbox"
                  checked={modifiedPolicyDetails.hasAccidents || modifiedPolicyDetails.hasAccidentsLast3Years || false}
                  onChange={handleInputChange}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hasAccidents" className="font-medium text-gray-700">
                  Accident History
                </label>
                <p className="text-gray-500">Any accidents in the last 3 years?</p>
              </div>
            </div>
          </div>
          
          {(modifiedPolicyDetails.hasAccidents || modifiedPolicyDetails.hasAccidentsLast3Years) && (
            <div>
              <label htmlFor="accidentCount" className="block text-sm font-medium text-gray-700">
                Number of Accidents
              </label>
              <input
                type="number"
                id="accidentCount"
                name="accidentCount"
                min="1"
                value={modifiedPolicyDetails.accidentCount || modifiedPolicyDetails.numberOfAccidents || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
              />
            </div>
          )}
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Loading quote details...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <p className="text-red-500">{error || 'Quote not found'}</p>
        <button
          onClick={onCancel}
          className="mt-4 inline-flex items-center text-accent hover:text-accent-dark"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <PageHeader 
        title="Modify Your Quote"
        subtitle={`${quote.insuranceType} Insurance Quote - Make changes to update your premium`}
        showBackButton
        onBackClick={onCancel}
      />
      
      <div className="p-6 sm:p-8">
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Quote successfully modified! Redirecting to view updated details...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {quote.insuranceType === "Workers' Comp" && renderWorkersCompForm()}
          {quote.insuranceType === 'Temp Staffing' && renderTempStaffingForm()}
          {quote.insuranceType === 'Trucking' && renderTruckingForm()}
          
          <div className="mt-8">
            <label htmlFor="modificationNotes" className="block text-sm font-medium text-gray-700">
              Modification Notes (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="modificationNotes"
                name="modificationNotes"
                rows={3}
                value={modificationNotes}
                onChange={e => setModificationNotes(e.target.value)}
                placeholder="Please explain why you're modifying this quote..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              These notes will be saved along with your quote modification history.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-center ${
                isSubmitting ? 'cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Update Quote</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : (
                'Update Quote'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 