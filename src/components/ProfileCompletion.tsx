import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../context/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const territories = [
  'Northeast',
  'Mid-Atlantic',
  'Southeast',
  'Midwest',
  'Southwest',
  'West Coast',
  'Northwest',
  'National'
];

const specialties = [
  'Commercial Property', 
  'Casualty', 
  'Workers Compensation',
  'Professional Liability',
  'Cyber Insurance',
  'Environmental',
  'Marine',
  'Aviation',
  'Surety',
  'Program Business'
];

const yearsExperienceOptions = [
  'Less than 1 year',
  '1-3 years',
  '4-7 years',
  '8-10 years',
  'More than 10 years'
];

const roles = [
  'Insurance Agent',
  'Broker',
  'Underwriter',
  'Senior Underwriter',
  'Manager',
  'Executive'
];

const ProfileCompletion: React.FC = () => {
  const { currentUser, saveUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [territory, setTerritory] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role || !yearsExperience || !territory || selectedSpecialties.length === 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to complete your profile');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const userProfile: UserProfile = {
        role,
        yearsExperience,
        territory,
        specialties: selectedSpecialties,
        companyName: companyName || undefined
      };
      
      await saveUserProfile(currentUser.uid, {
        ...userProfile,
        profileComplete: true
      });
      
      // Redirect to dashboard after successful profile completion
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSpecialtyToggle = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(item => item !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-600 mb-8">
          Please provide some additional information to help us personalize your experience.
        </p>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Role selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Your Role*
              </label>
              <div className="mt-1 relative">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select your role</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Years of Experience */}
            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                Years of Experience*
              </label>
              <div className="mt-1 relative">
                <select
                  id="yearsExperience"
                  name="yearsExperience"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select experience level</option>
                  {yearsExperienceOptions.map((years) => (
                    <option key={years} value={years}>
                      {years}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            
            {/* Territory */}
            <div>
              <label htmlFor="territory" className="block text-sm font-medium text-gray-700">
                Territory*
              </label>
              <div className="mt-1 relative">
                <select
                  id="territory"
                  name="territory"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select your territory</option>
                  {territories.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            
            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties* (select at least one)
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center">
                    <input
                      id={`specialty-${specialty}`}
                      name={`specialty-${specialty}`}
                      type="checkbox"
                      checked={selectedSpecialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`specialty-${specialty}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion; 