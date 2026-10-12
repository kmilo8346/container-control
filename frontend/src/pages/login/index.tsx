import { useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Layers } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { authClient } from '@/clients/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  if (user) return <Navigate to="/" replace />
  const error = params.get('error')
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="service-card w-full max-w-sm">
        <CardHeader className="gap-3">
          <Layers className="size-8 text-primary" />
          <CardTitle className="page-heading text-3xl">Container Control</CardTitle>
          <CardDescription>Sign in to manage your Railway containers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error === 'not_configured'
                ? 'GitHub login needs configuration in the API.'
                : 'GitHub sign-in failed or was cancelled. Please try again.'}
            </p>
          )}
          <Button className="h-11 w-full" render={<Link to="/authorize" />}>
            <KeyRound /> Continue with GitHub
          </Button>
          <p className="text-xs text-muted-foreground">
            We use your GitHub profile to identify your account.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export function AuthorizePage() {
  useEffect(() => {
    window.location.replace(authClient.authorizeUrl())
  }, [])
  return (
    <p className="p-8 text-muted-foreground" role="status">
      Redirecting to GitHub…
    </p>
  )
}
