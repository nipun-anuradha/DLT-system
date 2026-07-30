import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { usePolling } from '../../hooks';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from '../../utils/api';

const AdminTicketDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin } = useAuth();
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTicket(data.data);
        setSelectedAssignee(String(data.data.assigned_admin_id || ''));
        // Sort messages by createdAt
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
    if (!admin?.is_super) {
      return;
    }

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, [admin]);

  useEffect(() => {
    if (admin?.is_super) {
      fetchAdmins();
    }
  }, [admin, fetchAdmins]);

  // Poll for new messages every 10 seconds (only when ticket is not closed)
  usePolling(
    fetchTicket,
    5000,
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
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'taken':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'inprogress':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'close':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
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

    // Reset input
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
    e.preventDefault();
    
    if ((!message.trim() && selectedFiles.length === 0) || ticket?.status === 'close') {
      return;
    }

    try {
      setSending(true);
      const token = getAdminToken();
      const formData = new FormData();

      if (message.trim()) {
        formData.append('message', message.trim());
      }

      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Add new messages to the list
        setMessages(prev => [...prev, ...data.data]);
        setMessage('');
        setSelectedFiles([]);
        setPreviewImages([]);
        
        // Update ticket status if changed
        if (data.ticketStatus && ticket) {
          setTicket(prev => ({ ...prev, status: data.ticketStatus }));
        }
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

  // Handle close ticket
  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) {
      return;
    }

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'close' })
      });

      const data = await response.json();
      if (data.success) {
        setTicket(prev => ({ ...prev, status: 'close' }));
      } else {
        alert(data.message || 'Failed to close ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert('Failed to close ticket');
    }
  };

  const openUserInventory = () => {
    if (!ticket?.user?.id) return;
    navigate(`/admin/inventory?userId=${ticket.user.id}`);
  };

  const handleTakeTicket = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}/take`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchTicket(false);
      } else {
        alert(data.message || 'Failed to take ticket');
      }
    } catch (error) {
      console.error('Error taking ticket:', error);
      alert('Failed to take ticket');
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedAssignee || !ticket) {
      return;
    }

    try {
      setAssigning(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assigned_admin_id: Number(selectedAssignee) })
      });

      const data = await response.json();
      if (data.success) {
        await fetchTicket(false);
      } else {
        alert(data.message || 'Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    // Shift+Enter will naturally create a new line in textarea
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
  const renderAttachment = (files, isAdminMessage) => {
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
              isAdminMessage 
                ? 'bg-[#1e3a2f] hover:bg-[#254637]' 
                : 'bg-black/10 hover:bg-black/20'
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
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#9cbaa8]">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-[#9cbaa8]">error</span>
            <p className="text-[#9cbaa8]">Ticket not found</p>
            <button
              onClick={() => navigate('/admin/tickets')}
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
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#273a2f] px-6 lg:px-8 bg-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
          {/* Left: Menu, Back Button & Ticket Info */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white p-1 hover:bg-[#28392f] rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            
            <button
              className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-full transition-colors"
              onClick={() => navigate('/admin/tickets')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">#{ticket.id}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
            <p className="hidden md:block text-sm text-[#9cbaa8] truncate max-w-md">
              {ticket.subject} {ticket.user?.department && `- ${ticket.user.department}`}
            </p>
          </div>

          {/* Right: Close Button */}
          <div className="flex items-center gap-4">
            {!isClosed && ticket.status === 'open' && (
              <button 
                onClick={handleTakeTicket}
                className="flex items-center gap-2 text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-lg transition-colors border border-amber-500/20"
              >
                <span className="material-symbols-outlined text-lg">assignment_ind</span>
                <span className="hidden sm:inline">Take Ticket</span>
              </button>
            )}
            {!isClosed && (
              <button 
                onClick={handleCloseTicket}
                className="flex items-center gap-2 text-sm font-medium text-white bg-slate-500/20 hover:bg-slate-500/30 px-4 py-2 rounded-lg transition-colors border border-slate-500/20"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                <span className="hidden sm:inline">Close Ticket</span>
              </button>
            )}
            {isClosed && (
              <span className="flex items-center gap-2 text-sm font-medium text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span className="hidden sm:inline">Closed</span>
              </span>
            )}
          </div>
        </header>

        {/* Ticket Info Bar */}
        <div className="px-6 py-3 bg-[#1a2821] border-b border-[#273a2f] flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9cbaa8] text-lg">person</span>
            <span className="text-[#9cbaa8]">User:</span>
            <button
              type="button"
              onClick={openUserInventory}
              className="text-white font-medium hover:text-primary transition-colors"
            >
              {ticket.user?.name || 'Unknown'}
            </button>
          </div>
          {ticket.user?.emp_no && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">badge</span>
              <span className="text-[#9cbaa8]">Emp:</span>
              <span className="text-white">{ticket.user.emp_no}</span>
            </div>
          )}
          {ticket.user?.branch && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">location_on</span>
              <span className="text-white">{ticket.user.branch}</span>
            </div>
          )}
          {(ticket.user?.device_type || ticket.user?.device_model || ticket.user?.device_specs) && (
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">devices</span>
              <div className="flex flex-col">
                <span className="text-[#9cbaa8] text-xs uppercase tracking-wider">Device</span>
                <span className="text-white">
                  {ticket.user?.device_type || 'device'}{ticket.user?.device_model ? ` • ${ticket.user.device_model}` : ''}
                </span>
                {ticket.user?.device_specs && (
                  <span className="text-[#9cbaa8] text-xs whitespace-pre-line mt-1">{ticket.user.device_specs}</span>
                )}
              </div>
            </div>
          )}
          {ticket.assignedAdmin?.username && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">assignment_ind</span>
              <span className="text-[#9cbaa8]">Taken by:</span>
              <span className="text-white">{ticket.assignedAdmin.username}</span>
            </div>
          )}
          {ticket.resolvedByAdmin?.username && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">verified</span>
              <span className="text-[#9cbaa8]">Fixed by:</span>
              <span className="text-white">{ticket.resolvedByAdmin.username}</span>
            </div>
          )}
          {ticket.category && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">category</span>
              <span className="text-white capitalize">{ticket.category}</span>
            </div>
          )}
          {ticket.priority && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9cbaa8] text-lg">flag</span>
              <span className={`capitalize ${
                ticket.priority === 'high' ? 'text-red-400' : 
                ticket.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>{ticket.priority}</span>
            </div>
          )}

          {admin?.is_super && !isClosed && (
            <div className="w-full mt-4 p-4 rounded-2xl border border-[#273a2f] bg-[#162b20]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-[#9cbaa8]">Assign ticket to admin</p>
                  <select
                    className="mt-2 w-full md:w-72 h-11 px-4 rounded-xl bg-[#1d2d25] border border-[#28392f] text-white"
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                  >
                    <option value="">Select admin</option>
                    {admins.map((adminOption) => (
                      <option key={adminOption.id} value={adminOption.id}>
                        {adminOption.username}{adminOption.is_super ? ' (Super)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAssignAdmin}
                  disabled={!selectedAssignee || assigning}
                  className={`mt-2 md:mt-0 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    !selectedAssignee || assigning ? 'bg-slate-500/20 text-slate-500 cursor-not-allowed' : 'bg-primary text-background-dark hover:bg-primary/90'
                  }`}
                >
                  {assigning ? 'Assigning...' : 'Assign Admin'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 scroll-smooth"
          style={{
            backgroundImage: 'radial-gradient(#1c2e26 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messageGroups.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="flex justify-center my-4">
                    <div className="flex items-center gap-2 text-xs text-[#9cbaa8] bg-[#28392f]/50 px-4 py-1.5 rounded-full">
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                );
              }

              const msg = item.data;
              const parsedContent = parseMessageContent(msg.message);
              const isAdminMessage = msg.sender_type === 'admin';

              // Admin messages on RIGHT (since this is admin viewing), User messages on LEFT
              if (!isAdminMessage) {
                // User message - Left side
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 mb-1 px-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border border-[#273a2f] flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-sm">person</span>
                        </div>
                        <span className="text-xs font-medium text-white">
                          {msg.userSender?.name || ticket.user?.name || 'User'}
                        </span>
                      </div>
                      <div className="bg-[#28392f] text-white rounded-2xl rounded-tl-sm px-4 py-3">
                        {parsedContent.isAttachment ? (
                          renderAttachment(parsedContent.files, false)
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{parsedContent.text}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-[#9cbaa8]">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Admin message - Right side
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-xl">
                    <div className="flex items-center justify-end gap-2 mb-1 px-2">
                      <span className="text-xs font-medium text-white">
                        {msg.adminSender?.username || admin?.username || 'Admin'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-400 text-sm">support_agent</span>
                      </div>
                    </div>
                    <div className="bg-primary text-background-dark rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg shadow-primary/20">
                      {parsedContent.isAttachment ? (
                        renderAttachment(parsedContent.files, true)
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{parsedContent.text}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 px-2">
                      <span className="text-xs text-[#9cbaa8]">{formatTime(msg.createdAt)}</span>
                      <span className="material-symbols-outlined text-primary text-sm">done_all</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Closed Ticket Notice */}
        {isClosed && (
          <div className="border-t border-[#273a2f] bg-[#1a2821] p-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-[#9cbaa8]">
              <span className="material-symbols-outlined">lock</span>
              <span className="text-sm">This ticket has been closed. You can view the conversation but cannot send new messages.</span>
              <span className="text-sm text-white sm:ml-2">Fixed by: {ticket.resolvedByAdmin?.username || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Message Input Area */}
        {!isClosed && (
          <div className="border-t border-[#273a2f] bg-background-dark/95 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2">
                    {selectedFiles.map((file, index) => {
                      const preview = previewImages.find(p => p.file === file.name);
                      return (
                        <div 
                          key={index}
                          className="relative group bg-[#28392f] rounded-lg p-2 flex items-center gap-2"
                        >
                          {preview ? (
                            <img src={preview.url} alt={file.name} className="w-16 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-16 bg-[#1a2821] rounded flex items-center justify-center">
                              <span className="material-symbols-outlined text-[#9cbaa8]">description</span>
                            </div>
                          )}
                          <div className="flex flex-col max-w-[100px]">
                            <span className="text-xs text-white truncate">{file.name}</span>
                            <span className="text-xs text-[#9cbaa8]">{(file.size / 1024).toFixed(1)} KB</span>
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

                {/* Message Input */}
                <div className="flex items-end gap-3">
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
                    className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
                    title="Attach File"
                    disabled={selectedFiles.length >= 5}
                  >
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      className="w-full px-4 py-3 pr-12 bg-[#28392f] border border-[#273a2f] rounded-xl text-white placeholder-[#9cbaa8] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={sending}
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9cbaa8] hover:text-white transition-colors"
                      title="Emoji"
                    >
                      <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`p-3 rounded-xl transition-all shadow-lg ${
                      sending || (!message.trim() && selectedFiles.length === 0)
                        ? 'bg-primary/50 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'
                    } text-background-dark shadow-primary/30`}
                    disabled={sending || (!message.trim() && selectedFiles.length === 0)}
                  >
                    {sending ? (
                      <div className="w-6 h-6 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="material-symbols-outlined">send</span>
                    )}
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-[#9cbaa8] px-2">
                  Press <kbd className="px-1.5 py-0.5 bg-[#28392f] rounded">Enter</kbd> to send,{' '}
                  <kbd className="px-1.5 py-0.5 bg-[#28392f] rounded">Shift</kbd> +{' '}
                  <kbd className="px-1.5 py-0.5 bg-[#28392f] rounded">Enter</kbd> for new line
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTicketDetail;
