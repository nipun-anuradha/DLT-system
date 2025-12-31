import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const TicketDetail = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      // Handle message sending
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex overflow-hidden">
      <Sidebar activePage="tickets" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Ticket Header */}
        <header className="shrink-0 h-18 bg-white dark:bg-[#16231d] border-b dark:border-[#29382f] flex items-center justify-between px-4 py-3 shadow-sm z-20">
          <div className="flex items-center gap-4 overflow-hidden">
            <a
              href="/tickets"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 text-slate-500 dark:text-slate-400"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </a>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold leading-tight tracking-tight truncate text-slate-900 dark:text-white">
                  #INC-3902
                </h1>
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-[#9eb7a8] truncate">
                VPN Connection Failure - Engineering Dept
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Close Ticket Button */}
            <button className="hidden sm:flex items-center gap-2 bg-slate-200 dark:bg-[#29382f] hover:bg-slate-300 dark:hover:bg-[#3d5245] text-slate-800 dark:text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="hidden md:inline">Close Ticket</span>
            </button>
            {/* Mobile Menu */}
            <button className="sm:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Chat Stream (Main Content) */}
        <main className="flex-1 overflow-y-auto relative w-full flex flex-col bg-background-dark" style={{
          backgroundImage: 'radial-gradient(#1c2e26 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
            {/* Date Separator */}
            <div className="flex justify-center my-2">
              <div className="bg-slate-200 dark:bg-[#1f2b25] text-slate-600 dark:text-[#9eb7a8] text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
                Today, October 24
              </div>
            </div>

            {/* Message 1: User (Right) */}
            <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%] self-end">
              <div className="bg-primary text-[#0b1410] px-4 py-3 rounded-2xl rounded-tr-none shadow-md relative group">
                <p className="text-sm md:text-base leading-relaxed">
                  Hi, I'm having trouble connecting to the company VPN. It was working fine yesterday but today I
                  keep getting an error.
                </p>
                <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                  <span className="text-[10px] font-medium">10:23 AM</span>
                  <span className="material-symbols-outlined text-[12px]">done_all</span>
                </div>
              </div>
            </div>

            {/* Message 2: Admin (Left) */}
            <div className="flex flex-col items-start gap-1 max-w-[85%] md:max-w-[70%] self-start">
              <div className="flex items-center gap-2 ml-1 mb-0.5">
                <div
                  className="size-5 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAsZIQRwrCNX5m1BbBIXp1MK7GfBLdMvzgQcnRaRUlVPfnORbPU-3Hc7Dkv9f2ha5cJC1Gf3dp11G6d_qaWf-PlWdGXMmvaoyugsAMaZ7MZICTY0UpacqeIJLZY6YQvVoI35tP50MywGAQzeZNMbn4cEt0RLQqQH3K0bIA22UKwA-xMJMQiKgv4SbolKsWcSgg8tjqckFPR2CtTT-MVcS639rOZWCR-79CGOfL_sFdazAal-pGM-QHNA5lUbWgGGcSlynUK1ggz1eY')",
                  }}
                ></div>
                <span className="text-xs text-slate-400">Sarah Jenkins</span>
              </div>
              <div className="bg-white dark:bg-[#16231d] text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm relative">
                <p className="text-sm md:text-base leading-relaxed">
                  Hello! Could you please provide a screenshot of the error message you are seeing? Also, have you
                  updated your client recently?
                </p>
                <div className="flex justify-end mt-1 opacity-50">
                  <span className="text-[10px]">10:26 AM</span>
                </div>
              </div>
            </div>

            {/* Message 3: User (Right - With Image) */}
            <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%] self-end">
              <div className="bg-primary text-[#0b1410] p-1.5 rounded-2xl rounded-tr-none shadow-md relative">
                <div className="overflow-hidden rounded-lg mb-1.5 bg-black/10">
                  <img
                    alt="Screenshot of VPN connection error dialog box"
                    className="w-full h-auto object-cover max-h-60"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgGRpSW_TYIPmqhiz3cpI3Zo7LzFha0Ei8KRc-SEGLsCwZqaMgtTecYz6cO5X3izpyDHbG-tt_vcBS7p5CX3HwUwL9IFx8n9oDwvyzNN5-jsOuPEBfxuoNNirYI_UTvTNd4R25EzKr0DRzZWhM23CAEK9slq-UBdZpOXKxnbaYHZgJgkSrRDMLHZJIAuAzxA1hB58LB7A-tmtPZL27avL7xaa2lGfzB-JVLLiBsfqxq8JSqi-cXL1HnZY93FicxQoYkEpAp2FQp7U"
                  />
                </div>
                <div className="px-2 pb-1">
                  <p className="text-sm md:text-base leading-relaxed">
                    Here is the screenshot. Yes, I updated it this morning.
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                    <span className="text-[10px] font-medium">10:32 AM</span>
                    <span className="material-symbols-outlined text-[12px]">done</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message 4: Admin (Left) */}
            <div className="flex flex-col items-start gap-1 max-w-[85%] md:max-w-[70%] self-start">
              <div className="flex items-center gap-2 ml-1 mb-0.5">
                <div
                  className="size-5 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAYSRs9ubXAek2Kcutw1jRbU1yeXqmZU305cJQXzr6nCTRDEHOvmmGDOJBSXpJ12mCyNpGQCWg2d_wAJT4OZ7ZKcOWW__SYYGe0_Wh0I_qz4XcKupezxdyXD9WTQ-0bbk_HHU9hHhE_Q43RdcwNiQuRuHtZmTJj3ecAfDcln5UfVl6BpMrJZIjGnnTWoBr0h-7a4qh0hZt0QcbJBCyTcmxMRnDy-JRNxD6ozP8jRrFzB48GDSaCfsKgpD_NXcnOrjdoOQUm95AvKps')",
                  }}
                ></div>
                <span className="text-xs text-slate-400">Sarah Jenkins</span>
              </div>
              <div className="bg-white dark:bg-[#16231d] text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm relative">
                <p className="text-sm md:text-base leading-relaxed">
                  Thanks for that. It looks like a certificate mismatch. I've reset your certificate on the server
                  side. Please try reconnecting in about 2 minutes.
                </p>
                <div className="flex justify-end mt-1 opacity-50">
                  <span className="text-[10px]">10:35 AM</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Composer Footer */}
        <footer className="shrink-0 bg-white dark:bg-[#16231d] border-t dark:border-[#29382f] p-4 z-20">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
            {/* Context Bar */}
            <div className="flex items-center justify-end px-1">
              <span className="text-xs text-slate-400 hidden sm:block">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-3">
              {/* Attachment Button */}
              <button className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-[#111c16] rounded-xl hover:bg-slate-200 dark:hover:bg-[#29382f] transition-colors shrink-0 h-[52px] w-[52px] flex items-center justify-center">
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
                  onKeyPress={handleKeyPress}
                />
                {/* Emoji Icon inside Input */}
                <button className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-green-400 text-[#0b1410] rounded-xl h-[52px] w-[52px] flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined fill-1">send</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TicketDetail;
