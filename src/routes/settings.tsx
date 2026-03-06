import { createFileRoute } from "@tanstack/react-router"
import type { ComponentType, ReactNode } from "react"
import {
  Bot,
  CircleUser,
  EyeOff,
  PanelLeftClose,
  Tags,
  WalletMinimal,
  DollarSign
} from "lucide-react"
import { useAppPreferences } from "~/lib/preferences"

export const Route = createFileRoute("/settings")({
  component: SettingsPage
})

function SettingsPage() {
  const { preferences, updatePreferences } = useAppPreferences()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold tracking-tight">Settings</div>
          <div className="text-sm text-mutedForeground">
            Control privacy, currency, and smart features.
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="General"
            description="Profile & display preferences."
            icon={CircleUser}
          />
          <div className="mt-4 grid gap-4">
            <Field label="Profile name">
              <input
                value={preferences.profileName}
                onChange={(e) => updatePreferences({ profileName: e.target.value })}
                className="h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="e.g. Sulthan"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                value={preferences.profileEmail}
                onChange={(e) => updatePreferences({ profileEmail: e.target.value })}
                className="h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="you@example.com"
              />
            </Field>
            <div className="grid gap-2">
              <div className="text-xs font-medium text-mutedForeground">Currency</div>
              <div className="grid grid-cols-2 gap-2">
                <CurrencyButton
                  active={preferences.currency === "IDR"}
                  label="IDR"
                  icon={WalletMinimal}
                  onClick={() => updatePreferences({ currency: "IDR" })}
                />
                <CurrencyButton
                  active={preferences.currency === "USD"}
                  label="USD"
                  icon={DollarSign}
                  onClick={() => updatePreferences({ currency: "USD" })}
                />
              </div>
            </div>
            <ToggleRow
              icon={PanelLeftClose}
              title="Sidebar hover expand"
              description="When collapsed, expand sidebar on hover."
              checked={preferences.sidebarHoverExpand}
              onCheckedChange={(checked) =>
                updatePreferences({ sidebarHoverExpand: checked })
              }
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Feature controls"
            description="Turn smart automation on/off."
            icon={Bot}
          />
          <div className="mt-4 grid gap-3">
            <ToggleRow
              icon={Bot}
              title="RAG AI Analysis"
              description="Enable AI-powered finance insights (Transformers.js-ready)."
              checked={preferences.ragAiAnalysisEnabled}
              onCheckedChange={(checked) =>
                updatePreferences({ ragAiAnalysisEnabled: checked })
              }
            />
            <ToggleRow
              icon={Tags}
              title="Smart Categorization"
              description="Auto-tag transactions from smart input."
              checked={preferences.smartCategorizationEnabled}
              onCheckedChange={(checked) =>
                updatePreferences({ smartCategorizationEnabled: checked })
              }
            />
            <ToggleRow
              icon={EyeOff}
              title="Privacy Mode"
              description="Blur balances across the app."
              checked={preferences.privacyMode}
              onCheckedChange={(checked) => updatePreferences({ privacyMode: checked })}
            />
            <ToggleRow
              icon={Bot}
              title="Show advanced AI settings"
              description="Enable custom AI endpoint & prompt."
              checked={preferences.showAdvancedAiSettings}
              onCheckedChange={(checked) =>
                updatePreferences({ showAdvancedAiSettings: checked })
              }
            />
            {preferences.showAdvancedAiSettings && (
              <div className="mt-1 space-y-3 rounded-md border border-border/60 bg-background/40 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-mutedForeground">
                  Advanced AI Settings
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-mutedForeground">
                    Custom AI endpoint URL
                  </div>
                  <input
                    value={preferences.aiEndpointUrl}
                    onChange={(e) => updatePreferences({ aiEndpointUrl: e.target.value })}
                    className="h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    placeholder="http://localhost:3000/api/ai"
                  />
                  <div className="text-[11px] text-mutedForeground">
                    Endpoint akan dipanggil dengan <code className="rounded bg-card/70 px-1">POST
                    &#123; prompt: &quot;...&quot; &#125;</code>. Kosongkan untuk pakai default
                    Ollama lokal.
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-medium text-mutedForeground">
                    AI system prompt (opsional)
                  </div>
                  <textarea
                    value={preferences.aiSystemPrompt}
                    onChange={(e) => updatePreferences({ aiSystemPrompt: e.target.value })}
                    rows={3}
                    className="w-full resize-none rounded-md border border-border/60 bg-input px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    placeholder="Kamu adalah asisten keuangan pribadi..."
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader
          title="Data & safety"
          description="Small helpers for a safer workflow."
          icon={CircleUser}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-mutedForeground">
            Preferences are stored locally in your browser.
          </div>
          <button
            type="button"
            onClick={() =>
              updatePreferences({
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
              })
            }
            className="inline-flex h-9 items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 text-xs font-medium text-mutedForeground transition hover:border-rose-500/60 hover:text-foreground"
          >
            Reset preferences
          </button>
        </div>
      </Card>
    </div>
  )
}

function Card({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5">
      {children}
    </div>
  )
}

function CardHeader({
  title,
  description,
  icon: Icon
}: {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-mutedForeground">{description}</div>
      </div>
      <div className="rounded-md border border-border/60 bg-background/40 p-2 text-sky-400">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  )
}

function Field({
  label,
  children
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium text-mutedForeground">{label}</span>
      {children}
    </label>
  )
}

function CurrencyButton({
  active,
  label,
  icon: Icon,
  onClick
}: {
  active: boolean
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm transition",
        active
          ? "border-sky-500/60 bg-sky-500/10 text-foreground"
          : "border-border/60 bg-background/40 text-mutedForeground hover:border-sky-500/40 hover:text-foreground"
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-md bg-background/60 p-2 text-sky-400">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-mutedForeground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function Switch({
  checked,
  onCheckedChange
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked
          ? "border-sky-500/60 bg-sky-500/20"
          : "border-border/60 bg-background/40"
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-foreground/90 transition",
          checked ? "translate-x-6" : "translate-x-1"
        ].join(" ")}
      />
    </button>
  )
}

