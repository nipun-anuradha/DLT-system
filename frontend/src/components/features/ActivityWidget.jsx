const ActivityWidget = ({ activities, loading = false }) => {
  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-500',
      primary: 'bg-primary/10 text-primary',
      orange: 'bg-orange-500/10 text-orange-500',
      yellow: 'bg-yellow-500/10 text-yellow-500'
    };
    return colors[color] || 'bg-slate-500/10 text-slate-500';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 rounded-lg animate-pulse"
            >
              <div className="size-10 rounded-full bg-slate-200 dark:bg-[#29382f]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-[#29382f] rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-[#29382f] rounded w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-[#9eb7a8] mb-2">
              notifications_off
            </span>
            <p className="text-sm text-slate-500 dark:text-[#9eb7a8]">
              No notices available
            </p>
          </div>
        ) : (
          activities.map((activity) => (
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
                <p className="text-xs text-slate-500 dark:text-[#9eb7a8] line-clamp-2">
                  {activity.description}
                </p>
                {activity.createdAt && (
                  <p className="text-xs text-slate-400 dark:text-[#7a9a8a] mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityWidget;
