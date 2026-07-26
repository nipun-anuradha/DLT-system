import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { usePolling } from '../hooks';
import api from '../utils/api';

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('my');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState([
    {
      label: 'Total Tickets',
      value: '0',
      trend: 'flat',
      icon: 'folder',
      iconColor: 'text-slate-400',
      key: 'total',
    },
    {
      label: 'Open Tickets',
      value: '0',
      trend: 'flat',
      icon: 'mark_email_unread',
      iconColor: 'text-primary',
      highlight: true,
      key: 'open',
    },
    {
      label: 'In Progress',
      value: '0',
      trend: 'flat',
      icon: 'pending',
      iconColor: 'text-blue-400',
      key: 'inprogress',
    },
    {
      label: 'Closed Tickets',
      value: '0',
      trend: 'flat',
      icon: 'check_circle',
      iconColor: 'text-green-700 dark:text-green-900',
      key: 'closed',
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard counts
  const fetchDashboardCounts = useCallback(async () => {
    try {
      const response = await api.get('/user/tickets/dashboard/counts');
      if (response.success) {
        setStats(prevStats => prevStats.map(stat => ({
          ...stat,
          value: String(response.data[stat.key] || 0),
          trend: response.data[stat.key] > 0 ? 'up' : 'flat',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard counts:', error);
    }
  }, []);

  // Initial fetch for dashboard counts
  useEffect(() => {
    const init = async () => {
      await fetchDashboardCounts();
      setLoading(false);
    };
    init();
  }, [fetchDashboardCounts]);

  // Fetch tickets with filters and pagination
  const fetchTickets = useCallback(async (page = 1) => {
    setTicketsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        myTickets: activeFilter === 'my' ? 'true' : 'false',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await api.get(`/user/tickets?${params.toString()}`);
      if (response.success) {
        setTickets(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, [activeFilter, statusFilter, searchQuery]);

  // Poll for updates every 30 seconds
  const fetchAllData = useCallback(() => {
    fetchDashboardCounts();
    fetchTickets(pagination.currentPage);
  }, [fetchDashboardCounts, fetchTickets, pagination.currentPage]);

  usePolling(fetchAllData, 5000);

  // Fetch tickets when filters change
  useEffect(() => {
    fetchTickets(1);
  }, [activeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTickets(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    
    return pages;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      medium: 'amber',
      low: 'slate',
    };
    return colors[priority] || 'slate';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'primary',
      inprogress: 'blue',
      close: 'slate',
    };
    return colors[status] || 'slate';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      inprogress: 'In Progress',
      close: 'Closed',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getPriorityClasses = (color) => {
    const colors = {
      red: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
      amber: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      slate: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400',
    };
    return colors[color] || colors.slate;
  };

  const getStatusClasses = (color) => {
    const colors = {
      blue: 'border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400',
      primary: 'border-primary/30 text-emerald-700 dark:text-primary bg-primary/5',
      slate: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden h-screen flex">
      <Sidebar activePage="tickets" />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
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
                  <option value="inprogress">In Progress</option>
                  <option value="close">Closed</option>
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
                    {ticketsLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-gray-400">
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Loading tickets...
                          </div>
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                            <p>No tickets found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => {
                        const priorityColor = getPriorityColor(ticket.priority);
                        const statusColor = getStatusColor(ticket.status);
                        return (
                          <tr
                            key={ticket.id}
                            className="group hover:bg-gray-50 dark:hover:bg-[#21352b] transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500 dark:text-gray-400">
                              #{ticket.id}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                              {ticket.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit ${getPriorityClasses(priorityColor)}`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${priorityColor === 'red' ? 'bg-red-500' : priorityColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                <span className="text-xs font-bold">{getPriorityLabel(ticket.priority)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`flex items-center justify-center px-3 py-1 rounded-full border w-fit ${getStatusClasses(statusColor)}`}
                              >
                                <span className="text-xs font-bold">{getStatusLabel(ticket.status)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                              {formatDate(ticket.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                              {formatTimeAgo(ticket.updatedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/ticket-detail/${ticket.id}`}
                                className="text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#29382f] inline-flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!ticketsLoading && tickets.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-[#29382f] flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} tickets
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="flex items-center text-slate-400">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`size-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                            pagination.currentPage === page
                              ? 'bg-primary text-background-dark font-bold'
                              : 'bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="size-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1c2e24] border border-gray-200 dark:border-[#29382f] text-slate-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tickets;
