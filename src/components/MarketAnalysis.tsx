import React, { useState, useEffect } from 'react';
import { ChartBarIcon, UserGroupIcon, BuildingOfficeIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface MarketAnalysisProps {
  region: string;
  industry: string;
  marketSize: string;
  consumerSegment: string;
  timePeriod: string;
  marketMaturity: string;
}

interface MarketMetrics {
  marketSize: number;
  growthRate: number;
  marketShare: {
    company: string;
    share: number;
  }[];
  consumerMetrics: {
    averageAge: number;
    purchaseFrequency: string;
    customerLifetime: number;
    satisfaction: number;
  };
  competitiveMetrics: {
    totalCompetitors: number;
    marketConcentration: number;
    newEntrants: number;
    exitRate: number;
  };
  riskMetrics: {
    regulatoryRisk: number;
    economicRisk: number;
    competitiveRisk: number;
    overallRisk: number;
  };
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({
  region,
  industry,
  marketSize,
  consumerSegment,
  timePeriod,
  marketMaturity
}) => {
  const [metrics, setMetrics] = useState<MarketMetrics>({
    marketSize: 0,
    growthRate: 0,
    marketShare: [],
    consumerMetrics: {
      averageAge: 0,
      purchaseFrequency: '',
      customerLifetime: 0,
      satisfaction: 0
    },
    competitiveMetrics: {
      totalCompetitors: 0,
      marketConcentration: 0,
      newEntrants: 0,
      exitRate: 0
    },
    riskMetrics: {
      regulatoryRisk: 0,
      economicRisk: 0,
      competitiveRisk: 0,
      overallRisk: 0
    }
  });

  useEffect(() => {
    // Simulate API call to get market metrics
    const generateMetrics = () => {
      const baseMarketSize = marketSize === 'large' ? 1000000000 : marketSize === 'medium' ? 100000000 : 10000000;
      const growthMultiplier = marketMaturity === 'emerging' ? 0.25 : marketMaturity === 'growing' ? 0.15 : 0.05;
      
      setMetrics({
        marketSize: baseMarketSize,
        growthRate: growthMultiplier * 100,
        marketShare: [
          { company: 'Market Leader A', share: 28 },
          { company: 'Competitor B', share: 22 },
          { company: 'Competitor C', share: 15 },
          { company: 'Competitor D', share: 12 },
          { company: 'Others', share: 23 }
        ],
        consumerMetrics: {
          averageAge: consumerSegment === 'B2B' ? 42 : 35,
          purchaseFrequency: consumerSegment === 'B2B' ? 'Quarterly' : 'Monthly',
          customerLifetime: consumerSegment === 'B2B' ? 5.2 : 3.8,
          satisfaction: 8.2
        },
        competitiveMetrics: {
          totalCompetitors: marketMaturity === 'emerging' ? 15 : marketMaturity === 'growing' ? 25 : 35,
          marketConcentration: marketMaturity === 'mature' ? 0.75 : 0.45,
          newEntrants: marketMaturity === 'emerging' ? 8 : marketMaturity === 'growing' ? 5 : 2,
          exitRate: marketMaturity === 'mature' ? 0.12 : 0.08
        },
        riskMetrics: {
          regulatoryRisk: industry === 'Finance' || industry === 'Healthcare' ? 0.8 : 0.4,
          economicRisk: 0.6,
          competitiveRisk: marketMaturity === 'emerging' ? 0.7 : 0.5,
          overallRisk: 0.6
        }
      });
    };

    generateMetrics();
  }, [region, industry, marketSize, consumerSegment, timePeriod, marketMaturity]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 0.7) return { label: 'High', color: 'text-red-600' };
    if (risk >= 0.4) return { label: 'Moderate', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-accent mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Market Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Market Size</dt>
                <dd className="text-sm font-medium">{formatCurrency(metrics.marketSize)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Growth Rate</dt>
                <dd className="text-sm font-medium">{formatPercentage(metrics.growthRate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Market Stage</dt>
                <dd className="text-sm font-medium capitalize">{marketMaturity}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Market Share Distribution</h3>
            <div className="space-y-2">
              {metrics.marketShare.map((company) => (
                <div key={company.company} className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-accent rounded-full"
                        style={{ width: `${company.share}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-2 flex justify-between items-center w-32">
                    <span className="text-xs text-gray-600">{company.company}</span>
                    <span className="text-xs font-medium">{company.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consumer Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <UserGroupIcon className="h-6 w-6 text-accent mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Consumer Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demographics & Behavior</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Average Age</dt>
                <dd className="text-sm font-medium">{metrics.consumerMetrics.averageAge} years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Purchase Frequency</dt>
                <dd className="text-sm font-medium">{metrics.consumerMetrics.purchaseFrequency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Customer Lifetime</dt>
                <dd className="text-sm font-medium">{metrics.consumerMetrics.customerLifetime} years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Satisfaction Score</dt>
                <dd className="text-sm font-medium">{metrics.consumerMetrics.satisfaction}/10</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Key Trends</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Increasing demand for digital solutions</li>
              <li>• Growing focus on sustainability</li>
              <li>• Shift towards subscription-based models</li>
              <li>• Rising importance of personalization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Competitive Landscape */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <BuildingOfficeIcon className="h-6 w-6 text-accent mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Competitive Landscape</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Competition Metrics</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total Competitors</dt>
                <dd className="text-sm font-medium">{metrics.competitiveMetrics.totalCompetitors}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Market Concentration</dt>
                <dd className="text-sm font-medium">{formatPercentage(metrics.competitiveMetrics.marketConcentration * 100)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">New Entrants (Annual)</dt>
                <dd className="text-sm font-medium">{metrics.competitiveMetrics.newEntrants}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Exit Rate</dt>
                <dd className="text-sm font-medium">{formatPercentage(metrics.competitiveMetrics.exitRate * 100)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Competitive Advantages</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Strong brand recognition</li>
              <li>• Advanced technology infrastructure</li>
              <li>• Established distribution networks</li>
              <li>• Strategic partnerships</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-accent mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Levels</h3>
            <dl className="space-y-2">
              {Object.entries(metrics.riskMetrics).map(([key, value]) => {
                const { label, color } = getRiskLevel(value);
                return (
                  <div key={key} className="flex justify-between items-center">
                    <dt className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className={`text-sm font-medium ${color}`}>{label}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Key Risk Factors</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Regulatory compliance requirements</li>
              <li>• Economic volatility</li>
              <li>• Competitive pressure</li>
              <li>• Technology disruption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Market Entry Strategy</h3>
            <p className="text-sm text-gray-600">
              Consider a phased market entry approach, focusing initially on {region}'s key metropolitan areas.
              Partner with established distributors to leverage existing networks.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Competitive Positioning</h3>
            <p className="text-sm text-gray-600">
              Differentiate through superior technology integration and customer service.
              Focus on building strong relationships with key {consumerSegment} customers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Risk Mitigation</h3>
            <p className="text-sm text-gray-600">
              Implement robust compliance monitoring systems.
              Maintain flexible operations to adapt to market changes.
              Develop contingency plans for identified risks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;