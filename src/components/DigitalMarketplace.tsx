import React, { useState, useMemo } from 'react';
import { StarIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PageHeader from './PageHeader';

// Types
type ProductType = 'Cyber Liability' | 'Professional Liability' | 'General Liability' | 'D&O' | 'E&O';
type Industry = 'Technology' | 'Healthcare' | 'Finance' | 'Manufacturing' | 'Retail';
type CoverageLimit = '$1M' | '$2M' | '$5M+';

interface Product {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  coverageLimit: CoverageLimit;
  targetIndustries: Industry[];
  monthlyPremium: number;
  annualPremium: number;
  carrier: string;
  highlights: string[];
}

// Product Catalog
const products: Product[] = [
  {
    id: '1',
    name: 'TechGuard Cyber Protection',
    type: 'Cyber Liability',
    description: 'Comprehensive cyber protection for technology companies, including data breach coverage and cyber extortion.',
    coverageLimit: '$5M+',
    targetIndustries: ['Technology', 'Finance'],
    monthlyPremium: 750,
    annualPremium: 8500,
    carrier: 'CyberTech Insurance',
    highlights: ['Data Breach Response', 'Business Interruption', 'Cyber Extortion']
  },
  {
    id: '2',
    name: 'MedPro Shield',
    type: 'Professional Liability',
    description: 'Tailored professional liability coverage for healthcare providers.',
    coverageLimit: '$2M',
    targetIndustries: ['Healthcare'],
    monthlyPremium: 1200,
    annualPremium: 13500,
    carrier: 'HealthGuard Assurance',
    highlights: ['Malpractice Coverage', 'License Protection', 'Patient Data Security']
  },
  {
    id: '3',
    name: 'RetailGuard Plus',
    type: 'General Liability',
    description: 'Comprehensive general liability coverage for retail businesses.',
    coverageLimit: '$1M',
    targetIndustries: ['Retail'],
    monthlyPremium: 400,
    annualPremium: 4500,
    carrier: 'RetailSafe Insurance',
    highlights: ['Premises Liability', 'Products Liability', 'Personal Injury']
  },
  {
    id: '4',
    name: 'FinancePro D&O',
    type: 'D&O',
    description: 'Directors and Officers liability coverage for financial institutions.',
    coverageLimit: '$5M+',
    targetIndustries: ['Finance'],
    monthlyPremium: 2500,
    annualPremium: 28000,
    carrier: 'FinancialGuard Corp',
    highlights: ['Management Liability', 'Regulatory Defense', 'Shareholder Claims']
  },
  {
    id: '5',
    name: 'TechPro E&O',
    type: 'E&O',
    description: 'Errors and Omissions coverage for technology service providers.',
    coverageLimit: '$2M',
    targetIndustries: ['Technology'],
    monthlyPremium: 900,
    annualPremium: 10000,
    carrier: 'TechSure Insurance',
    highlights: ['Professional Services', 'Project Delays', 'Implementation Errors']
  },
  {
    id: '6',
    name: 'ManufacturingGuard GL',
    type: 'General Liability',
    description: 'Specialized general liability coverage for manufacturing operations.',
    coverageLimit: '$5M+',
    targetIndustries: ['Manufacturing'],
    monthlyPremium: 1800,
    annualPremium: 20000,
    carrier: 'IndustryPro Insurance',
    highlights: ['Products Liability', 'Premises Operations', 'Completed Operations']
  },
  {
    id: '7',
    name: 'HealthTech Cyber',
    type: 'Cyber Liability',
    description: 'Cyber liability protection for healthcare technology providers.',
    coverageLimit: '$2M',
    targetIndustries: ['Healthcare', 'Technology'],
    monthlyPremium: 850,
    annualPremium: 9500,
    carrier: 'MedTech Assurance',
    highlights: ['HIPAA Compliance', 'Patient Data Protection', 'Ransomware Coverage']
  },
  {
    id: '8',
    name: 'RetailPro E&O',
    type: 'E&O',
    description: 'E&O coverage for retail service providers and consultants.',
    coverageLimit: '$1M',
    targetIndustries: ['Retail'],
    monthlyPremium: 600,
    annualPremium: 6500,
    carrier: 'RetailGuard Insurance',
    highlights: ['Consulting Services', 'Implementation Services', 'Training Programs']
  },
  {
    id: '9',
    name: 'FinTech Shield',
    type: 'Professional Liability',
    description: 'Professional liability coverage for fintech companies.',
    coverageLimit: '$5M+',
    targetIndustries: ['Finance', 'Technology'],
    monthlyPremium: 1500,
    annualPremium: 16500,
    carrier: 'FinTech Assurance',
    highlights: ['Technology Services', 'Financial Advisory', 'Payment Processing']
  },
  {
    id: '10',
    name: 'MedStaff Pro',
    type: 'Professional Liability',
    description: 'Professional liability coverage for healthcare staffing firms.',
    coverageLimit: '$2M',
    targetIndustries: ['Healthcare'],
    monthlyPremium: 1100,
    annualPremium: 12000,
    carrier: 'HealthStaff Insurance',
    highlights: ['Staffing Services', 'Credentialing', 'Professional Liability']
  },
  {
    id: '11',
    name: 'TechBoard D&O',
    type: 'D&O',
    description: 'D&O coverage for technology company boards.',
    coverageLimit: '$5M+',
    targetIndustries: ['Technology'],
    monthlyPremium: 2000,
    annualPremium: 22000,
    carrier: 'TechBoard Assurance',
    highlights: ['Board Protection', 'IPO Coverage', 'M&A Coverage']
  },
  {
    id: '12',
    name: 'ManufacturingPro E&O',
    type: 'E&O',
    description: 'E&O coverage for manufacturing consultants and service providers.',
    coverageLimit: '$2M',
    targetIndustries: ['Manufacturing'],
    monthlyPremium: 950,
    annualPremium: 10500,
    carrier: 'ManufacturingGuard Corp',
    highlights: ['Process Consulting', 'Quality Control', 'Supply Chain Management']
  },
  {
    id: '13',
    name: 'RetailCyber Plus',
    type: 'Cyber Liability',
    description: 'Cyber protection for retail operations and e-commerce.',
    coverageLimit: '$2M',
    targetIndustries: ['Retail'],
    monthlyPremium: 700,
    annualPremium: 7800,
    carrier: 'RetailCyber Insurance',
    highlights: ['E-commerce Protection', 'PCI Compliance', 'Customer Data Security']
  },
  {
    id: '14',
    name: 'FinPro GL',
    type: 'General Liability',
    description: 'General liability coverage for financial institutions.',
    coverageLimit: '$5M+',
    targetIndustries: ['Finance'],
    monthlyPremium: 1600,
    annualPremium: 17500,
    carrier: 'FinancialGuard Corp',
    highlights: ['Premises Liability', 'Client Injury', 'Property Damage']
  },
  {
    id: '15',
    name: 'HealthTech D&O',
    type: 'D&O',
    description: 'D&O coverage for healthcare technology companies.',
    coverageLimit: '$5M+',
    targetIndustries: ['Healthcare', 'Technology'],
    monthlyPremium: 2200,
    annualPremium: 24000,
    carrier: 'MedTech Assurance',
    highlights: ['Regulatory Compliance', 'Investment Protection', 'Management Liability']
  }
];

const DigitalMarketplace: React.FC = () => {
  const [filters, setFilters] = useState({
    productType: '',
    industry: '',
    coverageLimit: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesType = !filters.productType || product.type === filters.productType;
      const matchesIndustry = !filters.industry || product.targetIndustries.includes(filters.industry as Industry);
      const matchesLimit = !filters.coverageLimit || product.coverageLimit === filters.coverageLimit;
      return matchesType && matchesIndustry && matchesLimit;
    });
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Insurance Products Marketplace"
          subtitle={`Browse and compare insurance products from leading carriers. Last updated: ${format(new Date(), 'MMMM d, yyyy')}`}
        />

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
                value={filters.productType}
                onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="Cyber Liability">Cyber Liability</option>
                <option value="Professional Liability">Professional Liability</option>
                <option value="General Liability">General Liability</option>
                <option value="D&O">D&O</option>
                <option value="E&O">E&O</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
                value={filters.industry}
                onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Coverage Limit</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50"
                value={filters.coverageLimit}
                onChange={(e) => setFilters(prev => ({ ...prev, coverageLimit: e.target.value }))}
              >
                <option value="">All Limits</option>
                <option value="$1M">$1M</option>
                <option value="$2M">$2M</option>
                <option value="$5M+">$5M+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-accent">{product.type}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.coverageLimit}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Monthly Premium</span>
                    <span className="font-medium">{formatCurrency(product.monthlyPremium)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Annual Premium</span>
                    <span className="font-medium">{formatCurrency(product.annualPremium)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Carrier</span>
                    <span className="font-medium">{product.carrier}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Target Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.targetIndustries.map((industry) => (
                      <span
                        key={industry}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    className="flex-1 bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 transition-colors"
                  >
                    Get Quote
                  </button>
                  <button
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products match your selected filters.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            All rates and coverage details are subject to change without notice.
            Please contact the carrier directly for the most up-to-date information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalMarketplace;