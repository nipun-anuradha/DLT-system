import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import dltLogo from '../../assets/dlt-logo.png';

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/user/notices?limit=1');
        if (response.success && response.data.length > 0) {
          setHasNotifications(true);
        } else {
          setHasNotifications(false);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <header className="w-full border-b border-[#29382f] bg-background-light dark:bg-background-dark px-4 sm:px-10 py-4 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <img src={dltLogo} alt="DLT Logo" className="h-10 w-auto" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {hasNotifications && (
              <span className="absolute top-2 right-2 size-2.5 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div 
            ref={dropdownRef}
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-[#29382f] flex items-center justify-center cursor-pointer ring-2 ring-transparent group-hover:ring-primary transition-all duration-200 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a2c23] border border-slate-200 dark:border-[#29382f] rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                <div className="py-1">
                  <a
                    className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#25382e] transition-colors flex items-center gap-3"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    View Profile
                  </a>
                  <a
                    className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#25382e] transition-colors flex items-center gap-3"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Edit Profile
                  </a>
                  <div className="h-px bg-slate-200 dark:bg-[#29382f] my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full px-4 py-3 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-[#25382e] transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
