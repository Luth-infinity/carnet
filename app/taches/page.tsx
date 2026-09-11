"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useShallow } from "zustand/react/shallow"
import { ArrowUpRight, CornerDownLeft, FileText, Plus } from "lucide-react"
import { Topbar } from "@/components/topbar"
import { TaskRow, useLinger } from "@/components/task-row"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { appendTask, collectTasks } from "@/lib/doc"
import { pageHref } from "@/lib/routes"

type Filter = "todo" | "done" | "all"

export default function TasksPage() {
  const [filter, setFilter] = React.useState<Filter>("todo")
  const [draft, setDraft] = React.useState("")
  const { lingering, linger } = useLinger()
  const pages = useStore(useShallow((s) => Object.values(s.pages).filter((p) => !p.trashedAt)))

  const groups = pages
    .map((page) => ({ page, tasks: collectTasks(page.content).filter((t) => t.text) }))
    .filter((g) => g.tasks.length)
    .sort((a, b) => {
      // La boîte de réception d'abord, puis les pages récemment modifiées
      if (a.page.system === "inbox") return -1
      if (b.page.system === "inbox") return 1
      return b.page.updatedAt - a.page.updatedAt
    })

  const total = groups.reduce((n, g) => n + g.tasks.length, 0)
  const done = groups.reduce((n, g) => n + g.tasks.filter((t) => t.checked).length, 0)

  const visible = groups
    .map((g) => ({
      ...g,
      counts: { done: g.tasks.filter((t) => t.checked).length, total: g.tasks.length },
      tasks: g.tasks.filter((t) => {
        const key = `${g.page.id}-${t.index}`
        if (filter === "all") return true
        if (filter === "done") return t.checked || lingering.has(key)
        return !t.checked || lingering.has(key)
      }),
    }))
    .filter((g) => g.tasks.length)

  const addTask = () => {
    const text = draft.trim()
    if (!text) return
    const { inbox, updatePage } = useStore.getState()
    const id = inbox()
    updatePage(id, { content: appendTask(useStore.getState().pages[id].content, text) })
    setDraft("")
  }

  return (
    <div className="flex h-[calc(100svh-1rem)] flex-col max-md:h-svh">
      <Topbar crumbs={[{ label: "Tâches" }]} />
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-3xl px-6 pt-12 pb-24 sm:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Tâches</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Toutes les cases à cocher de vos pages, au même endroit.
              </p>
            </div>
            <div className="w-48">
              <div className="text-muted-foreground mb-1.5 flex justify-between text-xs tabular-nums">
                <span>{total ? Math.round((done / total) * 100) : 0} %</span>
                <span>
                  {done}/{total} terminées
                </span>
              </div>
              <Progress value={total ? (done / total) * 100 : 0} className="h-1.5" />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              addTask()
            }}
            className="bg-card ring-border focus-within:ring-brand/50 mt-8 flex items-center gap-3 rounded-xl px-3.5 py-2.5 ring-1 transition-shadow focus-within:ring-2"
          >
            <Plus className="text-muted-foreground size-4" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ajouter une tâche rapide…"
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            {draft && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <CornerDownLeft className="size-3" /> dans Tâches rapides
              </span>
            )}
          </form>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mt-6">
            <TabsList>
              <TabsTrigger value="todo">À faire · {total - done}</TabsTrigger>
              <TabsTrigger value="done">Terminées · {done}</TabsTrigger>
              <TabsTrigger value="all">Toutes</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6 flex flex-col gap-4">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map(({ page, tasks, counts }) => (
                <motion.section
                  key={page.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card ring-border rounded-xl p-2 ring-1"
                >
                  <Link
                    href={pageHref(page.id)}
                    className="group/h hover:bg-accent flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <span className="flex size-5 items-center justify-center">
                      {page.icon ?? <FileText className="text-muted-foreground size-4" />}
                    </span>
                    <span className="truncate text-sm font-semibold">{page.title || "Sans titre"}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {counts.done}/{counts.total}
                    </span>
                    <ArrowUpRight className="text-muted-foreground ml-auto size-3.5 opacity-0 transition-opacity group-hover/h:opacity-100" />
                  </Link>
                  <div className="mt-0.5">
                    <AnimatePresence initial={false}>
                      {tasks.map((task) => (
                        <motion.div
                          key={task.index}
                          layout="position"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          style={{ paddingLeft: task.depth * 20 }}
                        >
                          <TaskRow
                            pageId={page.id}
                            task={task}
                            onToggle={() => linger(`${page.id}-${task.index}`)}
                            className="hover:bg-accent/50 transition-colors"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>

            {!visible.length && (
              <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center text-sm">
                <span className="text-3xl">{filter === "done" ? "🌱" : "🎉"}</span>
                {filter === "done"
                  ? "Aucune tâche terminée pour l'instant."
                  : total
                    ? "Tout est fait. Beau travail."
                    : "Aucune tâche. Ajoutez-en une ci-dessus ou tapez « / » dans une page."}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
