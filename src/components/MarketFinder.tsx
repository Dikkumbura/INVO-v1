import React, { useState } from 'react';
import MarketAnalysis from './MarketAnalysis';
import PageHeader from './PageHeader';

interface MarketFilters {
  region: string;
  industry: string;
  marketSize: string;
  consumerSegment: string;
  timePeriod: string;
  marketMaturity: string;
}

const MarketFinder: React.FC = () => {
  const [filters, setFilters] = useState<MarketFilters>({
    region: '',
    industry: '',
    marketSize: '',
    consumerSegment: '',
    timePeriod: '',
    marketMaturity: ''
  });

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (Object.values(filters).every(value => value)) {
      setIsAnalyzing(true);
      
      // Disable form inputs during analysis
      const inputs = document.querySelectorAll('select');
      inputs.forEach(input => input.setAttribute('disabled', 'true'));

      // Show loading state for 1.5 seconds
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowAnalysis(true);
        
        // Re-enable form inputs
        inputs.forEach(input => input.removeAttribute('disabled'));
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Market Analysis"
          subtitle="Analyze market opportunities and get detailed insights"
        />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Geographic Region</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              >
                <option value="">Select Region</option>
                <option value="northeast">Northeast</option>
                <option value="southeast">Southeast</option>
                <option value="midwest">Midwest</option>
                <option value="southwest">Southwest</option>
                <option value="west">West</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Industry Sector</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.industry}
                onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Market Size</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.marketSize}
                onChange={(e) => setFilters(prev => ({ ...prev, marketSize: e.target.value }))}
              >
                <option value="">Select Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Consumer Segment</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.consumerSegment}
                onChange={(e) => setFilters(prev => ({ ...prev, consumerSegment: e.target.value }))}
              >
                <option value="">Select Segment</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time Period</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.timePeriod}
                onChange={(e) => setFilters(prev => ({ ...prev, timePeriod: e.target.value }))}
              >
                <option value="">Select Period</option>
                <option value="current">Current</option>
                <option value="1year">1-Year Forecast</option>
                <option value="5year">5-Year Forecast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Market Maturity</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring focus:ring-accent focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={filters.marketMaturity}
                onChange={(e) => setFilters(prev => ({ ...prev, marketMaturity: e.target.value }))}
              >
                <option value="">Select Maturity</option>
                <option value="emerging">Emerging</option>
                <option value="growing">Growing</option>
                <option value="mature">Mature</option>
              </select>
            </div>
          </div>

          <div className="mt-6 relative">
            <button
              onClick={handleAnalyze}
              disabled={!Object.values(filters).every(value => value) || isAnalyzing}
              className="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <span className={`transition-opacity duration-200 ${isAnalyzing ? 'opacity-0' : 'opacity-100'}`}>
                Generate Market Analysis
              </span>
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                  </div>
                  <span className="ml-3 text-white">Analyzing market data...</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Report */}
        <div className={`transition-opacity duration-300 ${showAnalysis ? 'opacity-100' : 'opacity-0'}`}>
          {showAnalysis && <MarketAnalysis {...filters} />}
        </div>
      </div>
    </div>
  );
};

export default MarketFinder;