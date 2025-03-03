import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  CheckBadgeIcon, 
  StarIcon,
  UserGroupIcon,
  ScaleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';

const staffingInsuranceOfferings = [
  {
    id: 1,
    title: "Workers' Compensation",
    icon: ShieldCheckIcon,
    description: "Comprehensive coverage for workplace injuries and illnesses",
    benefits: [
      "Industry-specific risk assessment",
      "Pay-as-you-go premium options",
      "Integrated claims management",
      "Return-to-work programs"
    ]
  },
  {
    id: 2,
    title: "Professional Liability",
    icon: UserGroupIcon,
    description: "Protection against claims of errors and negligence",
    benefits: [
      "Coverage for placement errors",
      "Defense cost coverage",
      "Third-party claims protection",
      "Contractual liability coverage"
    ]
  },
  {
    id: 3,
    title: "Employment Practices Liability",
    icon: ScaleIcon,
    description: "Coverage for employment-related claims and disputes",
    benefits: [
      "Discrimination coverage",
      "Harassment protection",
      "Wrongful termination defense",
      "Third-party EPLI coverage"
    ]
  }
];

const Staffing: React.FC = () => {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    navigate('/quote');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Staffing Insurance"
          subtitle="Specialized insurance solutions for the staffing industry"
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-8">
            {/* Hero Section - Mobile Optimized */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Comprehensive Staffing Insurance Coverage
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
                Protect your staffing firm with tailored insurance solutions designed specifically for the unique challenges of the staffing industry.
              </p>
            </div>

            {/* Trust Indicators - Mobile Responsive Grid */}
            <div className="grid grid-cols-1 sm:flex sm:justify-center sm:items-center gap-4 sm:space-x-8 mb-6 sm:mb-8">
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">Specialized in Staffing Industry Since 1995</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <CheckBadgeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">ASA Commercial Liability Insurance Partner</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">A+ Rated Insurance Carriers</span>
              </div>
            </div>

            {/* Insurance Offerings Grid - Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
              {staffingInsuranceOfferings.map((offering) => (
                <div 
                  key={offering.id} 
                  className="bg-gray-50 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center mb-3 sm:mb-4">
                    <offering.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 ml-3">
                      {offering.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {offering.description}
                  </p>
                  <ul className="space-y-2">
                    {offering.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Testimonial - Mobile Optimized */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-8 mb-6 sm:mb-8">
              <div className="max-w-3xl mx-auto text-center">
                <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent mx-auto mb-3 sm:mb-4" />
                <blockquote className="text-base sm:text-xl text-gray-900 italic mb-3 sm:mb-4">
                  "INVO Underwriting has been instrumental in helping us navigate the complex world of staffing insurance. Their expertise and tailored solutions have saved us both time and money."
                </blockquote>
                <cite className="text-gray-600 block">
                  <span className="font-semibold">Sarah Johnson</span>
                  <span className="block text-xs sm:text-sm">CEO, TechStaff Solutions</span>
                </cite>
              </div>
            </div>

            {/* Call to Action - Mobile Friendly Button */}
            <div className="text-center px-4 sm:px-0">
              <button
                onClick={handleGetQuote}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-base sm:text-lg font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
              >
                Get Your Staffing Insurance Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staffing;