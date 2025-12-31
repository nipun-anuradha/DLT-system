import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    {
      label: 'Total Tickets',
      value: '124',
      trend: 'up',
      icon: 'folder',
      iconColor: 'text-slate-400',
    },
    {
      label: 'Open Tickets',
      value: '12',
      trend: 'up',
      icon: 'mark_email_unread',
      iconColor: 'text-primary',
      highlight: true,
    },
    {
      label: 'In Progress',
      value: '5',
      trend: 'flat',
      icon: 'pending',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Closed Tickets',
      value: '107',
      trend: 'up',
      icon: 'check_circle',
      iconColor: 'text-green-700 dark:text-green-900',
    },
  ];

  const tickets = [
    {
      id: '#4921',
      subject: 'Unable to access VPN',
      priority: 'High',
      priorityColor: 'red',
      status: 'In Progress',
      statusColor: 'blue',
      created: 'Oct 24, 2023',
      updated: '2 hrs ago',
    },
    {
      id: '#4920',
      subject: 'Software License Renewal',
      priority: 'Medium',
      priorityColor: 'amber',
      status: 'Open',
      statusColor: 'primary',
      created: 'Oct 23, 2023',
      updated: '1 day ago',
    },
    {
      id: '#4918',
      subject: 'Printer jamming on 2nd floor',
      priority: 'Low',
      priorityColor: 'slate',
      status: 'Closed',
      statusColor: 'slate',
      created: 'Oct 20, 2023',
      updated: '2 days ago',
    },
    {
      id: '#4915',
      subject: 'Request for new monitor',
      priority: 'Low',
      priorityColor: 'slate',
      status: 'Open',
      statusColor: 'primary',
      created: 'Oct 18, 2023',
      updated: '3 days ago',
    },
    {
      id: '#4912',
      subject: 'Zoom integration not working',
      priority: 'High',
      priorityColor: 'red',
      status: 'Open',
      statusColor: 'primary',
      created: 'Oct 17, 2023',
      updated: '4 days ago',
    },
  ];

  const getPriorityClasses = (color) => {
    const colors = {
      red: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      slate: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400',
    };
    return colors[color];
  };

  const getStatusClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400',
      primary: 'border-primary/30 text-emerald-700 dark:text-primary bg-primary/5',
      slate: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
    return colors[color];
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden h-screen flex">
      <Sidebar activePage="tickets" />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm z-10 sticky top-0 px-6 py-5 lg:px-10 border-b border-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                IT Support Tickets
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                Manage and track support requests efficiently.
              </p>
            </div>
            <Link to="/new-ticket" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark h-12 px-6 rounded-full font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95">
              <span className="material-symbols-outlined">add</span>
              <span>Open New Ticket</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-20">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
            {/* Stats Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-1 p-6 rounded-lg bg-white dark:bg-[#1c2e24] border border-gray-100 dark:border-[#29382f] shadow-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium group-hover:text-primary transition-colors">{stat.label}</p>
                    <span className={`material-symbols-outlined ${stat.iconColor} group-hover:text-primary transition-colors duration-300`}>{stat.icon}</span>
                  </div>
                  <div className="flex items-end gap-3 mt-2">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">{stat.value}</p>
                    <div
                      className={`flex items-center gap-0.5 text-sm font-bold mb-1.5 px-2 py-0.5 rounded-full ${
                        stat.trend === 'up'
                          ? 'text-primary bg-primary/10'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {stat.trend === 'up' ? 'trending_up' : 'trending_flat'}
                      </span>
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Filters & Search */}
            <section className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="w-full sm:max-w-md relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                    search
                  </span>
                </div>
                <input
                  className="w-full h-12 pl-12 pr-4 bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  placeholder="Search tickets by ID, subject, or keyword..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('my')}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-sm ${
                    activeFilter === 'my'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-background-dark font-bold shadow-md'
                      : 'bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#29382f]'
                  } transition-colors`}
                >
                  My Tickets
                </button>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="whitespace-nowrap px-4 py-2.5 rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#29382f] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </section>

            {/* Table Section */}
            <section className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-[#29382f] bg-white dark:bg-[#1c2e24] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-[#15231b]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#29382f]">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="group hover:bg-gray-50 dark:hover:bg-[#21352b] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-gray-400">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit ${getPriorityClasses(
                              ticket.priorityColor
                            )}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full bg-${ticket.priorityColor}-500`}></div>
                            <span className="text-xs font-bold">{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center justify-center px-3 py-1 rounded-full border w-fit ${getStatusClasses(
                              ticket.statusColor
                            )}`}
                          >
                            <span className="text-xs font-bold">{ticket.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {ticket.created}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {ticket.updated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to="/ticket-detail/1"
                            className="text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#29382f] inline-flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-[#29382f] flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-gray-400">Showing 1-5 of 124 tickets</p>
                <div className="flex gap-2">
                  <button className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="size-8 flex items-center justify-center rounded-full bg-primary text-background-dark font-bold text-sm">
                    1
                  </button>
                  <button className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    2
                  </button>
                  <button className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    3
                  </button>
                  <span className="flex items-center text-slate-400">...</span>
                  <button className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tickets;
