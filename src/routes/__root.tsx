/// <reference types="vite/client" />
import { useState } from "react"
import type { ComponentType, ReactNode } from "react"
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
  Link,
  useRouter
} from "@tanstack/react-router"
import appCss from "~/styles/tailwind.css?url"
import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Wallet,
  X,
  Menu,
  Info,
  WalletCards,
  LogOut,
  ArrowRightLeft,
} from "lucide-react"
import { AppPreferencesProvider, useAppPreferences } from "~/lib/preferences"
import { supabase } from "~/lib/supabase"
import { useEffect } from "react"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "MyPocket CFO"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  component: RootComponent
})

function RootComponent() {
  return (
    <RootDocument>
      <AppPreferencesProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </AppPreferencesProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const { preferences, updatePreferences, mobileSidebarOpen, setMobileSidebarOpen } = useAppPreferences()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/guide"]
    
    const checkAuth = async (currentSession: any) => {
      setSession(currentSession)
      setLoading(false)
      const pathname = router.state.location.pathname
      
      if (!currentSession) {
        if (!publicPaths.includes(pathname)) {
          // If unauthenticated and on a protected route, redirect to register first (as per user's wish)
          router.navigate({ to: "/register" })
        }
      } else {
        if (pathname === "/login" || pathname === "/register") {
          // If already logged in, redirect to dashboard
          router.navigate({ to: "/" })
        }
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      checkAuth(session)
    })

    supabase.auth.getSession().then(({ data }) => {
      checkAuth(data.session)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.navigate({ to: "/login" })
  }
  
  const [hovered, setHovered] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    setCurrentDate(now.toLocaleDateString('en-US', options))
  }, [])

  const userDisplayName = session?.user?.user_metadata?.username || session?.user?.email || "Guest"

  const getPageTitle = () => {
    const path = router.state.location.pathname
    if (path === "/") return "Dashboard"
    if (path === "/pockets") return "Pockets"
    if (path === "/transactions") return "Audit Transaksi"
    if (path === "/settings") return "Settings"
    if (path === "/guide") return "Guide"
    if (path === "/login") return "Login"
    if (path === "/register") return "Register"
    return "MyPocket CFO"
  }

  const isExpanded =
    !preferences.sidebarCollapsed ||
    (preferences.sidebarCollapsed && preferences.sidebarHoverExpand && hovered)

  function closeMobile() {
    setMobileSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <div className="text-[11px] text-mutedForeground animate-pulse">Checking access...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={[
          "hidden md:flex md:flex-col md:gap-4 md:border-r md:border-border/60 md:bg-card/40 md:backdrop-blur bg-red-600",
          "md:transition-all md:duration-300 md:ease-out",
          isExpanded ? "md:w-64" : "md:w-16"
        ].join(" ")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="h-16 px-3 flex items-center">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-background">
              <WalletCards className="size-5" />
            </span>
            {isExpanded && (
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight truncate">
                  MyPocket CFO
                </div>
                <div className="text-[11px] text-mutedForeground truncate">
                  Personal money cockpit
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 flex flex-col gap-1">
          {session && (
            <>
              <SidebarLink
                to="/"
                label="Dashboard"
                icon={LayoutDashboard}
                collapsed={!isExpanded}
              />
              <SidebarLink
                to="/pockets"
                label="Pockets"
                icon={Wallet}
                collapsed={!isExpanded}
              />
              <SidebarLink
                to="/transactions"
                label="Transactions"
                icon={ArrowRightLeft}
                collapsed={!isExpanded}
              />
            </>
          )}
          <SidebarLink
            to="/guide"
            label="Guide"
            icon={Info}
            collapsed={!isExpanded}
          />
          {session && (
            <SidebarLink
              to="/settings"
              label="Settings"
              icon={Settings}
              collapsed={!isExpanded}
            />
          )}
        </nav>
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border/60 bg-card/90 backdrop-blur">
            <div className="h-16 px-4 flex items-center justify-between border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-background">
                  CFO
                </span>
                <div>
                  <div className="text-sm font-semibold tracking-tight">
                    MyPocket CFO
                  </div>
                  <div className="text-[11px] text-mutedForeground">
                    Personal money cockpit
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 text-mutedForeground hover:text-foreground hover:border-sky-500/60"
                onClick={closeMobile}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-2 flex flex-col gap-1">
              {session && (
                <>
                  <MobileLink to="/" label="Dashboard" icon={LayoutDashboard} onClick={closeMobile} />
                  <MobileLink to="/pockets" label="Pockets" icon={Wallet} onClick={closeMobile} />
                  <MobileLink to="/transactions" label="Transactions" icon={ArrowRightLeft} onClick={closeMobile} />
                  <MobileLink to="/settings" label="Settings" icon={Settings} onClick={closeMobile} />
                </>
              )}
              <MobileLink to="/guide" label="Guide" icon={Info} onClick={closeMobile} />
              {!session && (
                <>
                  <MobileLink to="/login" label="Login" icon={LayoutDashboard} onClick={closeMobile} />
                  <MobileLink to="/register" label="Register" icon={WalletCards} onClick={closeMobile} />
                </>
              )}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex-col height-full overflow-auto">
        {/* Header Bar */}
          <header className="sticky top-0 z-50 h-16 border-b border-border/60 bg-card/20 backdrop-blur px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 text-mutedForeground hover:text-foreground hover:border-sky-500/60"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  className="hidden md:inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/40 text-mutedForeground transition hover:text-foreground hover:border-sky-500/60"
                  onClick={() =>
                    updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed })
                  }
                  title={preferences.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {preferences.sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight truncate">
                    {getPageTitle()}
                  </div>
                  <div className="text-[11px] text-mutedForeground truncate">
                    {session ? `Logged in as ${userDisplayName}` : "Your personal money cockpit"}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 text-[11px] text-mutedForeground">
              <span>Fintech-grade clarity · Fast & private</span>
              {session ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-[10px] font-medium transition hover:border-rose-500/60 hover:text-rose-400"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-[10px] font-medium transition hover:border-sky-500/60 hover:text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[10px] font-medium text-sky-400 transition hover:bg-sky-500/20"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </header>

        {/* Main Content */}
          <main className="flex-1 min-w-0 px-4 py-6 md:px-6">
            {children}
          </main>
      </div>
    </div>
  )
}

function SidebarLink({
  to,
  label,
  icon: Icon,
  collapsed
}: {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  collapsed: boolean
}) {
  return (
    <Link
      to={to}
      className={[
        "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-mutedForeground transition",
        "hover:bg-accent/60 hover:text-foreground hover:border-border/60",
        // collapsed ? "justify-center" : "justify-start",  
      ].join(" ")}
      activeProps={{
        className:
          "bg-accent/70 text-foreground border-border/60 shadow-sm shadow-sky-500/5"
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-sky-400" />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </Link>
  )
}

function MobileLink({
  to,
  label,
  icon: Icon,
  onClick
}: {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-mutedForeground transition hover:bg-accent/60 hover:text-foreground hover:border-border/60"
      activeProps={{
        className:
          "bg-accent/70 text-foreground border-border/60 shadow-sm shadow-sky-500/5"
      }}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-sky-400" />
      <span className="truncate">{label}</span>
    </Link>
  )
}
