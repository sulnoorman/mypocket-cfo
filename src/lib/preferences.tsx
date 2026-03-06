import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export type CurrencyCode = "IDR" | "USD"

export type AppPreferences = {
  profileName: string
  profileEmail: string
  currency: CurrencyCode
  privacyMode: boolean
  ragAiAnalysisEnabled: boolean
  smartCategorizationEnabled: boolean
  sidebarCollapsed: boolean
  sidebarHoverExpand: boolean
  aiEndpointUrl: string
  showAdvancedAiSettings: boolean
  aiSystemPrompt: string
}

type AppPreferencesContextValue = {
  preferences: AppPreferences
  updatePreferences: (patch: Partial<AppPreferences>) => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (open: boolean) => void
}

const STORAGE_KEY = "mypocket-cfo.preferences.v1"

const defaultPreferences: AppPreferences = {
  profileName: "",
  profileEmail: "",
  currency: "IDR",
  privacyMode: false,
  ragAiAnalysisEnabled: true,
  smartCategorizationEnabled: true,
  sidebarCollapsed: false,
  sidebarHoverExpand: true,
  aiEndpointUrl: "",
  showAdvancedAiSettings: false,
  aiSystemPrompt:
    "Kamu adalah asisten keuangan pribadi yang membantu pengguna memahami cashflow, pengeluaran, dan kebiasaan belanja. Jawab dengan bahasa Indonesia santai, praktis, dan tidak menggurui."
}

function safeParsePreferences(raw: string | null): Partial<AppPreferences> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<AppPreferences>
    }
    return null
  } catch {
    return null
  }
}

function mergePreferences(patch: Partial<AppPreferences> | null): AppPreferences {
  const next: AppPreferences = { ...defaultPreferences, ...(patch ?? {}) }
  if (next.currency !== "IDR" && next.currency !== "USD") {
    next.currency = "IDR"
  }
  return next
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null
)

export function AppPreferencesProvider({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const patch = safeParsePreferences(window.localStorage.getItem(STORAGE_KEY))
    if (patch) {
      setPreferences(mergePreferences(patch))
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const value = useMemo<AppPreferencesContextValue>(() => {
    return {
      preferences,
      updatePreferences: (patch) =>
        setPreferences((prev) => mergePreferences({ ...prev, ...patch })),
      mobileSidebarOpen,
      setMobileSidebarOpen
    }
  }, [preferences, mobileSidebarOpen])

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  )
}

export function useAppPreferences(): AppPreferencesContextValue {
  const ctx = useContext(AppPreferencesContext)
  if (!ctx) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider")
  }
  return ctx
}

