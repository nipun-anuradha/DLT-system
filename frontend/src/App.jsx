import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
      <BrowserRouter>
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/new-ticket" element={<NewTicket />} />
          <Route path="/ticket-detail/:id" element={<TicketDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          
          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
