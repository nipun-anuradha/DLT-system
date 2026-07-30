import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useAuth } from '../../context';
import { usePolling } from '../../hooks';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [counts, setCounts] = useState({
    totalTickets: 0,
    openTickets: 0,
    inprogressTickets: 0,
    closedTickets: 0,
    totalUsers: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const navigate = useNavigate();
  const { admin } = useAuth();

  // Fetch dashboard counts
  const fetchCounts = useCallback(async () => {
    try {
      const response = await api.get('/admin/dashboard/counts');
      if (response.success) {
        setCounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  }, []);

  // Fetch recent tickets
  const fetchRecentTickets = useCallback(async (status = 'all') => {
    try {
      setTicketsLoading(true);
      const response = await api.get(`/admin/dashboard/recent-tickets?status=${status}&limit=5`);
      if (response.success) {
        setRecentTickets(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCounts(), fetchRecentTickets()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCounts, fetchRecentTickets]);

  // Poll for dashboard updates every 30 seconds
  const fetchDashboardData = useCallback(() => {
    fetchCounts();
    fetchRecentTickets(activeFilter);
  }, [fetchCounts, fetchRecentTickets, activeFilter]);

  usePolling(fetchDashboardData, 5000);

  // Handle filter change
  const handleFilterChange = (status) => {
    setActiveFilter(status);
    fetchRecentTickets(status);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'orange';
      case 'inprogress': return 'blue';
      case 'close': return 'green';
      default: return 'gray';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'inprogress': return 'In Progress';
      case 'close': return 'Closed';
      default: return status;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const stats = [
    {
      label: 'Total Tickets',
      value: formatNumber(counts.totalTickets),
      icon: 'layers',
      color: 'primary',
    },
    {
      label: 'Open Tickets',
      value: formatNumber(counts.openTickets),
      icon: 'warning',
      color: 'orange',
    },
    {
      label: 'In Progress',
      value: formatNumber(counts.inprogressTickets),
      icon: 'schedule',
      color: 'blue',
    },
    {
      label: 'Closed Tickets',
      value: formatNumber(counts.closedTickets),
      icon: 'check_circle',
      color: 'primary',
    },
    {
      label: 'Total Users',
      value: formatNumber(counts.totalUsers),
      icon: 'group',
      color: 'primary',
    },
  ];

  if (loading) {
    return (
      <div className="bg-background-dark text-white font-display h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-[#9cbaa8]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#28392f] px-6 lg:px-8 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              className="text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-white text-lg font-bold">Admin</h2>
          </div>

          {/* Search (Desktop) */}
          <div className="hidden lg:flex items-center max-w-md w-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9cbaa8]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#28392f] rounded-xl leading-5 bg-[#162b20] text-gray-300 placeholder-[#9cbaa8] focus:outline-none focus:bg-[#1f382a] focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                placeholder="Search tickets, users, or settings..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-[#9cbaa8] hover:bg-[#28392f] hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#28392f]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-[#9cbaa8]">{admin?.is_super ? 'Super Admin' : 'Administrator'}</p>
              </div>
              <div className="relative size-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center border-2 border-[#28392f] shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Breadcrumbs & Heading */}
            <div className="flex flex-col gap-2">
              <nav className="flex text-sm text-[#9cbaa8]">
                <a className="hover:text-primary transition-colors" href="#">
                  Admin
                </a>
                <span className="mx-2">/</span>
                <span className="text-white">Dashboard</span>
              </nav>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">Dashboard Overview</h1>
                <p className="text-[#9cbaa8]">System performance metrics and support ticket status.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-surface-dark border border-[#28392f] p-5 rounded-2xl shadow-sm hover:shadow-[0_0_20px_-5px_rgba(61,245,135,0.1)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`bg-[#28392f] p-2 rounded-lg ${
                        stat.color === 'orange' 
                          ? 'group-hover:bg-orange-500/20' 
                          : stat.color === 'blue' 
                          ? 'group-hover:bg-blue-500/20' 
                          : 'group-hover:bg-primary/20'
                      } transition-colors`}
                    >
                      <span
                        className={`material-symbols-outlined text-white ${
                          stat.color === 'orange' 
                            ? 'group-hover:text-orange-500' 
                            : stat.color === 'blue' 
                            ? 'group-hover:text-blue-500' 
                            : 'group-hover:text-primary'
                        } transition-colors`}
                      >
                        {stat.icon}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#9cbaa8] text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-white text-2xl font-bold">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#132419] via-[#16281c] to-[#1b3323] border border-[#28392f] rounded-2xl p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">Inventory and Device Management</h3>
                  <p className="text-[#9cbaa8] text-sm max-w-2xl">
                    Track PCs, printers, mobile devices, and dongles. Review assignment history and user device specs from one place.
                  </p>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-[#102217] font-bold hover:bg-[#32d473] transition-colors"
                onClick={() => navigate('/admin/inventory')}
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                Open Inventory
              </button>
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-surface-dark border border-[#28392f] rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#28392f] flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-white">Recent Tickets</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleFilterChange('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === 'all' 
                        ? 'bg-[#28392f] text-white' 
                        : 'text-[#9cbaa8] hover:text-white hover:bg-[#28392f]'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => handleFilterChange('open')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === 'open' 
                        ? 'bg-[#28392f] text-white' 
                        : 'text-[#9cbaa8] hover:text-white hover:bg-[#28392f]'
                    }`}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => handleFilterChange('inprogress')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === 'inprogress' 
                        ? 'bg-[#28392f] text-white' 
                        : 'text-[#9cbaa8] hover:text-white hover:bg-[#28392f]'
                    }`}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => handleFilterChange('close')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeFilter === 'close' 
                        ? 'bg-[#28392f] text-white' 
                        : 'text-[#9cbaa8] hover:text-white hover:bg-[#28392f]'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto relative">
                {ticketsLoading && (
                  <div className="absolute inset-0 bg-background-dark/50 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                  </div>
                )}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111814] text-[#9cbaa8] text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Ticket ID</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Subject</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Requester</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Status</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Priority</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]">Date</th>
                      <th className="px-6 py-4 font-medium border-b border-[#28392f]"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#28392f]">
                    {recentTickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-[#9cbaa8]">
                          No tickets found
                        </td>
                      </tr>
                    ) : (
                      recentTickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-[#1f382a] transition-colors cursor-pointer" onClick={() => navigate(`/admin/tickets/${ticket.id}`)}>
                          <td className="px-6 py-4 text-white font-mono">#{ticket.id}</td>
                          <td className="px-6 py-4 text-white font-medium">{ticket.subject}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-xs font-bold text-white">
                                {ticket.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-white">{ticket.user?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                getStatusColor(ticket.status) === 'orange' 
                                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                                  : getStatusColor(ticket.status) === 'blue'
                                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                getStatusColor(ticket.status) === 'orange' 
                                  ? 'bg-orange-500' 
                                  : getStatusColor(ticket.status) === 'blue'
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                              }`}></span>
                              {getStatusLabel(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-medium text-xs uppercase tracking-wider ${
                                getPriorityColor(ticket.priority) === 'red' 
                                  ? 'text-red-400' 
                                  : getPriorityColor(ticket.priority) === 'yellow'
                                  ? 'text-yellow-400'
                                  : 'text-[#9cbaa8]'
                              }`}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#9cbaa8]">{formatDate(ticket.date)}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9cbaa8] hover:text-white" onClick={(e) => e.stopPropagation()}>
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[#28392f] bg-[#111814] flex justify-center">
                <button 
                  className="text-[#9cbaa8] text-sm hover:text-white flex items-center gap-1 transition-colors"
                  onClick={() => navigate('/admin/tickets')}
                >
                  View All Tickets <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <footer className="mt-8 border-t border-[#28392f] pt-8 pb-4">
              <p className="text-center text-[#9cbaa8] text-sm">© {new Date().getFullYear()} DLT IT Admin Panel v1.0</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
