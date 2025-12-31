import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Tickets',
      value: '1,245',
      trending: 'up',
      icon: 'layers',
      color: 'primary',
    },
    {
      label: 'Open Tickets',
      value: '42',
      change: '8',
      trending: 'up',
      icon: 'warning',
      color: 'orange',
    },
    {
      label: 'In Progress',
      value: '18',
      trending: 'down',
      icon: 'schedule',
      color: 'blue',
    },
    {
      label: 'Closed Tickets',
      value: '1,185',
      trending: 'up',
      icon: 'check_circle',
      color: 'primary',
    },
    {
      label: 'Total Users',
      value: '340',
      trending: 'up',
      icon: 'group',
      color: 'primary',
    },
  ];

  const recentTickets = [
    {
      id: '#1024',
      subject: 'VPN Connection Failure',
      requester: {
        name: 'Sarah Jenkins',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAfdVGTmP4HoVzcab3au-YFZcLjTVJ2CIb8l6CyM2wiLaX7OJ5-Z39vGkmIbFhbSl7OuhdTw8Ctc1gFgMz4vzSw3n1fM3WHRimR1_NCpStsJoC5hFJ39hl9AzTpr2Hzsd32E8POsrTXImQGwZVMwz9tx5a4NbBzthGKEKC0U_JPTMygc2ZDyAA-5XoaW3ZXC8z-iLzJLAiTyn2DCB82Lxqg5jeYsPGEt4c055VAHAT29EWHv_IR-IVLAwjpUhrtolWdxuBhBSAE-h4',
      },
      status: 'Open',
      statusColor: 'orange',
      priority: 'High',
      priorityColor: 'red',
      date: 'Oct 24, 2023',
    },
    {
      id: '#1023',
      subject: 'Software License Renewal',
      requester: {
        name: 'Mike Ross',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBkWk2Q3QvFixBSp2kx7GH8yn02Ho3h1WWat3v5NcAmvFbp_kIoA3sAMGGI1NlzD0YY863mTRZV_9EGjPq0ov2NPbq6IbA-o3RRuc_ggwQGUTUmxFs8R4zfwKdPI-IFAkXl_ZEPhGnvor5vzF66H0rCIeoKLbbxIfUrcCT3bt7uBpRLMdfz4VL9yfgtSzeG9ZVpMos31_Frpk7JZwo5wMsdR2ufMpqxdCwjc4vYk42dOGEdE65SP8JdhT7-FxYQOhW0bcMJ4N1qFys',
      },
      status: 'In Progress',
      statusColor: 'blue',
      priority: 'Medium',
      priorityColor: 'yellow',
      date: 'Oct 24, 2023',
    },
    {
      id: '#1022',
      subject: 'Password Reset Request',
      requester: {
        name: 'Emily Blunt',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDB5D3qjEOC4vFmmw68C4uXru0ITbAgF7CkIq4eSErJNwaB90BHGsWgqWcWscWKRTH3EOzQxRiA098J0mYfPPdfxMbbpK_jjN2Dp1lUVmA32ByuuJIUeQ2qzVhDd0niiYBvIic7y7UwZ7HGjlFBrQtUI-r-74XmMDN3v-3ouy3TsdrhUl4fqnlmR1S5CX0Gy5NWvG0Oye56YWfjhSOaMkWJFbPnn0QQmYYRG2nK0rlg4HKW558dSfgUwUEkbkrM7BFQABeaXB9hsF8',
      },
      status: 'Closed',
      statusColor: 'green',
      priority: 'Low',
      priorityColor: 'gray',
      date: 'Oct 23, 2023',
    },
  ];

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
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-[#9cbaa8]">Super Admin</p>
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
                      className={`bg-[#28392f] p-2 rounded-lg group-hover:bg-${stat.color === 'orange' ? 'orange' : stat.color === 'blue' ? 'blue' : 'primary'}/20 transition-colors`}
                    >
                      <span
                        className={`material-symbols-outlined text-white group-hover:text-${stat.color === 'orange' ? 'orange-500' : stat.color === 'blue' ? 'blue-500' : 'primary'} transition-colors`}
                      >
                        {stat.icon}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        stat.trending === 'up'
                          ? `text-${stat.color === 'orange' ? 'orange' : 'primary'}-500 bg-${stat.color === 'orange' ? 'orange' : 'primary'}-500/10`
                          : 'text-[#9cbaa8] bg-[#28392f]'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-[#9cbaa8] text-sm font-medium mb-1">{stat.label}</p>
                  <h3 className="text-white text-2xl font-bold">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-surface-dark border border-[#28392f] rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#28392f] flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-white">Recent Tickets</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#28392f] text-white hover:bg-[#34463b]">
                    All
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9cbaa8] hover:text-white hover:bg-[#28392f]">
                    Open
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9cbaa8] hover:text-white hover:bg-[#28392f]">
                    Processing
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9cbaa8] hover:text-white hover:bg-[#28392f]">
                    Closed
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id} className="group hover:bg-[#1f382a] transition-colors">
                        <td className="px-6 py-4 text-white font-mono">{ticket.id}</td>
                        <td className="px-6 py-4 text-white font-medium">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-6"
                              style={{ backgroundImage: `url('${ticket.requester.avatar}')` }}
                            ></div>
                            <span className="text-white">{ticket.requester.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${ticket.statusColor}-500/10 text-${ticket.statusColor}-500 border border-${ticket.statusColor}-500/20`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-${ticket.statusColor}-500`}></span>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-${ticket.priorityColor === 'red' ? 'red' : ticket.priorityColor === 'yellow' ? 'yellow' : '[#9cbaa8]'}-400 font-medium text-xs uppercase tracking-wider`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#9cbaa8]">{ticket.date}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#9cbaa8] hover:text-white">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
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
              <p className="text-center text-[#9cbaa8] text-sm">© {new Date().getFullYear()} DLT IT.Admin Panel v1.0</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
