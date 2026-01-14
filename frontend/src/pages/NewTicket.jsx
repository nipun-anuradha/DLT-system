import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { getAuthToken } from '../utils/api';
import { API_BASE_URL } from '../utils/constants';

const NewTicket = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'hardware',
    priority: 'low',
    description: '',
  });

  useEffect(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('subject', formData.subject);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('description', formData.description);

      if (selectedFile) {
        submitData.append('attachments', selectedFile);
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      // Navigate to tickets page on success
      navigate('/tickets');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setFormData({
      subject: '',
      category: 'hardware',
      priority: 'low',
      description: '',
    });
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen flex">
      <Sidebar activePage="tickets" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-[#29382f] bg-[#111714]/90 backdrop-blur-sm px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-3 text-white">
              <div className="bg-primary/20 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary">support_agent</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight hidden sm:block">IT Support Module</h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-6 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#9eb7a8]">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 bg-[#29382f] border-none rounded-full text-white placeholder-[#9eb7a8] focus:ring-2 focus:ring-primary focus:bg-[#1a2c22] transition-all sm:text-sm"
                placeholder="Search tickets, assets, or knowledge base..."
                type="text"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
          <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex">
              <ol className="inline-flex items-center space-x-2 md:space-x-3 text-sm">
                <li className="inline-flex items-center">
                  <a className="text-[#9eb7a8] hover:text-primary font-medium flex items-center gap-1" href="/">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Home
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-[#5c7263] text-sm">chevron_right</span>
                    <a className="ml-2 text-[#9eb7a8] hover:text-primary font-medium" href="/tickets">
                      Support
                    </a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-[#5c7263] text-sm">chevron_right</span>
                    <span className="ml-2 text-white font-medium">New Ticket</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Submit a Support Request
                </h1>
                <p className="text-[#9eb7a8] mt-2 text-base max-w-2xl">
                  Describe your issue in detail. Our IT team typically responds as soon as possible for high priority
                  tickets.
                </p>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-[#1a2c22] border border-[#29382f] rounded-[2rem] p-6 md:p-10 shadow-xl">
              {/* Auto-Generated Info Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 bg-[#111714] rounded-2xl p-5 border border-[#29382f]">
                <div className="flex flex-col gap-1">
                  <span className="text-[#9eb7a8] text-xs font-semibold uppercase tracking-wider">Ticket ID</span>
                  <span className="text-white font-mono text-lg font-medium">#Auto generate</span>
                </div>
                <div className="flex flex-col gap-1 md:border-l md:border-[#29382f] md:pl-6">
                  <span className="text-[#9eb7a8] text-xs font-semibold uppercase tracking-wider">Date Created</span>
                  <span className="text-white font-medium">{currentDate}</span>
                </div>
                <div className="flex flex-col gap-1 md:border-l md:border-[#29382f] md:pl-6">
                  <span className="text-[#9eb7a8] text-xs font-semibold uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(56,224,123,0.6)]"></span>
                    <span className="text-white font-medium">Open</span>
                  </div>
                </div>
              </div>

              {/* The Form */}
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Row 1: Subject */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-semibold ml-1" htmlFor="subject">
                    Subject
                  </label>
                  <div className="relative focus-ring rounded-full">
                    <input
                      className="w-full bg-[#111714] border border-[#29382f] text-white placeholder-[#5c7263] text-sm rounded-full focus:ring-0 focus:border-primary block p-4 pl-6 transition-colors shadow-sm"
                      id="subject"
                      placeholder="Briefly summarize the issue (e.g., Can't log into the System )"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Category & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-semibold ml-1" htmlFor="category">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#111714] border border-[#29382f] text-white text-sm rounded-full focus:ring-primary focus:border-primary block p-4 pl-6 appearance-none cursor-pointer"
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="hardware">Hardware Issue</option>
                        <option value="software">Software / Application</option>
                        <option value="network">Network / Connectivity</option>
                        <option value="item">Item Request / Upgrade</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#9eb7a8]">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-semibold ml-1" htmlFor="priority">
                      Priority Level
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-[#111714] border border-[#29382f] text-white text-sm rounded-full focus:ring-primary focus:border-primary block p-4 pl-6 appearance-none cursor-pointer"
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low - General Inquiry</option>
                        <option value="medium">Medium - Affects Productivity</option>
                        <option value="high">High - Critical System Down</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#9eb7a8]">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Description */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-semibold ml-1" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    className="block w-full text-sm text-white bg-[#111714] rounded-3xl border border-[#29382f] focus:ring-primary focus:border-primary p-6 placeholder-[#5c7263] resize-none"
                    id="description"
                    placeholder="Please provide detailed steps to reproduce the issue..."
                    rows="6"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Row 4: Attachments */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-semibold ml-1">Attachment (Optional)</label>
                  {!selectedFile ? (
                    <div className="flex items-center justify-center w-full">
                      <label
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#29382f] border-dashed rounded-[2rem] cursor-pointer bg-[#111714]/50 hover:bg-[#111714] hover:border-primary/50 transition-all group"
                        htmlFor="dropzone-file"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="p-3 bg-[#29382f] rounded-full mb-3 group-hover:bg-[#1a2c22] transition-colors">
                            <span className="material-symbols-outlined text-[#9eb7a8] group-hover:text-primary transition-colors">
                              cloud_upload
                            </span>
                          </div>
                          <p className="mb-1 text-sm text-[#9eb7a8]">
                            <span className="font-semibold text-white">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-[#5c7263]">PNG, JPG, PDF or DOC (MAX. 10MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          className="hidden"
                          id="dropzone-file"
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-[#111714] border border-[#29382f] rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <span className="material-symbols-outlined text-primary">
                            {selectedFile.type.startsWith('image/') ? 'image' : 'description'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                            {selectedFile.name}
                          </p>
                          <p className="text-[#5c7263] text-xs">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                    <span className="material-symbols-outlined">error</span>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Row 5: Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#29382f] mt-8">
                  <button
                    className="px-8 py-3 text-sm font-bold text-white bg-transparent border border-[#29382f] rounded-full hover:bg-[#29382f] hover:text-white transition-all focus:ring-2 focus:ring-[#9eb7a8] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleDiscard}
                    disabled={isSubmitting}
                  >
                    Discard
                  </button>
                  <button
                    className="group flex items-center gap-2 px-8 py-3 text-sm font-bold text-[#122017] bg-primary rounded-full hover:bg-[#32c96e] shadow-[0_0_15px_rgba(56,224,123,0.3)] hover:shadow-[0_0_20px_rgba(56,224,123,0.5)] transition-all focus:ring-4 focus:ring-primary/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Ticket
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                          send
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewTicket;
