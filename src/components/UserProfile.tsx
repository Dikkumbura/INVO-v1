import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, ArrowLeftOnRectangleIcon, CogIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface UserProfileProps {
  className?: string;
}

// Helper function to format role and specialty names
const formatRoleType = (roleId: string): string => {
  const roles: Record<string, string> = {
    'agent': 'Insurance Agent',
    'underwriter': 'Underwriter',
    'broker': 'Insurance Broker',
    'mgaStaff': 'MGA Staff',
    'other': 'Insurance Professional'
  };
  return roles[roleId] || 'Insurance Professional';
};

const formatSpecialty = (specialtyId: string): string => {
  const specialties: Record<string, string> = {
    'commercial': 'Commercial Insurance',
    'personal': 'Personal Insurance',
    'liability': 'Professional Liability',
    'property': 'Property & Casualty',
    'life': 'Life & Health',
    'cyber': 'Cyber Insurance',
    'specialty': 'Specialty Lines',
    'transportation': 'Transportation',
    'workers': 'Workers Compensation',
    'multiple': 'Multiple Specialties'
  };
  return specialties[specialtyId] || '';
};

const UserProfile: React.FC<UserProfileProps> = ({ className }) => {
  const { currentUser, userProfileData, logOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Function to get just the first name
  const getFirstName = (displayName: string | null): string => {
    if (!displayName) return 'User';
    return displayName.split(' ')[0]; // Extract first name by splitting on space
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={() => navigate('/login')}
        className={clsx(
          "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm",
          className
        )}
      >
        Sign in
      </button>
    );
  }

  // Get first name only
  const firstName = getFirstName(currentUser.displayName);
  const firstInitial = firstName.charAt(0).toUpperCase();

  return (
    <div className={clsx("relative flex items-center", className)}>
      {/* User profile display with avatar and name */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {/* Avatar with first initial */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={firstName} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">{firstInitial}</span>
          )}
        </div>
        
        {/* First name only */}
        <span className="text-sm font-medium text-gray-700">{firstName}</span>
      </div>

      {isMenuOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 top-full">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                <p className="text-sm font-medium text-gray-900">{currentUser.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                
                {/* Display user role and specialty if available */}
                {userProfileData && userProfileData.roleType && (
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <BriefcaseIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                    <span>{formatRoleType(userProfileData.roleType)}</span>
                  </div>
                )}
                
                {userProfileData && userProfileData.specialty && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatSpecialty(userProfileData.specialty)}
                  </p>
                )}
              </div>
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Your Profile
              </Link>
              
              <a
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <CogIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Settings
              </a>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile; 