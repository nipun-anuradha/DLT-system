import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    // Redirect to admin login with return URL
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
