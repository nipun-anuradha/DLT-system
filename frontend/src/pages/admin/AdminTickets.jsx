import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminTickets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const tickets = [
    {
      id: '#TCK-2049',
      subject: 'VPN Connection Issues',
      user: {
        name: 'Jane Cooper',
        department: 'Marketing',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB38ude9vlSoh5gcIM0GN00kF8Gs6fUfSEeehBR83ZJdAoXeNr41i9xFPld8qdbV0-jbT2rd9_-5vcwtORixFB7W4HxYxw5pHDeHJ2qRaiQFds6OnUfBdyNnrftVK4NVuCteJrbLywpCNnuCRAh5L7QTn3T0WxxAJKTy6mPDdTH1ZypyGipIcB6N_PZA-atY99_QAxvVtM6tBjw7eg8v83H2rsH7AOYbILWfn1_KYo_-V3NGra9BbyuXzwVfb1FLMKsf2nWo0VRRB4',
      },
      date: 'Oct 24, 2023',
      status: 'Open',
      statusColor: 'primary',
    },
    {
      id: '#TCK-2048',
      subject: 'Software License Renewal Request',
      user: {
        name: 'Cody Fisher',
        department: 'Development',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCKfw_iL2VmmQnw5baR3YBxt0guydtNOWZp5Hgm_awDuOCP5zjOv2wllZAz1BD9Gcz07-e8l8xfpfaHdEJcJ-b7kblthUugUOJ_86I1wT3yxtlQ32iXQIbVld0sZ66gsXwPOxV_nPye5RuwQuwVsKAWKbIWm0SOR8-oDV2XDDEFDULotS0MjqUZcNAaauAO0iaMiDqImohXkuqdjHNDm8BNbw2U_0hWDLmyUFqInCvc0rUAfJJ8C84DwsbC7EoCF_p9m3S6bhZvIXI',
      },
      date: 'Oct 23, 2023',
      status: 'In Progress',
      statusColor: 'yellow',
    },
    {
      id: '#TCK-2047',
      subject: 'Printer Jam on 2nd Floor',
      user: {
        name: 'Esther Howard',
        department: 'Sales',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCgwY4oGVgxBvqeL_YzL_Q_yhmhl_PtPj1Z2GESo5bb3kAVaSkKLdahG5k6ZadOdcmBzI0WRAx_8Hq2tnk7k33JP_nzXbwA8EELg4iY_EaDNrQ5Qgf4KpmmVSpgbI37nTQTUY-FVC41QZJPpxc_dYdUQJt-sF9tDMan4_xp8IqBULp4twVLoRxq0Z_kSBXAzqux8c503W-cCSNZU81pfMDMLzjykLoQ9jRlYJr1VjkxxTMk2EJZA0TrRRe3ct2hZUTC2zm0wOj4xEk',
      },
      date: 'Oct 22, 2023',
      status: 'Closed',
      statusColor: 'slate',
    },
    {
      id: '#TCK-2046',
      subject: 'New Monitor Request',
      user: {
        name: 'Guy Hawkins',
        department: 'Design',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBcFMewJvF8o7TLoYd9FeaWuQS2RGNrX_bjVaeOtE_j0oiwnRvBFvdi-jSL6Ugex2o8oGxCi5EiwtQkEpsgtB10JgYL_iMZgGJFyX6MjyNaXVF9yg9DOhup3SQSS77QVX9AnaOwEpMUXr2Dwt6ZH9ai54bBZVEr6LAWvrLpSmFVnxFrfoXU7N3_bDZ5jNCXIL17_NgQKgsxVN_qx39toI9FHgdMSETcACjNa9AqRROAxYLsDsEDkPc4Uuq0tCTcwVSqJxIoN2snse4',
      },
      date: 'Oct 21, 2023',
      status: 'Open',
      statusColor: 'primary',
    },
    {
      id: '#TCK-2045',
      subject: 'Email Signature Update',
      user: {
        name: 'Wade Warren',
        department: 'HR',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBszjIt2MvQul9fqE0-WSKQU8qd4XfXdLYSlkBDo6_NC2gLAf_QBz-X_Ct542HkVCUE4fTMhn5ZgY2e6FugjKaN6EudsYIfntdjhwL4DzhaJNglhC4MBe8Y5EKHiHXeFtm19a0XUcKCh44d7QJVPHlrPd7291-d-DwCKtASsQxngLycC2y_K9DNmbymBAq6qMac6Fea_8QlXqHKsF3yz3PfRx8CSIDVECjE4MipwbKxzrf1zWupVq3-hLysVDGCRXMjhRBK9am6f-o',
      },
      date: 'Oct 20, 2023',
      status: 'In Progress',
      statusColor: 'yellow',
    },
  ];

  const getStatusClass = (statusColor) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return colors[statusColor] || colors.primary;
  };

  const handleRowClick = (ticketId) => {
    navigate(`/admin/tickets/${ticketId.replace('#', '')}`);
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
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-[#9cbaa8]">Super Admin</p>
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
                  <p className="text-2xl font-bold text-white">1,248</p>
                </div>
                <div className="w-px bg-[#273a2f] h-10 mx-2"></div>
                <div className="text-right">
                  <p className="text-xs text-[#9cbaa8] uppercase tracking-wider font-semibold">Open</p>
                  <p className="text-2xl font-bold text-primary">42</p>
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
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <select className="appearance-none bg-background-dark border border-[#273a2f] text-white py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm cursor-pointer hover:border-[#9cbaa8]/50 transition-colors w-full md:w-40">
                    <option>Status: All</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
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
                    {tickets.map((ticket, index) => (
                      <tr
                        key={index}
                        className="group hover:bg-[#1e3b2b]/30 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(ticket.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{ticket.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-white truncate max-w-[250px]">
                              {ticket.subject}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 bg-cover bg-center"
                              style={{ backgroundImage: `url('${ticket.user.avatar}')` }}
                            ></div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{ticket.user.name}</div>
                              <div className="text-xs text-[#9cbaa8]">{ticket.user.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9cbaa8]">{ticket.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(
                              ticket.statusColor
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            {ticket.status !== 'Closed' && (
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-dark border-t border-[#273a2f] px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <a
                    className="relative inline-flex items-center px-4 py-2 border border-[#273a2f] text-sm font-medium rounded-md text-[#9cbaa8] bg-background-dark hover:bg-[#28392f]"
                    href="#"
                  >
                    Previous
                  </a>
                  <a
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#273a2f] text-sm font-medium rounded-md text-[#9cbaa8] bg-background-dark hover:bg-[#28392f]"
                    href="#"
                  >
                    Next
                  </a>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#9cbaa8]">
                      Showing <span className="font-medium text-white">1</span> to{' '}
                      <span className="font-medium text-white">5</span> of{' '}
                      <span className="font-medium text-white">97</span> results
                    </p>
                  </div>
                  <div>
                    <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <a
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f]"
                        href="#"
                      >
                        <span className="sr-only">Previous</span>
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </a>
                      <a
                        aria-current="page"
                        className="z-10 bg-primary/20 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        href="#"
                      >
                        1
                      </a>
                      <a
                        className="bg-background-dark border-[#273a2f] text-[#9cbaa8] hover:bg-[#28392f] relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        href="#"
                      >
                        2
                      </a>
                      <a
                        className="bg-background-dark border-[#273a2f] text-[#9cbaa8] hover:bg-[#28392f] relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        href="#"
                      >
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8]">
                        ...
                      </span>
                      <a
                        className="bg-background-dark border-[#273a2f] text-[#9cbaa8] hover:bg-[#28392f] relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        href="#"
                      >
                        8
                      </a>
                      <a
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#273a2f] bg-background-dark text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f]"
                        href="#"
                      >
                        <span className="sr-only">Next</span>
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </a>
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
