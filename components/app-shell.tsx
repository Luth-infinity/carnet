"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { CommandMenu } from "@/components/command-menu"
import { SettingsDialog } from "@/components/settings-dialog"
import { Logo } from "@/components/logo"
import { useHydrated } from "@/hooks/use-hydrated"
import { useStore } from "@/lib/store"
import { useUi } from "@/lib/ui-store"
import { useNavigateActions } from "@/lib/actions"
import { desktop } from "@/lib/desktop"

function GlobalShortcuts() {
  const { newPage, openToday } = useNavigateActions()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = (e.ctrlKey || e.metaKey) && !e.altKey
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault()
        const ui = useUi.getState()
        ui.setCommandOpen(!ui.commandOpen)
        return
      }
      // Dans l'application de bureau, Ctrl N et Ctrl J sont libres ; un navigateur les garde pour lui
      const create = desktop() ? mod && !e.shiftKey : e.altKey && !e.ctrlKey && !e.metaKey
      if (!create) return
      if (e.code === "KeyN") {
        e.preventDefault()
        newPage()
      } else if (e.code === "KeyJ") {
        e.preventDefault()
        openToday()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [newPage, openToday])

  return null
}

/** Relie l'application de bureau : plateforme, menu natif et mises à jour */
function DesktopBridge() {
  const router = useRouter()
  const { newPage, openToday } = useNavigateActions()

  React.useEffect(() => {
    const api = desktop()
    if (!api) return
    document.documentElement.dataset.platform = api.platform

    const offMenu = api.onMenu((action) => {
      const ui = useUi.getState()
      if (action === "new-page") newPage()
      else if (action === "today") openToday()
      else if (action === "search") ui.setCommandOpen(true)
      else if (action === "settings") ui.setSettingsOpen(true)
      else if (action === "tasks") router.push("/taches")
    })
    const offUpdate = api.onUpdateAvailable((update) => useUi.getState().setUpdate(update))
    return () => {
      offMenu()
      offUpdate()
    }
  }, [router, newPage, openToday])

  return null
}

function Splash() {
  return (
    <div className="bg-sidebar flex min-h-svh items-center justify-center">
      <Logo className="size-10 animate-pulse" />
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const seeded = useStore((s) => s.seeded)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={300}>
        {hydrated && seeded ? (
          // useSearchParams (page active) exige une frontière Suspense dans un export statique
          <React.Suspense fallback={<Splash />}>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="min-h-[calc(100svh-1rem)] overflow-hidden">{children}</SidebarInset>
              <CommandMenu />
              <SettingsDialog />
              <GlobalShortcuts />
              <DesktopBridge />
            </SidebarProvider>
          </React.Suspense>
        ) : (
          <Splash />
        )}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
