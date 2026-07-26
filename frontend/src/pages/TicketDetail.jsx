import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { usePolling } from '../hooks';
import { API_BASE_URL } from '../utils/constants';
import { getAuthToken } from '../utils/api';

const TicketDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [closing, setClosing] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [selectedResolvedAdminId, setSelectedResolvedAdminId] = useState('');
  const [closeTicketError, setCloseTicketError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch ticket details
  const fetchTicket = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTicket(data.data);
        const sortedMessages = (data.data.messages || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      } else {
        console.error('Failed to fetch ticket:', data.message);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchTicket(true);
    }
  }, [id, fetchTicket]);

  const fetchAdmins = useCallback(async () => {
    if (availableAdmins.length > 0) {
      return;
    }

    try {
      setAdminsLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAvailableAdmins(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setAdminsLoading(false);
    }
  }, [availableAdmins.length]);

  useEffect(() => {
    if (isCloseModalOpen) {
      fetchAdmins();
    }
  }, [isCloseModalOpen, fetchAdmins]);

  // Poll for new messages every 10 seconds (only when ticket is not closed)
  usePolling(
    fetchTicket,
    10000,
    !!id && ticket?.status !== 'close'
  );

  // Parse message content - check if it's an attachment
  const parseMessageContent = (messageText) => {
    try {
      const parsed = JSON.parse(messageText);
      if (parsed.type === 'attachment' && parsed.files) {
        return { isAttachment: true, files: parsed.files };
      }
    } catch (e) {
      // Not JSON, it's a regular text message
    }
    return { isAttachment: false, text: messageText };
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for separator
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-orange-500/10 text-orange-500 ring-orange-500/20';
      case 'taken':
        return 'bg-amber-500/10 text-amber-500 ring-amber-500/20';
      case 'inprogress':
        return 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20';
      case 'close':
        return 'bg-green-500/10 text-green-500 ring-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 ring-slate-500/20';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'taken':
        return 'Taken';
      case 'inprogress':
        return 'In Progress';
      case 'close':
        return 'Closed';
      default:
        return status;
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Only PNG, JPG, SVG, and PDF files under 10MB are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5));

    // Create preview URLs for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, { file: file.name, url: reader.result }]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected file
  const removeFile = (index) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter(p => p.file !== fileToRemove.name));
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    if ((!message.trim() && selectedFiles.length === 0) || ticket?.status === 'close') {
      return;
    }

    try {
      setSending(true);
      const token = getAuthToken();
      const formData = new FormData();

      if (message.trim()) {
        formData.append('message', message.trim());
      }

      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/user/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, ...data.data]);
        setMessage('');
        setSelectedFiles([]);
        setPreviewImages([]);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle close ticket
  const handleCloseTicket = async () => {
    setCloseTicketError('');
    setIsCloseModalOpen(true);
  };

  const handleConfirmCloseTicket = async () => {
    if (!selectedResolvedAdminId) {
      setCloseTicketError('Please select the admin who fixed the issue.');
      return;
    }

    try {
      setClosing(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/tickets/${id}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolvedByAdminId: Number(selectedResolvedAdminId) })
      });

      const data = await response.json();
      if (data.success) {
        setIsCloseModalOpen(false);
        setSelectedResolvedAdminId('');
        await fetchTicket(false);
      } else {
        setCloseTicketError(data.message || 'Failed to close ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      setCloseTicketError('Failed to close ticket');
    } finally {
      setClosing(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.createdAt });
      }
      groups.push({ type: 'message', data: msg, index });
    });

    return groups;
  };

  // Render attachment
  const renderAttachment = (files, isUserMessage) => {
    return files.map((file, idx) => {
      const isImage = file.mimetype?.startsWith('image/');
      const fileUrl = `${API_BASE_URL.replace('/api', '')}${file.path}`;

      if (isImage) {
        return (
          <div key={idx} className="mt-2">
            <img
              src={fileUrl}
              alt={file.originalName || 'Attachment'}
              className="rounded-lg max-w-full h-auto max-h-60 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        );
      } else {
        return (
          <a
            key={idx}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg ${
              isUserMessage 
                ? 'bg-black/10 hover:bg-black/20' 
                : 'bg-[#1e3a2f] hover:bg-[#254637]'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-lg">description</span>
            <span className="text-sm truncate">{file.originalName || file.filename}</span>
          </a>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display h-screen flex overflow-hidden">
        <Sidebar activePage="tickets" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#9eb7a8]">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display h-screen flex overflow-hidden">
        <Sidebar activePage="tickets" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-[#9eb7a8]">error</span>
            <p className="text-[#9eb7a8]">Ticket not found</p>
            <button
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 bg-primary text-background-dark rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === 'close';
  const messageGroups = groupMessagesByDate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex overflow-hidden">
      <Sidebar activePage="tickets" />

      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        {/* Top Ticket Header */}
        <header className="shrink-0 h-18 bg-white dark:bg-[#16231d] border-b dark:border-[#29382f] flex items-center justify-between px-4 py-3 shadow-sm z-20">
          <div className="flex items-center gap-4 overflow-hidden">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 text-slate-500 dark:text-slate-400"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold leading-tight tracking-tight truncate text-slate-900 dark:text-white">
                  #{ticket.id}
                </h1>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-[#9eb7a8] truncate">
                {ticket.subject}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isClosed ? (
              <span className="hidden sm:flex items-center gap-2 bg-green-500/10 text-green-500 text-sm font-medium py-2 px-4 rounded-lg border border-green-500/20">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span className="hidden md:inline">Closed</span>
              </span>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-[#9eb7a8]">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Awaiting response</span>
                </div>
                <button
                  onClick={handleCloseTicket}
                  disabled={closing}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium py-2 px-4 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {closing ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  )}
                  <span className="hidden md:inline">Close Ticket</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Chat Stream (Main Content) */}
        <main className="flex-1 overflow-y-auto relative w-full flex flex-col bg-background-dark" style={{
          backgroundImage: 'radial-gradient(#1c2e26 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4">
            {messageGroups.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="flex justify-center my-2">
                    <div className="bg-slate-200 dark:bg-[#1f2b25] text-slate-600 dark:text-[#9eb7a8] text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
                      {formatDate(item.date)}
                    </div>
                  </div>
                );
              }

              const msg = item.data;
              const parsedContent = parseMessageContent(msg.message);
              const isUserMessage = msg.sender_type === 'user';

              // User messages on RIGHT, Admin messages on LEFT (from user's perspective)
              if (isUserMessage) {
                // User message - Right side
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%] self-end">
                    <div className="bg-primary text-[#0b1410] px-4 py-3 rounded-2xl rounded-tr-none shadow-md relative">
                      {parsedContent.isAttachment ? (
                        renderAttachment(parsedContent.files, true)
                      ) : (
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{parsedContent.text}</p>
                      )}
                      <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                        <span className="text-[10px] font-medium">{formatTime(msg.createdAt)}</span>
                        <span className="material-symbols-outlined text-[12px]">done_all</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Admin message - Left side
              return (
                <div key={msg.id} className="flex flex-col items-start gap-1 max-w-[85%] md:max-w-[70%] self-start">
                  <div className="flex items-center gap-2 ml-1 mb-0.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-400 text-xs">support_agent</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {msg.adminSender?.username || 'Support'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#16231d] text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm relative">
                    {parsedContent.isAttachment ? (
                      renderAttachment(parsedContent.files, false)
                    ) : (
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{parsedContent.text}</p>
                    )}
                    <div className="flex justify-end mt-1 opacity-50">
                      <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Closed Ticket Notice */}
        {isClosed && (
          <div className="shrink-0 bg-[#16231d] border-t border-[#29382f] p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-[#9eb7a8]">
              <span className="material-symbols-outlined">lock</span>
              <div className="flex flex-col gap-1 text-sm">
                <span>This ticket has been closed. You can view the conversation but cannot send new messages.</span>
                <span className="text-[#9eb7a8]">
                  Fixed by: <span className="text-white font-medium">{ticket.resolvedByAdmin?.username || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {isCloseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCloseModalOpen(false)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#29382f] bg-[#16231d] shadow-2xl p-6">
              <h3 className="text-lg font-bold text-white">Close Ticket</h3>
              <p className="mt-1 text-sm text-[#9eb7a8]">
                Select the admin who fixed the issue before closing this ticket.
              </p>

              <div className="mt-5">
                <label className="block text-sm font-medium text-white mb-2">Fixed by</label>
                <select
                  className="w-full rounded-xl border border-[#29382f] bg-[#111c16] px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedResolvedAdminId}
                  onChange={(e) => {
                    setSelectedResolvedAdminId(e.target.value);
                    setCloseTicketError('');
                  }}
                  disabled={adminsLoading}
                >
                  <option value="">{adminsLoading ? 'Loading admins...' : 'Select admin'}</option>
                  {availableAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.username}
                    </option>
                  ))}
                </select>
                {closeTicketError && (
                  <p className="mt-2 text-sm text-red-400">{closeTicketError}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29382f] text-[#9eb7a8] hover:text-white hover:bg-[#1f2d25]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseTicket}
                  disabled={closing}
                  className="px-4 py-2 rounded-xl bg-primary text-[#102217] font-bold hover:bg-[#32d473] disabled:opacity-50"
                >
                  {closing ? 'Closing...' : 'Close Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Composer Footer */}
        {!isClosed && (
          <footer className="shrink-0 bg-white dark:bg-[#16231d] border-t dark:border-[#29382f] p-4 z-20">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {selectedFiles.map((file, index) => {
                    const preview = previewImages.find(p => p.file === file.name);
                    return (
                      <div 
                        key={index}
                        className="relative group bg-slate-100 dark:bg-[#111c16] rounded-lg p-2 flex items-center gap-2"
                      >
                        {preview ? (
                          <img src={preview.url} alt={file.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-[#29382f] rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500 dark:text-[#9eb7a8]">description</span>
                          </div>
                        )}
                        <div className="flex flex-col max-w-[80px]">
                          <span className="text-xs text-slate-700 dark:text-white truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 dark:text-[#9eb7a8]">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-white text-sm">close</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Context Bar */}
              <div className="flex items-center justify-end px-1">
                <span className="text-xs text-slate-400 hidden sm:block">
                  Press Enter to send, Shift + Enter for new line
                </span>
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".png,.jpg,.jpeg,.svg,.pdf"
                  multiple
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-[#111c16] rounded-xl hover:bg-slate-200 dark:hover:bg-[#29382f] transition-colors shrink-0 h-[52px] w-[52px] flex items-center justify-center"
                  disabled={selectedFiles.length >= 5}
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    className="w-full bg-slate-50 dark:bg-[#111c16] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#9eb7a8] rounded-xl border border-slate-200 dark:border-[#29382f] focus:border-primary focus:ring-1 focus:ring-primary p-3.5 pr-12 resize-none text-sm leading-relaxed"
                    placeholder="Type a message..."
                    rows="1"
                    style={{ minHeight: '52px', maxHeight: '120px' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  {/* Emoji Icon inside Input */}
                  <button type="button" className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sending || (!message.trim() && selectedFiles.length === 0)}
                  className={`rounded-xl h-[52px] w-[52px] flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20 transition-all active:scale-95 ${
                    sending || (!message.trim() && selectedFiles.length === 0)
                      ? 'bg-primary/50 cursor-not-allowed'
                      : 'bg-primary hover:bg-green-400'
                  } text-[#0b1410]`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-[#0b1410] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined fill-1">send</span>
                  )}
                </button>
              </form>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;
