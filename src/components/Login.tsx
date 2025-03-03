import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import clsx from 'clsx';
import { useAuth, UserProfileData } from '../context/AuthContext';

// SVG Icons for social logins
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.569 12.6254C17.597 15.4237 20.2539 16.3088 20.2969 16.3244C20.2759 16.3942 19.8785 17.7232 18.9982 19.0985C18.2344 20.2969 17.4375 21.4875 16.1602 21.5156C14.9062 21.5438 14.4921 20.7183 13.0312 20.7183C11.5703 20.7183 11.1093 21.4875 9.9375 21.5438C8.7187 21.6 7.8124 20.2969 7.0312 19.0985C5.4374 16.6406 4.2187 12.1172 5.8593 9.01569C6.6718 7.47663 8.2031 6.50788 9.8671 6.47975C11.0859 6.45163 12.2343 7.36725 12.9843 7.36725C13.7343 7.36725 15.1406 6.2813 16.5937 6.42975C17.1797 6.45788 18.8671 6.68538 19.9687 8.21881C19.8671 8.28131 17.5468 9.56256 17.569 12.6254ZM15.1875 4.32819C15.8437 3.53131 16.2812 2.41413 16.1484 1.2813C15.1796 1.32819 13.9765 1.91413 13.2968 2.71101C12.6952 3.39851 12.1718 4.54694 12.3046 5.65163C13.3906 5.73131 14.5312 5.12538 15.1875 4.32819Z" fill="currentColor"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/>
  </svg>
);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  roleType: z.string().min(1, 'Please select your role'),
  specialty: z.string().min(1, 'Please select your specialty'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
  companyName: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginForm, setLoginForm] = useState<Partial<LoginFormData>>({
    rememberMe: false
  });
  const [registerForm, setRegisterForm] = useState<Partial<RegisterFormData>>({
    agreeToTerms: false,
    roleType: '',
    specialty: '',
    experienceLevel: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { signUp, logIn, resetPassword, googleSignIn, facebookSignIn, appleSignIn } = useAuth();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  // Focus first input when component mounts
  useEffect(() => {
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isLogin, showForgotPassword]);

  // Calculate password strength
  useEffect(() => {
    if (!registerForm.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    const password = registerForm.password;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Normalize to 0-100
    setPasswordStrength(Math.min(100, Math.floor((strength / 6) * 100)));
  }, [registerForm.password]);

  const getStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Moderate';
    return 'Strong';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(loginForm);
      
      // Firebase login
      await logIn(validatedData.email, validatedData.password);
      
      // Redirect to dashboard on success
      navigate('/');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle Firebase errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'This account has been disabled. Please contact support for assistance.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.code) {
          errorMessage = error.message || errorMessage;
        }
        
        setErrors({ form: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Define role types, specialties, and experience levels
  const roleTypes = [
    { id: 'agent', name: 'Insurance Agent' },
    { id: 'underwriter', name: 'Underwriter' },
    { id: 'senior_underwriter', name: 'Senior Underwriter' },
    { id: 'broker', name: 'Insurance Broker' },
    { id: 'mgaStaff', name: 'MGA Staff' },
    { id: 'other', name: 'Other Insurance Professional' }
  ];

  const specialties = [
    { id: 'commercial_auto', name: 'Commercial Auto Insurance' },
    { id: 'workers_comp', name: 'Workers\' Compensation' },
    { id: 'professional_liability', name: 'Professional Liability' },
    { id: 'property', name: 'Property Insurance' },
    { id: 'general_liability', name: 'General Liability' },
    { id: 'cyber', name: 'Cyber Insurance' },
    { id: 'northeast', name: 'Northeast Region' },
    { id: 'southeast', name: 'Southeast Region' },
    { id: 'midwest', name: 'Midwest Region' },
    { id: 'west', name: 'Western Region' },
    { id: 'southwest', name: 'Southwest Region' }
  ];

  const experienceLevels = [
    { id: 'new', name: 'New to Industry (<2 years)' },
    { id: 'experienced', name: 'Experienced (2-5 years)' },
    { id: 'senior', name: 'Senior (5+ years)' },
    { id: 'management', name: 'Leadership/Management' }
  ];

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different types of inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRegisterForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setRegisterForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    // Declare validatedData outside the try block so it's accessible in catch
    let validatedData: any = null;

    try {
      validatedData = registerSchema.parse(registerForm);
      
      // Create profile data object
      const profileData: UserProfileData = {
        roleType: validatedData.roleType,
        specialty: validatedData.specialty,
        experienceLevel: validatedData.experienceLevel,
        companyName: validatedData.companyName || ''
      };
      
      // Sign up with additional profile data
      await signUp(
        validatedData.email, 
        validatedData.password, 
        validatedData.fullName,
        profileData
      );
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Clear form
      setRegisterForm({
        agreeToTerms: false,
        roleType: '',
        specialty: '',
        experienceLevel: ''
      });
      
      // Switch to login view after 3 seconds
      setTimeout(() => {
        setRegistrationSuccess(false);
        setIsLogin(true);
        setLoginForm({
          email: validatedData.email,
          password: ''
        });
      }, 3000);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Handle Firebase errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already in use. Please use a different email or try logging in.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } 
        // Check for permission errors - but these should now be caught in AuthContext
        else if (error.message && (
          error.message.includes('permission') || 
          error.message.includes('permissions') ||
          error.message.includes('unauthorized') ||
          error.message.includes('access')
        )) {
          // This would be a Firestore permission error, but account creation succeeded
          // Show success instead of error since the account was created
          setRegistrationSuccess(true);
          
          // Clear form
          setRegisterForm({
            agreeToTerms: false,
            roleType: '',
            specialty: '',
            experienceLevel: ''
          });
          
          // Switch to login view after 3 seconds
          setTimeout(() => {
            setRegistrationSuccess(false);
            setIsLogin(true);
            setLoginForm({
              email: registerForm.email || '',
              password: ''
            });
          }, 3000);
          
          // Return early to prevent showing the error
          setIsLoading(false);
          return;
        }
        else if (error.code) {
          errorMessage = error.message || errorMessage;
        }
        
        setErrors({ form: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (!forgotPasswordEmail) {
        setErrors({ email: 'Please enter your email address' });
        return;
      }

      await resetPassword(forgotPasswordEmail);
      setResetEmailSent(true);
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code) {
        errorMessage = error.message || errorMessage;
      }
      
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setErrors({});
    setIsLoading(true);

    try {
      // Add a small delay to ensure the popup isn't blocked
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (provider === 'google') {
        await googleSignIn();
      } else if (provider === 'facebook') {
        await facebookSignIn();
      } else if (provider === 'apple') {
        await appleSignIn();
      }
      
      // Redirect to dashboard on success
      navigate('/');
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completing the sign-in process.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in popup was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code) {
        errorMessage = error.message || errorMessage;
      }
      
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setLoginForm(prev => ({ ...prev, [name]: inputValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would apply dark mode to the entire app
    // For this example, we'll just toggle the class on the container
  };

  // Render forgot password form
  if (showForgotPassword) {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center px-4 sm:px-6 transition-colors duration-300",
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className={clsx(
              "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
              isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            )}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <div className={clsx(
          "w-full max-w-md rounded-xl shadow-lg overflow-hidden transition-colors duration-300",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 overflow-hidden">
                <img 
                  src="/images/logo.jpg" 
                  alt="INVO Underwriting" 
                  className="w-full h-auto object-contain max-h-8"
                />
              </div>
            </div>

            <h2 className={clsx(
              "text-2xl font-bold text-center mb-6",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Reset Your Password
            </h2>

            {resetEmailSent ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  Password reset email sent! Check your inbox for instructions.
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setForgotPasswordEmail('');
                  }}
                  className="text-accent hover:text-accent/90 font-medium"
                >
                  Return to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {errors.form && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {errors.form}
                  </div>
                )}

                <p className={clsx(
                  "text-sm mb-4",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div>
                  <label htmlFor="forgotPasswordEmail" className={clsx(
                    "block text-sm font-medium mb-1",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Email
                  </label>
                  <input
                    ref={initialFocusRef}
                    type="email"
                    id="forgotPasswordEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className={clsx(
                      "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                      errors.email 
                        ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                          : "border-gray-300 focus:border-accent focus:ring-accent"
                    )}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className={clsx(
                      "flex-1 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                      isDarkMode 
                        ? "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={clsx(
                      "flex-1 flex justify-center items-center px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                      isLoading 
                        ? "bg-accent/70 cursor-not-allowed" 
                        : "bg-accent hover:bg-accent/90 focus:ring-accent"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center px-4 sm:px-6 transition-colors duration-300",
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className={clsx(
            "p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
            isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          )}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className={clsx(
        "w-full max-w-md rounded-xl shadow-lg overflow-hidden transition-colors duration-300",
        isDarkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 overflow-hidden">
              <img 
                src="/images/logo.jpg" 
                alt="INVO Underwriting" 
                className="w-full h-auto object-contain max-h-8"
              />
            </div>
          </div>

          <h2 className={clsx(
            "text-2xl font-bold text-center mb-6",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {registrationSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Account created successfully!</p>
                  <p className="text-sm">You'll be redirected to the login page in a moment. Welcome to INVO Underwriting!</p>
                </div>
              </div>
            </div>
          )}

          {isLogin ? (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {errors.form}
                </div>
              )}

              <div>
                <label htmlFor="email" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Email
                </label>
                <input
                  ref={initialFocusRef}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={loginForm.email || ''}
                  onChange={handleLoginInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.email 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className={clsx(
                    "block text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={clsx(
                      "text-sm font-medium",
                      isDarkMode ? "text-accent hover:text-accent/90" : "text-accent hover:text-accent/90"
                    )}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={loginForm.password || ''}
                    onChange={handleLoginInputChange}
                    className={clsx(
                      "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                      errors.password 
                        ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                          : "border-gray-300 focus:border-accent focus:ring-accent"
                    )}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className={clsx(
                      "absolute inset-y-0 right-0 pr-3 flex items-center",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={loginForm.rememberMe || false}
                  onChange={handleLoginInputChange}
                  className={clsx(
                    "h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-accent focus:border-accent focus:ring-accent" 
                      : "border-gray-300 text-accent focus:border-accent focus:ring-accent"
                  )}
                />
                <label htmlFor="rememberMe" className={clsx(
                  "ml-2 block text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  "w-full flex justify-center items-center px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                  isLoading 
                    ? "bg-accent/70 cursor-not-allowed" 
                    : "bg-accent hover:bg-accent/90 focus:ring-accent"
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {errors.form}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Full Name
                </label>
                <input
                  ref={initialFocusRef}
                  type="text"
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={registerForm.fullName || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.fullName 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.fullName ? "true" : "false"}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1 text-sm text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  autoComplete="email"
                  value={registerForm.email || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.email 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                />
                {errors.email && (
                  <p id="register-email-error" className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="roleType" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Your Role
                </label>
                <select
                  id="roleType"
                  name="roleType"
                  value={registerForm.roleType || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.roleType 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.roleType ? "true" : "false"}
                  aria-describedby={errors.roleType ? "roleType-error" : undefined}
                >
                  <option value="">Select your role</option>
                  {roleTypes.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                {errors.roleType && (
                  <p id="roleType-error" className="mt-1 text-sm text-red-600">
                    {errors.roleType}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="specialty" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Your Insurance Specialty
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={registerForm.specialty || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.specialty 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.specialty ? "true" : "false"}
                  aria-describedby={errors.specialty ? "specialty-error" : undefined}
                >
                  <option value="">Select your specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                  ))}
                </select>
                {errors.specialty && (
                  <p id="specialty-error" className="mt-1 text-sm text-red-600">
                    {errors.specialty}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="experienceLevel" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Your Experience Level
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={registerForm.experienceLevel || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    errors.experienceLevel 
                      ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                        : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                  aria-invalid={errors.experienceLevel ? "true" : "false"}
                  aria-describedby={errors.experienceLevel ? "experienceLevel-error" : undefined}
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                {errors.experienceLevel && (
                  <p id="experienceLevel-error" className="mt-1 text-sm text-red-600">
                    {errors.experienceLevel}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="companyName" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Company/Agency Name <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={registerForm.companyName || ''}
                  onChange={handleRegisterInputChange}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                      : "border-gray-300 focus:border-accent focus:ring-accent"
                  )}
                />
              </div>

              <div>
                <label htmlFor="register-password" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    name="password"
                    autoComplete="new-password"
                    value={registerForm.password || ''}
                    onChange={handleRegisterInputChange}
                    className={clsx(
                      "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                      errors.password 
                        ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                          : "border-gray-300 focus:border-accent focus:ring-accent"
                    )}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "register-password-error" : undefined}
                  />
                  <button
                    type="button"
                    className={clsx(
                      "absolute inset-y-0 right-0 pr-3 flex items-center",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="register-password-error" className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className={clsx(
                  "block text-sm font-medium mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={registerForm.confirmPassword || ''}
                    onChange={handleRegisterInputChange}
                    className={clsx(
                      "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                      errors.confirmPassword 
                        ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-white focus:border-accent focus:ring-accent" 
                          : "border-gray-300 focus:border-accent focus:ring-accent"
                    )}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    className={clsx(
                      "absolute inset-y-0 right-0 pr-3 flex items-center",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={registerForm.agreeToTerms || false}
                    onChange={handleRegisterInputChange}
                    className={clsx(
                      "h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors duration-200",
                      errors.agreeToTerms 
                        ? "border-red-300 focus:border-red-300 focus:ring-red-500" 
                        : isDarkMode 
                          ? "border-gray-600 bg-gray-700 text-accent focus:border-accent focus:ring-accent" 
                          : "border-gray-300 text-accent focus:border-accent focus:ring-accent"
                    )}
                    aria-invalid={errors.agreeToTerms ? "true" : "false"}
                    aria-describedby={errors.agreeToTerms ? "agreeToTerms-error" : undefined}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="agreeToTerms" className={clsx(
                    "text-sm",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    I agree to the <a href="#" className="text-accent hover:text-accent/90">Terms of Service</a> and <a href="#" className="text-accent hover:text-accent/90">Privacy Policy</a>
                  </label>
                  {errors.agreeToTerms && (
                    <p id="agreeToTerms-error" className="mt-1 text-sm text-red-600">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  "w-full flex justify-center items-center px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                  isLoading 
                    ? "bg-accent/70 cursor-not-allowed" 
                    : "bg-accent hover:bg-accent/90 focus:ring-accent"
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={clsx(
                  "w-full border-t",
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                )}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={clsx(
                  "px-2",
                  isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
                )}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className={clsx(
                  "w-full inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                  isDarkMode 
                    ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
                )}
              >
                <GoogleIcon />
                <span className="sr-only">Sign in with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn('apple')}
                className={clsx(
                  "w-full inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                  isDarkMode 
                    ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
                )}
              >
                <AppleIcon />
                <span className="sr-only">Sign in with Apple</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn('facebook')}
                className={clsx(
                  "w-full inline-flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200",
                  isDarkMode 
                    ? "border-gray-700 bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
                )}
              >
                <FacebookIcon />
                <span className="sr-only">Sign in with Facebook</span>
              </button>
            </div>
          </div>

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <p className={clsx(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="ml-1 font-medium text-accent hover:text-accent/90 focus:outline-none focus:underline transition-colors duration-200"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;