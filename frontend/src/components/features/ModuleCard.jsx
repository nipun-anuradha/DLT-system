import { Link } from 'react-router-dom';

const ModuleCard = ({ title, description, icon, status, badge, action }) => {
  const isActive = status === 'active';
  const isRestricted = status === 'restricted';
  const isComingSoon = status === 'coming-soon';
  const isDisabled = !isActive;

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary-700 dark:text-primary">
          <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
          Active
        </span>
      );
    }
    if (isRestricted) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400">
          Restricted
        </span>
      );
    }
    if (isComingSoon) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-[#29382f] text-slate-500 dark:text-[#7a9083]">
          Coming Soon
        </span>
      );
    }
  };

  const getBadgeIconColor = (color) => {
    const colors = {
      yellow: 'text-yellow-500',
      blue: 'text-blue-500',
      primary: 'text-primary',
      orange: 'text-orange-500'
    };
    return colors[color] || 'text-slate-500';
  };

  return (
    <div
      className={`group relative flex flex-col p-6 rounded-lg ${
        isActive
          ? 'bg-white dark:bg-[#1a2c23] border-2 border-primary/20 hover:border-primary shadow-lg hover:shadow-primary/10'
          : 'bg-slate-50 dark:bg-[#16261d] border border-slate-200 dark:border-[#29382f] opacity-75'
      } transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`size-12 rounded-full flex items-center justify-center ${
            isActive
              ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-[#122017]'
              : 'bg-slate-200 dark:bg-[#29382f] text-slate-400 dark:text-[#5a7063]'
          } transition-colors duration-300`}
        >
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex-1">
        <h3
          className={`text-xl font-bold mb-2 ${
            isActive
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-slate-400'
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm mb-4 ${
            isActive
              ? 'text-slate-500 dark:text-[#9eb7a8]'
              : 'text-slate-400 dark:text-[#5a7063]'
          }`}
        >
          {description}
        </p>

        {badge && isActive && (
          <div className="flex items-center gap-2 mb-6">
            <span className={`material-symbols-outlined text-[18px] ${getBadgeIconColor(badge.color)}`}>
              {badge.icon}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {badge.text}
            </span>
          </div>
        )}
      </div>

      {action.enabled && action.link ? (
        <Link
          to={action.link}
          className="w-full py-3 px-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 bg-primary hover:bg-[#2ec56b] text-[#122017] group-hover:translate-y-[-2px]"
        >
          {action.icon && <span className="material-symbols-outlined text-[18px]">{action.icon}</span>}
          {action.text}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      ) : (
        <button
          className={`w-full py-3 px-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            action.enabled
              ? 'bg-primary hover:bg-[#2ec56b] text-[#122017] group-hover:translate-y-[-2px]'
              : 'bg-slate-200 dark:bg-[#29382f] text-slate-400 dark:text-[#5a7063] cursor-not-allowed'
          }`}
          disabled={!action.enabled}
        >
          {action.icon && <span className="material-symbols-outlined text-[18px]">{action.icon}</span>}
          {action.text}
          {action.enabled && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
        </button>
      )}
    </div>
  );
};

export default ModuleCard;
