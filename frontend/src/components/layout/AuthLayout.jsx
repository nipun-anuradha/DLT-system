const AuthLayout = ({ children }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[480px] p-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
