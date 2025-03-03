import { Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HomeIcon, BuildingOfficeIcon, TruckIcon, ShieldCheckIcon, DocumentTextIcon, UserGroupIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import UserProfile from './components/UserProfile';
import AIAssistant from './components/AIAssistant';
import { ClaimProvider } from './context/ClaimContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Digital Marketplace', href: '/marketplace', icon: BuildingOfficeIcon },
  { name: 'Staffing', href: '/staffing', icon: UserGroupIcon },
  { name: 'Trucking', href: '/trucking', icon: TruckIcon },
  { name: 'Insurance Carriers', href: '/carriers', icon: ShieldCheckIcon },
  { name: 'Saved Quotes', href: '/saved-quotes', icon: DocumentTextIcon },
];

function App() {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === '/login';

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      if (showMobileNav) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileNav, isMobile]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleAssistantToggle = () => {
    setIsAssistantOpen(!isAssistantOpen);
  };

  return (
    <ClaimProvider>
      <div className="min-h-screen bg-gray-50">
        <Disclosure as="nav" className="bg-[#f7f7f7] shadow sticky top-0 z-10">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex flex-1">
                    <div className="flex flex-shrink-0 items-center">
                      <Link to={currentUser ? "/dashboard" : "/login"} className="h-full flex items-center">
                        <div className="w-36 overflow-hidden">
                          <img 
                            src="/images/logo.jpg" 
                            alt="INVO Underwriting" 
                            className="w-full h-auto object-contain max-h-12"
                          />
                        </div>
                      </Link>
                    </div>
                    {/* Only show navigation links when logged in and not on login page */}
                    {currentUser && !isLoginPage && (
                      <div className="hidden sm:ml-6 sm:flex flex-1 justify-around">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="inline-flex items-center border-b-2 border-transparent px-4 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {currentUser && !isLoginPage && (
                      <button
                        onClick={handleAssistantToggle}
                        className="group relative flex items-center justify-center px-3 py-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200 animate-pulse hover:animate-none shadow-md"
                        aria-label="AI Assistant"
                      >
                        <SparklesIcon className="h-6 w-6" aria-hidden="true" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                        </span>
                      </button>
                    )}
                    {currentUser ? (
                      <UserProfile />
                    ) : (
                      <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm">
                        Sign in
                      </Link>
                    )}
                  </div>
                  {/* Only show mobile menu button when logged in and not on login page */}
                  {currentUser && !isLoginPage && (
                    <div className="-mr-2 flex items-center sm:hidden">
                      <Disclosure.Button 
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                        onClick={() => setShowMobileNav(!showMobileNav)}
                      >
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                  )}
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                {/* Only show navigation items when logged in */}
                {currentUser && (
                  <div className="space-y-1 pb-3 pt-2">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        to={item.href}
                        className="flex items-center border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                        onClick={() => setShowMobileNav(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {item.name}
                      </Disclosure.Button>
                    ))}
                    <Disclosure.Button
                      as="button"
                      onClick={() => {
                        setShowMobileNav(false);
                        handleAssistantToggle();
                      }}
                      className="w-full flex items-center border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <SparklesIcon className="mr-3 h-5 w-5 text-blue-500" aria-hidden="true" />
                      AI Assistant
                    </Disclosure.Button>
                  </div>
                )}
                
                {!currentUser && (
                  <div className="space-y-1 pb-3 pt-2">
                    <Disclosure.Button
                      as={Link}
                      to="/login"
                      className="mx-4 flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowMobileNav(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign in
                    </Disclosure.Button>
                  </div>
                )}
                
                {/* User profile section in mobile menu */}
                {currentUser && (
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white">
                          {currentUser.photoURL ? (
                            <img 
                              src={currentUser.photoURL} 
                              alt={currentUser.displayName || 'User'} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{currentUser.displayName || 'User'}</div>
                        <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Disclosure.Button
                        as={Link}
                        to="/profile"
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() => setShowMobileNav(false)}
                      >
                        Your Profile
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="button"
                        onClick={() => {
                          setShowMobileNav(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Sign out
                      </Disclosure.Button>
                    </div>
                  </div>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Outlet />
        {isAssistantOpen && <AIAssistant isOpen={isAssistantOpen} onClose={handleAssistantToggle} />}
      </div>
    </ClaimProvider>
  );
}

export default App;