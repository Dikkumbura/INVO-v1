import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfileData } from '../context/AuthContext';
import { UserIcon, BriefcaseIcon, CheckIcon, XMarkIcon, CameraIcon, PencilIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

// Role types, specialties, and experience levels
const roleTypes = [
  { id: 'agent', name: 'Insurance Agent' },
  { id: 'underwriter', name: 'Underwriter' },
  { id: 'senior_underwriter', name: 'Senior Underwriter' },
  { id: 'broker', name: 'Insurance Broker' },
  { id: 'mgaStaff', name: 'MGA Staff' },
  { id: 'other', name: 'Other Insurance Professional' }
];

const specialties = [
  { id: 'commercial_auto', name: 'Commercial Auto Insurance' },
  { id: 'workers_comp', name: 'Workers\' Compensation' },
  { id: 'professional_liability', name: 'Professional Liability' },
  { id: 'property', name: 'Property Insurance' },
  { id: 'general_liability', name: 'General Liability' },
  { id: 'cyber', name: 'Cyber Insurance' },
  { id: 'northeast', name: 'Northeast Region' },
  { id: 'southeast', name: 'Southeast Region' },
  { id: 'midwest', name: 'Midwest Region' },
  { id: 'west', name: 'Western Region' },
  { id: 'southwest', name: 'Southwest Region' }
];

const experienceLevels = [
  { id: 'new', name: 'New to Industry (<2 years)' },
  { id: 'experienced', name: 'Experienced (2-5 years)' },
  { id: 'senior', name: 'Senior (5+ years)' },
  { id: 'management', name: 'Leadership/Management' }
];

// Helper functions to format roles and specialties for display
const formatRoleType = (roleId: string): string => {
  const role = roleTypes.find(r => r.id === roleId);
  return role ? role.name : 'Insurance Professional';
};

const formatSpecialty = (specialtyId: string): string => {
  const specialty = specialties.find(s => s.id === specialtyId);
  return specialty ? specialty.name : 'All Regions';
};

const formatExperienceLevel = (experienceId: string): string => {
  const experience = experienceLevels.find(e => e.id === experienceId);
  return experience ? experience.name : '';
};

const ProfilePage: React.FC = () => {
  const { currentUser, userProfileData, updateUserProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [profileData, setProfileData] = useState<UserProfileData>({
    roleType: '',
    specialty: '',
    experienceLevel: '',
    companyName: ''
  });
  
  // Initialize form data from user data
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
    
    if (userProfileData) {
      setProfileData({
        roleType: userProfileData.roleType || '',
        specialty: userProfileData.specialty || '',
        experienceLevel: userProfileData.experienceLevel || '',
        companyName: userProfileData.companyName || ''
      });
    }
  }, [currentUser, userProfileData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'displayName') {
      setDisplayName(value);
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!displayName) {
      setError('Please enter your name');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptUpdate = async (): Promise<boolean> => {
      try {
        console.log(`Saving profile attempt ${retryCount + 1}/${maxRetries + 1}`);
        await updateUserProfile(displayName, profileData);
        return true;
      } catch (err: any) {
        console.error(`Error updating profile (attempt ${retryCount + 1}):`, err);
        
        // Only retry for network issues or temporary failures
        if (err.code?.includes('network') || err.code === 'deadline-exceeded') {
          return false; // Will trigger a retry
        }
        
        // For other errors, propagate them
        throw err;
      }
    };
    
    try {
      let success = false;
      
      // First attempt
      success = await attemptUpdate();
      
      // Retry logic
      while (!success && retryCount < maxRetries) {
        retryCount++;
        // Wait a bit before retrying (500ms, 1000ms, etc.)
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
        success = await attemptUpdate();
      }
      
      if (success) {
        setSuccessMessage('Profile updated successfully!');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        setIsEditing(false);
      } else {
        setError('Failed to update profile after multiple attempts. Please try again later.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      // More descriptive error message based on the error
      if (err.code === 'permission-denied') {
        setError('Permission denied. You may not have permission to update your profile.');
      } else if (err.code?.includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message) {
        setError(`Failed to update profile: ${err.message}`);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form to original values
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
    
    if (userProfileData) {
      setProfileData({
        roleType: userProfileData.roleType || '',
        specialty: userProfileData.specialty || '',
        experienceLevel: userProfileData.experienceLevel || '',
        companyName: userProfileData.companyName || ''
      });
    }
    
    setIsEditing(false);
    setError('');
  };
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setDeleteError('Please enter your password');
      return;
    }
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      await deleteAccount(password);
      // On success, user will be logged out and redirected
      navigate('/login');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/wrong-password') {
        setDeleteError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setDeleteError('Too many unsuccessful attempts. Please try again later.');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Delete account modal
  const DeleteAccountModal = () => (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete your account? All of your data will be permanently removed.
                    This action cannot be undone.
                  </p>
                  
                  {deleteError && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      <div className="flex">
                        <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                        <span>{deleteError}</span>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleDeleteAccount} className="mt-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Confirm your password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className={`inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Account</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setPassword('');
                setDeleteError('');
              }}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Please log in to view your profile</h1>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and page title */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <div className="flex">
              <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 py-8 px-6">
            <div className="flex flex-col items-center sm:flex-row">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-2xl font-semibold text-accent shadow-md">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={displayName} 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(displayName)}</span>
                  )}
                </div>
                {isEditing && (
                  <button 
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-accent hover:text-accent/90 transition-colors duration-200"
                    aria-label="Change profile picture"
                  >
                    <CameraIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* User info */}
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-white">{currentUser.displayName}</h2>
                <p className="text-blue-100">{currentUser.email}</p>
                
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {userProfileData?.roleType && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700">
                      <BriefcaseIcon className="mr-1 h-3 w-3" />
                      {formatRoleType(userProfileData.roleType)}
                    </div>
                  )}
                  
                  {userProfileData?.specialty && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-blue-700">
                      {formatSpecialty(userProfileData.specialty)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Edit button */}
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XMarkIcon className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="displayName"
                            id="displayName"
                            value={displayName}
                            onChange={handleInputChange}
                            required
                            className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={currentUser.email || ''}
                            disabled
                            className="bg-gray-50 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="roleType" className="block text-sm font-medium text-gray-700">
                          Professional Role
                        </label>
                        <div className="mt-1">
                          <select
                            id="roleType"
                            name="roleType"
                            value={profileData.roleType}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select your role</option>
                            {roleTypes.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                          Specialty or Territory
                        </label>
                        <div className="mt-1">
                          <select
                            id="specialty"
                            name="specialty"
                            value={profileData.specialty}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select your specialty</option>
                            {specialties.map(specialty => (
                              <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                          Experience Level
                        </label>
                        <div className="mt-1">
                          <select
                            id="experienceLevel"
                            name="experienceLevel"
                            value={profileData.experienceLevel}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select your experience level</option>
                            {experienceLevels.map(level => (
                              <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                          Company/Agency Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="companyName"
                            id="companyName"
                            value={profileData.companyName || ''}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={clsx(
                        "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
                        isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-accent/90"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Profile</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentUser.displayName || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentUser.email}</dd>
                    </div>
                  </dl>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Professional Information</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Professional Role</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userProfileData?.roleType ? formatRoleType(userProfileData.roleType) : 'Not set'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Specialty or Territory</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userProfileData?.specialty ? formatSpecialty(userProfileData.specialty) : 'Not set'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userProfileData?.experienceLevel ? formatExperienceLevel(userProfileData.experienceLevel) : 'Not set'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company/Agency</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {userProfileData?.companyName || 'Not set'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Account Management Section */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Management</h3>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <button 
                  className="text-accent hover:text-accent/90 text-sm font-medium focus:outline-none"
                  onClick={() => navigate('/reset-password')}
                >
                  Reset Password
                </button>
              </div>
              
              <div>
                <button 
                  className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  This will permanently delete your account and all associated data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render delete account modal */}
      {showDeleteModal && <DeleteAccountModal />}
    </div>
  );
};

export default ProfilePage; 