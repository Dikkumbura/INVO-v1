import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import InsuranceTypeSelect from './InsuranceTypeSelect';
import QuoteSummary from './QuoteSummary';
import clsx from 'clsx';
import { insuranceSubmissionService } from '../services/insuranceSubmission';
import PageHeader from './PageHeader';

const industryTypes = ["Construction", "Healthcare", "Retail", "Manufacturing", "Other"] as const;
const tempStaffingIndustries = ["Healthcare", "Manufacturing", "Retail", "Office Work", "Construction"] as const;
const yesNoOptions = ["Yes", "No"] as const;
const cargoTypes = ["General Freight", "Hazardous Materials", "Refrigerated Goods", "Livestock"] as const;

const workersCompSchema = z.object({
  // Business Information
  businessName: z.string().min(1, "Business name is required"),
  industryType: z.enum(industryTypes, { required_error: "Industry type is required" }),
  businessLocation: z.string().min(1, "Business location is required"),
  yearsInBusiness: z.number().min(0, "Years in business must be 0 or greater"),
  
  // Payroll & Employees
  annualPayroll: z.number().min(0, "Annual payroll must be 0 or greater"),
  numberOfEmployees: z.number().min(1, "Must have at least one employee"),
  safetyTraining: z.enum(yesNoOptions, { required_error: "Please specify if you offer safety training" }),
  useHeavyMachinery: z.enum(yesNoOptions, { required_error: "Please specify if employees use heavy machinery" }),
  
  // Coverage Details
  desiredCoverageAmount: z.number().min(0, "Coverage amount must be 0 or greater"),
  hasPastClaims: z.enum(yesNoOptions, { required_error: "Please specify if you have past claims" }),
  pastClaimsCount: z.number().optional(),
  
  // Contact Information
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const tempStaffingSchema = z.object({
  // Agency Information
  staffingAgencyName: z.string().min(1, "Agency name is required"),
  primaryIndustry: z.enum(tempStaffingIndustries, { required_error: "Primary industry is required" }),
  businessLocation: z.string().min(1, "Business location is required"),
  yearsInBusiness: z.number().min(0, "Years in business must be 0 or greater"),
  
  // Workforce & Payroll
  totalTempEmployees: z.number().min(1, "Must have at least one temporary employee"),
  annualTempPayroll: z.number().min(0, "Annual payroll must be 0 or greater"),
  averageContractLength: z.number().min(0, "Contract length must be 0 or greater"),
  providesHealthBenefits: z.enum(yesNoOptions, { required_error: "Please specify if you provide health benefits" }),
  usesHeavyMachinery: z.enum(yesNoOptions, { required_error: "Please specify if staff uses heavy machinery" }),
  
  // Coverage Details
  desiredCoverageAmount: z.number().min(0, "Coverage amount must be 0 or greater"),
  hasPastClaims: z.enum(yesNoOptions, { required_error: "Please specify if you have past claims" }),
  pastClaimsCount: z.number().optional(),
  
  // Contact Information
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const truckingSchema = z.object({
  // Company Information
  truckingCompanyName: z.string().min(1, "Company name is required"),
  businessLocation: z.string().min(1, "Business location is required"),
  yearsInOperation: z.number().min(0, "Years in operation must be 0 or greater"),
  usdotNumber: z.string().optional(),
  
  // Fleet & Drivers
  numberOfTrucks: z.number().min(1, "Must have at least one truck"),
  numberOfDrivers: z.number().min(1, "Must have at least one driver"),
  operatesInterstate: z.enum(yesNoOptions, { required_error: "Please specify if you operate interstate" }),
  annualMilesPerTruck: z.number().min(0, "Annual miles must be 0 or greater"),
  primaryCargoType: z.enum(cargoTypes, { required_error: "Primary cargo type is required" }),
  
  // Safety & Compliance
  hasFleetSafetyProgram: z.enum(yesNoOptions, { required_error: "Please specify if you have a fleet safety program" }),
  hasDrugTesting: z.enum(yesNoOptions, { required_error: "Please specify if you have drug testing" }),
  hasAccidents: z.enum(yesNoOptions, { required_error: "Please specify if you have had accidents" }),
  accidentCount: z.number().optional(),
  
  // Coverage Details
  desiredCoverageAmount: z.number().min(0, "Coverage amount must be 0 or greater"),
  currentInsurer: z.string().optional(),
  
  // Contact Information
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type WorkersCompFormData = z.infer<typeof workersCompSchema>;
type TempStaffingFormData = z.infer<typeof tempStaffingSchema>;
type TruckingFormData = z.infer<typeof truckingSchema>;

type FormData = WorkersCompFormData | TempStaffingFormData | TruckingFormData;

export default function QuoteForm() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInsuranceTypeSelect = (type: string) => {
    setSelectedType(type);
    setFormData({});
    setErrors({});
    setShowError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setIsGenerating(true);

    try {
      let validatedData;
      if (!selectedType) {
        throw new Error('Please select an insurance type');
      }

      const numericFields = [
        'yearsInBusiness',
        'yearsInOperation',
        'annualPayroll',
        'annualTempPayroll',
        'numberOfEmployees',
        'totalTempEmployees',
        'averageContractLength',
        'numberOfTrucks',
        'numberOfDrivers',
        'annualMilesPerTruck',
        'desiredCoverageAmount',
        'pastClaimsCount',
        'accidentCount'
      ];

      const processedFormData = { ...formData };
      numericFields.forEach(field => {
        if (field in formData) {
          processedFormData[field] = Number(formData[field]);
        }
      });

      if (selectedType === "Workers' Comp") {
        validatedData = workersCompSchema.parse(processedFormData);
      } else if (selectedType === "Temp Staffing") {
        validatedData = tempStaffingSchema.parse(processedFormData);
      } else if (selectedType === "Trucking") {
        validatedData = truckingSchema.parse(processedFormData);
      } else {
        throw new Error('Invalid insurance type selected');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const submission = await insuranceSubmissionService.processSubmission(
        selectedType,
        validatedData
      );

      setSubmissionData(submission);
      setShowSummary(true);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        setShowError(true);
      } else {
        setErrors({
          submit: error instanceof Error ? error.message : 'Failed to process submission'
        });
        setShowError(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = () => {
    setShowSummary(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const renderField = (
    name: string,
    label: string,
    type: string = "text",
    options?: readonly string[],
    min?: number
  ) => {
    const value = formData[name] || '';
    const error = errors[name];
    const fieldId = `field-${name}`;

    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange: handleInputChange,
      className: clsx(
        "mt-1 block w-full rounded-md shadow-sm focus:ring-accent focus:border-accent sm:text-sm",
        error ? "border-red-300" : "border-gray-300"
      )
    };

    return (
      <div>
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        
        {type === "select" && options ? (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            min={min}
            {...commonProps}
          />
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  const renderSubmitButton = () => (
    <button
      type="submit"
      disabled={isGenerating}
      className={`
        flex-1 relative bg-accent text-white py-3 px-4 rounded-md
        hover:bg-accent/90 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-accent transition-all duration-300
        ${isGenerating ? 'cursor-not-allowed' : ''}
      `}
      aria-busy={isGenerating}
    >
      <span className={`flex items-center justify-center transition-opacity duration-300 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
        Generate a Quote
      </span>
      {isGenerating && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="animate-spin h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Get an Instant Quote"
          subtitle="Fill out the form below to receive your customized insurance quote"
        />
        
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
            <p className="mt-4 text-lg text-gray-600">Generating your quote...</p>
          </div>
        ) : (
          <>
            {!showSummary && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Choose Insurance Type</h2>
                  <InsuranceTypeSelect onSelect={handleInsuranceTypeSelect} isLoading={false} />
                </div>

                {selectedType === "Workers' Comp" && (
                  <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 border-b">
                      <h1 className="text-2xl font-semibold text-gray-900">Workers' Compensation Quote Request</h1>
                      <p className="mt-2 text-sm text-gray-600">
                        Please provide the following information to get your workers' compensation insurance quote.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
                      {showError && Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 md:col-span-2">
                          Please fill in all required fields correctly.
                        </div>
                      )}

                      {/* Business Information */}
                      <div className="md:col-span-1">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("businessName", "Business Name")}
                          {renderField("industryType", "Industry Type", "select", industryTypes)}
                          {renderField("businessLocation", "Business Location")}
                          {renderField("yearsInBusiness", "Years in Business", "number", undefined, 0)}
                        </div>
                      </div>

                      {/* Payroll & Employees */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Payroll & Employees</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("annualPayroll", "Annual Payroll ($)", "number", undefined, 0)}
                          {renderField("numberOfEmployees", "Number of Employees", "number", undefined, 1)}
                          {renderField("safetyTraining", "Do you offer workplace safety training?", "select", yesNoOptions)}
                          {renderField("useHeavyMachinery", "Do employees use heavy machinery?", "select", yesNoOptions)}
                        </div>
                      </div>

                      {/* Coverage Details */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Coverage Details</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("desiredCoverageAmount", "Desired Coverage Amount ($)", "number", undefined, 0)}
                          {renderField("hasPastClaims", "Have you had any claims in the past 5 years?", "select", yesNoOptions)}
                          {formData.hasPastClaims === "Yes" && renderField("pastClaimsCount", "Number of Past Claims", "number", undefined, 0)}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("contactName", "Contact Name")}
                          {renderField("contactEmail", "Email")}
                          {renderField("contactPhone", "Phone Number")}
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-12 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          {renderSubmitButton()}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {selectedType === "Temp Staffing" && (
                  <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 border-b">
                      <h1 className="text-2xl font-semibold text-gray-900">Temp Staffing Insurance Quote Request</h1>
                      <p className="mt-2 text-sm text-gray-600">
                        Please provide the following information to get your temporary staffing insurance quote.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
                      {showError && Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 md:col-span-2">
                          Please fill in all required fields correctly.
                        </div>
                      )}

                      {/* Agency Information */}
                      <div className="md:col-span-1">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Agency Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("staffingAgencyName", "Staffing Agency Name")}
                          {renderField("primaryIndustry", "Primary Industry Served", "select", tempStaffingIndustries)}
                          {renderField("businessLocation", "Business Location")}
                          {renderField("yearsInBusiness", "Years in Business", "number", undefined, 0)}
                        </div>
                      </div>

                      {/* Workforce & Payroll */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Workforce & Payroll</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("totalTempEmployees", "Total Temporary Employees", "number", undefined, 1)}
                          {renderField("annualTempPayroll", "Annual Temp Payroll ($)", "number", undefined, 0)}
                          {renderField("averageContractLength", "Average Contract Length (days)", "number", undefined, 1)}
                          {renderField("providesHealthBenefits", "Do you provide health benefits?", "select", yesNoOptions)}
                          {renderField("usesHeavyMachinery", "Do employees use heavy machinery?", "select", yesNoOptions)}
                        </div>
                      </div>

                      {/* Coverage Requirements */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Coverage Requirements</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("requiredCoverageAmount", "Required Coverage Amount ($)", "number", undefined, 0)}
                          {renderField("needsEmploymentPractices", "Need Employment Practices Liability?", "select", yesNoOptions)}
                          {renderField("internationalPlacements", "Do you place workers internationally?", "select", yesNoOptions)}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("contactName", "Contact Name")}
                          {renderField("contactEmail", "Email")}
                          {renderField("contactPhone", "Phone Number")}
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-12 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          {renderSubmitButton()}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {selectedType === "Trucking" && (
                  <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 border-b">
                      <h1 className="text-2xl font-semibold text-gray-900">Trucking Insurance Quote Request</h1>
                      <p className="mt-2 text-sm text-gray-600">
                        Please provide the following information to get your trucking insurance quote.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
                      {showError && Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 md:col-span-2">
                          Please fill in all required fields correctly.
                        </div>
                      )}

                      {/* Company Information */}
                      <div className="md:col-span-1">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("companyName", "Company Name")}
                          {renderField("businessLocation", "Business Location")}
                          {renderField("yearsInBusiness", "Years in Business", "number", undefined, 0)}
                          {renderField("mcNumber", "MC/DOT Number")}
                        </div>
                      </div>

                      {/* Fleet Information */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Fleet Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("numberOfTrucks", "Number of Trucks", "number", undefined, 1)}
                          {renderField("numberOfDrivers", "Number of Drivers", "number", undefined, 1)}
                          {renderField("primaryCargoType", "Primary Cargo Type", "select", cargoTypes)}
                          {renderField("operatingRadius", "Operating Radius (miles)", "number", undefined, 0)}
                        </div>
                      </div>

                      {/* Coverage Details */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Coverage Details</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("liabilityCoverage", "Liability Coverage ($)", "number", undefined, 0)}
                          {renderField("cargoCoverage", "Cargo Coverage ($)", "number", undefined, 0)}
                          {renderField("hasAccidentsLast3Years", "Any accidents in the last 3 years?", "select", yesNoOptions)}
                          {formData.hasAccidentsLast3Years === "Yes" && renderField("numberOfAccidents", "Number of Accidents", "number", undefined, 0)}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="md:col-span-1 mt-10 md:mt-0">
                        <div className="mb-6 pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                        </div>
                        <div className="space-y-5">
                          {renderField("contactName", "Contact Name")}
                          {renderField("contactEmail", "Email")}
                          {renderField("contactPhone", "Phone Number")}
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-12 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          {renderSubmitButton()}
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {showSummary && submissionData && (
              <QuoteSummary
                formData={formData}
                insuranceType={selectedType!}
                onEdit={handleEdit}
                submission={submissionData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}