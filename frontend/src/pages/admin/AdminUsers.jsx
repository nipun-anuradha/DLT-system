import { useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminUsers = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const users = [
    {
      id: 1,
      name: 'Liam Johnson',
      email: 'liam.j@managesys.com',
      employeeId: 'EMP-2049',
      role: 'Administrator',
      roleIcon: 'admin_panel_settings',
      roleColor: 'purple',
      status: 'Active',
      statusColor: 'primary',
      lastLogin: 'Oct 24, 2023 09:41 AM',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCkfhwYdca94H5WJBEBaShl9H1FG-oTZdOKmKlQDkR3U-SfOD46svi1FJ2qg4kQSPrdYNVupwSmaTdNRdnpREWiC344ULLji1JxZf5kf25j-jyxdZbPbMg1ADFiQErWLBoCTJB-qsO5LpDuqLROxF780FYfEDBhqLoO-N38M1BpHEjLSemBeS_Vw0A0H4qOLXlGuisg_yOk458ORUXPTPc_Sq2ZQLiA9kBvSoS7UoIFMX6CJsEMnQSlXrFK_OgcwRhNKZDeS0P75w8',
    },
    {
      id: 2,
      name: 'Olivia Smith',
      email: 'o.smith@managesys.com',
      employeeId: 'EMP-3912',
      role: 'User',
      roleIcon: 'person',
      roleColor: 'blue',
      status: 'Active',
      statusColor: 'primary',
      lastLogin: 'Oct 23, 2023 04:15 PM',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAXaB5St52SfWsCuhWOfk52JJqw4BR2pgAz-Tedoz0h8lQ4uQ2cCmp2rPNBtlghTyPiTGCUQwUj9KbpIvTn6o2u2B2WzpcI_vVeA8hW8wfV-RA1D1I17SimOeFjuHfvRChfvk5s12ktqUrGVxJmuK_YSqFMtRLbcKxtPYmsfGYi2TnvTpSlFJO8n8i6l4QhJdBVbTxOYNELfK0SFVRurDe0d45PLfNHfx2xEtiwnrlWLzzNsDw6GB5Nz07Fa3QW0WRCd6GNEMFhU0g',
    },
    {
      id: 3,
      name: 'Ethan Scott',
      email: 'ethan.s@managesys.com',
      employeeId: 'EMP-1102',
      role: 'Support Agent',
      roleIcon: 'support_agent',
      roleColor: 'orange',
      status: 'Disabled',
      statusColor: 'gray',
      lastLogin: 'Sep 12, 2023 11:00 AM',
      initials: 'ES',
    },
    {
      id: 4,
      name: 'Noah Williams',
      email: 'n.williams@managesys.com',
      employeeId: 'EMP-4401',
      role: 'User',
      roleIcon: 'person',
      roleColor: 'blue',
      status: 'Active',
      statusColor: 'primary',
      lastLogin: 'Oct 22, 2023 02:20 PM',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDfzxm6EeukL5iXGqBrdPSeBueswU02q6GStWJ7m3PQyR6nG4j89Uc9-sDTmleaZ1nJA_I60qi7M0mCoFNlFBee8FXTCPk50MMnjlZKOpBiUrrsEJwnag8J-LUtmNjG4QCSER43I9HT0OLQF_jXF9VLICkWa-9pDLZJqi3wbG_LxvUxnjI0wnTjyMCbuELOYeTgX5ES9EpTvb4gfcjFmjwTU4LSG9i1B5Yjwmg4FiKFkZYRMoet3-lTGqVNL3PJkOBJ1cVkvhT99Bg',
    },
    {
      id: 5,
      name: 'Ava Martinez',
      email: 'ava.m@managesys.com',
      employeeId: 'EMP-5122',
      role: 'User',
      roleIcon: 'person',
      roleColor: 'blue',
      status: 'Pending',
      statusColor: 'yellow',
      lastLogin: 'Never',
      initials: 'AV',
    },
  ];

  const getStatusBadge = (status, statusColor) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    const dotColors = {
      primary: 'bg-primary',
      gray: 'bg-gray-400',
      yellow: 'bg-yellow-400',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[statusColor]}`}>
        <span className={`size-1.5 rounded-full ${dotColors[statusColor]}`}></span>
        {status}
      </span>
    );
  };

  const getRoleIconColor = (color) => {
    const colors = {
      purple: 'text-purple-400',
      blue: 'text-blue-400',
      orange: 'text-orange-400',
    };
    return colors[color] || 'text-blue-400';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u.id));
      setSelectAll(true);
    } else {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      if (newSelected.length === users.length) {
        setSelectAll(true);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#28392f] px-6 lg:px-10 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <button 
              className="text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-white text-lg font-bold">ManageSys</h2>
          </div>

          {/* Search (Desktop) */}
          <div className="hidden md:flex w-full max-w-md items-center">
            <label className="flex w-full cursor-text items-center rounded-xl bg-[#1d2d25] border border-transparent focus-within:border-primary/50 transition-colors h-10 px-3">
              <span className="material-symbols-outlined text-[#9cbaa8]">search</span>
              <input
                className="w-full bg-transparent px-3 text-sm text-white placeholder-[#9cbaa8] focus:outline-none"
                placeholder="Global Search..."
              />
            </label>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative flex items-center justify-center rounded-xl bg-[#28392f] hover:bg-[#344a3d] text-white p-2 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-[#28392f]"></span>
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
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8 lg:px-12 scroll-smooth">
          <div className="mx-auto max-w-7xl flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <a className="text-[#9cbaa8] hover:text-primary transition-colors flex items-center gap-1" href="#">
                <span className="material-symbols-outlined text-[18px]">home</span>
                Home
              </a>
              <span className="text-[#9cbaa8]">/</span>
              <a className="text-[#9cbaa8] hover:text-primary transition-colors" href="#">
                Admin
              </a>
              <span className="text-[#9cbaa8]">/</span>
              <span className="text-primary font-medium">System Users</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">System Users</h1>
                <p className="text-[#9cbaa8] mt-2">Manage user access, roles, and account statuses.</p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-primary hover:bg-[#32d473] text-[#102217] px-5 py-3 font-bold transition-all shadow-[0_0_15px_rgba(61,245,135,0.2)] hover:shadow-[0_0_20px_rgba(61,245,135,0.4)]">
                <span className="material-symbols-outlined">add</span>
                <span>Add New User</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5 lg:col-span-6">
                <label className="flex h-12 w-full items-center rounded-xl bg-surface-dark border border-[#28392f] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all px-4 shadow-sm">
                  <span className="material-symbols-outlined text-[#9cbaa8] mr-3">search</span>
                  <input
                    className="flex-1 bg-transparent text-white placeholder-[#5a7063] focus:outline-none text-base"
                    placeholder="Search by Name, ID or Email"
                  />
                </label>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl border border-[#28392f] bg-surface-dark overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#15261d] text-[#9cbaa8] text-xs uppercase tracking-wider font-semibold">
                      <th className="p-4 border-b border-[#28392f] w-12">
                        <input
                          className="rounded border-gray-600 bg-[#28392f] text-primary focus:ring-offset-[#102217]"
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 border-b border-[#28392f] cursor-pointer hover:text-white transition-colors group">
                        <div className="flex items-center gap-1">
                          User Details{' '}
                          <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100">
                            arrow_drop_down
                          </span>
                        </div>
                      </th>
                      <th className="p-4 border-b border-[#28392f]">Employee ID</th>
                      <th className="p-4 border-b border-[#28392f]">Role</th>
                      <th className="p-4 border-b border-[#28392f]">Status</th>
                      <th className="p-4 border-b border-[#28392f]">Last Login</th>
                      <th className="p-4 border-b border-[#28392f] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#28392f]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#1d3326] transition-colors group">
                        <td className="p-4">
                          <input
                            className="rounded border-gray-600 bg-[#28392f] text-primary focus:ring-0 focus:ring-offset-0"
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-9"
                                style={{ backgroundImage: `url('${user.avatar}')` }}
                              ></div>
                            ) : (
                              <div
                                className={`flex items-center justify-center bg-${user.initials === 'ES' ? 'blue' : 'purple'}-500/20 text-${user.initials === 'ES' ? 'blue' : 'purple'}-400 rounded-full size-9 font-bold text-sm`}
                              >
                                {user.initials}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{user.name}</span>
                              <span className="text-[#9cbaa8] text-xs">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white font-mono text-xs">{user.employeeId}</td>
                        <td className="p-4 text-white">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-[18px] ${getRoleIconColor(user.roleColor)}`}>
                              {user.roleIcon}
                            </span>
                            <span>{user.role}</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(user.status, user.statusColor)}</td>
                        <td className={`p-4 ${user.lastLogin === 'Never' ? 'text-[#9cbaa8] italic text-xs' : 'text-[#9cbaa8]'}`}>
                          {user.lastLogin}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            {user.status === 'Disabled' ? (
                              <button
                                className="p-2 text-[#9cbaa8] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Enable User"
                              >
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                              </button>
                            ) : user.status === 'Pending' ? (
                              <button
                                className="p-2 text-[#9cbaa8] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Resend Invite"
                              >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                              </button>
                            ) : (
                              <button
                                className="p-2 text-[#9cbaa8] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Disable User"
                              >
                                <span className="material-symbols-outlined text-[20px]">block</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between border-t border-[#28392f] bg-[#15261d] px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#9cbaa8]">
                      Showing <span className="font-medium text-white">1</span> to{' '}
                      <span className="font-medium text-white">5</span> of{' '}
                      <span className="font-medium text-white">42</span> results
                    </p>
                  </div>
                  <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <a
                        className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0"
                        href="#"
                      >
                        <span className="sr-only">Previous</span>
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                      </a>
                      <a
                        aria-current="page"
                        className="relative z-10 inline-flex items-center bg-primary/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/30 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        href="#"
                      >
                        1
                      </a>
                      <a
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0"
                        href="#"
                      >
                        2
                      </a>
                      <a
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0"
                        href="#"
                      >
                        3
                      </a>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9cbaa8] ring-1 ring-inset ring-[#28392f]">
                        ...
                      </span>
                      <a
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0"
                        href="#"
                      >
                        8
                      </a>
                      <a
                        className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-[#9cbaa8] ring-1 ring-inset ring-[#28392f] hover:bg-[#28392f] hover:text-white focus:z-20 focus:outline-offset-0"
                        href="#"
                      >
                        <span className="sr-only">Next</span>
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </a>
                    </nav>
                  </div>
                </div>

                {/* Mobile Pagination */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <a
                    className="relative inline-flex items-center rounded-lg border border-[#28392f] bg-[#1d2d25] px-4 py-2 text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
                    href="#"
                  >
                    Previous
                  </a>
                  <a
                    className="relative inline-flex items-center rounded-lg border border-[#28392f] bg-[#1d2d25] px-4 py-2 text-sm font-medium text-[#9cbaa8] hover:bg-[#28392f] hover:text-white"
                    href="#"
                  >
                    Next
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
