import { useState } from 'react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    console.log('Login attempt:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[480px] p-4 animate-fade-in-up">
        {/* Login Card */}
        <div className="glass-panel w-full rounded-xl p-8 md:p-10 flex flex-col gap-6 relative">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* Logo Graphic */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2 shadow-[0_0_15px_rgba(56,224,123,0.15)]">
              <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            </div>
            <div className="flex flex-col space-y-1">
              <h1 className="text-white tracking-tight text-3xl font-bold leading-tight">DLT System Access</h1>
              <p className="text-[#9eb7a8] text-base font-normal">Please authenticate to continue.</p>
            </div>
          </div>

          {/* Form Section */}
          <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium ml-4">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9eb7a8] group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">badge</span>
                </div>
                <input
                  autoComplete="username"
                  className="flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-input-bg focus:border-primary h-14 placeholder:text-[#9eb7a8]/50 pl-12 pr-4 text-base font-normal leading-normal transition-all duration-200"
                  placeholder="Enter your username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Security Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-4 mr-1">
                <label className="text-white text-sm font-medium">Security</label>
                <a className="text-primary text-sm font-medium hover:text-primary/80 transition-colors hover:underline" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9eb7a8] group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input
                  autoComplete="current-password"
                  className="flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-input-bg focus:border-primary h-14 placeholder:text-[#9eb7a8]/50 pl-12 pr-12 text-base font-normal leading-normal transition-all duration-200"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9eb7a8] hover:text-white transition-colors cursor-pointer focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
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
              className="mt-4 w-full h-14 bg-primary hover:bg-[#2fc76b] active:scale-[0.98] text-background-dark text-lg font-bold rounded-xl shadow-[0_4px_14px_0_rgba(56,224,123,0.39)] hover:shadow-[0_6px_20px_rgba(56,224,123,0.23)] transition-all duration-200 flex items-center justify-center gap-2"
              type="submit"
            >
              <span className="material-symbols-outlined">login</span>
              <span>Login</span>
            </button>
          </form>

          {/* Footer / Help */}
          <div className="pt-2 text-center">
            <p className="text-[#9eb7a8] text-sm">
              Having trouble? <a className="text-white font-medium hover:text-primary transition-colors" href="#">Contact IT Support</a>
            </p>
          </div>

          {/* Bottom visual interest */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 text-center px-4">
          <p className="text-[#9eb7a8]/60 text-xs font-light">
            © {new Date().getFullYear()} DLT IT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
