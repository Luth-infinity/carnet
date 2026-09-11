"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { CalendarDays, CircleCheckBig, CornerDownLeft, FileText, House, Moon, Plus, Settings2, Sun } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { ancestorsOf, useStore } from "@/lib/store"
import { useUi } from "@/lib/ui-store"
import { useNavigateActions } from "@/lib/actions"
import { shortcut } from "@/lib/desktop"
import { docText } from "@/lib/doc"
import { formatRelative } from "@/lib/dates"
import { pageHref } from "@/lib/routes"
import { normalize } from "@/components/editor/suggestion-menu"

interface Result {
  id: string
  title: string
  icon: string | null
  path: string
  excerpt: string | null
  updatedAt: number
  /** 1 si le titre correspond, 0 si seul le contenu correspond */
  score: number
}

function excerptAround(text: string, query: string) {
  const i = normalize(text).indexOf(query)
  if (i < 0) return null
  const start = Math.max(0, i - 40)
  const end = Math.min(text.length, i + query.length + 60)
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`
}

export function CommandMenu() {
  const router = useRouter()
  const open = useUi((s) => s.commandOpen)
  const setOpen = useUi((s) => s.setCommandOpen)
  const setSettingsOpen = useUi((s) => s.setSettingsOpen)
  const { newPage, openToday } = useNavigateActions()
  const { resolvedTheme, setTheme } = useTheme()
  const [query, setQuery] = React.useState("")

  const results = React.useMemo<Result[]>(() => {
    if (!open) return []
    const pages = useStore.getState().pages
    const q = normalize(query.trim())
    const out: Result[] = []
    for (const p of Object.values(pages)) {
      if (p.trashedAt) continue
      const title = p.title || "Sans titre"
      const path = ancestorsOf(pages, p.id)
        .map((a) => a.title || "Sans titre")
        .join(" / ")
      if (!q) {
        out.push({ id: p.id, title, icon: p.icon, path, excerpt: null, updatedAt: p.updatedAt, score: 1 })
        continue
      }
      const inTitle = normalize(title).includes(q)
      const excerpt = inTitle ? null : excerptAround(docText(p.content), q)
      if (inTitle || excerpt) {
        out.push({ id: p.id, title, icon: p.icon, path, excerpt, updatedAt: p.updatedAt, score: inTitle ? 1 : 0 })
      }
    }
    return out.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt).slice(0, 30)
  }, [open, query])

  const run = (fn: () => void) => {
    setOpen(false)
    setQuery("")
    fn()
  }

  const actions = [
    { id: "new", label: "Nouvelle page", icon: Plus, shortcut: shortcut("N"), run: () => newPage() },
    { id: "today", label: "Note du jour", icon: CalendarDays, shortcut: shortcut("J"), run: openToday },
    { id: "tasks", label: "Voir les tâches", icon: CircleCheckBig, run: () => router.push("/taches") },
    { id: "home", label: "Accueil", icon: House, run: () => router.push("/") },
    {
      id: "theme",
      label: resolvedTheme === "dark" ? "Passer en thème clair" : "Passer en thème sombre",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    },
    { id: "settings", label: "Réglages et sauvegarde", icon: Settings2, run: () => setSettingsOpen(true) },
  ]
  const q = normalize(query.trim())
  const visibleActions = actions.filter((a) => !q || normalize(a.label).includes(q))

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
      title="Palette de commandes"
      description="Rechercher une page ou lancer une action"
      className="sm:max-w-xl"
    >
      <Command shouldFilter={false} className="rounded-xl!">
        <CommandInput value={query} onValueChange={setQuery} placeholder="Rechercher une page, un mot, une action…" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>Rien trouvé pour « {query} »</CommandEmpty>

          {visibleActions.length > 0 && (
            <CommandGroup heading="Actions">
              {visibleActions.map((a) => (
                <CommandItem key={a.id} value={`action-${a.id}`} onSelect={() => run(a.run)}>
                  <a.icon />
                  {a.label}
                  {a.shortcut && <CommandShortcut>{a.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.length > 0 && (
            <CommandGroup heading={q ? "Pages" : "Récemment modifiées"}>
              {results.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`page-${r.id}`}
                  onSelect={() => run(() => router.push(pageHref(r.id)))}
                  className="group/item items-start py-2"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center text-base leading-none">
                    {r.icon ?? <FileText className="text-muted-foreground" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-medium">{r.title}</span>
                      {r.path && <span className="text-muted-foreground truncate text-xs">{r.path}</span>}
                    </span>
                    {r.excerpt && (
                      <span className="text-muted-foreground mt-0.5 block truncate text-xs">{r.excerpt}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs group-data-[selected=true]/item:hidden">
                    {formatRelative(r.updatedAt)}
                  </span>
                  <CornerDownLeft className="text-muted-foreground hidden size-3.5 shrink-0 self-center group-data-[selected=true]/item:block" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
