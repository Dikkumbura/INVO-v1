import { v4 as uuidv4 } from 'uuid';
import { PolicySubmission, PolicySubmissionForm } from '../types/insurance';
import { policyService } from './firestore';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'policy_submissions';

class PolicySubmissionService {
  private readSubmissions(): PolicySubmission[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error reading policy submissions:', error);
      return [];
    }
  }

  private writeSubmissions(submissions: PolicySubmission[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch (error) {
      console.error('Error writing policy submissions:', error);
      throw new Error('Failed to save policy submission');
    }
  }

  public async submitPolicy(formData: PolicySubmissionForm): Promise<PolicySubmission> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const submission: PolicySubmission = {
      ...formData,
      id: uuidv4(),
      submissionDate: new Date().toISOString(),
      status: 'pending'
    };

    const submissions = this.readSubmissions();
    submissions.push(submission);
    this.writeSubmissions(submissions);

    // Store in Firestore if user is authenticated
    try {
      const auth = useAuth();
      if (auth.currentUser) {
        await policyService.createWithId(submission.id, {
          userId: auth.currentUser.uid,
          ...submission
        });
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      // Continue with local storage even if Firestore fails
    }

    return submission;
  }

  public getSubmission(id: string): PolicySubmission | null {
    const submissions = this.readSubmissions();
    return submissions.find(sub => sub.id === id) || null;
  }

  public getAllSubmissions(): PolicySubmission[] {
    return this.readSubmissions();
  }
}

export const policySubmissionService = new PolicySubmissionService();