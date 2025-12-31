import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle admin login
    console.log('Admin login attempt:', formData);
    
    // Redirect to admin dashboard
    navigate('/admin/dashboard');
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
        <div className="w-full max-w-[480px]">
          {/* Login Card */}
          <div className="glass-panel rounded-2xl p-8 sm:p-10 flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-dark border border-white/5 flex items-center justify-center shadow-lg shadow-black/20 mb-2 group">
                <span className="material-symbols-outlined text-primary text-[32px] group-hover:scale-110 transition-transform duration-300">
                  admin_panel_settings
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin System Access</h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[300px] mx-auto">
                  Enter credentials to access the IT Support Module
                </p>
              </div>
            </div>

            {/* Form Section */}
            <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
              {/* Admin ID Input */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-primary/80 uppercase tracking-wider ml-1"
                  htmlFor="adminId"
                >
                  Admin Email
                </label>
                <div className="input-dark rounded-lg flex items-center px-4 h-12">
                  <span className="material-symbols-outlined text-slate-500 mr-3 text-[20px]">badge</span>
                  <input
                    className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-slate-600 text-white font-medium"
                    id="adminId"
                    placeholder="admin@company.com"
                    type="text"
                    value={formData.adminId}
                    onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-medium text-primary/80 uppercase tracking-wider ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="input-dark rounded-lg flex items-center px-4 h-12 relative group">
                  <span className="material-symbols-outlined text-slate-500 mr-3 text-[20px]">key</span>
                  <input
                    className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 placeholder:text-slate-600 text-white font-medium pr-8"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                className="mt-4 w-full h-12 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#00ff66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#102217] focus:ring-primary active:scale-[0.98] transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                Secure Login
              </button>
            </form>

            {/* Footer / Disclaimer */}
            <div className="pt-4 border-t border-white/5 text-center">
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[14px]">encrypted</span>
                  <span>Restricted Area. Authorized Admins Only.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="text-center mt-6">
            <a className="text-sm text-slate-500 hover:text-primary transition-colors duration-200" href="#">
              Forgot Administrator Password?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
