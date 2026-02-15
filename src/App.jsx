import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginView from './views/auth/LoginView'
import LandingPage from './views/LandingPage'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import AdminDashboard from './views/admin/DashboardView'
import MediaView from './views/admin/MediaView'
import PlaylistsView from './views/admin/PlaylistsView'
import ScreensView from './views/admin/ScreensView'
import ClientsView from './views/admin/ClientsView'
import SettingsView from './views/admin/SettingsView'
import ClientDashboard from './views/client/DashboardView'
import MyScreensView from './views/client/MyScreensView'
import ProfileView from './views/client/ProfileView'
import { useAuth } from './hooks/useAuth'
import FluidBackground from './components/ui/FluidBackground'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <FluidBackground />
      <div className="text-white animate-pulse">Loading Lumia...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" />

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role if trying to access unauthorized area
    return role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/client" />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginView />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="media" element={<MediaView />} />
          <Route path="playlists" element={<PlaylistsView />} />
          <Route path="screens" element={<ScreensView />} />
          <Route path="clients" element={<ClientsView />} />
          <Route path="settings" element={<SettingsView />} />
          {/* Add other admin routes */}
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client', 'admin']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ClientDashboard />} />
          <Route path="screens" element={<MyScreensView />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
