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
  const [guidedStep, setGuidedStep] = useState(1);
  const [issueHierarchy, setIssueHierarchy] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [useCustomTicket, setUseCustomTicket] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'software',
    priority: 'medium',
    description: '',
  });

  const selectedCategoryMeta = issueHierarchy.find((item) => item.slug === selectedCategory);
  const selectedItemMeta = selectedCategoryMeta?.subCategories?.find((item) => item.slug === selectedItem);
  const selectedIssueMeta = selectedItemMeta?.details?.find((item) => item.slug === selectedIssue);

  useEffect(() => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  useEffect(() => {
    const loadIssueHierarchy = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/user/issue-hierarchy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load issue categories');
        }

        const data = await response.json();
        setIssueHierarchy(data.data || []);
      } catch (err) {
        console.error('Failed to load issue hierarchy', err);
      }
    };

    loadIssueHierarchy();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleGuidedCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedItem('');
    setSelectedIssue('');
    setGuidedStep(2);
    setError('');
  };

  const handleGuidedItemSelect = (item) => {
    setSelectedItem(item);
    setSelectedIssue('');
    setGuidedStep(3);
    setError('');
  };

  const handleGuidedIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setError('');
  };

  const handleUseCustomTicket = () => {
    setUseCustomTicket(true);
    setError('');
  };

  const handleBackToGuided = () => {
    setUseCustomTicket(false);
    if (!selectedCategory) {
      setGuidedStep(1);
    } else if (!selectedItem) {
      setGuidedStep(2);
    } else {
      setGuidedStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let subject = formData.subject.trim();
    let description = formData.description.trim();
    let category = formData.category;
    let issueCategory = '';
    let issueType = '';
    let issueDetail = '';

    if (!useCustomTicket) {
      if (!selectedCategory || !selectedItem || !selectedIssue) {
        setError('Please complete the issue selection before submitting');
        return;
      }

      subject = `${selectedCategoryMeta.name} / ${selectedItemMeta.name} / ${selectedIssueMeta.name}`;
      description = `Selected issue: ${subject}. Please assist with this request.`;
      category = selectedCategory;
      issueCategory = selectedCategory;
      issueType = selectedItem;
      issueDetail = selectedIssue;
    } else {
      if (!subject) {
        setError('Subject is required');
        return;
      }
      if (!description) {
        setError('Description is required');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('subject', subject);
      submitData.append('category', category);
      submitData.append('priority', formData.priority);
      submitData.append('description', description);
      submitData.append('issue_category', issueCategory);
      submitData.append('issue_type', issueType);
      submitData.append('issue_detail', issueDetail);

      if (selectedFile) {
        submitData.append('attachments', selectedFile);
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

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
      category: 'software',
      priority: 'medium',
      description: '',
    });
    setSelectedCategory('');
    setSelectedItem('');
    setSelectedIssue('');
    setGuidedStep(1);
    setUseCustomTicket(false);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen flex">
      <Sidebar activePage="tickets" />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
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

        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
          <div className="max-w-5xl mx-auto space-y-8 pb-20">
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Submit a Support Request
                </h1>
                <p className="text-[#9eb7a8] mt-2 text-base max-w-2xl">
                  Select the most common issue first. If needed, you can still describe your request manually.
                </p>
              </div>
            </div>

            <div className="bg-[#1a2c22] border border-[#29382f] rounded-[2rem] p-6 md:p-10 shadow-xl">
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

              <form className="space-y-8" onSubmit={handleSubmit}>
                {!useCustomTicket ? (
                  <div className="space-y-6">
                    <div className="rounded-[1.75rem] border border-[#29382f] bg-[#111714]/70 p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Choose the issue in 3 quick steps</h3>
                          <p className="text-sm text-[#9eb7a8] mt-1">
                            Pick the closest match. This will create a request much faster.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUseCustomTicket}
                          className="text-sm font-semibold text-primary hover:text-[#32c96e] transition-colors"
                        >
                          Write my own issue instead
                        </button>
                      </div>

                      {guidedStep === 1 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {issueHierarchy.map((option) => (
                            <button
                              key={option.slug}
                              type="button"
                              onClick={() => handleGuidedCategorySelect(option.slug)}
                              className="rounded-2xl border border-[#29382f] bg-[#1a2c22] p-4 text-left transition-all hover:border-primary/60 hover:bg-[#22362b]"
                            >
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">{option.icon || 'folder'}</span>
                                <div>
                                  <p className="text-white font-semibold">{option.name}</p>
                                  <p className="text-sm text-[#9eb7a8]">{option.description}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {guidedStep >= 2 && selectedCategory && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold">2. Select the app or item</h4>
                            <button
                              type="button"
                              onClick={() => setGuidedStep(1)}
                              className="text-sm text-[#9eb7a8] hover:text-white"
                            >
                              Back
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedCategoryMeta?.subCategories?.map((option) => (
                              <button
                                key={option.slug}
                                type="button"
                                onClick={() => handleGuidedItemSelect(option.slug)}
                                className={`rounded-2xl border p-3 text-left transition-all ${
                                  selectedItem === option.slug
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-[#29382f] bg-[#111714] text-[#9eb7a8] hover:border-primary/50 hover:text-white'
                                }`}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {guidedStep === 3 && selectedCategory && selectedItem && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold">3. Choose the issue detail</h4>
                            <button
                              type="button"
                              onClick={() => setGuidedStep(2)}
                              className="text-sm text-[#9eb7a8] hover:text-white"
                            >
                              Back
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedItemMeta?.details?.map((option) => (
                              <button
                                key={option.slug}
                                type="button"
                                onClick={() => handleGuidedIssueSelect(option.slug)}
                                className={`rounded-2xl border p-3 text-left transition-all ${
                                  selectedIssue === option.slug
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-[#29382f] bg-[#111714] text-[#9eb7a8] hover:border-primary/50 hover:text-white'
                                }`}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedCategoryMeta && selectedItemMeta && selectedIssueMeta && (
                      <div className="rounded-[1.75rem] border border-primary/30 bg-primary/10 p-5">
                        <p className="text-sm text-[#9eb7a8]">Selected request</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {selectedCategoryMeta.name} / {selectedItemMeta.name} / {selectedIssueMeta.name}
                        </p>
                        <p className="mt-2 text-sm text-[#dff8e8]">
                          This will be submitted as your support ticket.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-2xl border border-[#29382f] bg-[#111714]/70 px-4 py-3">
                      <p className="text-sm text-[#9eb7a8]">You are writing a custom support request.</p>
                      <button
                        type="button"
                        onClick={handleBackToGuided}
                        className="text-sm font-semibold text-primary hover:text-[#32c96e]"
                      >
                        Use guided selection
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-semibold ml-1" htmlFor="subject">
                        Subject
                      </label>
                      <div className="relative focus-ring rounded-full">
                        <input
                          className="w-full bg-[#111714] border border-[#29382f] text-white placeholder-[#5c7263] text-sm rounded-full focus:ring-0 focus:border-primary block p-4 pl-6 transition-colors shadow-sm"
                          id="subject"
                          placeholder="Briefly summarize the issue"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                    </div>

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
                            <option value="software">Software</option>
                            <option value="hardware">Hardware</option>
                            <option value="system">System</option>
                            <option value="internet">Internet</option>
                            <option value="request">Request</option>
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
                              <p className="text-[#5c7263] text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
                  </>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                    <span className="material-symbols-outlined">error</span>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

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
