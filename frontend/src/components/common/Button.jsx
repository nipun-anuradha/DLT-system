const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  variant = 'primary',
  icon,
  className = '' 
}) => {
  const baseStyles = "w-full h-14 text-lg font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary hover:bg-[#11834d] active:scale-[0.98] text-white shadow-[0_4px_14px_0_rgba(20,155,91,0.22)] hover:shadow-[0_6px_20px_rgba(20,155,91,0.18)]",
    secondary: "bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-input-border",
    danger: "bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      type={type}
      onClick={onClick}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
