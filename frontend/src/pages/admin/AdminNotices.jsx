import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { usePolling } from '../../hooks';
import { apiRequest } from '../../utils/api';

const AdminNotices = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Notices data state
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notices from API
  const fetchNotices = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      const response = await apiRequest(`/admin/notices?${params.toString()}`);
      setNotices(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  usePolling(() => fetchNotices(pagination.currentPage), 5000);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNotices(newPage);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      sent: 'bg-primary/10 text-primary border-primary/20',
      draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const dotColors = {
      sent: 'bg-primary',
      draft: 'bg-gray-400',
    };

    const displayStatus = status === 'sent' ? 'Sent' : 'Draft';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.draft}`}>
        <span className={`size-1.5 rounded-full ${dotColors[status] || dotColors.draft}`}></span>
        {displayStatus}
      </span>
    );
  };

  const handlePublish = async () => {
    if (!subject.trim() || !description.trim()) {
      setFormError('Please fill in both subject and description');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await apiRequest('/admin/notices', {
        method: 'POST',
        body: JSON.stringify({
          topic: subject,
          message: description,
          status: 'sent',
        }),
      });

      setFormSuccess('Notice published successfully!');
      setSubject('');
      setDescription('');
      fetchNotices(1);

      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      setFormError(error.message || 'Failed to publish notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (notice) => {
    setDeletingNotice(notice);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingNotice(null);
  };

  const handleDeleteNotice = async () => {
    if (!deletingNotice) return;

    setIsDeleting(true);
    try {
      await apiRequest(`/admin/notices/${deletingNotice.id}`, {
        method: 'DELETE',
      });
      handleCloseDeleteModal();
      fetchNotices(pagination.currentPage);
    } catch (error) {
      console.error('Failed to delete notice:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
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
                {/* Error Message */}
                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
                    <span className="text-red-400 text-sm">{formError}</span>
                  </div>
                )}

                {/* Success Message */}
                {formSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    <span className="text-primary text-sm">{formSuccess}</span>
                  </div>
                )}

                <form className="flex flex-col gap-6">
                  {/* Subject Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium" htmlFor="subject">
                      Subject Line <span className="text-red-400">*</span>
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
                      Content / Description <span className="text-red-400">*</span>
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
                      className="group flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:bg-[#05d85a] hover:shadow-[0_0_15px_rgba(6,249,103,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                      onClick={handlePublish}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <span>Publish Notice</span>
                          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                            send
                          </span>
                        </>
                      )}
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
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#273a2f]">
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span className="text-[#9cbaa8]">Loading notices...</span>
                            </div>
                          </td>
                        </tr>
                      ) : notices.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <span className="material-symbols-outlined text-[48px] text-[#5a7063]">
                                campaign
                              </span>
                              <span className="text-[#9cbaa8]">No notices found</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        notices.map((notice) => {
                          const { date, time } = formatDate(notice.createdAt);
                          return (
                            <tr key={notice.id} className="group hover:bg-[#273a2f]/10 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-white font-medium text-sm group-hover:text-primary transition-colors">
                                    {notice.topic}
                                  </span>
                                  <span className="text-[#9cbaa8] text-xs mt-0.5 truncate max-w-[300px]">
                                    {notice.message}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-[#9cbaa8] whitespace-nowrap">
                                {date} <span className="text-xs opacity-60 ml-1">{time}</span>
                              </td>
                              <td className="px-6 py-4">{getStatusBadge(notice.status)}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleOpenDeleteModal(notice)}
                                  className="text-[#9cbaa8] hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                                  title="Delete Notice"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!loading && notices.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#273a2f] bg-[#273a2f]/10">
                    <p className="text-xs text-[#9cbaa8]">
                      Showing{' '}
                      <span className="text-white font-medium">
                        {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      of <span className="text-white font-medium">{pagination.totalItems}</span> results
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-1 rounded-md bg-[#273a2f] text-[#9cbaa8] text-xs hover:text-white hover:bg-[#273a2f]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-1 rounded-md bg-[#273a2f] text-[#9cbaa8] text-xs hover:text-white hover:bg-[#273a2f]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseDeleteModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface-dark border border-[#28392f] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#28392f]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-red-500/10">
                  <span className="material-symbols-outlined text-red-400">delete</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Notice</h2>
                  <p className="text-sm text-[#9cbaa8]">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-[#9cbaa8]">
                Are you sure you want to delete the notice{' '}
                <span className="text-white font-medium">"{deletingNotice?.topic}"</span>?
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 pt-0">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-5 py-2.5 rounded-xl text-[#9cbaa8] hover:text-white hover:bg-[#28392f] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNotice}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    <span>Delete Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
