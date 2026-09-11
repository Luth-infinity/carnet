"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRight, FileText, MoreHorizontal, Plus } from "lucide-react"
import { useShallow } from "zustand/react/shallow"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageMenuItems } from "@/components/page-menu"
import { selectChildren, useStore } from "@/lib/store"
import type { DropPosition } from "@/lib/types"
import { cn } from "@/lib/utils"
import { pageHref, useActivePageId } from "@/lib/routes"

const DRAG_TYPE = "application/x-carnet-page"

interface DragState {
  overId: string | null
  position: DropPosition | null
}

/** Une seule page peut être glissée à la fois : pas besoin d'état React pour ça */
let draggingId: string | null = null

const DragContext = React.createContext<{
  state: DragState
  setState: (s: DragState) => void
} | null>(null)

export function PageTree({ parentId = null }: { parentId?: string | null }) {
  const [state, setState] = React.useState<DragState>({ overId: null, position: null })
  const ctx = React.useMemo(() => ({ state, setState }), [state])

  return (
    <DragContext.Provider value={ctx}>
      <TreeLevel parentId={parentId} depth={0} />
    </DragContext.Provider>
  )
}

function TreeLevel({ parentId, depth }: { parentId: string | null; depth: number }) {
  const children = useStore(useShallow((s) => selectChildren(s.pages, parentId).map((p) => p.id)))
  return (
    <ul className="flex flex-col gap-px">
      {children.map((id) => (
        <TreeItem key={id} id={id} depth={depth} />
      ))}
    </ul>
  )
}

function TreeItem({ id, depth }: { id: string; depth: number }) {
  const router = useRouter()
  const activeId = useActivePageId()
  const drag = React.useContext(DragContext)!
  const page = useStore((s) => s.pages[id])
  const hasChildren = useStore((s) => Object.values(s.pages).some((p) => p.parentId === id && !p.trashedAt))
  const expanded = useStore((s) => Boolean(s.expanded[id]))
  const setExpanded = useStore((s) => s.setExpanded)
  const [menuOpen, setMenuOpen] = React.useState(false)

  if (!page) return null
  const active = activeId === id
  const isOver = drag.state.overId === id

  const onDragOver = (e: React.DragEvent) => {
    const dragging = draggingId
    if (!dragging) return
    e.stopPropagation()
    if (dragging === id) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    const position: DropPosition = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside"
    if (drag.state.overId !== id || drag.state.position !== position) {
      drag.setState({ overId: id, position })
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const dragging = draggingId
    if (dragging && drag.state.position) {
      useStore.getState().movePage(dragging, id, drag.state.position)
    }
    draggingId = null
    drag.setState({ overId: null, position: null })
  }

  return (
    <li className="relative">
      <div
        draggable
        onDragStart={(e) => {
          draggingId = id
          e.dataTransfer.effectAllowed = "move"
          e.dataTransfer.setData(DRAG_TYPE, id)
        }}
        onDragEnd={() => {
          draggingId = null
          drag.setState({ overId: null, position: null })
        }}
        onDragOver={onDragOver}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node) && drag.state.overId === id) {
            drag.setState({ overId: null, position: null })
          }
        }}
        onDrop={onDrop}
        className={cn(
          "group/row text-sidebar-foreground/85 relative flex h-7 items-center gap-1 rounded-md pr-1 text-sm transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          menuOpen && "bg-sidebar-accent",
          isOver && drag.state.position === "inside" && "bg-primary/10 ring-primary/40 ring-1"
        )}
        style={{ paddingLeft: 4 + depth * 14 }}
      >
        {isOver && drag.state.position !== "inside" && (
          <span
            className={cn(
              "bg-primary pointer-events-none absolute right-1 h-0.5 rounded-full",
              drag.state.position === "before" ? "-top-px" : "-bottom-px"
            )}
            style={{ left: 8 + depth * 14 }}
          />
        )}

        <button
          type="button"
          aria-label={expanded ? "Replier" : "Déplier"}
          onClick={() => setExpanded(id, !expanded)}
          className={cn(
            "text-muted-foreground hover:bg-foreground/10 flex size-5 shrink-0 items-center justify-center rounded transition-colors",
            !hasChildren && "invisible"
          )}
        >
          <ChevronRight className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-90")} />
        </button>

        <Link
          href={pageHref(id)}
          draggable={false}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 self-stretch outline-none group-hover/row:pr-11",
            menuOpen && "pr-11"
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-[15px] leading-none">
            {page.icon ?? <FileText className="text-muted-foreground size-4" />}
          </span>
          <span className={cn("truncate", !page.title && "text-muted-foreground")}>
            {page.title || "Sans titre"}
          </span>
        </Link>

        <div
          className={cn(
            "absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100",
            menuOpen && "opacity-100"
          )}
        >
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Actions"
                className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground flex size-5 items-center justify-center rounded"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right">
              <PageMenuItems pageId={id} />
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            aria-label="Ajouter une sous-page"
            title="Ajouter une sous-page"
            onClick={() => {
              const child = useStore.getState().createPage({ parentId: id })
              router.push(pageHref(child))
            }}
            className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-px">
              <TreeLevel parentId={id} depth={depth + 1} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/** Zone de dépôt pour renvoyer une page à la racine */
export function RootDropZone({ children, className }: { children: React.ReactNode; className?: string }) {
  const [over, setOver] = React.useState(false)
  return (
    <div
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        const id = e.dataTransfer.getData(DRAG_TYPE)
        setOver(false)
        if (id) useStore.getState().movePage(id, null, "inside")
      }}
      className={cn("rounded-md transition-colors", over && "bg-primary/10 ring-primary/40 ring-1", className)}
    >
      {children}
    </div>
  )
}
