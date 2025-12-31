const Input = ({ 
  label, 
  icon, 
  type = 'text', 
  placeholder, 
  name,
  value,
  onChange,
  autoComplete,
  rightIcon,
  onRightIconClick 
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-white text-sm font-medium ml-4">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9eb7a8] group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
        )}
        <input
          autoComplete={autoComplete}
          className={`flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-input-border bg-input-bg focus:border-primary h-14 placeholder:text-[#9eb7a8]/50 ${icon ? 'pl-12' : 'pl-4'} ${rightIcon ? 'pr-12' : 'pr-4'} text-base font-normal leading-normal transition-all duration-200`}
          placeholder={placeholder}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
        {rightIcon && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9eb7a8] hover:text-white transition-colors cursor-pointer focus:outline-none"
            type="button"
            onClick={onRightIconClick}
          >
            <span className="material-symbols-outlined text-xl">{rightIcon}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
