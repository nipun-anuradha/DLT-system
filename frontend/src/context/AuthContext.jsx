import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    // User auth
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Admin auth
    const storedAdminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    const storedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA);

    if (storedAdminToken && storedAdmin) {
      setAdminToken(storedAdminToken);
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin({
        ...parsedAdmin,
        is_super: parsedAdmin.is_super || false
      });
    }

    setLoading(false);
  }, []);

  // User Login function
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  };

  // Admin Login function
  const adminLogin = (adminData, authToken) => {
    const normalizedAdmin = {
      ...adminData,
      is_super: adminData.is_super || false
    };
    setAdmin(normalizedAdmin);
    setAdminToken(authToken);
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(normalizedAdmin));
  };

  // User Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    // Set flag to prevent Microsoft auto-login on Login page
    sessionStorage.setItem('just_logged_out', 'true');
  };

  // Admin Logout function
  const adminLogout = () => {
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token;
  };

  // Check if admin is authenticated
  const isAdminAuthenticated = () => {
    return !!adminToken;
  };

  const value = {
    user,
    token,
    admin,
    adminToken,
    loading,
    login,
    logout,
    adminLogin,
    adminLogout,
    isAuthenticated,
    isAdminAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
