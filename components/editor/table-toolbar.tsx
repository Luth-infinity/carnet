"use client"

import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import {
  ArrowDownToLine,
  ArrowRightToLine,
  Columns3,
  Rows3,
  Trash2,
  PanelTop,
} from "lucide-react"

function Btn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={
        "hover:bg-accent flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors [&_svg]:size-3.5 " +
        (danger ? "text-destructive" : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  )
}

export function TableToolbar({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubble"
      options={{ placement: "top", offset: 10 }}
      shouldShow={({ editor: e, from, to }) => e.isEditable && from === to && e.isActive("table")}
      getReferencedVirtualElement={() => {
        const { from } = editor.state.selection
        const dom = editor.view.domAtPos(from).node as HTMLElement
        const el = (dom.nodeType === 3 ? dom.parentElement : dom)?.closest(".tableWrapper, table")
        if (!el) return null
        return { getBoundingClientRect: () => el.getBoundingClientRect() }
      }}
      className="bg-popover/95 ring-foreground/10 flex items-center gap-0.5 rounded-xl p-1 shadow-xl ring-1 backdrop-blur-xl"
    >
      <Btn label="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
        <ArrowDownToLine /> Ligne
      </Btn>
      <Btn label="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
        <ArrowRightToLine /> Colonne
      </Btn>
      <span className="bg-border mx-0.5 h-4 w-px" />
      <Btn label="Activer/désactiver l'en-tête" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
        <PanelTop />
      </Btn>
      <Btn label="Supprimer la ligne" onClick={() => editor.chain().focus().deleteRow().run()}>
        <Rows3 />
      </Btn>
      <Btn label="Supprimer la colonne" onClick={() => editor.chain().focus().deleteColumn().run()}>
        <Columns3 />
      </Btn>
      <span className="bg-border mx-0.5 h-4 w-px" />
      <Btn label="Supprimer le tableau" danger onClick={() => editor.chain().focus().deleteTable().run()}>
        <Trash2 />
      </Btn>
    </BubbleMenu>
  )
}
