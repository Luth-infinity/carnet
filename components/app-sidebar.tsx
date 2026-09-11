"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useShallow } from "zustand/react/shallow"
import {
  CalendarDays,
  CircleCheckBig,
  FileText,
  House,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
  Trash2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Kbd } from "@/components/ui/kbd"
import { PageTree, RootDropZone } from "@/components/page-tree"
import { Logo } from "@/components/logo"
import { UpdateBadge } from "@/components/update-badge"
import { useStore } from "@/lib/store"
import { useUi } from "@/lib/ui-store"
import { useNavigateActions } from "@/lib/actions"
import { shortcut } from "@/lib/desktop"
import { collectTasks } from "@/lib/doc"
import { isoDay } from "@/lib/dates"
import { pageHref, useActivePageId } from "@/lib/routes"

function useOpenTaskCount() {
  return useStore((s) => {
    let n = 0
    for (const p of Object.values(s.pages)) {
      if (p.trashedAt) continue
      n += collectTasks(p.content).filter((t) => !t.checked && t.text).length
    }
    return n
  })
}

export function AppSidebar() {
  const pathname = usePathname()
  const activeId = useActivePageId()
  const { resolvedTheme, setTheme } = useTheme()
  const setCommandOpen = useUi((s) => s.setCommandOpen)
  const setSettingsOpen = useUi((s) => s.setSettingsOpen)
  const { newPage, openToday } = useNavigateActions()
  const openTasks = useOpenTaskCount()
  const trashCount = useStore((s) => Object.values(s.pages).filter((p) => p.trashedAt).length)
  const todayId = useStore((s) => Object.values(s.pages).find((p) => p.dailyDate === isoDay() && !p.trashedAt)?.id)
  const favorites = useStore(
    useShallow((s) =>
      Object.values(s.pages)
        .filter((p) => p.favorite && !p.trashedAt)
        .sort((a, b) => a.title.localeCompare(b.title))
    )
  )

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="gap-3 pt-3">
        <div className="flex items-center gap-2.5 px-1.5">
          <Logo className="size-7" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">Carnet</div>
            <div className="text-muted-foreground text-xs">Notes locales</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="bg-background/70 text-muted-foreground ring-sidebar-border hover:bg-background hover:text-foreground flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm shadow-xs ring-1 transition-colors"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Rechercher</span>
          <Kbd>{shortcut("K")}</Kbd>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <House />
                  <span>Accueil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={openToday} isActive={Boolean(todayId) && activeId === todayId}>
                <CalendarDays />
                <span>Aujourd&apos;hui</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/taches")}>
                <Link href="/taches">
                  <CircleCheckBig />
                  <span>Tâches</span>
                </Link>
              </SidebarMenuButton>
              {openTasks > 0 && <SidebarMenuBadge className="tabular-nums">{openTasks}</SidebarMenuBadge>}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => newPage()}>
                <Plus />
                <span>Nouvelle page</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Favoris</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-px">
                {favorites.map((f) => (
                  <SidebarMenuItem key={f.id}>
                    <SidebarMenuButton asChild size="sm" isActive={activeId === f.id} className="h-7 text-sm">
                      <Link href={pageHref(f.id)}>
                        <span className="flex size-4 items-center justify-center text-[14px] leading-none">
                          {f.icon ?? <FileText className="text-muted-foreground" />}
                        </span>
                        <span>{f.title || "Sans titre"}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <RootDropZone>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
          </RootDropZone>
          <SidebarGroupAction title="Nouvelle page" onClick={() => newPage()}>
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <PageTree />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UpdateBadge />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/corbeille")}>
              <Link href="/corbeille">
                <Trash2 />
                <span>Corbeille</span>
              </Link>
            </SidebarMenuButton>
            {trashCount > 0 && <SidebarMenuBadge className="tabular-nums">{trashCount}</SidebarMenuBadge>}
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-1">
            <SidebarMenuButton onClick={() => setSettingsOpen(true)} className="flex-1">
              <Settings2 />
              <span>Réglages</span>
            </SidebarMenuButton>
            <button
              type="button"
              title={resolvedTheme === "dark" ? "Thème clair" : "Thème sombre"}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
            >
              {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
