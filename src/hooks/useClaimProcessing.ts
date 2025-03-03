import { useState, useCallback } from 'react';

// Define claim types
export type ClaimType = 
  | 'property' 
  | 'liability' 
  | 'workers_comp' 
  | 'auto' 
  | 'professional' 
  | 'cyber';

// Define claim status types
export type ClaimStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'additional_info' 
  | 'approved' 
  | 'denied' 
  | 'paid';

// Define payment status
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'paid' 
  | 'failed';

// Define risk level
export type RiskLevel = 'low' | 'medium' | 'high';

// Claim form data definition
export interface ClaimFormData {
  policyNumber: string;
  claimType: ClaimType | '';
  incidentDate: string;
  description: string;
  estimatedAmount: string;
  contactPhone: string;
  contactEmail: string;
  documents: File[];
}

// Claim result interface
export interface ClaimResult {
  approved: boolean;
  referenceNumber: string;
  message: string;
  nextSteps: string[];
  paymentAmount?: string;
  paymentStatus?: PaymentStatus;
  riskLevel?: RiskLevel;
  reviewDate?: string;
}

// Initial default form data
const initialFormData: ClaimFormData = {
  policyNumber: '',
  claimType: '',
  incidentDate: '',
  description: '',
  estimatedAmount: '',
  contactPhone: '',
  contactEmail: '',
  documents: []
};

// Main hook for claim processing
export const useClaimProcessing = () => {
  // State for form data
  const [formData, setFormData] = useState<ClaimFormData>(initialFormData);
  
  // State for uploaded file names
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  // State for claim result
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  
  // State for loading/processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setUploadedFiles([]);
    setClaimResult(null);
    setIsProcessing(false);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle file uploads
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }));
      
      const newFileNames = newFiles.map(file => file.name);
      setUploadedFiles(prev => [...prev, ...newFileNames]);
    }
  }, []);

  // Remove a file from the uploaded list
  const handleRemoveFile = useCallback((index: number) => {
    setFormData(prev => {
      const updatedFiles = [...prev.documents];
      updatedFiles.splice(index, 1);
      
      return {
        ...prev,
        documents: updatedFiles
      };
    });
    
    setUploadedFiles(prev => {
      const updatedFileNames = [...prev];
      updatedFileNames.splice(index, 1);
      return updatedFileNames;
    });
  }, []);

  // Determine risk level based on claim data
  const determineRiskLevel = useCallback((): RiskLevel => {
    const amount = parseFloat(formData.estimatedAmount);
    
    // Risk factor for different claim types
    const claimTypeRisk = {
      'cyber': 1.5,  // Cyber claims often have higher risk
      'professional': 1.3,
      'liability': 1.2,
      'workers_comp': 1.1,
      'property': 1.0,
      'auto': 0.9
    };
    
    const riskMultiplier = formData.claimType ? 
      claimTypeRisk[formData.claimType as keyof typeof claimTypeRisk] || 1 : 1;
    
    // Calculate adjusted amount based on claim type risk factor
    const adjustedAmount = amount * riskMultiplier;
    
    // Determine risk level based on adjusted amount
    if (adjustedAmount > 15000) return 'high';
    if (adjustedAmount > 5000) return 'medium';
    return 'low';
  }, [formData]);

  // Generate a random claim reference number
  const generateReferenceNumber = useCallback((): string => {
    return 'CLM-' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  // Simulate claim processing
  const processClaimSubmission = useCallback(() => {
    setIsProcessing(true);
    
    // Simulate API call with a timeout
    return new Promise<ClaimResult>((resolve) => {
      setTimeout(() => {
        const riskLevel = determineRiskLevel();
        const referenceNumber = generateReferenceNumber();
        
        let result: ClaimResult;
        
        if (riskLevel === 'high') {
          // High risk claims require manual review
          result = {
            approved: false,
            referenceNumber,
            riskLevel,
            message: "Your claim requires additional review by our team.",
            nextSteps: [
              "Our claims team will review your submission",
              "You may be contacted for additional information",
              "You'll receive a decision within 5-7 business days"
            ],
            paymentStatus: 'pending',
            reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
        } else {
          // For low and medium risk, generate automated results
          const isApproved = Math.random() > 0.3; // 70% approval rate for demo
          
          if (isApproved) {
            const paymentAmount = (parseFloat(formData.estimatedAmount) * 0.85).toFixed(2);
            result = {
              approved: true,
              referenceNumber,
              riskLevel,
              paymentAmount,
              message: "Your claim has been automatically approved.",
              nextSteps: [
                `Payment of $${paymentAmount} will be processed`,
                "You'll receive payment within 3-5 business days",
                "You can track your claim status anytime"
              ],
              paymentStatus: 'processing'
            };
          } else {
            result = {
              approved: false,
              referenceNumber,
              riskLevel,
              message: "We were unable to automatically approve your claim.",
              nextSteps: [
                "A claims adjuster will contact you within 24 hours",
                "Please have any additional documentation ready",
                "You can check your claim status anytime"
              ],
              paymentStatus: 'pending'
            };
          }
        }
        
        setClaimResult(result);
        setIsProcessing(false);
        resolve(result);
      }, 2000);
    });
  }, [formData, determineRiskLevel, generateReferenceNumber]);

  // Check if form is valid
  const isFormValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.policyNumber && !!formData.claimType;
      case 2:
        return !!formData.incidentDate && !!formData.description && !!formData.estimatedAmount;
      case 3:
        return formData.documents.length > 0;
      default:
        return false;
    }
  }, [formData]);

  return {
    formData,
    uploadedFiles,
    claimResult,
    isProcessing,
    resetForm,
    handleInputChange,
    handleFileUpload,
    handleRemoveFile,
    processClaimSubmission,
    isFormValid
  };
};

export default useClaimProcessing; 