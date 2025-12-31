import { useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminNotices = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const notices = [
    {
      id: 1,
      subject: 'Emergency Downtime - Payment Gateway',
      preview: 'The payment provider is currently experiencing...',
      date: 'Oct 24, 2023',
      time: '14:30',
      author: {
        name: 'Alex M.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCjzOfnhADU1n6JZtarAEVGMqadPix9ADJMYoT8xAeOi1dLkqBXlmgvDPWlYt8RgWKjGlZuwbOt8-jiAP9IitFEdeErcarDXlpBxvUhHYrRNl09Mgmc2DEVE8yHWbhoIZNtuppMuxX1Y_WFamwctCKk_ERP5x0qKn_D2snSr-nmqFOlDgSj5W891SLn4AK-7EWe96LfEB9oBrloUwkXCFdjDwLZTYN7tgqU-QM285vDRRbqKgDsdTAjrntYtQbpo_3O1Lr6cgXaWow',
      },
      status: 'Sent',
      statusColor: 'primary',
    },
    {
      id: 2,
      subject: 'System Update v2.4.0 Features',
      preview: 'Introducing new dashboard widgets and faster...',
      date: 'Oct 20, 2023',
      time: '09:15',
      author: {
        name: 'Sarah J.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAZOIDtVupNI5WuBKzKU3Fpf935iQJE3P-ZtvTbZK4gJRs2mL76js0Vr34VkshaYZn6i-UlPkw8OFJzjy2uNx9ELwt7DmpdMJ7rNnsStay99PXClKNS6T8SVzSMOlz_K5XH9xdol9Mxa7QX_Ii_RTbchkcHietm_IonT8SoMTkCgegk3fQDqYqtyR7PbgcOU381sE7D1ghRwXqBT1nx7psti2dvC0CJ6lyRngPdFSZAAPByrwWPGtRxL6e6mdoEhyvb5WvlSSBBbDI',
      },
      status: 'Sent',
      statusColor: 'primary',
    },
    {
      id: 3,
      subject: 'Holiday Support Schedule',
      preview: 'Drafting the hours for the upcoming winter holidays...',
      date: 'Oct 18, 2023',
      time: '16:45',
      author: {
        name: 'Alex M.',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Odh-mQ0dnxIi-YiAlL9b2z9d8QHYqaE6DvQAxWcbuTG6yfId6Gb5CzglD7bPVkKziZaDx5Sx11AmE_r8ZDKhaHYeWFQa5KsaDNCs3u-scmIm_d7agf1Ok6UPyqxiy_pOIe34d75AbwIMSNWPw3PdOc5RMbdTHCCFQ0MBExBEcdpwdPApiOum_LPyyljhZt_ElU469bMHanIVjQCla39aXguaXvwoa4nA0hkiPCIQ23hfP6WSpjg75YGexplfGZn9mQhQUgMu7yY',
      },
      status: 'Draft',
      statusColor: 'gray',
    },
  ];

  const getStatusBadge = (status, statusColor) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const dotColors = {
      primary: 'bg-primary',
      gray: 'bg-gray-400',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[statusColor]}`}>
        <span className={`size-1.5 rounded-full ${dotColors[statusColor]}`}></span>
        {status}
      </span>
    );
  };

  const handlePublish = () => {
    console.log('Publishing notice:', { subject, description });
    // Reset form
    setSubject('');
    setDescription('');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', { subject, description });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-[#273a2f] bg-surface-dark px-6 py-4 sticky top-0 z-20">
          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden text-white mr-4 p-1 hover:bg-[#28392f] rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <a className="text-[#9cbaa8] hover:text-primary transition-colors" href="#">
              Admin
            </a>
            <span className="text-[#273a2f]">/</span>
            <span className="text-white font-medium">Notices</span>
          </div>

          <div className="flex flex-1 justify-end gap-4 items-center">
            {/* Search */}
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#9cbaa8] text-lg group-focus-within:text-primary">
                  search
                </span>
              </div>
              <input
                className="block w-64 rounded-xl border-none bg-[#273a2f] py-2 pl-10 pr-3 text-white placeholder:[#9cbaa8] focus:ring-2 focus:ring-primary focus:bg-[#273a2f]/80 transition-all text-sm"
                placeholder="Search notices..."
                type="text"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="relative flex items-center justify-center rounded-xl size-10 bg-[#273a2f] text-white hover:bg-primary hover:text-background-dark transition-all">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-surface-dark"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-4 pb-4 border-b border-[#273a2f]/30">
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">Notice Management</h2>
                <p className="text-[#9cbaa8] text-base">
                  Create, edit, and manage system-wide announcements for all users.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-sm text-primary font-medium">System Online</span>
              </div>
            </div>

            {/* Create Notice Section */}
            <div className="bg-surface-dark rounded-xl border border-[#273a2f] shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#273a2f] bg-[#273a2f]/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <h3 className="text-white text-lg font-bold">Compose New Notice</h3>
              </div>
              <div className="p-6">
                <form className="flex flex-col gap-6">
                  {/* Subject Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium" htmlFor="subject">
                      Subject Line
                    </label>
                    <input
                      className="w-full rounded-lg bg-[#273a2f] border-transparent focus:border-primary focus:bg-[#273a2f]/80 focus:ring-0 text-white placeholder-[#9cbaa8] px-4 py-3"
                      id="subject"
                      placeholder="e.g., Scheduled Maintenance: Saturday 10 PM EST"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Description Textarea */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium" htmlFor="description">
                      Content / Description
                    </label>
                    <div className="relative">
                      <textarea
                        className="w-full rounded-lg bg-[#273a2f] border-transparent focus:border-primary focus:bg-[#273a2f]/80 focus:ring-0 text-white placeholder-[#9cbaa8] px-4 py-3 resize-none"
                        id="description"
                        placeholder="Enter the detailed message for the users here..."
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-4 pt-2">
                    <button
                      className="group flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:bg-[#05d85a] hover:shadow-[0_0_15px_rgba(6,249,103,0.4)] transition-all transform active:scale-95"
                      type="button"
                      onClick={handlePublish}
                    >
                      <span>Publish Notice</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                        send
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Notice History Table */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9cbaa8]">history</span>
                  Notice History
                </h3>
              </div>

              <div className="bg-surface-dark rounded-xl border border-[#273a2f] shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#273a2f] bg-[#273a2f]/30 text-xs uppercase tracking-wider text-[#9cbaa8] font-medium">
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Created Date</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#273a2f]">
                      {notices.map((notice) => (
                        <tr key={notice.id} className="group hover:bg-[#273a2f]/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium text-sm group-hover:text-primary transition-colors">
                                {notice.subject}
                              </span>
                              <span className="text-[#9cbaa8] text-xs mt-0.5 truncate max-w-[200px]">
                                {notice.preview}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#9cbaa8] whitespace-nowrap">
                            {notice.date} <span className="text-xs opacity-60 ml-1">{notice.time}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="size-6 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${notice.author.avatar}')` }}
                              ></div>
                              <span className="text-xs text-white">{notice.author.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(notice.status, notice.statusColor)}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#9cbaa8] hover:text-white p-1 rounded-md hover:bg-[#273a2f] transition-colors">
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#273a2f] bg-[#273a2f]/10">
                  <p className="text-xs text-[#9cbaa8]">
                    Showing <span className="text-white font-medium">1-3</span> of{' '}
                    <span className="text-white font-medium">12</span> results
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md bg-[#273a2f] text-[#9cbaa8] text-xs hover:text-white hover:bg-[#273a2f]/80 disabled:opacity-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 rounded-md bg-[#273a2f] text-[#9cbaa8] text-xs hover:text-white hover:bg-[#273a2f]/80">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNotices;
