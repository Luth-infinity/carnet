"use client"

import * as React from "react"
import { ReactRenderer, type Editor, type Range } from "@tiptap/react"
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion"
import { computePosition, flip, offset, shift } from "@floating-ui/dom"
import { cn } from "@/lib/utils"

export interface MenuItem {
  id: string
  title: string
  description?: string
  group?: string
  icon?: React.ReactNode
  shortcut?: string
  keywords?: string[]
  run?: (editor: Editor, range: Range) => void
  [key: string]: unknown
}

export interface SuggestionMenuHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

interface SuggestionMenuProps {
  items: MenuItem[]
  command: (item: MenuItem) => void
  emptyLabel?: string
}

export const SuggestionMenu = React.forwardRef<SuggestionMenuHandle, SuggestionMenuProps>(
  function SuggestionMenu({ items, command, emptyLabel = "Aucun résultat" }, ref) {
    const [selected, setSelected] = React.useState(0)
    const listRef = React.useRef<HTMLDivElement>(null)
    const [prevItems, setPrevItems] = React.useState(items)

    if (items !== prevItems) {
      setPrevItems(items)
      setSelected(0)
    }

    React.useEffect(() => {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${selected}"]`)
        ?.scrollIntoView({ block: "nearest" })
    }, [selected])

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (!items.length) return false
        if (event.key === "ArrowDown") {
          setSelected((s) => (s + 1) % items.length)
          return true
        }
        if (event.key === "ArrowUp") {
          setSelected((s) => (s - 1 + items.length) % items.length)
          return true
        }
        if (event.key === "Enter" || event.key === "Tab") {
          const item = items[selected]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    let lastGroup: string | undefined

    return (
      <div
        ref={listRef}
        className="suggestion-menu bg-popover/95 text-popover-foreground ring-foreground/10 max-h-80 w-72 overflow-y-auto rounded-xl p-1 shadow-xl ring-1 backdrop-blur-xl"
      >
        {items.length === 0 && (
          <div className="text-muted-foreground px-3 py-6 text-center text-sm">{emptyLabel}</div>
        )}
        {items.map((item, index) => {
          const showGroup = item.group && item.group !== lastGroup
          lastGroup = item.group
          return (
            <React.Fragment key={item.id}>
              {showGroup && (
                <div className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-medium tracking-wide uppercase">
                  {item.group}
                </div>
              )}
              <button
                type="button"
                data-index={index}
                onMouseEnter={() => setSelected(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => command(item)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                  index === selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                )}
              >
                {item.icon && (
                  <span className="bg-background ring-foreground/10 flex size-9 shrink-0 items-center justify-center rounded-md text-base ring-1 [&_svg]:size-4">
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-muted-foreground block truncate text-xs">{item.description}</span>
                  )}
                </span>
                {item.shortcut && (
                  <span className="text-muted-foreground font-mono text-[11px]">{item.shortcut}</span>
                )}
              </button>
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)

/** Rendu générique d'une suggestion Tiptap dans un popover flottant */
export function suggestionRenderer(emptyLabel?: string) {
  return () => {
    let renderer: ReactRenderer<SuggestionMenuHandle, SuggestionMenuProps> | null = null
    let el: HTMLDivElement | null = null

    const place = (props: SuggestionProps<MenuItem>) => {
      const rect = props.clientRect?.()
      if (!rect || !el) return
      const target = el
      computePosition({ getBoundingClientRect: () => rect }, target, {
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        target.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
      })
    }

    return {
      onStart: (props: SuggestionProps<MenuItem>) => {
        renderer = new ReactRenderer(SuggestionMenu, {
          props: { items: props.items, command: props.command, emptyLabel },
          editor: props.editor,
        })
        el = document.createElement("div")
        el.className = "suggestion-popover"
        el.style.position = "fixed"
        el.style.top = "0"
        el.style.left = "0"
        el.style.zIndex = "60"
        el.appendChild(renderer.element)
        document.body.appendChild(el)
        place(props)
      },
      onUpdate: (props: SuggestionProps<MenuItem>) => {
        renderer?.updateProps({ items: props.items, command: props.command, emptyLabel })
        place(props)
      },
      onKeyDown: (props: SuggestionKeyDownProps) => renderer?.ref?.onKeyDown(props) ?? false,
      onExit: () => {
        el?.remove()
        renderer?.destroy()
        el = null
        renderer = null
      },
    }
  }
}

export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}
