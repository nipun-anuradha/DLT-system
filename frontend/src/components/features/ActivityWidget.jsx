const ActivityWidget = ({ activities }) => {
  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-500',
      primary: 'bg-primary/10 text-primary',
      orange: 'bg-orange-500/10 text-orange-500',
      yellow: 'bg-yellow-500/10 text-yellow-500'
    };
    return colors[color] || 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="p-6 rounded-lg bg-white dark:bg-[#1a2c23] border border-slate-200 dark:border-[#29382f]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          System Notice & Messages
        </h3>
        <a className="text-sm font-medium text-primary hover:underline" href="#">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#122017] transition-colors"
          >
            <div
              className={`size-10 rounded-full flex items-center justify-center ${getIconColorClasses(
                activity.iconColor
              )}`}
            >
              <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-[#9eb7a8]">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityWidget;
