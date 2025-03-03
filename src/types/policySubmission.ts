import { z } from 'zod';

// Insurance Types
export const insuranceTypes = [
  'Workers Compensation',
  'General Liability',
  'Professional Liability',
  'Commercial Property',
  'Cyber Liability',
  'Business Owners Policy',
  'Commercial Auto',
  'Umbrella Insurance',
  'Directors & Officers',
  'Employment Practices Liability'
] as const;

// Business Types
export const businessTypes = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Company (LLC)',
  'S Corporation',
  'C Corporation',
  'Non-profit',
  'Other'
] as const;

// Industry Sectors
export const industrySectors = [
  'Construction',
  'Retail',
  'Healthcare',
  'Manufacturing',
  'Professional Services',
  'Technology',
  'Hospitality',
  'Transportation',
  'Education',
  'Real Estate',
  'Finance',
  'Other'
] as const;

// Years in Business Options
export const yearsInBusinessOptions = [
  'Less than 1 year',
  '1-3 years',
  '4-10 years',
  '11-20 years',
  'More than 20 years'
] as const;

// Annual Revenue Options
export const annualRevenueOptions = [
  'Less than $100,000',
  '$100,000 - $500,000',
  '$500,001 - $1,000,000',
  '$1,000,001 - $5,000,000',
  '$5,000,001 - $10,000,000',
  'More than $10,000,000'
] as const;

// Number of Employees Options
export const numberOfEmployeesOptions = [
  '1-5',
  '6-20',
  '21-50',
  '51-100',
  '101-500',
  'More than 500'
] as const;

// Enhanced validation schema with multi-step approach
export const policySubmissionSchemaEnhanced = z.object({
  // Step 1: Pre-qualification
  applicantType: z.enum(['business', 'individual'], {
    required_error: 'Please select applicant type'
  }),
  insuranceType: z.enum(insuranceTypes, {
    required_error: 'Please select insurance type'
  }),
  
  // Step 2: Business/Individual Information
  businessName: z.string().min(1, 'Business name is required').optional(),
  dba: z.string().optional(),
  businessType: z.enum(businessTypes).optional(),
  industrySector: z.enum(industrySectors, {
    required_error: 'Industry sector is required'
  }),
  yearsInBusiness: z.enum(yearsInBusinessOptions, {
    required_error: 'Years in business is required'
  }),
  annualRevenue: z.enum(annualRevenueOptions, {
    required_error: 'Annual revenue is required'
  }),
  numberOfEmployees: z.enum(numberOfEmployeesOptions, {
    required_error: 'Number of employees is required'
  }),
  
  // Individual information
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  
  // Common contact information
  contactEmail: z.string().email('Invalid email format'),
  contactPhone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  
  // Step 3: Location Information
  physicalAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    unit: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required'),
  }),
  mailingAddress: z.object({
    sameAsPhysical: z.boolean().optional(),
    street: z.string().optional(),
    unit: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  additionalLocations: z.array(z.object({
    street: z.string(),
    unit: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  })).optional(),
  
  // Step 4: Coverage Information
  effectiveDate: z.string().refine(date => new Date(date) >= new Date(), {
    message: 'Effective date must be today or later'
  }),
  expirationDate: z.string().refine(
    (date, ctx) => {
      const effectiveDate = new Date(ctx.parent.effectiveDate);
      const expirationDate = new Date(date);
      return expirationDate > effectiveDate;
    },
    {
      message: 'Expiration date must be after effective date'
    }
  ),
  
  // Coverage limits will be dynamic based on insurance type
  coverageLimits: z.record(z.string(), z.string()).optional(),
  deductibles: z.record(z.string(), z.string()).optional(),
  
  // Step 5: Risk Details (dynamic based on insurance type)
  riskDetails: z.record(z.string(), z.unknown()).optional(),
  
  // Step 6: Claims History
  hasPriorClaims: z.boolean(),
  claimsHistory: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.string(),
    status: z.enum(['Open', 'Closed', 'Pending']),
  })).optional(),
  
  // Step 7: Additional Information
  currentlyInsured: z.boolean(),
  currentCarrier: z.string().optional(),
  currentPremium: z.string().optional(),
  reasonForShopping: z.string().optional(),
  additionalComments: z.string().max(1000).optional(),
  
  // Step 8: Document Upload (handled separately)
  documentsUploaded: z.boolean().optional(),
});

// Define conditional validations based on applicant type
export const getConditionalSchema = (data: any) => {
  if (data.applicantType === 'business') {
    return policySubmissionSchemaEnhanced.refine(
      (data) => !!data.businessName,
      {
        message: "Business name is required for business applicants",
        path: ["businessName"],
      }
    );
  } else {
    return policySubmissionSchemaEnhanced.refine(
      (data) => !!data.firstName && !!data.lastName,
      {
        message: "First and last name are required for individual applicants",
        path: ["firstName"],
      }
    );
  }
};

export type PolicySubmissionFormEnhanced = z.infer<typeof policySubmissionSchemaEnhanced>;

export interface PolicySubmissionEnhanced extends PolicySubmissionFormEnhanced {
  id: string;
  submissionDate: string;
  status: 'draft' | 'pending' | 'in_review' | 'quoted' | 'approved' | 'rejected';
  submissionNumber: string;
  assignedUnderwriter?: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  quotes?: {
    id: string;
    premium: number;
    carrier: string;
    coverageLimits: Record<string, string>;
    status: 'pending' | 'accepted' | 'rejected';
    issuedDate: string;
  }[];
}