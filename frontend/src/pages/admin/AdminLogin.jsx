import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { authService } from '../../services/authService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminAuthenticated, adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated()) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAdminAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.adminLogin({
        username: formData.username,
        password: formData.password,
      });

      if (response.success) {
        // Update context with admin data
        adminLogin(response.data, response.token);
        
        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 bg-background-dark">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        {/* Radial Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[380px]">
          {/* Login Card */}
          <div className="glass-panel rounded-xl p-6 sm:p-8 flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-dark border border-white/5 flex items-center justify-center shadow-lg shadow-black/20 group">
                <span className="material-symbols-outlined text-primary text-[24px] group-hover:scale-110 transition-transform duration-300">
                  admin_panel_settings
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white mb-1">Admin Access</h1>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enter credentials to access the system
                </p>
              </div>
            </div>

            {/* Form Section */}
            <form className="flex flex-col gap-4 mt-1" onSubmit={handleSubmit}>
              {/* Admin ID Input */}
              <div className="space-y-1">
                <label
                  className="block text-xs font-medium text-primary/80 uppercase tracking-wider ml-1"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="input-dark rounded-lg flex items-center px-3 h-10">
                  <span className="material-symbols-outlined text-slate-500 mr-2 text-[18px]">badge</span>
                  <input
                    className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-slate-600 text-white font-medium"
                    id="username"
                    placeholder="admin"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label
                  className="block text-xs font-medium text-primary/80 uppercase tracking-wider ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="input-dark rounded-lg flex items-center px-3 h-10 relative group">
                  <span className="material-symbols-outlined text-slate-500 mr-2 text-[18px]">key</span>
                  <input
                    className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-slate-600 text-white font-medium pr-8"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={loading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                className="mt-2 w-full h-10 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#00ff66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#102217] focus:ring-primary active:scale-[0.98] transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary text-sm"
                type="submit"
                disabled={loading || !formData.username || !formData.password}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    Secure Login
                  </>
                )}
              </button>
            </form>

            {/* Footer / Disclaimer */}
            <div className="pt-3 border-t border-white/5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[14px]">encrypted</span>
                <span>Authorized Admins Only</span>
              </div>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="text-center mt-4">
            <a className="text-xs text-slate-500 hover:text-primary transition-colors duration-200" href="#">
              Forgot Administrator Password?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
