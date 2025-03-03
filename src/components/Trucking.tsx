import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  CheckBadgeIcon, 
  StarIcon,
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';

const truckingInsuranceOfferings = [
  {
    id: 1,
    title: "Commercial Auto Liability",
    icon: TruckIcon,
    description: "Essential coverage for your fleet operations and drivers",
    benefits: [
      "Primary liability coverage",
      "Physical damage protection",
      "Non-owned auto coverage",
      "Hired auto coverage"
    ]
  },
  {
    id: 2,
    title: "Cargo Insurance",
    icon: ShieldExclamationIcon,
    description: "Protection for goods in transit and storage",
    benefits: [
      "All-risk coverage options",
      "Temperature control failure",
      "Loading/unloading coverage",
      "Broad theft protection"
    ]
  },
  {
    id: 3,
    title: "General Liability",
    icon: ClipboardDocumentCheckIcon,
    description: "Comprehensive business liability protection",
    benefits: [
      "Premises liability",
      "Products liability",
      "Completed operations",
      "Personal injury coverage"
    ]
  }
];

const Trucking: React.FC = () => {
  const navigate = useNavigate();

  const handleGetQuote = () => {
    navigate('/quote');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Trucking Insurance"
          subtitle="Comprehensive insurance solutions for the transportation industry"
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-8">
            {/* Hero Section - Mobile Optimized */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Specialized Trucking Insurance Solutions
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
                Comprehensive coverage options designed to protect your fleet, drivers, and cargo while keeping your business moving forward.
              </p>
            </div>

            {/* Trust Indicators - Mobile Responsive Grid */}
            <div className="grid grid-cols-1 sm:flex sm:justify-center sm:items-center gap-4 sm:space-x-8 mb-6 sm:mb-8">
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">25+ Years in Transportation Insurance</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <CheckBadgeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">DOT Compliance Expertise</span>
              </div>
              <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-0 rounded-lg sm:rounded-none">
                <StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-accent mr-2" />
                <span className="text-sm sm:text-base text-gray-700">24/7 Claims Support</span>
              </div>
            </div>

            {/* Insurance Offerings Grid - Responsive Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
              {truckingInsuranceOfferings.map((offering) => (
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
                  "INVO Underwriting understands the unique challenges of the trucking industry. Their comprehensive coverage and responsive service have been essential to our fleet's success."
                </blockquote>
                <cite className="text-gray-600 block">
                  <span className="font-semibold">Michael Rodriguez</span>
                  <span className="block text-xs sm:text-sm">Owner, Rodriguez Trucking LLC</span>
                </cite>
              </div>
            </div>

            {/* Call to Action - Mobile Friendly Button */}
            <div className="text-center px-4 sm:px-0">
              <button
                onClick={handleGetQuote}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-base sm:text-lg font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
              >
                Get Your Trucking Insurance Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trucking;