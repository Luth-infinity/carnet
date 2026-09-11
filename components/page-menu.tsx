"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Copy, Download, FilePlus2, Star, StarOff, Trash2 } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { exportMarkdown } from "@/lib/actions"
import { pageHref, useActivePageId } from "@/lib/routes"

/** Actions communes à une page, à placer dans un DropdownMenuContent */
export function PageMenuItems({ pageId }: { pageId: string }) {
  const router = useRouter()
  const activeId = useActivePageId()
  const page = useStore((s) => s.pages[pageId])
  const { toggleFavorite, createPage, duplicatePage, trashPage, restorePage } = useStore.getState()

  if (!page) return null

  return (
    <>
      <DropdownMenuItem onSelect={() => toggleFavorite(page.id)}>
        {page.favorite ? <StarOff /> : <Star />}
        {page.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          const id = createPage({ parentId: page.id })
          router.push(pageHref(id))
        }}
      >
        <FilePlus2 />
        Nouvelle sous-page
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          const id = duplicatePage(page.id)
          if (id) router.push(pageHref(id))
        }}
      >
        <Copy />
        Dupliquer
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => exportMarkdown(page)}>
        <Download />
        Exporter en Markdown
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onSelect={() => {
          const inside = activeId === page.id
          trashPage(page.id)
          if (inside) router.push(page.parentId ? pageHref(page.parentId) : "/")
          toast("Page déplacée dans la corbeille", {
            description: page.title || "Sans titre",
            action: { label: "Annuler", onClick: () => restorePage(page.id) },
          })
        }}
      >
        <Trash2 />
        Mettre à la corbeille
      </DropdownMenuItem>
    </>
  )
}
