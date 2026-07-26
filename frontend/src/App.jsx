import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminProtectedRoute } from './components/common'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import NewTicket from './pages/NewTicket'
import TicketDetail from './pages/TicketDetail'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTickets from './pages/admin/AdminTickets'
import AdminTicketDetail from './pages/admin/AdminTicketDetail'
import AdminUsers from './pages/admin/AdminUsers'
import AdminInventory from './pages/admin/AdminInventory'
import AdminNotices from './pages/admin/AdminNotices'
import Login from './pages/Login'
import './App.css'

// Layout wrapper for protected user routes
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
)

// Layout wrapper for protected admin routes
const AdminProtectedLayout = () => (
  <AdminProtectedRoute>
    <Outlet />
  </AdminProtectedRoute>
)

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            {/* Protected Client Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/new-ticket" element={<NewTicket />} />
              <Route path="/ticket-detail/:id" element={<TicketDetail />} />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route element={<AdminProtectedLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/notices" element={<AdminNotices />} />
            </Route>
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App
