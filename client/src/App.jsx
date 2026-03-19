import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Donations from './pages/Donations'
import Requests from './pages/Requests'
import Tasks from './pages/Tasks'
import Users from './pages/Users'
import { useAuth } from './context/AuthContext'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/donations" element={
        <ProtectedRoute roles={['admin','donor']}><Layout><Donations /></Layout></ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute roles={['admin','beneficiary']}><Layout><Requests /></Layout></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute roles={['admin','volunteer']}><Layout><Tasks /></Layout></ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute roles={['admin']}><Layout><Users /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
