"use client"

import * as React from "react"
import { motion } from "motion/react"
import { useStore } from "@/lib/store"
import { setTaskChecked, type TaskRef } from "@/lib/doc"
import { cn } from "@/lib/utils"

export function toggleTask(pageId: string, index: number, checked: boolean) {
  const { pages, updatePage } = useStore.getState()
  const page = pages[pageId]
  if (!page?.content) return
  updatePage(pageId, { content: setTaskChecked(page.content, index, checked) })
}

/** Garde visibles un court instant les tâches qu'on vient de cocher, pour voir l'animation */
export function useLinger(delay = 900) {
  const [keys, setKeys] = React.useState<Set<string>>(() => new Set())
  const add = React.useCallback(
    (key: string) => {
      setKeys((s) => new Set(s).add(key))
      setTimeout(() => {
        setKeys((s) => {
          const next = new Set(s)
          next.delete(key)
          return next
        })
      }, delay)
    },
    [delay]
  )
  return { lingering: keys, linger: add }
}

export function TaskCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        "group/check flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-150 active:scale-90",
        checked ? "border-brand bg-brand" : "border-foreground/30 hover:border-brand bg-background"
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
        <motion.path
          d="M2.5 6.2 5 8.6l4.6-5.2"
          fill="none"
          stroke="var(--brand-foreground)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </svg>
    </button>
  )
}

export function TaskRow({
  pageId,
  task,
  onToggle,
  className,
}: {
  pageId: string
  task: TaskRef
  onToggle?: (checked: boolean) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg px-2 py-1.5", className)}>
      <span className="flex h-5 items-center">
        <TaskCheckbox
          checked={task.checked}
          onChange={(v) => {
            toggleTask(pageId, task.index, v)
            onToggle?.(v)
          }}
        />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-sm leading-5 transition-colors duration-300",
          task.checked && "text-muted-foreground decoration-muted-foreground/60 line-through"
        )}
      >
        {task.text}
      </span>
    </div>
  )
}
