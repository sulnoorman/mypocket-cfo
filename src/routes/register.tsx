import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { Eye, EyeClosed } from "lucide-react"
import { useState } from "react"
import { supabase } from "~/lib/supabase"

export const Route = createFileRoute("/register")({
  component: RegisterPage
})

function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState<Boolean>(false)

  function togglePassword(e: React.MouseEvent) {
    e.preventDefault()
    setShowPassword(prev => !prev)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username is required")
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username.trim()
        }
      }
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.navigate({ to: "/login" })
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <div className="text-lg font-semibold tracking-tight">Create account</div>
      {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">{error}</div>}
      <form onSubmit={onSubmit} className="grid gap-3">
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          type="text" 
          placeholder="Username" 
          className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
        />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />

        <div className="flex items-center">
          <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
          <button type="button" className="focus:outline-none -ml-8" onClick={togglePassword}>
            {showPassword ?
              <EyeClosed className="w-4 text-gray-200" />
              : <Eye className="w-4 text-gray-200" />
            }
          </button>
        </div>

        <button type="submit" disabled={loading} className="h-9 rounded-md bg-emerald-500 px-3 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="text-xs text-mutedForeground">Already have an account? <Link to="/login" className="text-sky-400">Sign in</Link></div>
    </div>
  )
}
