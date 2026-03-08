import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { supabase } from "~/lib/supabase"

export const Route = createFileRoute("/login")({
  component: LoginPage
})

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.navigate({ to: "/" })
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <div className="text-lg font-semibold tracking-tight">Sign in</div>
      {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">{error}</div>}
      <form onSubmit={onSubmit} className="grid gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
        <button disabled={loading} className="h-9 rounded-md bg-sky-500 px-3 text-sm font-medium text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
      <div className="text-xs text-mutedForeground">No account? <Link to="/register" className="text-sky-400">Register</Link></div>
    </div>
  )
}
