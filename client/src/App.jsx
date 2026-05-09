import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import Layout from "./components/Layout.jsx"
import Spinner from "./components/Spinner.jsx"
import { authApi, clearStoredToken, getStoredToken } from "./lib/api.js"
import AuthPage from "./pages/AuthPage.jsx"
import HomePage from "./pages/HomePage.jsx"
import UploadPage from "./pages/UploadPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"
import VideoPage from "./pages/VideoPage.jsx"

function RequireAuth({ user, loading, children }) {
  const location = useLocation()
  if (loading) return <Spinner label="Checking session" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getStoredToken()))

  useEffect(() => {
    let alive = true
    async function loadUser() {
      if (!getStoredToken()) {
        setLoading(false)
        return
      }
      try {
        const payload = await authApi.currentUser()
        if (alive) setUser(payload.data)
      } catch {
        clearStoredToken()
        if (alive) setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadUser()
    return () => {
      alive = false
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" onAuth={setUser} />} />
      <Route path="/signup" element={<AuthPage mode="signup" onAuth={setUser} />} />
      <Route
        element={
          <RequireAuth user={user} loading={loading}>
            <Layout user={user} onLogout={() => setUser(null)} />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="/upload" element={<UploadPage user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} onUserUpdate={setUser} />} />
        <Route path="/profile/:username" element={<ProfilePage user={user} onUserUpdate={setUser} />} />
        <Route path="/watch/:videoId" element={<VideoPage user={user} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
