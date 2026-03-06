import { jsxs, jsx } from "react/jsx-runtime";
import { CircleUser, WalletMinimal, DollarSign, Bot, Tags, EyeOff } from "lucide-react";
import { u as useAppPreferences } from "./router-C_hNtkw0.js";
import "@tanstack/react-router";
import "react";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
function SettingsPage() {
  const {
    preferences,
    updatePreferences
  } = useAppPreferences();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-5xl flex-col gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold tracking-tight", children: "Settings" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-mutedForeground", children: "Control privacy, currency, and smart features." })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "General", description: "Profile & display preferences.", icon: CircleUser }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4", children: [
          /* @__PURE__ */ jsx(Field, { label: "Profile name", children: /* @__PURE__ */ jsx("input", { value: preferences.profileName, onChange: (e) => updatePreferences({
            profileName: e.target.value
          }), className: "h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500", placeholder: "e.g. Sulthan" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Email (optional)", children: /* @__PURE__ */ jsx("input", { type: "email", value: preferences.profileEmail, onChange: (e) => updatePreferences({
            profileEmail: e.target.value
          }), className: "h-9 w-full rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500", placeholder: "you@example.com" }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-mutedForeground", children: "Currency" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsx(CurrencyButton, { active: preferences.currency === "IDR", label: "IDR", icon: WalletMinimal, onClick: () => updatePreferences({
                currency: "IDR"
              }) }),
              /* @__PURE__ */ jsx(CurrencyButton, { active: preferences.currency === "USD", label: "USD", icon: DollarSign, onClick: () => updatePreferences({
                currency: "USD"
              }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Feature controls", description: "Turn smart automation on/off.", icon: Bot }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3", children: [
          /* @__PURE__ */ jsx(ToggleRow, { icon: Bot, title: "RAG AI Analysis", description: "Enable AI-powered finance insights (Transformers.js-ready).", checked: preferences.ragAiAnalysisEnabled, onCheckedChange: (checked) => updatePreferences({
            ragAiAnalysisEnabled: checked
          }) }),
          /* @__PURE__ */ jsx(ToggleRow, { icon: Tags, title: "Smart Categorization", description: "Auto-tag transactions from smart input.", checked: preferences.smartCategorizationEnabled, onCheckedChange: (checked) => updatePreferences({
            smartCategorizationEnabled: checked
          }) }),
          /* @__PURE__ */ jsx(ToggleRow, { icon: EyeOff, title: "Privacy Mode", description: "Blur balances across the app.", checked: preferences.privacyMode, onCheckedChange: (checked) => updatePreferences({
            privacyMode: checked
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { title: "Data & safety", description: "Small helpers for a safer workflow.", icon: CircleUser }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-mutedForeground", children: "Preferences are stored locally in your browser." }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updatePreferences({
          profileName: "",
          profileEmail: "",
          currency: "IDR",
          privacyMode: false,
          ragAiAnalysisEnabled: true,
          smartCategorizationEnabled: true,
          sidebarCollapsed: false
        }), className: "inline-flex h-9 items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 text-xs font-medium text-mutedForeground transition hover:border-rose-500/60 hover:text-foreground", children: "Reset preferences" })
      ] })
    ] })
  ] });
}
function Card({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5", children });
}
function CardHeader({
  title,
  description,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-mutedForeground", children: description })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border/60 bg-background/40 p-2 text-sky-400", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("label", { className: "grid gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-mutedForeground", children: label }),
    children
  ] });
}
function CurrencyButton({
  active,
  label,
  icon: Icon,
  onClick
}) {
  return /* @__PURE__ */ jsxs("button", { type: "button", onClick, className: ["inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm transition", active ? "border-sky-500/60 bg-sky-500/10 text-foreground" : "border-border/60 bg-background/40 text-mutedForeground hover:border-sky-500/40 hover:text-foreground"].join(" "), children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
    /* @__PURE__ */ jsx("span", { className: "font-medium", children: label })
  ] });
}
function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-background/40 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "mt-0.5 rounded-md bg-background/60 p-2 text-sky-400", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: title }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-mutedForeground", children: description })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Switch, { checked, onCheckedChange })
  ] });
}
function Switch({
  checked,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onCheckedChange(!checked), className: ["relative inline-flex h-7 w-12 items-center rounded-full border transition", checked ? "border-sky-500/60 bg-sky-500/20" : "border-border/60 bg-background/40"].join(" "), children: /* @__PURE__ */ jsx("span", { className: ["inline-block h-5 w-5 transform rounded-full bg-foreground/90 transition", checked ? "translate-x-6" : "translate-x-1"].join(" ") }) });
}
export {
  SettingsPage as component
};
