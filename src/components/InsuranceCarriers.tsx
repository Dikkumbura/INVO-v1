import React, { useState } from 'react';
import { 
  StarIcon, 
  ShieldCheckIcon, 
  BuildingOfficeIcon, 
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';

interface Carrier {
  id: string;
  name: string;
  type: 'standard' | 'specialty' | 'niche';
  specialties: string[];
  description: string;
}

const carriers: Carrier[] = [
  // Standard Commercial Carriers
  {
    id: 'allstate',
    name: 'Allstate',
    type: 'standard',
    specialties: ['Personal Lines', 'Commercial Lines', "Workers' Compensation"],
    description: "General personal and commercial lines, including workers' compensation through National General."
  },
  {
    id: 'amtrust',
    name: 'AmTrust',
    type: 'standard',
    specialties: ['Specialty Commercial', "Workers' Compensation", 'General Liability', 'Property'],
    description: "Specialty commercial lines, including workers' compensation, general liability, and property."
  },
  {
    id: 'biberk',
    name: 'biBERK (Berkshire Hathaway)',
    type: 'standard',
    specialties: ['Small Business Insurance', "Workers' Compensation", 'General Liability'],
    description: "Small business insurance, including workers' compensation, general liability, and property."
  },
  {
    id: 'chubb',
    name: 'Chubb',
    type: 'standard',
    specialties: ['Property', 'Casualty', 'Cyber', 'Professional Liability'],
    description: 'Broad commercial lines, including property, casualty, cyber, and professional liability.'
  },
  {
    id: 'employers',
    name: 'Employers Insurance',
    type: 'standard',
    specialties: ["Workers' Compensation"],
    description: "Workers' compensation specialist for small to medium businesses."
  },
  {
    id: 'great-american',
    name: 'Great American Insurance',
    type: 'standard',
    specialties: ['Specialty Lines', "Workers' Compensation", 'Property', 'Casualty'],
    description: "Specialty lines, including workers' compensation, property, and casualty."
  },

  // Specialty Carriers
  {
    id: 'bond',
    name: 'BOND (Bond Specialty Insurance)',
    type: 'specialty',
    specialties: ['Surety Bonds', 'Niche Commercial Risks'],
    description: 'Specialty surety bonds and niche commercial risks.'
  },
  {
    id: 'cfc',
    name: 'CFC Underwriting',
    type: 'specialty',
    specialties: ['Cyber', 'Technology', 'Professional Liability'],
    description: 'Specialty lines like cyber, technology, and professional liability.'
  },
  {
    id: 'drafters',
    name: 'Drafters Insurance',
    type: 'specialty',
    specialties: ['Professional Liability', 'E&O', 'Design Professionals'],
    description: 'Insurance for architects, engineers, and design professionals (professional liability/E&O).'
  },
  {
    id: 'fairmatic',
    name: 'Fairmatic',
    type: 'specialty',
    specialties: ['Commercial Auto', 'Fleet Insurance', 'AI Risk Assessment'],
    description: 'Commercial auto and fleet insurance, with AI-driven risk assessment.'
  },
  {
    id: 'keyrisk',
    name: 'KeyRisk',
    type: 'specialty',
    specialties: ["Workers' Compensation", 'Occupational Accident', 'Staffing'],
    description: "Workers' compensation and occupational accident insurance for staffing and high-risk industries."
  },
  {
    id: 'kinsale',
    name: 'Kinsale Insurance',
    type: 'specialty',
    specialties: ['Excess & Surplus', 'General Liability', 'Property', 'Specialty Risks'],
    description: 'Excess and surplus lines, including general liability, property, and specialty risks.'
  },

  // Niche Carriers
  {
    id: 'church-mutual',
    name: 'Church Mutual',
    type: 'niche',
    specialties: ['Religious Organizations', 'Non-Profits'],
    description: 'Insurance for religious organizations, non-profits, and related risks.'
  },
  {
    id: 'jewelers-mutual',
    name: 'Jewelers Mutual',
    type: 'niche',
    specialties: ['Jewelry Industry', 'Property', 'Liability'],
    description: 'Insurance for jewelers, focusing on property and liability for the jewelry industry.'
  },
  {
    id: 'normandy',
    name: 'Normandy Insurance Company',
    type: 'niche',
    specialties: ['Specialty Property', 'Casualty', 'Vacant Properties'],
    description: 'Specialty property and casualty for unique risks (e.g., vacant properties).'
  },
  {
    id: 'palomar',
    name: 'Palomar Insurance',
    type: 'niche',
    specialties: ['Specialty Property', 'Earthquake', 'Flood'],
    description: 'Specialty property insurance, including earthquake and flood.'
  },
  {
    id: 'covertree',
    name: 'CoverTree',
    type: 'niche',
    specialties: ['Landlord Insurance', 'Property Management'],
    description: 'Landlord insurance and property management risks.'
  },
  {
    id: 'steadily',
    name: 'Steadily',
    type: 'niche',
    specialties: ['Landlord Insurance', 'Rental Property'],
    description: 'Landlord and rental property insurance.'
  }
];

const InsuranceCarriers: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'specialty' | 'niche'>('all');

  const filteredCarriers = selectedType === 'all' 
    ? carriers 
    : carriers.filter(carrier => carrier.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Our Insurance Carrier Partners"
          subtitle="Access to a diverse network of top-rated insurance providers specializing in various industries and risks"
        />

        {/* Trust Indicators - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="flex items-center justify-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <StarIcon className="h-5 w-5 sm:h-8 sm:w-8 text-accent mr-3" />
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Industry Leaders</h3>
                <p className="text-xs sm:text-base text-gray-600">Top-rated insurance providers</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <ShieldCheckIcon className="h-5 w-5 sm:h-8 sm:w-8 text-accent mr-3" />
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Specialized Coverage</h3>
                <p className="text-xs sm:text-base text-gray-600">Industry-specific solutions</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <BuildingOfficeIcon className="h-5 w-5 sm:h-8 sm:w-8 text-accent mr-3" />
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Comprehensive Network</h3>
                <p className="text-xs sm:text-base text-gray-600">Multiple market access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:space-x-4">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 hidden sm:block" />
            <div className="grid grid-cols-2 sm:flex gap-2 sm:space-x-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'all' 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('standard')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'standard' 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setSelectedType('specialty')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'specialty' 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Specialty
              </button>
              <button
                onClick={() => setSelectedType('niche')}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'niche' 
                    ? 'bg-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Niche
              </button>
            </div>
          </div>
        </div>

        {/* Carriers Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {filteredCarriers.map((carrier) => (
            <div 
              key={carrier.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-xl font-semibold text-gray-900 line-clamp-2">{carrier.name}</h3>
                  <span className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                    carrier.type === 'standard' ? 'bg-blue-100 text-blue-800' :
                    carrier.type === 'specialty' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {carrier.type.charAt(0).toUpperCase() + carrier.type.slice(1)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{carrier.description}</p>

                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {carrier.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Access Our Carrier Network</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Let us help you find the right insurance solution from our extensive network of carrier partners.
          </p>
          <button className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-base sm:text-lg font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors">
            Contact an Underwriter
          </button>
        </div>

        {/* Disclaimer - Mobile Friendly */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 text-center px-4 sm:px-0">
          <p>
            Coverage availability and terms vary by jurisdiction and are subject to underwriting review.
            Please consult with your insurance professional for specific coverage details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceCarriers;