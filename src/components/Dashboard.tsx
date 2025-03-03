import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  DocumentTextIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
  UserGroupIcon,
  BoltIcon,
  CalendarIcon,
  CheckCircleIcon,
  PhoneIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import LoadingScreen from './LoadingScreen';
import NotificationPopup from './NotificationPopup';
import { useAuth } from '../context/AuthContext';
import PageHeader from './PageHeader';

// Mock data for active policies
const activePolicies = [
  {
    id: 'POL-001',
    client: 'TechStaff Solutions',
    type: "Workers' Compensation",
    premium: 125000,
    expiresAt: '2025-06-15',
    status: 'Active'
  },
  {
    id: 'POL-002',
    client: 'Rodriguez Trucking LLC',
    type: 'Commercial Auto',
    premium: 85000,
    expiresAt: '2025-04-30',
    status: 'Active'
  },
  {
    id: 'POL-003',
    client: 'MedStaff Pro',
    type: 'Professional Liability',
    premium: 95000,
    expiresAt: '2025-05-20',
    status: 'Renewal Due'
  }
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 'ACT-001',
    type: 'Quote Generated',
    client: 'FastTrack Logistics',
    description: 'Commercial Auto Insurance Quote',
    timestamp: '2025-02-25T14:30:00Z'
  },
  {
    id: 'ACT-002',
    type: 'Policy Renewed',
    client: 'HealthStaff Direct',
    description: "Workers' Compensation Policy",
    timestamp: '2025-02-24T16:45:00Z'
  },
  {
    id: 'ACT-003',
    type: 'Claim Filed',
    client: 'TechStaff Solutions',
    description: 'Professional Liability Claim',
    timestamp: '2025-02-24T10:15:00Z'
  },
  {
    id: 'ACT-004',
    type: 'Payment Received',
    client: 'Rodriguez Trucking LLC',
    description: 'Premium Payment - Commercial Auto',
    timestamp: '2025-02-23T09:30:00Z'
  }
];

// Performance metrics data
const performanceMetrics = {
  totalPremium: 2500000,
  growthRate: 18.5,
  retentionRate: 92,
  averagePremium: 75000,
  newBusinessCount: 28,
  quotesToBindRatio: 0.38
};

// Mock data for agent-specific information
const agentInfo = {
  name: "Stephen Belote",
  role: "Senior Underwriter",
  territory: "Northeast Region",
  specialties: ["Workers' Comp", "Commercial Auto", "Professional Liability"],
  currentGoalProgress: 85,
  yearlyGoal: 3000000,
  upcomingRenewals: 12
};

// Mock data for market updates
const marketUpdates = [
  {
    id: 1,
    category: "Rate Changes",
    title: "Workers' Comp Rates Decreasing in Northeast",
    impact: "positive",
    description: "Expected 5-10% decrease in Q2 2025"
  },
  {
    id: 2,
    category: "New Market",
    title: "New Cyber Liability Market Opening",
    impact: "opportunity",
    description: "Competitive rates for tech companies"
  },
  {
    id: 3,
    category: "Regulatory",
    title: "Updated Compliance Requirements",
    impact: "neutral",
    description: "New guidelines effective April 1st"
  }
];

// Mock data for opportunities
const opportunities = [
  {
    id: 1,
    client: "Global Tech Solutions",
    type: "New Business",
    premium: 250000,
    probability: 75,
    nextStep: "Schedule Follow-up",
    dueDate: "2025-03-15"
  },
  {
    id: 2,
    client: "Metro Healthcare Group",
    type: "Cross-sell",
    premium: 180000,
    probability: 60,
    nextStep: "Quote Presentation",
    dueDate: "2025-03-10"
  },
  {
    id: 3,
    client: "East Coast Logistics",
    type: "Renewal Upsell",
    premium: 320000,
    probability: 85,
    nextStep: "Policy Review",
    dueDate: "2025-03-20"
  }
];

// Mock data for notifications
const notifications = [
  {
    id: 1,
    type: "urgent",
    title: "Renewal Action Required",
    message: "TechStaff Solutions policy expires in 30 days",
    timestamp: "1 hour ago"
  },
  {
    id: 2,
    type: "alert",
    title: "New Market Alert",
    message: "Special rates available for technology companies",
    timestamp: "2 hours ago"
  },
  {
    id: 3,
    type: "info",
    title: "Training Available",
    message: "New cyber liability product training session",
    timestamp: "3 hours ago"
  }
];

// Add mock data for tasks
const tasks = [
  {
    id: 1,
    title: "Review TechStaff Solutions Renewal",
    priority: "high",
    dueDate: "2025-03-10",
    type: "renewal",
    status: "pending"
  },
  {
    id: 2,
    title: "Complete Cyber Liability Training",
    priority: "medium",
    dueDate: "2025-03-15",
    type: "training",
    status: "in-progress"
  },
  {
    id: 3,
    title: "Follow up with Metro Healthcare",
    priority: "high",
    dueDate: "2025-03-08",
    type: "follow-up",
    status: "pending"
  },
  {
    id: 4,
    title: "Submit Global Tech Solutions Quote",
    priority: "medium",
    dueDate: "2025-03-12",
    type: "quote",
    status: "draft"
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format role type
const formatRoleType = (roleId: string): string => {
  const roles: Record<string, string> = {
    'agent': 'Insurance Agent',
    'underwriter': 'Underwriter',
    'senior_underwriter': 'Senior Underwriter',
    'broker': 'Insurance Broker',
    'mgaStaff': 'MGA Staff',
    'other': 'Insurance Professional'
  };
  return roles[roleId] || 'Insurance Professional';
};

// Helper function to format specialty
const formatSpecialty = (specialty: string): string => {
  const specialties: Record<string, string> = {
    // Product specialties
    'workers_comp': 'Workers\' Compensation',
    'commercial_auto': 'Commercial Auto Insurance',
    'professional_liability': 'Professional Liability',
    'cyber': 'Cyber Insurance',
    'general_liability': 'General Liability',
    'property': 'Property Insurance',
    
    // Regional specialties
    'northeast': 'Northeast Region',
    'southeast': 'Southeast Region',
    'midwest': 'Midwest Region',
    'west': 'Western Region',
    'southwest': 'Southwest Region',
  };
  return specialties[specialty] || specialty || 'All Regions';
};

type QuickAction = {
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
  href?: string;
  action?: () => void;
  isNew?: boolean;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { currentUser, userProfileData } = useAuth();

  // Function to get user's first name
  const getFirstName = (displayName: string | null): string => {
    if (!displayName) return 'User';
    return displayName.split(' ')[0]; // Extract first name by splitting on space
  };

  // Get user information
  const firstName = getFirstName(currentUser?.displayName || null);
  
  // Only use agentInfo as a last resort, not as a default fallback
  const userRole = userProfileData?.roleType 
    ? formatRoleType(userProfileData.roleType) 
    : (currentUser ? 'User' : 'Insurance Professional');
    
  const userTerritory = userProfileData?.specialty 
    ? formatSpecialty(userProfileData.specialty) 
    : (currentUser ? 'All Regions' : 'Northeast Region');

  const handleGetQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/quote');
    }, 1000);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const quickActions: QuickAction[] = [
    { name: 'Get an Instant Quote', action: handleGetQuote, icon: DocumentTextIcon },
    { name: 'Policy Submission', href: '/policy-submission-enhanced', icon: ArrowPathIcon },
    { name: 'Specialty Insurance', href: '/specialty', icon: BellIcon },
    { name: 'File a claim', href: '/file-claim', icon: ShieldExclamationIcon },
  ];

  // Type-safe notifications with specific type values
  const typedNotifications = notifications.map(notification => ({
    ...notification,
    type: notification.type === 'urgent' || notification.type === 'alert' || notification.type === 'info' 
      ? notification.type 
      : 'info' as 'urgent' | 'alert' | 'info'
  }));

  return (
    <>
      <div className="relative">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {isLoading && <LoadingScreen />}
          
          {/* Agent Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <PageHeader
                title={`Welcome back, ${firstName}`}
                subtitle={`${userRole} • ${userTerritory}`}
                showBackButton={false}
              />
              <div className="flex items-center space-x-4">
                {/* Enhanced Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={handleNotificationsToggle}
                    className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none group"
                    aria-label="View notifications"
                  >
                    <div className="absolute -inset-1 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors duration-300" />
                    <BellIcon className="h-6 w-6 relative animate-[wiggle_1s_ease-in-out_infinite]" />
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </button>
                  
                  {/* Position the notification popup inside the notification bell container */}
                  {isNotificationsOpen && (
                    <NotificationPopup 
                      notifications={typedNotifications}
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Goal Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Yearly Goal Progress</span>
                <span className="text-sm font-medium text-accent">{formatCurrency(2500000)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-accent h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${75}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                75% achieved • 8 renewals pending
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Premium</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(performanceMetrics.totalPremium)}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600">↑ {formatPercentage(performanceMetrics.growthRate)} growth</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Retention Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(performanceMetrics.retentionRate)}</p>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">{performanceMetrics.newBusinessCount} new businesses</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Quote to Bind Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPercentage(performanceMetrics.quotesToBindRatio * 100)}</p>
                  </div>
                  <ShieldCheckIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Industry avg: 32%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <div
                key={action.name}
                className={`relative bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer ${
                  action.isNew ? 'animate-pulse-subtle' : ''
                }`}
                onClick={action.action}
              >
                {action.href ? (
                  <Link to={action.href} className="block p-5">
                    <action.icon className={`h-6 w-6 mb-2 ${action.isNew ? 'text-accent animate-glow' : 'text-accent'}`} />
                    <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                    {action.isNew && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="p-5">
                    <action.icon className={`h-6 w-6 mb-2 ${action.isNew ? 'text-accent animate-glow' : 'text-accent'}`} />
                    <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                    {action.isNew && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Opportunities and Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Hot Opportunities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Hot Opportunities</h2>
                <Link 
                  to="/opportunities"
                  className="text-accent hover:text-accent/90 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center">
                        <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-gray-900">{opportunity.client}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {opportunity.type} • {formatCurrency(opportunity.premium)} potential
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-accent">
                        {opportunity.probability}% probability
                      </div>
                      <div className="text-sm text-gray-500">
                        Due {formatDate(opportunity.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks & Reminders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tasks & Reminders</h2>
                <button className="text-accent hover:text-accent/90 text-sm font-medium">
                  Add Task
                </button>
              </div>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {task.type === 'renewal' && <ArrowPathIcon className="h-5 w-5 text-blue-500 mr-2" />}
                        {task.type === 'training' && <UserGroupIcon className="h-5 w-5 text-purple-500 mr-2" />}
                        {task.type === 'follow-up' && <PhoneIcon className="h-5 w-5 text-green-500 mr-2" />}
                        {task.type === 'quote' && <DocumentTextIcon className="h-5 w-5 text-orange-500 mr-2" />}
                        <span className="font-medium text-gray-900">{task.title}</span>
                      </div>
                      <div className="flex items-center mt-1 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <button className="ml-4 text-gray-400 hover:text-gray-500">
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Policies and Recent Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Active Policies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Policies</h2>
                <Link 
                  to="/#"
                  className="text-accent hover:text-accent/90 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {activePolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{policy.client}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {policy.type} • {formatCurrency(policy.premium)}/year
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${
                        policy.status === 'Renewal Due' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {policy.status}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {formatDate(policy.expiresAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <button className="text-accent hover:text-accent/90 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'Quote Generated' && (
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.type === 'Policy Renewed' && (
                        <ArrowPathIcon className="h-5 w-5 text-green-500" />
                      )}
                      {activity.type === 'Claim Filed' && (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      {activity.type === 'Payment Received' && (
                        <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.client} • {activity.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Updates */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketUpdates.map((update) => (
                <div key={update.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-3">
                    <FireIcon className="h-5 w-5 text-accent mr-2" />
                    <span className="text-sm font-medium text-gray-500">{update.category}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{update.title}</h3>
                  <p className="text-sm text-gray-600">{update.description}</p>
                  <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    update.impact === 'positive' ? 'bg-green-100 text-green-800' :
                    update.impact === 'opportunity' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {update.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}