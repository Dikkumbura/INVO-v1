import React, { useState } from 'react';
import { ClipboardDocumentCheckIcon, MagnifyingGlassIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';
import { useClaims } from '../context/ClaimContext';
import { useNavigate } from 'react-router-dom';

const ClaimTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const { claims } = useClaims();
  const navigate = useNavigate();

  // Filter claims based on search term
  const filteredClaims = claims.filter(claim => 
    claim.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format claim type for display
  const formatClaimType = (type: string): string => {
    const types: Record<string, string> = {
      'property': 'Property Damage',
      'liability': 'Liability',
      'workers_comp': 'Workers\' Compensation',
      'auto': 'Auto',
      'professional': 'Professional Liability',
      'cyber': 'Cyber Incident'
    };
    
    return types[type] || type;
  };

  // Format claim status for display
  const formatClaimStatus = (status: string): string => {
    const statuses: Record<string, string> = {
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'additional_info': 'Additional Info Required',
      'approved': 'Approved',
      'denied': 'Denied',
      'paid': 'Paid'
    };
    
    return statuses[status] || status;
  };

  // Handle claim selection
  const handleClaimSelect = (referenceNumber: string) => {
    setSelectedClaim(referenceNumber === selectedClaim ? null : referenceNumber);
  };

  // Render claim status badge
  const renderStatusBadge = (status: string) => {
    let colorClass = '';
    const displayStatus = formatClaimStatus(status);
    
    switch (status) {
      case 'approved':
      case 'paid':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'under_review':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'additional_info':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'denied':
        colorClass = 'bg-red-100 text-red-800';
        break;
      case 'submitted':
        colorClass = 'bg-purple-100 text-purple-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {displayStatus}
      </span>
    );
  };

  // Render payment status badge
  const renderPaymentBadge = (status: string) => {
    let colorClass;
    
    switch (status) {
      case 'paid':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'processing':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'failed':
        colorClass = 'bg-red-100 text-red-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Navigate to file claim page
  const goToFileClaim = () => {
    navigate('/file-claim');
  };

  // Get details of selected claim
  const selectedClaimDetails = selectedClaim ? claims.find(claim => claim.referenceNumber === selectedClaim) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Claim Tracking"
        subtitle="View and track your insurance claims"
        showBackButton={true}
        icon={<ClipboardDocumentCheckIcon className="h-8 w-8 text-accent" />}
      />
      
      <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-accent focus:border-accent block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by claim #, policy #, type, or status"
            />
          </div>
        </div>
        
        {/* Claims table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.length > 0 ? (
                filteredClaims.map((claim) => (
                  <tr 
                    key={claim.referenceNumber} 
                    onClick={() => handleClaimSelect(claim.referenceNumber)}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedClaim === claim.referenceNumber ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent">
                      {claim.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatClaimType(claim.claimType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(claim.dateSubmitted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${claim.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPaymentBadge(claim.paymentStatus)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No claims found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Claim details */}
      {selectedClaimDetails && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Claim Details
            </h3>
            <div>
              {renderStatusBadge(selectedClaimDetails.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Claim Reference Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClaimDetails.referenceNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClaimDetails.policyNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Claim Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatClaimType(selectedClaimDetails.claimType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date Submitted</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedClaimDetails.dateSubmitted)}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Claim Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900">${selectedClaimDetails.amount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1">{renderPaymentBadge(selectedClaimDetails.paymentStatus)}</dd>
                </div>
                {selectedClaimDetails.paymentDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedClaimDetails.paymentDate)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Next Steps</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedClaimDetails.status === 'approved' && selectedClaimDetails.paymentStatus === 'paid'
                      ? 'Your claim has been approved and payment has been issued.'
                      : selectedClaimDetails.status === 'under_review'
                      ? 'Your claim is currently under review by our claims team. You will be notified once a decision is made.'
                      : selectedClaimDetails.status === 'additional_info'
                      ? 'We need additional information to process your claim. Please contact our claims department.'
                      : 'Please contact our claims department for more information.'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Download Details
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              Contact Claims Adjuster
            </button>
          </div>
        </div>
      )}
      
      {/* No claims message */}
      {filteredClaims.length === 0 && (
        <div className="mt-6 text-center py-12 bg-white rounded-lg shadow-sm">
          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Claims Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            We couldn't find any claims matching your search criteria. Try adjusting your search or file a new claim.
          </p>
          <div className="mt-6">
            <button
              onClick={goToFileClaim}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              File a New Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimTracking; 