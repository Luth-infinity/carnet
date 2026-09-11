"use client"

import * as React from "react"
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react"
import { Extension } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Placeholder, TrailingNode } from "@tiptap/extensions"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details"
import { TableKit } from "@tiptap/extension-table"
import DragHandle from "@tiptap/extension-drag-handle-react"
import { common, createLowlight } from "lowlight"
import { GripVertical, Plus } from "lucide-react"
import type { Node as PMNode } from "@tiptap/pm/model"
import { useStore } from "@/lib/store"
import type { Page } from "@/lib/types"
import { Callout } from "./callout"
import { SlashCommand } from "./slash-command"
import { PageMention } from "./page-mention"
import { BubbleToolbar } from "./bubble-toolbar"
import { TableToolbar } from "./table-toolbar"

const lowlight = createLowlight(common)

/** Ctrl/Cmd + Entrée coche ou décoche la tâche courante */
const TaskShortcuts = Extension.create({
  name: "taskShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": ({ editor }) => {
        const { $from } = editor.state.selection
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === "taskItem") {
            const pos = $from.before(d)
            editor.view.dispatch(
              editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: !node.attrs.checked })
            )
            return true
          }
        }
        return false
      },
    }
  },
})

function buildExtensions(pageId: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      dropcursor: { color: "var(--drop-cursor)", width: 3 },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Placeholder.configure({
      includeChildren: true,
      // Les variantes dans les listes et tableaux sont gérées en CSS (globals.css)
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return `Titre ${node.attrs.level}`
        if (node.type.name === "detailsSummary") return "Titre de la section"
        if (node.type.name === "codeBlock") return ""
        return "Tapez « / » pour insérer un bloc, « @ » pour lier une page…"
      },
    }),
    // Garde toujours un paragraphe en fin de page, pour pouvoir écrire sous un tableau ou un bloc de code
    TrailingNode,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Typography.configure({
      openDoubleQuote: "« ",
      closeDoubleQuote: " »",
    }),
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
    Details.configure({ persist: true, HTMLAttributes: { class: "details" } }),
    DetailsSummary,
    DetailsContent,
    TableKit.configure({ table: { resizable: true, cellMinWidth: 80 } }),
    Callout,
    TaskShortcuts,
    SlashCommand(pageId),
    PageMention(pageId),
  ]
}

interface EditorProps {
  page: Page
  editable?: boolean
  onReady?: (editor: TiptapEditor) => void
}

export function Editor({ page, editable = true, onReady }: EditorProps) {
  const updatePage = useStore((s) => s.updatePage)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = React.useRef<(() => void) | null>(null)
  const hovered = React.useRef<{ node: PMNode | null; pos: number }>({ node: null, pos: -1 })

  const flush = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    pending.current?.()
    pending.current = null
  }, [])

  // L'éditeur est recréé à chaque page (key), les extensions ne changent donc jamais
  const [extensions] = React.useState(() => buildExtensions(page.id))

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions,
    content: page.content ?? "",
    editorProps: {
      attributes: {
        class: "carnet-prose",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: e }) => {
      pending.current = () => updatePage(page.id, { content: e.getJSON() })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush, 300)
    },
  })

  React.useEffect(() => {
    if (editor && onReady) onReady(editor)
  }, [editor, onReady])

  React.useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  React.useEffect(() => {
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("beforeunload", flush)
      flush()
    }
  }, [flush])

  if (!editor) return <div className="min-h-24" />

  const insertBelow = () => {
    const { node, pos } = hovered.current
    if (!node || pos < 0) return
    const at = pos + node.nodeSize
    editor
      .chain()
      .insertContentAt(at, { type: "paragraph" })
      .setTextSelection(at + 1)
      .insertContent("/")
      .focus()
      .run()
  }

  return (
    <div className="relative">
      {editable && (
      <DragHandle
        editor={editor}
        onNodeChange={({ node, pos }) => {
          hovered.current = { node, pos }
        }}
      >
        <div className="drag-handle flex items-center gap-0.5">
          <button
            type="button"
            onClick={insertBelow}
            title="Ajouter un bloc en dessous"
            className="text-muted-foreground/70 hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded-md transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <div
            title="Glisser pour déplacer"
            className="text-muted-foreground/70 hover:bg-accent hover:text-foreground flex h-6 w-5 cursor-grab items-center justify-center rounded-md transition-colors active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </div>
        </div>
      </DragHandle>
      )}
      <EditorContent editor={editor} />
      <BubbleToolbar editor={editor} />
      <TableToolbar editor={editor} />
    </div>
  )
}
