import { v4 as uuidv4 } from 'uuid';
import { quoteService } from './firestore';
import { useAuth } from '../context/AuthContext';
import { Timestamp } from 'firebase/firestore';

// Premium calculation result schema
interface Premium {
  monthlyPremium: number;
  annualPremium: number;
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

// Quote status type
export type QuoteStatus = 'new' | 'modified' | 'accepted';

// Modification history entry type
export interface ModificationEntry {
  timestamp: number;
  notes: string;
  premium: {
    monthlyPremium: number;
    annualPremium: number;
    factors: Array<{
      name: string;
      impact: number;
    }>;
  };
  policyDetails: Record<string, any>;
}

// Submission schema
export interface Submission {
  id: string;
  timestamp: number;
  insuranceType: string;
  customerInfo: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    businessLocation: string;
  };
  policyDetails: Record<string, any>;
  premium: {
    monthlyPremium: number;
    annualPremium: number;
    factors: Array<{
      name: string;
      impact: number;
    }>;
  };
  status: QuoteStatus;
  modificationHistory: ModificationEntry[];
}

const STORAGE_KEY = 'insurance_submissions';
const SAVED_QUOTES_KEY = 'saved_quotes';

export class InsuranceSubmissionService {
  private submissions: Submission[] = [];
  private savedQuotes: string[] = [];
  
  constructor() {
    this.loadSubmissions();
    this.loadSavedQuotes();
  }
  
  private loadSubmissions() {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return;
      this.submissions = JSON.parse(storedData);
    } catch (error) {
      console.error('Error reading submissions:', error);
    }
  }

  private writeSubmissions(submissions: Submission[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch (error) {
      console.error('Error writing submissions:', error);
      throw new Error('Failed to save submission');
    }
  }

  private loadSavedQuotes() {
    try {
      const storedSavedQuotes = localStorage.getItem(SAVED_QUOTES_KEY);
      if (!storedSavedQuotes) return;
      this.savedQuotes = JSON.parse(storedSavedQuotes);
    } catch (error) {
      console.error('Error reading saved quotes:', error);
    }
  }

  private saveSavedQuotes() {
    try {
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(this.savedQuotes));
    } catch (error) {
      console.error('Error writing saved quotes:', error);
      throw new Error('Failed to save saved quotes');
    }
  }

  public getSubmissions(): Submission[] {
    return this.submissions;
  }

  public getSubmission(id: string): Submission | null {
    const submission = this.submissions.find(sub => sub.id === id);
    return submission || null;
  }

  public getAllSubmissions(): Submission[] {
    return this.submissions;
  }

  public calculatePremium(insuranceType: string, policyDetails: Record<string, unknown>): Promise<Premium> {
    // This is a simplified premium calculation
    // In a real system, this would use complex actuarial formulas
    let baseRate = 1000;
    const factors: Array<{ name: string; impact: number }> = [];

    switch (insuranceType) {
      case "Workers' Comp":
        const employees = policyDetails.numberOfEmployees as number;
        const payroll = policyDetails.annualPayroll as number;
        baseRate = (payroll / 100) * 1.5;
        factors.push(
          { name: 'Number of Employees', impact: employees * 0.1 },
          { name: 'Safety Training', impact: policyDetails.safetyTraining === 'Yes' ? -0.15 : 0 }
        );
        break;

      case 'Temp Staffing':
        const tempEmployees = policyDetails.totalTempEmployees as number;
        const tempPayroll = policyDetails.annualTempPayroll as number;
        baseRate = (tempPayroll / 100) * 2;
        factors.push(
          { name: 'Number of Temp Employees', impact: tempEmployees * 0.15 },
          { name: 'Health Benefits', impact: policyDetails.providesHealthBenefits === 'Yes' ? -0.2 : 0 }
        );
        break;

      case 'Trucking':
        const trucks = policyDetails.numberOfTrucks as number;
        const miles = policyDetails.annualMilesPerTruck as number;
        baseRate = (trucks * miles / 1000) * 2.5;
        factors.push(
          { name: 'Fleet Size', impact: trucks * 0.2 },
          { name: 'Safety Program', impact: policyDetails.hasFleetSafetyProgram === 'Yes' ? -0.25 : 0 }
        );
        break;
    }

    const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0);
    const annualPremium = baseRate * (1 + totalImpact);

    return Promise.resolve({
      monthlyPremium: Math.round((annualPremium / 12) * 100) / 100,
      annualPremium: Math.round(annualPremium * 100) / 100,
      factors
    });
  }

  public async processSubmission(
    insuranceType: string,
    formData: Record<string, unknown>
  ): Promise<Submission> {
    try {
      // Extract customer information
      const customerInfo = {
        contactName: formData.contactName as string,
        contactEmail: formData.contactEmail as string,
        contactPhone: formData.contactPhone as string,
        businessLocation: formData.businessLocation as string
      };

      // Calculate premium
      const premium = await this.calculatePremium(insuranceType, formData);

      // Create submission object
      const submission: Submission = {
        id: uuidv4(),
        timestamp: Date.now(),
        insuranceType,
        customerInfo,
        policyDetails: formData,
        premium,
        status: 'new',
        modificationHistory: []
      };

      // Add new submission
      this.submissions.push(submission);

      // Write updated submissions back to storage
      this.writeSubmissions(this.submissions);

      // Store in Firestore if user is authenticated
      try {
        const auth = useAuth();
        if (auth.currentUser) {
          await quoteService.createWithId(submission.id, {
            userId: auth.currentUser.uid,
            insuranceType: submission.insuranceType,
            customerInfo: submission.customerInfo,
            policyDetails: submission.policyDetails,
            premium: submission.premium,
            timestamp: submission.timestamp,
            status: submission.status,
            modificationHistory: submission.modificationHistory
          });
        }
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Continue with local storage even if Firestore fails
      }

      return submission;
    } catch (error) {
      console.error('Error processing submission:', error);
      throw new Error('Failed to process insurance submission');
    }
  }

  public async acceptQuote(submissionId: string, currentUser?: any): Promise<boolean> {
    const submissionIndex = this.submissions.findIndex(sub => sub.id === submissionId);
    if (submissionIndex === -1) return false;
    
    this.submissions[submissionIndex].status = 'accepted';
    this.writeSubmissions(this.submissions);
    
    // Update Firestore if user is authenticated
    try {
      if (currentUser) {
        await quoteService.update(submissionId, {
          status: 'accepted'
        });
      }
    } catch (error) {
      console.error('Error updating Firestore:', error);
      // Continue with local storage even if Firestore fails
    }
    
    return true;
  }
  
  public async modifyQuote(
    submissionId: string,
    updatedPolicyDetails: Record<string, unknown>,
    notes?: string,
    currentUser?: any
  ): Promise<Submission | null> {
    const submissionIndex = this.submissions.findIndex(sub => sub.id === submissionId);
    if (submissionIndex === -1) return null;
    
    const currentSubmission = this.submissions[submissionIndex];
    const previousPolicyDetails = { ...currentSubmission.policyDetails };
    const previousPremium = { ...currentSubmission.premium };
    
    // Calculate new premium based on updated details
    const newPremium = await this.calculatePremium(
      currentSubmission.insuranceType,
      updatedPolicyDetails
    );
    
    // Add current details to modification history
    if (!currentSubmission.modificationHistory) {
      currentSubmission.modificationHistory = [];
    }
    
    // For local storage, use regular timestamp
    const now = Date.now();
    currentSubmission.modificationHistory.push({
      timestamp: now,
      notes,
      premium: previousPremium,
      policyDetails: previousPolicyDetails
    });
    
    // Update submission with new details
    currentSubmission.policyDetails = updatedPolicyDetails;
    currentSubmission.premium = newPremium;
    currentSubmission.status = 'modified';
    
    // Save updated submissions
    this.writeSubmissions(this.submissions);
    
    // Update Firestore if user is authenticated
    try {
      if (currentUser) {
        // Convert modification history timestamps to Firestore timestamps for Firestore
        const firestoreModificationHistory = currentSubmission.modificationHistory.map(entry => ({
          ...entry,
          timestamp: typeof entry.timestamp === 'number' 
            ? Timestamp.fromMillis(entry.timestamp) 
            : entry.timestamp
        }));
        
        await quoteService.update(submissionId, {
          status: 'modified',
          policyDetails: updatedPolicyDetails,
          premium: newPremium,
          modificationHistory: firestoreModificationHistory
        });
      }
    } catch (error) {
      console.error('Error updating Firestore:', error);
      // Continue with local storage even if Firestore fails
    }
    
    return currentSubmission;
  }

  public async saveQuote(submissionId: string): Promise<boolean> {
    if (!this.savedQuotes.includes(submissionId)) {
      this.savedQuotes.push(submissionId);
      this.saveSavedQuotes();
      
      // Update Firestore if user is authenticated
      try {
        const auth = useAuth();
        if (auth.currentUser) {
          await quoteService.addToCollection(submissionId, 'savedQuotes', auth.currentUser.uid);
        }
      } catch (error) {
        console.error('Error updating Firestore:', error);
        // Continue with local storage even if Firestore fails
      }
      
      return true;
    }
    return false;
  }

  public getSavedQuotes(): string[] {
    return this.savedQuotes;
  }

  public getSavedQuoteSubmissions(): Submission[] {
    return this.submissions.filter(sub => this.savedQuotes.includes(sub.id));
  }

  public async deleteSavedQuote(submissionId: string): Promise<boolean> {
    const index = this.savedQuotes.indexOf(submissionId);
    if (index !== -1) {
      this.savedQuotes.splice(index, 1);
      this.saveSavedQuotes();
      
      // Update Firestore if user is authenticated
      try {
        const auth = useAuth();
        if (auth.currentUser) {
          await quoteService.removeFromCollection(submissionId, 'savedQuotes', auth.currentUser.uid);
        }
      } catch (error) {
        console.error('Error updating Firestore:', error);
        // Continue with local storage even if Firestore fails
      }
      
      return true;
    }
    return false;
  }

  // Add this method to load saved quotes from Firebase
  public async loadSavedQuotesFromFirebase(): Promise<void> {
    try {
      const auth = useAuth();
      if (auth.currentUser) {
        // Get saved quote IDs from Firebase
        const savedQuoteIds = await quoteService.getUserCollection('savedQuotes', auth.currentUser.uid);
        
        // Update the local savedQuotes array
        this.savedQuotes = savedQuoteIds;
        this.saveSavedQuotes(); // Also save to localStorage
        
        // For each saved quote ID, check if we have it locally, if not fetch from Firebase
        for (const quoteId of savedQuoteIds) {
          if (!this.submissions.some(sub => sub.id === quoteId)) {
            const quoteData = await quoteService.getById(quoteId);
            if (quoteData) {
              // Convert to Submission format and add to local submissions
              const submission: Submission = {
                id: quoteId,
                timestamp: Date.parse(quoteData.timestamp as string) || Date.now(),
                insuranceType: quoteData.insuranceType,
                customerInfo: quoteData.customerInfo,
                policyDetails: quoteData.policyDetails,
                premium: quoteData.premium,
                status: quoteData.status || 'new',
                modificationHistory: quoteData.modificationHistory || []
              };
              this.submissions.push(submission);
            }
          }
        }
        
        // Save updated submissions to localStorage
        this.writeSubmissions(this.submissions);
      }
    } catch (error) {
      console.error('Error loading saved quotes from Firebase:', error);
    }
  }

  // Add this method to directly add a submission to the local storage
  public addSubmission(submission: Submission): void {
    // Check if submission already exists
    const existingIndex = this.submissions.findIndex(sub => sub.id === submission.id);
    if (existingIndex !== -1) {
      // Update existing submission
      this.submissions[existingIndex] = submission;
    } else {
      // Add new submission
      this.submissions.push(submission);
    }
    this.writeSubmissions(this.submissions);
  }
}

// Export singleton instance
export const insuranceSubmissionService = new InsuranceSubmissionService();