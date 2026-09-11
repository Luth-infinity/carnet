"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { NodeSelection } from "@tiptap/pm/state"
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Highlighter,
  Italic,
  Link2,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const HIGHLIGHTS = [
  { name: "Jaune", color: "var(--hl-yellow)" },
  { name: "Vert", color: "var(--hl-green)" },
  { name: "Bleu", color: "var(--hl-blue)" },
  { name: "Rose", color: "var(--hl-pink)" },
  { name: "Violet", color: "var(--hl-purple)" },
]

const BLOCKS: { label: string; isActive: (e: Editor) => boolean; run: (e: Editor) => void }[] = [
  {
    label: "Texte",
    isActive: (e) => e.isActive("paragraph") && !e.isActive("taskItem") && !e.isActive("listItem"),
    run: (e) => e.chain().focus().setParagraph().run(),
  },
  { label: "Titre 1", isActive: (e) => e.isActive("heading", { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "Titre 2", isActive: (e) => e.isActive("heading", { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "Titre 3", isActive: (e) => e.isActive("heading", { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "Liste de tâches", isActive: (e) => e.isActive("taskList"), run: (e) => e.chain().focus().toggleTaskList().run() },
  { label: "Liste à puces", isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "Liste numérotée", isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: "Citation", isActive: (e) => e.isActive("blockquote"), run: (e) => e.chain().focus().toggleBlockquote().run() },
]

function ToolButton({
  active,
  label,
  onClick,
  children,
  className,
}: {
  active?: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 min-w-7 items-center justify-center gap-1 rounded-md px-1.5 text-xs transition-colors [&_svg]:size-3.5",
        active && "bg-accent text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [panel, setPanel] = React.useState<"none" | "blocks" | "colors" | "link">("none")
  const [href, setHref] = React.useState("")

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      highlight: e.isActive("highlight"),
      link: e.isActive("link"),
      linkHref: (e.getAttributes("link").href as string | undefined) ?? "",
      block: BLOCKS.find((b) => b.isActive(e))?.label ?? "Texte",
    }),
  })

  const applyLink = () => {
    const value = href.trim()
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      const url = /^(https?:|mailto:|\/)/.test(value) ? value : `https://${value}`
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    setPanel("none")
  }

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="textBubble"
      options={{ placement: "top", offset: 8, onHide: () => setPanel("none") }}
      shouldShow={({ editor: e, state: s, from, to }) => {
        if (from === to || !e.isEditable) return false
        if (s.selection instanceof NodeSelection) return false
        if (e.isActive("codeBlock")) return false
        return !s.doc.textBetween(from, to).trim() ? false : true
      }}
      className="bubble-toolbar bg-popover/95 text-popover-foreground ring-foreground/10 rounded-xl shadow-xl ring-1 backdrop-blur-xl"
    >
      {panel === "link" ? (
        <form
          className="flex items-center gap-1 p-1"
          onSubmit={(e) => {
            e.preventDefault()
            applyLink()
          }}
        >
          <input
            autoFocus
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                setPanel("none")
                editor.commands.focus()
              }
            }}
            placeholder="Coller un lien…"
            className="placeholder:text-muted-foreground h-7 w-60 bg-transparent px-2 text-sm outline-none"
          />
          <ToolButton label="Valider" onClick={applyLink}>
            <Check />
          </ToolButton>
          {state.link && (
            <ToolButton
              label="Retirer le lien"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run()
                setPanel("none")
              }}
            >
              <Unlink />
            </ToolButton>
          )}
        </form>
      ) : (
        <div className="relative flex items-center gap-0.5 p-1">
          <ToolButton
            label="Transformer en"
            active={panel === "blocks"}
            onClick={() => setPanel(panel === "blocks" ? "none" : "blocks")}
            className="px-2 font-medium"
          >
            {state.block}
            <ChevronDown />
          </ToolButton>
          <span className="bg-border mx-0.5 h-4 w-px" />
          <ToolButton label="Gras (Ctrl B)" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold />
          </ToolButton>
          <ToolButton label="Italique (Ctrl I)" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic />
          </ToolButton>
          <ToolButton label="Souligné (Ctrl U)" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <Underline />
          </ToolButton>
          <ToolButton label="Barré" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough />
          </ToolButton>
          <ToolButton label="Code" active={state.code} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code />
          </ToolButton>
          <ToolButton
            label="Surligner"
            active={state.highlight || panel === "colors"}
            onClick={() => setPanel(panel === "colors" ? "none" : "colors")}
          >
            <Highlighter />
          </ToolButton>
          <ToolButton
            label="Lien"
            active={state.link}
            onClick={() => {
              setHref(state.linkHref)
              setPanel("link")
            }}
          >
            <Link2 />
          </ToolButton>

          {panel === "blocks" && (
            <div className="bg-popover ring-foreground/10 animate-in fade-in-0 zoom-in-95 absolute top-full left-0 mt-1.5 w-48 rounded-xl p-1 shadow-xl ring-1">
              {BLOCKS.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    b.run(editor)
                    setPanel("none")
                  }}
                  className="hover:bg-accent flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm"
                >
                  {b.label}
                  {state.block === b.label && <Check className="size-3.5" />}
                </button>
              ))}
            </div>
          )}

          {panel === "colors" && (
            <div className="bg-popover ring-foreground/10 animate-in fade-in-0 zoom-in-95 absolute top-full right-0 mt-1.5 flex items-center gap-1 rounded-xl p-1.5 shadow-xl ring-1">
              {HIGHLIGHTS.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  title={h.name}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color: h.color }).run()
                    setPanel("none")
                  }}
                  className="ring-foreground/10 size-6 rounded-md ring-1 transition-transform hover:scale-110"
                  style={{ background: h.color }}
                />
              ))}
              <button
                type="button"
                title="Aucun surlignage"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setPanel("none")
                }}
                className="text-muted-foreground hover:bg-accent flex h-6 items-center rounded-md px-2 text-xs"
              >
                Aucun
              </button>
            </div>
          )}
        </div>
      )}
    </BubbleMenu>
  )
}
