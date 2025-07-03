import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection } from 'firebase/firestore';
import { auth } from '../firebase/config';

// Define the user profile data interface
export interface UserProfileData {
  roleType?: string;
  specialty?: string;
  experienceLevel?: string;
  companyName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfileData: UserProfileData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, profileData?: UserProfileData) => Promise<User>;
  logIn: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<User>;
  facebookSignIn: () => Promise<User>;
  appleSignIn: () => Promise<User>;
  updateUserProfile: (displayName: string, profileData?: UserProfileData) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TEMPORARY: Mock user for bypassing authentication
  const mockUser = {
    uid: 'temp-user-123',
    email: 'demo@invo.com',
    displayName: 'Demo User',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as User;
  
  const mockProfileData = {
    roleType: 'underwriter',
    specialty: 'commercial_auto',
    experienceLevel: 'senior',
    companyName: 'INVO Demo'
  };
  
  // Initialize Firestore
  const db = getFirestore();
  
  // Helper function to check if we have permission to access a collection
  const checkFirestorePermission = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      // Try to fetch the document to see if we have permission
      const docRef = doc(db, 'userProfiles', auth.currentUser.uid);
      await getDoc(docRef);
      
      console.log('Firestore permission check passed');
      return true;
    } catch (error: any) {
      console.error('Firestore permission check failed:', error);
      
      if (error.code === 'permission-denied') {
        console.error('Firebase security rules are preventing access to userProfiles collection');
      }
      
      return false;
    }
  };

  // Helper function to store user profile data in Firestore
  const storeUserProfileData = async (userId: string, profileData: UserProfileData): Promise<void> => {
    try {
      // First check if we have permission
      await checkFirestorePermission();
      
      // Proceed with the write operation
      const userProfilesRef = doc(db, 'userProfiles', userId);
      await setDoc(userProfilesRef, profileData, { merge: true });
      console.log('Successfully stored user profile data in Firestore');
    } catch (error: any) {
      console.error("Error storing user profile data:", error);
      
      // Add more descriptive error based on the error code
      if (error.code === 'permission-denied') {
        console.error("This is a Firebase Security Rules issue. Check your Firestore rules to ensure authenticated users can write to their own profiles.");
        throw new Error("Permission denied. Please contact support.");
      }
      
      throw error;
    }
  };

  // Helper function to fetch user profile data from Firestore
  const fetchUserProfileData = async (userId: string): Promise<UserProfileData | null> => {
    try {
      const docRef = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Successfully fetched user profile data from Firestore');
        return docSnap.data() as UserProfileData;
      } else {
        console.log('No user profile data found in Firestore');
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching user profile data:", error);
      
      if (error.code === 'permission-denied') {
        console.error("This is a Firebase Security Rules issue. Check your Firestore rules to ensure authenticated users can read their own profiles.");
      }
      
      // We return null instead of throwing to avoid breaking the auth flow
      // The UI can handle a null profile
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string,
    profileData?: UserProfileData
  ): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's profile with the display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        
        // Store additional profile data if provided
        if (profileData) {
          try {
            await storeUserProfileData(userCredential.user.uid, profileData);
            // Set the userProfileData state immediately
            setUserProfileData(profileData);
          } catch (storeError) {
            // Log the error but don't fail the registration
            console.error("Non-critical error storing profile data:", storeError);
            // Still set the profile data in the local state so the UI works
            setUserProfileData(profileData);
          }
        }
      }
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  // Log in with email and password
  const logIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile data
      if (userCredential.user) {
        const profileData = await fetchUserProfileData(userCredential.user.uid);
        if (profileData) {
          setUserProfileData(profileData);
        }
      }
      
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  // Log out
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfileData(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  // Google sign in
  const googleSignIn = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Fetch user profile data
      if (result.user) {
        const profileData = await fetchUserProfileData(result.user.uid);
        if (profileData) {
          setUserProfileData(profileData);
        }
      }
      
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Facebook sign in
  const facebookSignIn = async (): Promise<User> => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Fetch user profile data
      if (result.user) {
        const profileData = await fetchUserProfileData(result.user.uid);
        if (profileData) {
          setUserProfileData(profileData);
        }
      }
      
      return result.user;
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
      throw error;
    }
  };

  // Apple sign in
  const appleSignIn = async (): Promise<User> => {
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      
      // Fetch user profile data
      if (result.user) {
        const profileData = await fetchUserProfileData(result.user.uid);
        if (profileData) {
          setUserProfileData(profileData);
        }
      }
      
      return result.user;
    } catch (error) {
      console.error("Error signing in with Apple:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, profileData?: UserProfileData): Promise<void> => {
    try {
      if (auth.currentUser) {
        console.log('Updating user display name:', displayName);
        
        // First update the display name in Firebase Auth
        await updateProfile(auth.currentUser, { displayName });
        
        // Update additional profile data if provided
        if (profileData && auth.currentUser.uid) {
          console.log('Updating user profile data in Firestore:', profileData);
          
          try {
            await storeUserProfileData(auth.currentUser.uid, profileData);
            setUserProfileData(prev => ({ ...prev, ...profileData }));
          } catch (firestoreError) {
            console.error("Error storing profile data in Firestore:", firestoreError);
            
            // Even if Firestore update fails, we'll still update the local state
            // This allows the UI to reflect the changes even if persistence failed
            setUserProfileData(prev => ({ ...prev, ...profileData }));
            
            // Re-throw the error for the component to handle
            throw firestoreError;
          }
        }
      } else {
        throw new Error("No authenticated user found");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Delete user account
  const deleteAccount = async (password: string): Promise<void> => {
    try {
      if (auth.currentUser && auth.currentUser.email) {
        // Re-authenticate user before deleting
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          password
        );
        
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Delete user profile data from Firestore
        if (auth.currentUser.uid) {
          const db = getFirestore();
          const userDocRef = doc(db, 'userProfiles', auth.currentUser.uid);
          await deleteDoc(userDocRef);
        }
        
        // Delete the user account
        await deleteUser(auth.currentUser);
        
        // Reset state
        setCurrentUser(null);
        setUserProfileData(null);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // TEMPORARY: Bypass Firebase auth and use mock user
    const bypassAuth = true;
    
    if (bypassAuth) {
      // Set mock user and profile data immediately
      setCurrentUser(mockUser);
      setUserProfileData(mockProfileData);
      setLoading(false);
      return;
    }
    
    // Original Firebase auth logic (commented out for bypass)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Fetch user profile data when auth state changes
      if (user) {
        try {
          const profileData = await fetchUserProfileData(user.uid);
          
          // If we got profile data, set it
          if (profileData) {
            console.log('Successfully loaded user profile data from Firestore');
            setUserProfileData(profileData);
          } 
          // If no profile data exists but we have a user, create a minimal profile
          // This handles the case where Firestore write failed during registration
          else {
            console.log('No profile data found for authenticated user, setting minimal profile');
            // Set minimal profile data based on what we have from the user object
            setUserProfileData({
              // Default to empty values - the UI will handle this gracefully
              roleType: '',
              specialty: '',
              experienceLevel: '',
              companyName: ''
            });
            
            // Try to store this minimal profile data in Firestore
            // This will help for future logins
            try {
              await storeUserProfileData(user.uid, {
                roleType: '',
                specialty: '',
                experienceLevel: '',
                companyName: ''
              });
            } catch (error) {
              // If this fails, it's not critical, we'll just use the local state
              console.error('Failed to store minimal profile data:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          // Set an empty profile on error
          setUserProfileData({
            roleType: '',
            specialty: '',
            experienceLevel: '',
            companyName: ''
          });
        }
      } else {
        setUserProfileData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [mockUser, mockProfileData]);

  const value = {
    currentUser,
    userProfileData,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
    googleSignIn,
    facebookSignIn,
    appleSignIn,
    updateUserProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};