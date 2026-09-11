"use client"

import Mention from "@tiptap/extension-mention"
import { PluginKey } from "@tiptap/pm/state"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import { useRouter } from "next/navigation"
import { FileText, Plus } from "lucide-react"
import { useStore } from "@/lib/store"
import { pageHref } from "@/lib/routes"
import { normalize, suggestionRenderer, type MenuItem } from "./suggestion-menu"

function MentionView({ node }: ReactNodeViewProps) {
  const router = useRouter()
  const id = node.attrs.id as string
  const page = useStore((s) => s.pages[id])
  const missing = !page || Boolean(page.trashedAt)

  return (
    <NodeViewWrapper as="span" className="page-mention-wrap">
      <a
        href={pageHref(id)}
        contentEditable={false}
        data-missing={missing || undefined}
        className="page-mention"
        onClick={(e) => {
          e.preventDefault()
          if (!missing) router.push(pageHref(id))
        }}
        title={missing ? "Page supprimée" : "Ouvrir la page"}
      >
        <span className="page-mention-icon">{page?.icon ?? <FileText />}</span>
        <span className="page-mention-label">{page?.title || node.attrs.label || "Sans titre"}</span>
      </a>
    </NodeViewWrapper>
  )
}

export function PageMention(pageId: string) {
  return Mention.extend({
    addNodeView() {
      return ReactNodeViewRenderer(MentionView, { as: "span" })
    },
  }).configure({
    HTMLAttributes: { class: "page-mention" },
    renderText: ({ node }) => `@${node.attrs.label ?? ""}`,
    suggestion: {
      char: "@",
      pluginKey: new PluginKey("pageMention"),
      items: ({ query }) => {
        const q = normalize(query)
        const pages = Object.values(useStore.getState().pages)
          .filter((p) => !p.trashedAt && p.id !== pageId)
          .filter((p) => !q || normalize(p.title || "Sans titre").includes(q))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 8)

        const items: MenuItem[] = pages.map((p) => ({
          id: p.id,
          title: p.title || "Sans titre",
          group: "Pages",
          icon: p.icon ?? <FileText />,
        }))
        if (query.trim()) {
          items.push({
            id: "__create__",
            title: `Créer « ${query.trim()} »`,
            description: "Nouvelle sous-page de cette page",
            group: "Nouvelle page",
            icon: <Plus />,
            create: query.trim(),
          })
        }
        return items
      },
      command: ({ editor, range, props }) => {
        const item = props as unknown as MenuItem
        let id = item.id
        let label = item.title
        if (item.create) {
          label = String(item.create)
          id = useStore.getState().createPage({ parentId: pageId, title: label })
        }
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            { type: "mention", attrs: { id, label } },
            { type: "text", text: " " },
          ])
          .run()
      },
      render: suggestionRenderer("Aucune page trouvée"),
    },
  })
}
