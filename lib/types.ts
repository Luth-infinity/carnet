import type { JSONContent } from "@tiptap/react"

export type PageFont = "sans" | "serif" | "mono"

export interface Page {
  id: string
  title: string
  icon: string | null
  cover: string | null
  parentId: string | null
  order: number
  content: JSONContent | null
  createdAt: number
  updatedAt: number
  favorite: boolean
  trashedAt: number | null
  font: PageFont
  fullWidth: boolean
  /** Date ISO (AAAA-MM-JJ) pour les notes du journal */
  dailyDate?: string
  /** Pages créées par l'app elle-même */
  system?: "journal" | "inbox"
}

export type DropPosition = "before" | "after" | "inside"
