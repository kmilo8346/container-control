import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom'
import { KeyRound, Layers, LogOut } from 'lucide-react'
import { Dashboard } from './App'
import { API_URL, AuthProvider, useAuth } from './auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function Login() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  if (user) return <Navigate to="/" replace />
  const error = params.get('error')
  return <main className="flex min-h-screen items-center justify-center px-6">
    <Card className="service-card w-full max-w-sm">
      <CardHeader className="gap-3">
        <Layers className="size-8 text-primary" />
        <CardTitle className="page-heading text-3xl">Container Control</CardTitle>
        <CardDescription>Sign in to manage your Railway containers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p role="alert" className="text-sm text-destructive">{error === 'not_configured' ? 'GitHub login needs configuration in the API.' : 'GitHub sign-in failed or was cancelled. Please try again.'}</p>}
        <Button className="h-11 w-full" render={<Link to="/authorize" />}><KeyRound /> Continue with GitHub</Button>
        <p className="text-xs text-muted-foreground">We use your GitHub profile to identify your account.</p>
      </CardContent>
    </Card>
  </main>
}

function Authorize() {
  useEffect(() => { window.location.replace(`${API_URL}/auth/github`) }, [])
  return <p className="p-8 text-muted-foreground" role="status">Redirecting to GitHub…</p>
}

function Layout() {
  const { user, logout } = useAuth()
  const [error, setError] = useState(false)
  if (!user) return <Navigate to="/login" replace />
  return <>
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-3 font-semibold"><Layers className="size-5" /> Container Control</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Containers</Link>
          <span className="text-muted-foreground">{user.login}</span>
          <Button variant="ghost" onClick={() => { void logout().catch(() => setError(true)) }}><LogOut /> Sign out</Button>
        </div>
      </nav>
      {error && <p role="alert" className="px-6 pb-3 text-sm text-destructive">Could not sign out. Please try again.</p>}
    </header>
    <Outlet />
  </>
}

function Navigation() {
  const { loading, error } = useAuth()
  if (loading) return <p className="p-8 text-muted-foreground" role="status">Checking your session…</p>
  if (error) return <main className="space-y-4 p-8"><p role="alert">The API is unavailable. Check that it is running.</p><Button onClick={() => window.location.reload()}>Try again</Button></main>
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/authorize" element={<Authorize />} />
    <Route element={<Layout />}><Route index element={<Dashboard />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

export default function AppRouter() {
  return <BrowserRouter><AuthProvider><Navigation /></AuthProvider></BrowserRouter>
}
