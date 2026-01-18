import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import AdminNotices from './pages/admin/AdminNotices'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Client Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/new-ticket" element={
              <ProtectedRoute>
                <NewTicket />
              </ProtectedRoute>
            } />
            <Route path="/ticket-detail/:id" element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <AdminProtectedRoute>
                <AdminTickets />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/tickets/:id" element={
              <AdminProtectedRoute>
                <AdminTicketDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/notices" element={
              <AdminProtectedRoute>
                <AdminNotices />
              </AdminProtectedRoute>
            } />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  )
}

export default App
