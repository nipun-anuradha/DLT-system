import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../config/msalConfig';
import { fetchMsGraphProfile, logMicrosoftUserDetails } from '../services/msGraphService';
import api from '../utils/api';
import * as yup from 'yup';

// Login validation schema
const loginSchema = yup.object().shape({
  username: yup.string().trim().required('Email is required').email('Please enter a valid email'),
  password: yup.string().required('Password is required').min(3, 'Password must be at least 3 characters')
});

// Registration validation schema - simplified
const registerSchema = yup.object().shape({
  name: yup.string()
    .max(100, 'Name must not exceed 100 characters'),
  username: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),
  password: yup.string()
    .required('Password is required')
    .min(3, 'Password must be at least 3 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  mobile: yup.string()
    .matches(/^$|^\d{10,15}$/, 'Mobile number must be 10-15 digits'),
  department: yup.string()
    .max(100, 'Department must not exceed 100 characters'),
  branch: yup.string()
    .max(100, 'Branch/City must not exceed 100 characters')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { instance } = useMsal();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    department: '',
    branch: ''
  });

  // Redirect if already logged in (using useEffect to avoid render-time navigation)
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form using yup
    try {
      await loginSchema.validate(formData, { abortEarly: false });
    } catch (validationError) {
      setError(validationError.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username: formData.username.trim(),
        password: formData.password
      });

      if (response.success) {
        login(response.data, response.token);
        navigate('/', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Microsoft Sign-In Handler - Using REDIRECT flow
  const handleMicrosoftSignIn = async () => {
    setError('');
    setMsLoading(true);
    
    try {
      console.log("🔄 Starting Microsoft login redirect...");
      
      // Use redirect instead of popup (more reliable)
      await instance.loginRedirect(loginRequest);
      
      // Note: Code after loginRedirect won't execute immediately
      // The page will redirect to Microsoft, then back to our app
      // The response will be handled in useEffect below
      
    } catch (err) {
      console.error("❌ Microsoft Sign-In Error:", err);
      setError(err.message || 'Microsoft sign-in failed');
      setMsLoading(false);
    }
  };

  // Check for Microsoft login on component mount (after redirect back)
  useEffect(() => {
    const handleMsLoginResponse = async () => {
      // Skip if user just logged out (flag in sessionStorage)
      const justLoggedOut = sessionStorage.getItem('just_logged_out');
      if (justLoggedOut) {
        sessionStorage.removeItem('just_logged_out');
        // Clear MSAL accounts to prevent auto-login
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          await instance.logoutPopup({ account: accounts[0], mainWindowRedirectUri: '/login' }).catch(() => {
            // Fallback: just clear the account from cache
            instance.setActiveAccount(null);
          });
        }
        return;
      }
      
      const accounts = instance.getAllAccounts();
      
      if (accounts.length > 0) {
        console.log("✅ Found Microsoft account:", accounts[0]);
        setMsLoading(true);
        
        try {
          // Acquire token for Graph API
          console.log("🔄 Acquiring token for Graph API...");
          const tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          
          console.log("✅ Access Token acquired");
          
          // Fetch user details from Microsoft Graph
          console.log("🔄 Fetching profile from Microsoft Graph API...");
          const graphProfile = await fetchMsGraphProfile(tokenResponse.accessToken);
          console.log("✅ Graph Profile fetched:", graphProfile);
          
          // Log all the details
          const mappedUserData = logMicrosoftUserDetails(accounts[0], graphProfile);
          console.log("📋 Mapped User Data for Registration:", mappedUserData);
          
          // Send to backend to register/login
          console.log("🔄 Sending to backend for authentication...");
          const response = await api.post('/auth/microsoft', {
            microsoftId: mappedUserData.microsoftId,
            email: mappedUserData.email,
            displayName: mappedUserData.displayName,
            department: mappedUserData.department,
            mobilePhone: mappedUserData.mobilePhone,
            city: mappedUserData.city // City from MS - used as branch
          });
          
          if (response.success) {
            console.log("✅ Backend authentication successful:", response);
            
            // Login with the returned token
            login(response.data, response.token);
            
            // Show message based on new or existing user
            if (response.isNewUser) {
              console.log("🆕 New user account created");
            } else {
              console.log("👤 Existing user logged in");
            }
            
            // Navigate to dashboard
            navigate('/', { replace: true });
          } else {
            setError(response.message || 'Microsoft sign-in failed');
          }
          
        } catch (err) {
          console.error("Error during Microsoft auth:", err);
          setError(err.message || 'Microsoft sign-in failed');
        } finally {
          setMsLoading(false);
        }
      }
    };
    
    handleMsLoginResponse();
  }, [instance, login, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Registration handlers
  const resetRegisterForm = () => {
    setRegisterFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      department: '',
      branch: ''
    });
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterFieldErrors({});
  };

  const handleOpenRegisterModal = () => {
    resetRegisterForm();
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    resetRegisterForm();
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
    setRegisterError('');
    if (registerFieldErrors[name]) {
      setRegisterFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterFieldErrors({});

    try {
      await registerSchema.validate(registerFormData, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const errors = {};
        validationError.inner.forEach(err => {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
          }
        });
        setRegisterFieldErrors(errors);
        setRegisterError('Please fix the errors below');
        return;
      }
    }

    setRegisterLoading(true);

    try {
      const payload = {
        name: registerFormData.name || null,
        username: registerFormData.username,
        password: registerFormData.password,
        mobile: registerFormData.mobile || null,
        department: registerFormData.department || null,
        branch: registerFormData.branch || null
      };

      await api.post('/auth/register', payload);

      setRegisterSuccess('Account created successfully! You can now login.');
      setTimeout(() => {
        handleCloseRegisterModal();
      }, 2000);
    } catch (error) {
      setRegisterError(error.message || 'Failed to create account');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[420px] p-4 animate-fade-in-up">
        {/* Login Card */}
        <div className="glass-panel w-full rounded-xl p-6 md:p-8 flex flex-col gap-5 relative">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {/* Logo Graphic */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-1 shadow-[0_0_15px_rgba(56,224,123,0.15)]">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            </div>
            <div className="flex flex-col space-y-0.5">
              <h1 className="text-white tracking-tight text-2xl font-bold leading-tight">DLT System Access</h1>
              <p className="text-[#9eb7a8] text-sm font-normal">Please authenticate to continue.</p>
            </div>
          </div>

          {/* Form Section */}
          <form className="flex flex-col gap-4 mt-1" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white text-sm font-medium ml-3">Username</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9eb7a8] group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">badge</span>
                </div>
                <input
                  autoComplete="username"
                  className="flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-input-bg focus:border-primary h-11 placeholder:text-[#9eb7a8]/50 pl-10 pr-4 text-sm font-normal leading-normal transition-all duration-200"
                  placeholder="user@dlt.lk"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Security Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-3 mr-1">
                <label className="text-white text-sm font-medium">Password</label>
                <a className="text-primary text-xs font-medium hover:text-primary/80 transition-colors hover:underline" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9eb7a8] group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  autoComplete="current-password"
                  className="flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-input-bg focus:border-primary h-11 placeholder:text-[#9eb7a8]/50 pl-10 pr-10 text-sm font-normal leading-normal transition-all duration-200"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9eb7a8] hover:text-white transition-colors cursor-pointer focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              className="mt-3 w-full h-11 bg-primary hover:bg-[#2fc76b] active:scale-[0.98] text-background-dark text-base font-bold rounded-xl shadow-[0_4px_14px_0_rgba(56,224,123,0.39)] hover:shadow-[0_6px_20px_rgba(56,224,123,0.23)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background-dark"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">login</span>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#28392f]"></div>
            <span className="text-[#9eb7a8] text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-[#28392f]"></div>
          </div>

          {/* Microsoft Sign-In Button */}
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={msLoading}
            className="w-full h-11 bg-[#2f2f2f] hover:bg-[#3c3c3c] active:scale-[0.98] text-white text-sm font-semibold rounded-xl border border-[#3c3c3c] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {msLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                {/* Microsoft Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          {/* Footer / Help */}
          <div className="pt-1 text-center space-y-2">
            <p className="text-[#9eb7a8] text-xs">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={handleOpenRegisterModal}
                className="text-primary font-medium hover:text-primary/80 transition-colors hover:underline"
              >
                Create Account
              </button>
            </p>
            <p className="text-[#9eb7a8] text-xs">
              Having trouble?{' '}
              <button 
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="text-white font-medium hover:text-primary transition-colors"
              >
                Contact IT Support
              </button>
            </p>
          </div>

          {/* Bottom visual interest */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>

        {/* Legal Footer */}
        <div className="mt-6 text-center px-4">
          <p className="text-[#9eb7a8]/60 text-xs font-light">
            © {new Date().getFullYear()} DLT IT. All rights reserved.
          </p>
        </div>
      </div>

      {/* Contact IT Support Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsContactModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#28392f]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">IT Support</h2>
                  <p className="text-xs text-[#9cbaa8]">Contact Information</p>
                </div>
              </div>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* IT Department Section */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">
                  IT Department – Dutch Lanka Trailers (Pvt) Ltd
                </h3>
                <div className="space-y-2">
                  <a href="mailto:mahanama@dlt.lk" className="flex items-center gap-2 text-[#9cbaa8] hover:text-primary transition-colors text-sm">
                    <span className="material-symbols-outlined text-base">mail</span>
                    mahanama@dlt.lk
                  </a>
                  <a href="mailto:thanuja@dlt.lk" className="flex items-center gap-2 text-[#9cbaa8] hover:text-primary transition-colors text-sm">
                    <span className="material-symbols-outlined text-base">mail</span>
                    thanuja@dlt.lk
                  </a>
                  <a href="mailto:nipun.anuradha@dlt.lk" className="flex items-center gap-2 text-[#9cbaa8] hover:text-primary transition-colors text-sm">
                    <span className="material-symbols-outlined text-base">mail</span>
                    nipun.anuradha@dlt.lk
                  </a>
                </div>
              </div>

              {/* Issue Reporting Section */}
              <div className="pt-4 border-t border-[#28392f]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">
                  Issue Reporting
                </h3>
                <p className="text-[#9cbaa8] text-sm leading-relaxed mb-3">
                  If you experience any system bugs, errors, or issues, please report them via email to the developer:
                </p>
                <a href="mailto:nipun.anuradha@dlt.lk" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-base">bug_report</span>
                  nipun.anuradha@dlt.lk
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-5 border-t border-[#28392f]">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] text-sm font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseRegisterModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#28392f]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Account</h2>
                  <p className="text-xs text-[#9cbaa8]">Register for a new account</p>
                </div>
              </div>
              <button 
                onClick={handleCloseRegisterModal}
                className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegisterSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-160px)]">
              {/* Error Message */}
              {registerError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                  <span className="text-red-400 text-sm">{registerError}</span>
                </div>
              )}

              {/* Success Message */}
              {registerSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="text-primary text-sm">{registerSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registerFormData.name}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="Enter full name (optional)"
                    />
                    {registerFieldErrors.name && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.name}</p>}
                  </div>
                </div>

                {/* Email (Username) */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="username"
                    value={registerFormData.username}
                    onChange={handleRegisterChange}
                    className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    placeholder="your.email@example.com"
                  />
                  {registerFieldErrors.username && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.username}</p>}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        name="password"
                        value={registerFormData.password}
                        onChange={handleRegisterChange}
                        className={`w-full h-10 px-3 pr-10 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                        placeholder="Min 3 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9cbaa8] hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showRegPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {registerFieldErrors.password && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerFormData.confirmPassword}
                        onChange={handleRegisterChange}
                        className={`w-full h-10 px-3 pr-10 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9cbaa8] hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {registerFieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={registerFormData.mobile}
                    onChange={handleRegisterChange}
                    className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.mobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    placeholder="10-15 digit mobile number (optional)"
                    maxLength={15}
                  />
                  {registerFieldErrors.mobile && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.mobile}</p>}
                </div>

                {/* Branch & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Branch / City
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={registerFormData.branch}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="e.g. Colombo (optional)"
                    />
                    {registerFieldErrors.branch && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.branch}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={registerFormData.department}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.department ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="e.g. IT (optional)"
                    />
                    {registerFieldErrors.department && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.department}</p>}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-5 pt-5 border-t border-[#28392f]">
                <button
                  type="button"
                  onClick={handleCloseRegisterModal}
                  className="px-4 py-2 rounded-xl text-[#9cbaa8] hover:text-white hover:bg-[#28392f] font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] text-sm font-bold transition-all shadow-[0_0_15px_rgba(61,245,135,0.2)] hover:shadow-[0_0_20px_rgba(61,245,135,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
