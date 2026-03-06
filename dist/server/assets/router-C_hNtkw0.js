import { createRootRoute, Outlet, HeadContent, Scripts, Link, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PanelLeftClose, LayoutDashboard, Wallet, Settings, PanelLeftOpen, X, Menu } from "lucide-react";
import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const appCss = "/assets/tailwind-DwhZe2Ny.css";
const STORAGE_KEY = "mypocket-cfo.preferences.v1";
const defaultPreferences = {
  profileName: "",
  profileEmail: "",
  currency: "IDR",
  privacyMode: false,
  ragAiAnalysisEnabled: true,
  smartCategorizationEnabled: true,
  sidebarCollapsed: false
};
function safeParsePreferences(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function mergePreferences(patch) {
  const next = { ...defaultPreferences, ...patch ?? {} };
  if (next.currency !== "IDR" && next.currency !== "USD") {
    next.currency = "IDR";
  }
  return next;
}
const AppPreferencesContext = createContext(
  null
);
function AppPreferencesProvider({
  children
}) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
    const patch = safeParsePreferences(window.localStorage.getItem(STORAGE_KEY));
    if (patch) {
      setPreferences(mergePreferences(patch));
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);
  const value = useMemo(() => {
    return {
      preferences,
      updatePreferences: (patch) => setPreferences((prev) => mergePreferences({ ...prev, ...patch })),
      mobileSidebarOpen,
      setMobileSidebarOpen
    };
  }, [preferences, mobileSidebarOpen]);
  return /* @__PURE__ */ jsx(AppPreferencesContext.Provider, { value, children });
}
function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return ctx;
}
const Route$3 = createRootRoute({
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
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(AppPreferencesProvider, { children: /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) }) }) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "bg-background text-foreground min-h-screen antialiased", children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function AppShell({ children }) {
  const { preferences, updatePreferences, mobileSidebarOpen, setMobileSidebarOpen } = useAppPreferences();
  function closeMobile() {
    setMobileSidebarOpen(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: [
          "hidden md:flex md:flex-col md:gap-4 md:border-r md:border-border/60 md:bg-card/40 md:backdrop-blur",
          preferences.sidebarCollapsed ? "md:w-16" : "md:w-64"
        ].join(" "),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "h-16 px-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-hidden", children: [
              /* @__PURE__ */ jsx("span", { className: "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-background", children: "CFO" }),
              !preferences.sidebarCollapsed && /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold tracking-tight truncate", children: "MyPocket CFO" }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-mutedForeground truncate", children: "Personal money cockpit" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: [
                  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/50 text-mutedForeground transition hover:text-foreground hover:border-sky-500/60",
                  preferences.sidebarCollapsed ? "opacity-0 pointer-events-none" : ""
                ].join(" "),
                onClick: () => updatePreferences({ sidebarCollapsed: true }),
                title: "Collapse sidebar",
                children: /* @__PURE__ */ jsx(PanelLeftClose, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-2 flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx(
              SidebarLink,
              {
                to: "/",
                label: "Dashboard",
                icon: LayoutDashboard,
                collapsed: preferences.sidebarCollapsed
              }
            ),
            /* @__PURE__ */ jsx(
              SidebarLink,
              {
                to: "/pockets",
                label: "Pockets",
                icon: Wallet,
                collapsed: preferences.sidebarCollapsed
              }
            ),
            /* @__PURE__ */ jsx(
              SidebarLink,
              {
                to: "/settings",
                label: "Settings",
                icon: Settings,
                collapsed: preferences.sidebarCollapsed
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "w-full inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs text-mutedForeground transition hover:text-foreground hover:border-sky-500/60",
              onClick: () => updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed }),
              title: preferences.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar",
              children: preferences.sidebarCollapsed ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(PanelLeftOpen, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Expand sidebar" })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(PanelLeftClose, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: "Collapse" })
              ] })
            }
          ) })
        ]
      }
    ),
    mobileSidebarOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 md:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "absolute inset-0 bg-black/60",
          "aria-label": "Close menu",
          onClick: closeMobile
        }
      ),
      /* @__PURE__ */ jsxs("aside", { className: "absolute left-0 top-0 h-full w-72 border-r border-border/60 bg-card/90 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "h-16 px-4 flex items-center justify-between border-b border-border/60", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-background", children: "CFO" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold tracking-tight", children: "MyPocket CFO" }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-mutedForeground", children: "Personal money cockpit" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 text-mutedForeground hover:text-foreground hover:border-sky-500/60",
              onClick: closeMobile,
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "p-2 flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx(MobileLink, { to: "/", label: "Dashboard", icon: LayoutDashboard, onClick: closeMobile }),
          /* @__PURE__ */ jsx(MobileLink, { to: "/pockets", label: "Pockets", icon: Wallet, onClick: closeMobile }),
          /* @__PURE__ */ jsx(MobileLink, { to: "/settings", label: "Settings", icon: Settings, onClick: closeMobile })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex min-w-0 flex-col", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 border-b border-border/60 bg-card/20 backdrop-blur px-4 md:px-6 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 text-mutedForeground hover:text-foreground hover:border-sky-500/60",
              onClick: () => setMobileSidebarOpen(true),
              "aria-label": "Open menu",
              children: /* @__PURE__ */ jsx(Menu, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold tracking-tight truncate", children: "MyPocket CFO" }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-mutedForeground truncate", children: "Your personal money cockpit" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-2 text-[11px] text-mutedForeground", children: "Fintech-grade clarity · Fast & private" })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0 px-4 py-6 md:px-6", children })
    ] })
  ] });
}
function SidebarLink({
  to,
  label,
  icon: Icon,
  collapsed
}) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      className: [
        "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-mutedForeground transition",
        "hover:bg-accent/60 hover:text-foreground hover:border-border/60"
      ].join(" "),
      activeProps: {
        className: "bg-accent/70 text-foreground border-border/60 shadow-sm shadow-sky-500/5"
      },
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 flex-shrink-0 text-sky-400" }),
        !collapsed && /* @__PURE__ */ jsx("span", { className: "truncate", children: label }),
        collapsed && /* @__PURE__ */ jsx("span", { className: "sr-only", children: label })
      ]
    }
  );
}
function MobileLink({
  to,
  label,
  icon: Icon,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      onClick,
      className: "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-mutedForeground transition hover:bg-accent/60 hover:text-foreground hover:border-border/60",
      activeProps: {
        className: "bg-accent/70 text-foreground border-border/60 shadow-sm shadow-sky-500/5"
      },
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 flex-shrink-0 text-sky-400" }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: label })
      ]
    }
  );
}
const $$splitComponentImporter$2 = () => import("./settings-BcEPj1qo.js");
const Route$2 = createFileRoute("/settings")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getDashboardData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d559676742f60ca6690f4425e4efc767611d69bd0ae9342c3c7f0abdafebbd4c"));
const createPocket = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("8547b6239d6a06bf69eacf8d8ba01863797ac72443576aa0449618a9d8036b02"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("9ecd24a1e309f53f1e0ca516e84e41c6187912d9315a027229ec288d321839cd"));
const archivePocket = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("dba2f337c63aeca4188aa12bda9b1236fa6783c23bcf3da73bb58fc02c8299ff"));
const createPocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("eaf8e89607d3b0486a2601c34a04a2a2f4e1806b7530588aebf0154a689bec0f"));
const togglePocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("a0bb503f7b4c30e85df0cc90a38296aaea4bb98a133c9765dabd076456ea51fb"));
const deletePocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("07a70d2437ca43515b7c7f6efd729da44eb15cd9c1d4d3d202ab296793bb4123"));
const createTransactionFromSmartInput = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("1b2e31df34f80caf04cb5275d757b9a994ef02b8c2b07586982114472e45fc97"));
const deleteTransaction = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("6b62ebe496c159e725c4a1571bc97830b291a24b97be8851614179dfab0579e2"));
createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("a879879235d807c09622eb2074a8ebe40a6f6f01f7a887a9392fc9c8353f1a29"));
createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(createSsrRpc("ff67c4b03db143e9b1067e5daad005a96c8344104aa7f6f0f52c2478fe3a31ec"));
const $$splitComponentImporter$1 = () => import("./pockets-dRlgHYSX.js");
const Route$1 = createFileRoute("/pockets")({
  loader: () => getDashboardData(),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-Ce1v49tc.js");
const Route = createFileRoute("/")({
  loader: () => getDashboardData(),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SettingsRoute = Route$2.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$3
});
const PocketsRoute = Route$1.update({
  id: "/pockets",
  path: "/pockets",
  getParentRoute: () => Route$3
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  PocketsRoute,
  SettingsRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  createTransactionFromSmartInput as a,
  createPocket as b,
  createSsrRpc as c,
  deleteTransaction as d,
  archivePocket as e,
  deletePocketItem as f,
  createPocketItem as g,
  Route as h,
  router as r,
  togglePocketItem as t,
  useAppPreferences as u
};
