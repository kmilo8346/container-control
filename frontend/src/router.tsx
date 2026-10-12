import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layers, LogOut } from 'lucide-react'
import { GalleryPage } from './pages/gallery'
import { PaintingLogsPage } from './pages/logs'
import { LoginPage, AuthorizePage } from './pages/login'
import { AuthProvider } from './providers/auth-provider'
import { useAuth } from './hooks/use-auth'
import { Button } from '@/components/ui/button'

function Layout() {
  const { user, logout } = useAuth()
  const [error, setError] = useState(false)
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <header className="border-b border-border">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5"
          aria-label="Main navigation"
        >
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <Layers className="size-5" /> Container Control
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Paintings
            </Link>
            <span className="text-muted-foreground">{user.login}</span>
            <Button
              variant="ghost"
              onClick={() => {
                void logout().catch(() => setError(true))
              }}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </nav>
        {error && (
          <p role="alert" className="px-6 pb-3 text-sm text-destructive">
            Could not sign out. Please try again.
          </p>
        )}
      </header>
      <Outlet />
    </>
  )
}

function Navigation() {
  const { loading, error } = useAuth()
  if (loading)
    return (
      <p className="p-8 text-muted-foreground" role="status">
        Checking your session…
      </p>
    )
  if (error)
    return (
      <main className="space-y-4 p-8">
        <p role="alert">The API is unavailable. Check that it is running.</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </main>
    )
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authorize" element={<AuthorizePage />} />
      <Route element={<Layout />}>
        <Route index element={<GalleryPage />} />
        <Route path="paintings/logs" element={<PaintingLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </BrowserRouter>
  )
}
