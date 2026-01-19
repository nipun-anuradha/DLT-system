import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import * as yup from 'yup';

// Login validation schema
const loginSchema = yup.object().shape({
  username: yup.string().trim().required('Username is required'),
  password: yup.string().required('Password is required').min(3, 'Password must be at least 3 characters')
});

// Registration validation schema
const registerSchema = yup.object().shape({
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  emp_no: yup.string()
    .required('Employee number is required')
    .max(45, 'Employee number must not exceed 45 characters'),
  username: yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters'),
  password: yup.string()
    .required('Password is required')
    .min(3, 'Password must be at least 3 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  mobile: yup.string()
    .required('Mobile number is required')
    .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  branch_id: yup.number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .typeError('Please select a branch')
    .required('Please select a branch')
    .positive('Please select a branch'),
  department_id: yup.number()
    .transform((value, originalValue) => originalValue === '' ? undefined : value)
    .typeError('Please select a department')
    .required('Please select a department')
    .positive('Please select a department')
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    emp_no: '',
    username: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    branch_id: '',
    department_id: ''
  });

  // Lookup data
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch branches and departments when modal opens
  useEffect(() => {
    if (isRegisterModalOpen) {
      const fetchLookupData = async () => {
        try {
          const [branchesRes, departmentsRes] = await Promise.all([
            api.get('/public/branches'),
            api.get('/public/departments')
          ]);
          setBranches(branchesRes.data || []);
          setDepartments(departmentsRes.data || []);
        } catch (error) {
          console.error('Failed to fetch lookup data:', error);
        }
      };
      fetchLookupData();
    }
  }, [isRegisterModalOpen]);

  // Redirect if already logged in
  if (isAuthenticated()) {
    navigate('/', { replace: true });
    return null;
  }

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

  // Registration handlers
  const resetRegisterForm = () => {
    setRegisterFormData({
      name: '',
      emp_no: '',
      username: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      branch_id: '',
      department_id: ''
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
        name: registerFormData.name,
        emp_no: registerFormData.emp_no,
        username: registerFormData.username,
        password: registerFormData.password,
        mobile: registerFormData.mobile,
        branch_id: parseInt(registerFormData.branch_id),
        department_id: parseInt(registerFormData.department_id)
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
              Having trouble? <a className="text-white font-medium hover:text-primary transition-colors" href="#">Contact IT Support</a>
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
                {/* Full Name & Employee Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registerFormData.name}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="Enter full name"
                    />
                    {registerFieldErrors.name && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Employee No <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="emp_no"
                      value={registerFormData.emp_no}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.emp_no ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                      placeholder="e.g. 33xx"
                    />
                    {registerFieldErrors.emp_no && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.emp_no}</p>}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={registerFormData.username}
                    onChange={handleRegisterChange}
                    className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    placeholder="user@dlt.lk"
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
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={registerFormData.mobile}
                    onChange={handleRegisterChange}
                    className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm placeholder-[#5a7063] focus:outline-none focus:ring-1 transition-all ${registerFieldErrors.mobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                  />
                  {registerFieldErrors.mobile && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.mobile}</p>}
                </div>

                {/* Branch & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Branch <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="branch_id"
                      value={registerFormData.branch_id}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${registerFieldErrors.branch_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                    {registerFieldErrors.branch_id && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.branch_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9cbaa8] mb-1.5">
                      Department <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="department_id"
                      value={registerFormData.department_id}
                      onChange={handleRegisterChange}
                      className={`w-full h-10 px-3 rounded-xl bg-[#1d2d25] border text-white text-sm focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${registerFieldErrors.department_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-[#28392f] focus:border-primary/50 focus:ring-primary/50'}`}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {registerFieldErrors.department_id && <p className="mt-1 text-xs text-red-400">{registerFieldErrors.department_id}</p>}
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
