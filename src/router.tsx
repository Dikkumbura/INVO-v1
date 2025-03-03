import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PolicySubmission from './components/PolicySubmission';
import ClaimTracking from './components/ClaimTracking';
import ProfileCompletion from './components/ProfileCompletion';
import ProfilePage from './components/ProfilePage';
import DigitalMarketplace from './components/DigitalMarketplace';
import Staffing from './components/Staffing';
import Trucking from './components/Trucking';
import InsuranceCarriers from './components/InsuranceCarriers';
import SavedQuotes from './components/SavedQuotes';
import QuoteForm from './components/QuoteForm';
import QuoteDetails from './components/QuoteDetails';
import SpecialtyInsurance from './components/SpecialtyInsurance';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import PolicyPayment from './components/PolicyPayment';
import PolicySubmissionEnhanced from './components/PolicySubmissionEnhanced';
import FileClaimPage from './components/FileClaimPage';

// Protected route component
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? element : <Navigate to="/login" />;
};

// Default landing route component
const DefaultRoute = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

// Wrap child elements with ErrorBoundary
const withErrorBoundary = (element: React.ReactNode) => {
  return <ErrorBoundary>{element}</ErrorBoundary>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <DefaultRoute />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/dashboard',
        element: withErrorBoundary(<ProtectedRoute element={<Dashboard />} />),
      },
      {
        path: '/policy-submission',
        element: withErrorBoundary(<ProtectedRoute element={<PolicySubmission />} />),
      },
      {
        path: '/policy-submission-enhanced',
        element: withErrorBoundary(<ProtectedRoute element={<PolicySubmissionEnhanced />} />),
      },
      {
        path: '/claim-tracking',
        element: withErrorBoundary(<ProtectedRoute element={<ClaimTracking />} />),
      },
      {
        path: '/profile-completion',
        element: withErrorBoundary(<ProtectedRoute element={<ProfileCompletion />} />),
      },
      {
        path: '/profile',
        element: withErrorBoundary(<ProtectedRoute element={<ProfilePage />} />),
      },
      {
        path: '/marketplace',
        element: withErrorBoundary(<ProtectedRoute element={<DigitalMarketplace />} />),
      },
      {
        path: '/staffing',
        element: withErrorBoundary(<ProtectedRoute element={<Staffing />} />),
      },
      {
        path: '/trucking',
        element: withErrorBoundary(<ProtectedRoute element={<Trucking />} />),
      },
      {
        path: '/carriers',
        element: withErrorBoundary(<ProtectedRoute element={<InsuranceCarriers />} />),
      },
      {
        path: '/saved-quotes',
        element: withErrorBoundary(<ProtectedRoute element={<SavedQuotes />} />),
      },
      {
        path: '/quote',
        element: withErrorBoundary(<ProtectedRoute element={<QuoteForm />} />),
      },
      {
        path: '/quote/:quoteId',
        element: withErrorBoundary(<ProtectedRoute element={<QuoteDetails />} />),
      },
      {
        path: '/specialty',
        element: withErrorBoundary(<ProtectedRoute element={<SpecialtyInsurance />} />),
      },
      {
        path: '/policy-payment/:quoteId',
        element: withErrorBoundary(<ProtectedRoute element={<PolicyPayment />} />),
      },
      {
        path: '/file-claim',
        element: withErrorBoundary(<ProtectedRoute element={<FileClaimPage />} />),
      },
      {
        path: '*',
        element: <NotFound />,
      }
    ],
  },
]);

export default router; 