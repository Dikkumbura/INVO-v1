import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Generic Firestore service for CRUD operations
export class FirestoreService<T extends { id?: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a document with auto-generated ID
  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        ...data,
        id: docRef.id
      } as T;
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Create a document with a specific ID
  async createWithId(id: string, data: Omit<T, 'id'>): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        ...data,
        id
      } as T;
    } catch (error) {
      console.error(`Error creating document with ID in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id
        } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents in the collection
  async getAll(): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as T[];
    } catch (error) {
      console.error(`Error getting all documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Query documents by field
  async queryByField(field: string, value: any): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      const q = query(collectionRef, where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as T[];
    } catch (error) {
      console.error(`Error querying documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update a document
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Add a document ID to a collection for a user
  async addToCollection(docId: string, collectionName: string, userId: string): Promise<void> {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      await setDoc(doc(userCollectionRef, docId), {
        id: docId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error adding to collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Remove a document ID from a collection for a user
  async removeFromCollection(docId: string, collectionName: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error removing from collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents in a collection for a user
  async getUserCollection(collectionName: string, userId: string): Promise<string[]> {
    try {
      const userCollectionRef = collection(db, 'users', userId, collectionName);
      const querySnapshot = await getDocs(userCollectionRef);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error(`Error getting user collection ${collectionName}:`, error);
      throw error;
    }
  }
}

// Export specific service instances for different collections
export const userService = new FirestoreService<{
  id?: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}>('users');

export const quoteService = new FirestoreService<{
  id?: string;
  userId: string;
  insuranceType: string;
  customerInfo: Record<string, any>;
  policyDetails: Record<string, any>;
  premium: {
    monthlyPremium: number;
    annualPremium: number;
    factors: Array<{
      name: string;
      impact: number;
    }>;
  };
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}>('quotes');

export const policyService = new FirestoreService<{
  id?: string;
  userId: string;
  insuredName: string;
  businessName?: string;
  contactEmail: string;
  phoneNumber: string;
  coverageType: string;
  effectiveDate: string;
  expirationDate: string;
  additionalNotes?: string;
  submissionDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}>('policies');