import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ClaimType, ClaimStatus, PaymentStatus, RiskLevel } from '../hooks/useClaimProcessing';

// Define claim interface
export interface Claim {
  referenceNumber: string;
  policyNumber: string;
  claimType: ClaimType;
  dateSubmitted: string;
  description: string;
  amount: string;
  status: ClaimStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentAmount?: string;
  riskLevel: RiskLevel;
  documents?: string[];
  nextSteps?: string[];
  claimantInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface ClaimContextType {
  claims: Claim[];
  addClaim: (claim: Claim) => void;
  updateClaim: (referenceNumber: string, updatedClaim: Partial<Claim>) => void;
  getClaim: (referenceNumber: string) => Claim | undefined;
  deleteClaim: (referenceNumber: string) => void;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

// Sample claims for demonstration
const sampleClaims: Claim[] = [
  {
    referenceNumber: 'CLM-385721',
    policyNumber: 'POL-984632',
    claimType: 'property',
    dateSubmitted: '2025-02-20T09:30:00Z',
    description: 'Water damage from pipe burst in office space',
    amount: '12500.00',
    status: 'approved',
    paymentStatus: 'paid',
    paymentDate: '2025-02-27T14:20:00Z',
    paymentAmount: '10625.00',
    riskLevel: 'medium'
  },
  {
    referenceNumber: 'CLM-429856',
    policyNumber: 'POL-984632',
    claimType: 'liability',
    dateSubmitted: '2025-02-22T11:15:00Z',
    description: 'Customer slip and fall in retail store',
    amount: '25000.00',
    status: 'under_review',
    paymentStatus: 'pending',
    riskLevel: 'high'
  },
  {
    referenceNumber: 'CLM-657423',
    policyNumber: 'POL-775132',
    claimType: 'professional',
    dateSubmitted: '2025-02-18T15:40:00Z',
    description: 'Alleged errors in professional services provided to client',
    amount: '18750.00',
    status: 'additional_info',
    paymentStatus: 'pending',
    riskLevel: 'high'
  }
];

export const ClaimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with sample claims and any stored claims
  const [claims, setClaims] = useState<Claim[]>(() => {
    const storedClaims = localStorage.getItem('claims');
    return storedClaims ? [...JSON.parse(storedClaims), ...sampleClaims] : sampleClaims;
  });

  // Save claims to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('claims', JSON.stringify(claims));
  }, [claims]);

  // Add a new claim
  const addClaim = (claim: Claim) => {
    setClaims(prev => [...prev, claim]);
  };

  // Update an existing claim
  const updateClaim = (referenceNumber: string, updatedClaim: Partial<Claim>) => {
    setClaims(prev => 
      prev.map(claim => 
        claim.referenceNumber === referenceNumber 
          ? { ...claim, ...updatedClaim } 
          : claim
      )
    );
  };

  // Get a specific claim by reference number
  const getClaim = (referenceNumber: string) => {
    return claims.find(claim => claim.referenceNumber === referenceNumber);
  };

  // Delete a claim
  const deleteClaim = (referenceNumber: string) => {
    setClaims(prev => prev.filter(claim => claim.referenceNumber !== referenceNumber));
  };

  return (
    <ClaimContext.Provider value={{ claims, addClaim, updateClaim, getClaim, deleteClaim }}>
      {children}
    </ClaimContext.Provider>
  );
};

// Custom hook to use the claim context
export const useClaims = () => {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimProvider');
  }
  return context;
};

export default ClaimContext; 