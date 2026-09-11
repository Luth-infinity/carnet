"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { useShallow } from "zustand/react/shallow"
import { ArrowRight, CalendarDays, CircleCheckBig, Plus, Search } from "lucide-react"
import { Topbar } from "@/components/topbar"
import { PageCard } from "@/components/page-view"
import { TaskRow, useLinger } from "@/components/task-row"
import { Kbd } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"
import { useStore } from "@/lib/store"
import { useUi } from "@/lib/ui-store"
import { useNavigateActions } from "@/lib/actions"
import { shortcut } from "@/lib/desktop"
import { collectTasks, wordCount } from "@/lib/doc"
import { formatFullDay, greeting } from "@/lib/dates"
import { pageHref } from "@/lib/routes"

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const { newPage, openToday } = useNavigateActions()
  const setCommandOpen = useUi((s) => s.setCommandOpen)
  const pages = useStore(useShallow((s) => Object.values(s.pages).filter((p) => !p.trashedAt)))
  const [now] = React.useState(() => new Date())
  const { lingering, linger } = useLinger()

  const recent = [...pages].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6)
  const words = pages.reduce((n, p) => n + wordCount(p.content), 0)
  const allTasks = pages.flatMap((p) =>
    collectTasks(p.content)
      .filter((t) => t.text)
      .map((t) => ({ page: p, task: t }))
  )
  const open = allTasks.filter((t) => !t.task.checked)
  const shown = allTasks.filter((t) => !t.task.checked || lingering.has(`${t.page.id}-${t.task.index}`))
  const done = allTasks.length - open.length
  const progress = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0

  const actions = [
    { label: "Nouvelle page", hint: shortcut("N"), icon: Plus, onClick: () => newPage(), tint: "bg-brand/10 text-brand" },
    { label: "Note du jour", hint: shortcut("J"), icon: CalendarDays, onClick: openToday, tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Rechercher", hint: shortcut("K"), icon: Search, onClick: () => setCommandOpen(true), tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ]

  return (
    <div className="flex h-[calc(100svh-1rem)] flex-col max-md:h-svh">
      <Topbar crumbs={[{ label: "Accueil" }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pt-12 pb-24 sm:px-10">
          <Reveal>
            <p className="text-muted-foreground text-sm">{formatFullDay(now)}</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight">{greeting(now)} 👋</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {pages.length} pages · {words.toLocaleString("fr-FR")} mots · {open.length} tâche{open.length > 1 ? "s" : ""} en cours
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-8 grid gap-3 sm:grid-cols-3">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="group bg-card ring-border hover:ring-foreground/20 flex items-center gap-3 rounded-xl p-3.5 text-left ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className={`flex size-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${a.tint}`}>
                  <a.icon className="size-5" />
                </span>
                <span className="flex-1 text-sm font-medium">{a.label}</span>
                <Kbd>{a.hint}</Kbd>
              </button>
            ))}
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
            <Reveal delay={0.1}>
              <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">Récemment modifiées</h2>
              {recent.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recent.map((p) => (
                    <PageCard key={p.id} page={p} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                  Aucune page pour l&apos;instant.
                </div>
              )}
            </Reveal>

            <Reveal delay={0.15}>
              <div className="bg-card ring-border rounded-xl p-4 ring-1">
                <div className="flex items-center gap-2">
                  <CircleCheckBig className="text-brand size-4" />
                  <h2 className="flex-1 text-sm font-semibold">Tâches</h2>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {done}/{allTasks.length}
                  </span>
                </div>
                <Progress value={progress} className="mt-3 h-1.5" />
                <div className="mt-3 flex flex-col">
                  {shown.slice(0, 6).map(({ page, task }) => (
                    <div key={`${page.id}-${task.index}`}>
                      <TaskRow
                        pageId={page.id}
                        task={task}
                        className="-mx-2"
                        onToggle={(v) => v && linger(`${page.id}-${task.index}`)}
                      />
                      <Link
                        href={pageHref(page.id)}
                        className="text-muted-foreground hover:text-foreground -mt-1 mb-1 ml-[1.9rem] block truncate text-xs transition-colors"
                      >
                        {page.icon} {page.title || "Sans titre"}
                      </Link>
                    </div>
                  ))}
                  {!shown.length && (
                    <p className="text-muted-foreground py-4 text-center text-sm">Rien à faire, profitez-en.</p>
                  )}
                </div>
                <Link
                  href="/taches"
                  className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  Toutes les tâches <ArrowRight className="size-3" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}
