import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';

const AdminTicketDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('In Progress');

  const messages = [
    {
      type: 'user',
      sender: 'User',
      text: "Hi, I'm having trouble connecting to the company VPN. It was working fine yesterday but today I keep getting an error.",
      time: '10:23 AM',
    },
    {
      type: 'admin',
      sender: 'Sarah Jenkins',
      text: 'Hello! Could you please provide a screenshot of the error message you are seeing? Also, have you updated your client recently?',
      time: '10:28 AM',
    },
    {
      type: 'user',
      sender: 'User',
      text: 'Here is the screenshot. Yes, I updated it this morning.',
      time: '10:32 AM',
      hasImage: true,
      image:
        'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=300&fit=crop',
    },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

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
              <h1 className="text-lg font-bold text-white">#{id}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                {status}
              </span>
            </div>
            <p className="hidden md:block text-sm text-[#9cbaa8]">VPN Connection Failure - Engineering Dept</p>
          </div>

          {/* Right: Status Dropdown & Close Button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                className="appearance-none bg-[#28392f] border border-[#273a2f] text-white py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm cursor-pointer hover:bg-[#34463b] transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Waiting for User</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9cbaa8]">
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-white bg-slate-500/20 hover:bg-slate-500/30 px-4 py-2 rounded-lg transition-colors border border-slate-500/20">
              <span className="material-symbols-outlined text-lg">close</span>
              Close Ticket
            </button>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => {
              if (msg.type === 'system') {
                return (
                  <div key={index} className="flex justify-center">
                    <div className="flex items-center gap-2 text-xs text-[#9cbaa8] bg-[#28392f]/30 px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              if (msg.type === 'user') {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-xl">
                      <div className="bg-primary text-background-dark rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg shadow-primary/20">
                        <p className="text-sm">{msg.text}</p>
                        {msg.hasImage && msg.image && (
                          <div className="mt-3">
                            <img
                              src={msg.image}
                              alt="Attachment"
                              className="rounded-lg border-2 border-background-dark/20 max-w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1 px-2">
                        <span className="text-xs text-[#9cbaa8]">{msg.time}</span>
                        <span className="material-symbols-outlined text-primary text-sm">done_all</span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (msg.type === 'admin') {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 mb-1 px-2">
                        <div
                          className="w-6 h-6 rounded-full bg-cover bg-center border border-[#273a2f]"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClg7xBVaf_BnQA4ypLmSouPdi8zIW5_RL7u2FoetIxwat-7B-SaUqkTA9G5mtNvpJEWy6wLKhyAyaF8Cb608NfLnNUITdayphfpBbs12u52QkPhtLh4DWxE249T6VfTMrrqS9MVbbyWC0xthup0JBJPZr0bu8_s5K6sjGWp7vb_82E_3DfZtP99PL_cpveRislxXWyXUDS5sGYuomlSlRN_TIK1Ut8a3fn2gQ29AZKCkLbgFfQLgd9LnHA_dIilh2gHC0ns4GCFJw')",
                          }}
                        ></div>
                        <span className="text-xs font-medium text-white">{msg.sender}</span>
                      </div>
                      <div className="bg-[#28392f] text-white rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-[#9cbaa8]">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Message Input Area */}
        <div className="border-t border-[#273a2f] bg-background-dark/95 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              {/* Message Input */}
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  className="p-2 text-[#9cbaa8] hover:text-white hover:bg-[#28392f] rounded-lg transition-colors"
                  title="Attach File"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <div className="flex-1 relative">
                  <input
                    className="w-full px-4 py-3 pr-12 bg-[#28392f] border border-[#273a2f] rounded-xl text-white placeholder-[#9cbaa8] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                  className="p-3 rounded-xl transition-all shadow-lg bg-primary hover:bg-primary/90 text-background-dark shadow-primary/30"
                  disabled={!message.trim()}
                >
                  <span className="material-symbols-outlined">send</span>
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
      </div>
    </div>
  );
};

export default AdminTicketDetail;
