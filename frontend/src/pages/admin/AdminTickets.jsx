import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { usePolling } from '../../hooks';
import api from '../../utils/api';
import { useAuth } from '../../context';

const AdminTickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [counts, setCounts] = useState({
    totalTickets: 0,
    openTickets: 0
  });
  const navigate = useNavigate();
  const { admin } = useAuth();

  // Fetch dashboard counts
  const fetchCounts = async () => {
    try {
      const response = await api.get('/admin/dashboard/counts');
      if (response.success) {
        setCounts({
          totalTickets: response.data.totalTickets,
          openTickets: response.data.openTickets
        });
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  // Fetch tickets
  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await api.get(`/admin/tickets?${params}`);
      if (response.success) {
        setTickets(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const refreshTickets = useCallback(() => {
    fetchTickets(pagination.currentPage);
  }, [fetchTickets, pagination.currentPage]);

  // Initial load
  useEffect(() => {
    fetchCounts();
  }, []);

  // Fetch tickets when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTickets(1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, statusFilter, fetchTickets]);

  usePolling(refreshTickets, 5000);

  // Handle page change
  const handlePageChange = (page) => {
    fetchTickets(page);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      open: { label: 'Open', color: 'primary' },
      inprogress: { label: 'In Progress', color: 'yellow' },
      close: { label: 'Closed', color: 'slate' }
    };
    return statusMap[status] || statusMap.open;
  };

  const getStatusClass = (statusColor) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return colors[statusColor] || colors.primary;
  };

  const handleRowClick = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  const handleTakeTicket = async (ticketId) => {
    try {
      const response = await api.put(`/admin/tickets/${ticketId}/take`, {});
      if (response.success) {
        fetchTickets(pagination.currentPage);
      } else {
        alert(response.message || 'Failed to take ticket');
      }
    } catch (error) {
      console.error('Error taking ticket:', error);
      alert(error.message || 'Failed to take ticket');
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#273a2f] px-6 lg:px-8 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            
            {/* Back Button */}
            <button 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => navigate('/admin/dashboard')}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center text-sm font-medium text-[#9cbaa8] ml-4">
              <a className="hover:text-white transition-colors" href="#">
                Home
              </a>
              <span className="mx-2 text-[#273a2f]">/</span>
              <a className="hover:text-white transition-colors" href="#">
                Tickets
              </a>
              <span className="mx-2 text-[#273a2f]">/</span>
              <span className="text-primary">All Tickets</span>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#28392f]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-[#9cbaa8]">Administrator</p>
              </div>
              <div className="relative size-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center border-2 border-[#28392f] shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Ticket Management</h2>
                <p className="text-[#9cbaa8] mt-1">Overview of all support requests and their current status.</p>
              </div>
              <div className="flex gap-3">
                <div className="text-right">
                  <p className="text-xs text-[#9cbaa8] uppercase tracking-wider font-semibold">Total Tickets</p>
                  <p className="text-2xl font-bold text-white">{counts.totalTickets.toLocaleString()}</p>
                </div>
                <div className="w-px bg-[#273a2f] h-10 mx-2"></div>
                <div className="text-right">
                  <p className="text-xs text-[#9cbaa8] uppercase tracking-wider font-semibold">Open</p>
                  <p className="text-2xl font-bold text-primary">{counts.openTickets}</p>
                </div>
              </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="bg-surface-dark p-4 rounded-xl border border-[#273a2f] shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#9cbaa8] group-focus-within:text-primary transition-colors">
                    search
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#273a2f] rounded-lg leading-5 bg-background-dark text-white placeholder-[#9cbaa8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-inner"
                  placeholder="Search by ID, Subject, or User..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <select 
                    className="appearance-none bg-background-dark border border-[#273a2f] text-white py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm cursor-pointer hover:border-[#9cbaa8]/50 transition-colors w-full md:w-40"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Status: All</option>
                    <option value="open">Open</option>
                    <option value="inprogress">In Progress</option>
                    <option value="close">Closed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9cbaa8]">
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </div>
                </div>
                <button
                  className="p-2.5 bg-background-dark border border-[#273a2f] rounded-lg text-[#9cbaa8] hover:text-white hover:border-primary transition-colors"
                  title="Export CSV"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>

            {/* Ticket Table */}
            <div className="bg-surface-dark rounded-xl border border-[#273a2f] shadow-lg overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#273a2f]">
                  <thead className="bg-[#1e3b2b]/50">
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        ID
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider w-1/3"
                        scope="col"
                      >
                        Subject
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        Created By
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        Branch
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        Date
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        Status
                      </th>
                      <th
                        className="px-6 py-4 text-right text-xs font-semibold text-[#9cbaa8] uppercase tracking-wider"
                        scope="col"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#273a2f]">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[#9cbaa8]">Loading tickets...</span>
                          </div>
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-[#9cbaa8]">
                          No tickets found
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => {
                        const statusInfo = getStatusInfo(ticket.status);
                        return (
                          <tr
                            key={ticket.id}
                            className="group hover:bg-[#1e3b2b]/30 transition-colors cursor-pointer"
                            onClick={() => handleRowClick(ticket.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">#{ticket.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-white truncate max-w-[250px]">
                                  {ticket.subject}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-green-600 flex-shrink-0 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white text-sm">person</span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-white">{ticket.user?.name || 'Unknown'}</div>
                                  <div className="text-xs text-[#9cbaa8]">{ticket.user?.department || 'N/A'}</div>
                                    {ticket.assignedAdmin?.username && (
                                      <div className="text-[11px] text-amber-400 mt-0.5">
                                        Taken by {ticket.assignedAdmin.username}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9cbaa8]">{ticket.user?.branch || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9cbaa8]">{formatDate(ticket.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(statusInfo.color)}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {ticket.status === 'open' && (
                                  <button
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTakeTicket(ticket.id);
                                    }}
                                    title="Take Ticket"
                                  >
                                    Take
                                  </button>
                                )}
                                <button
                                  className="p-1 text-[#9cbaa8] hover:text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(ticket.id);
                                  }}
                                  title="View Ticket"
                                >
                                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                                <button
                                  className="p-1 text-[#9cbaa8] hover:text-primary transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Edit Status"
                                >
                                  <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                {ticket.status !== 'close' && (
                                  <button
                                    className="p-1 text-[#9cbaa8] hover:text-red-400 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Close Ticket"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-dark border-t border-[#273a2f] px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    className="relative inline-flex items-center px-4 py-2 border border-[#273a2f] text-sm font-medium rounded-md text-[#9cbaa8] bg-background-dark hover:bg-[#28392f] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                  >
                    Previous
                  </button>
                  <button
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#273a2f] text-sm font-medium rounded-md text-[#9cbaa8] bg-background-dark hover:bg-[#28392f] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#9cbaa8]">
                      Showing <span className="font-medium text-white">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium text-white">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
                      <span className="font-medium text-white">{pagination.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                      >
                        <span className="sr-only">Previous</span>
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                      {getPaginationNumbers().map((page, index) => (
                        page === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.currentPage
                                ? 'z-10 bg-primary/20 border-primary text-primary'
                                : 'bg-background-dark border-[#273a2f] text-[#9cbaa8] hover:bg-[#28392f]'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                      <button
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                      >
                        <span className="sr-only">Next</span>
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
