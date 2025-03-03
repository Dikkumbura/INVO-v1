import { z } from 'zod';

export const coverageTypes = [
  'General Liability',
  'Professional Liability',
  'Property Insurance',
  'Cyber Insurance',
  'Business Interruption',
  'Workers Compensation'
] as const;

export const policySubmissionSchema = z.object({
  // Section 1: Insured Details
  insuredName: z.string().min(1, 'Insured name is required'),
  businessName: z.string().optional(),
  contactEmail: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),

  // Section 2: Coverage Information
  coverageType: z.enum(coverageTypes, {
    required_error: 'Please select a coverage type'
  }),
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

  // Section 3: Additional Information
  additionalNotes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
});

export type PolicySubmissionForm = z.infer<typeof policySubmissionSchema>;

export interface PolicySubmission extends PolicySubmissionForm {
  id: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Location {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  sameAsPhysical?: boolean;
}

export interface Claim {
  date: string;
  amount: string;
  description: string;
  status: 'Open' | 'Closed' | 'Pending';
}

export interface CoverageLimits {
  eachOccurrence?: string;
  generalAggregate?: string;
  productsAggregate?: string;
  personalInjury?: string;
  employersLiability?: string;
  // Add other coverage limits as needed
}

export interface RiskDetails {
  // Workers Comp specific
  fullTimeEmployees?: string | number;
  partTimeEmployees?: string | number;
  annualPayroll?: string;
  safetyPrograms?: 'yes' | 'no';
  safetyProgramsDescription?: string;
  
  // General Liability specific
  operationsDescription?: string;
  subcontractor?: 'yes' | 'no';
  hireSubcontractors?: 'yes' | 'no';
  
  // Add other risk details as needed
}

export interface Deductibles {
  standard?: string;
  // Add other deductible types as needed
}

export interface PolicySubmissionFormData {
  applicantType: 'business' | 'individual';
  businessName?: string;
  businessType?: string;
  federalEIN?: string;
  yearsInBusiness?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  
  insuranceType: string;
  
  physicalAddress?: Location;
  mailingAddressSameAsPhysical?: boolean;
  mailingAddress?: Location;
  additionalLocations?: Location[];
  
  effectiveDate?: string;
  expirationDate?: string;
  coverageLimits?: CoverageLimits;
  deductibles?: Deductibles;
  
  riskDetails?: RiskDetails;
  
  hasPriorClaims?: boolean;
  claimsHistory?: Claim[];
  
  currentlyInsured?: boolean;
  currentCarrier?: string;
  currentPremium?: string;
  reasonForShopping?: string;
  
  additionalComments?: string;
  files?: File[];
  
  termsAccepted?: boolean;
}