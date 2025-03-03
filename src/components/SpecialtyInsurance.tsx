import React from 'react';
import { 
  ShieldCheckIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';
import { Link } from 'react-router-dom';

interface InsuranceProduct {
  id: string;
  title: string;
  description: string;
  coverageHighlights: string[];
  idealFor: string[];
  icon: React.ForwardRefExoticComponent<any>;
}

const specialtyProducts: InsuranceProduct[] = [
  {
    id: 'environmental',
    title: 'Environmental Insurance',
    description: 'Comprehensive coverage for environmental risks and liabilities, including pollution cleanup, regulatory compliance, and third-party claims.',
    coverageHighlights: [
      'Pollution Legal Liability',
      'Contractor\'s Environmental Liability',
      'Storage Tank Coverage',
      'Remediation Cost Cap',
      'Environmental Professional Liability'
    ],
    idealFor: [
      'Manufacturing Facilities',
      'Chemical Companies',
      'Real Estate Developers',
      'Construction Companies',
      'Energy Providers'
    ],
    icon: ShieldCheckIcon
  },
  {
    id: 'management-liability',
    title: 'Management Liability',
    description: 'Protection for directors, officers, and organizations against claims related to management decisions and corporate governance.',
    coverageHighlights: [
      'Directors & Officers Liability',
      'Employment Practices Liability',
      'Fiduciary Liability',
      'Crime Insurance',
      'Cyber Liability'
    ],
    idealFor: [
      'Public Companies',
      'Private Companies',
      'Non-Profit Organizations',
      'Financial Institutions',
      'Healthcare Organizations'
    ],
    icon: BuildingOfficeIcon
  },
  {
    id: 'professional-liability',
    title: 'Professional Liability',
    description: 'Specialized coverage for professionals against claims of negligence or failure to perform professional duties.',
    coverageHighlights: [
      'Errors & Omissions Coverage',
      'Malpractice Insurance',
      'Technology E&O',
      'Media Liability',
      'Professional Services Coverage'
    ],
    idealFor: [
      'Technology Companies',
      'Healthcare Providers',
      'Consultants',
      'Architects & Engineers',
      'Legal Professionals'
    ],
    icon: DocumentCheckIcon
  }
];

const SpecialtyInsurance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Specialty Insurance Solutions"
          subtitle="Tailored coverage options for unique and complex risks"
        />

        {/* Introduction Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Protecting Your Business Against Specialized Risks
            </h2>
            <p className="text-gray-600 mb-4">
              Our specialty insurance solutions are designed to address complex risks that standard insurance policies may not cover. We work with leading carriers to provide comprehensive coverage tailored to your industry's unique challenges.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                to="/quote"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                Get a Quote
              </Link>
              <Link
                to="/market-finder"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                Find Markets
              </Link>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {specialtyProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <product.icon className="h-6 w-6 text-accent" />
                  <h3 className="ml-2 text-lg font-semibold text-gray-900">{product.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage Highlights</h4>
                  <ul className="space-y-2">
                    {product.coverageHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Ideal For</h4>
                  <ul className="space-y-1">
                    {product.idealFor.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/quote?type=${product.id}`}
                    className="inline-flex items-center text-accent hover:text-accent/90 text-sm font-medium"
                  >
                    Learn More
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Choose Our Specialty Insurance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-6 w-6 text-accent mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Customized Coverage</h3>
                <p className="text-sm text-gray-600">Tailored solutions designed specifically for your industry and risk profile.</p>
              </div>
            </div>
            <div className="flex items-start">
              <CurrencyDollarIcon className="h-6 w-6 text-accent mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Competitive Pricing</h3>
                <p className="text-sm text-gray-600">Access to multiple markets ensures the best coverage at competitive rates.</p>
              </div>
            </div>
            <div className="flex items-start">
              <BuildingOfficeIcon className="h-6 w-6 text-accent mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Expert Support</h3>
                <p className="text-sm text-gray-600">Dedicated team of specialists with deep industry knowledge.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Information?</h2>
            <p className="text-gray-600 mb-6">
              Our specialty insurance experts are ready to help you understand your coverage options and find the right solution for your business.
            </p>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                Contact an Expert
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                Download Brochure
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            Coverage availability and terms vary by jurisdiction and are subject to underwriting review.
            Please consult with your insurance professional for specific coverage details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyInsurance;