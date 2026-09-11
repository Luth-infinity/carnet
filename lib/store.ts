"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { JSONContent } from "@tiptap/react"
import type { DropPosition, Page, PageFont } from "./types"
import { dailyNoteContent } from "./templates"
import { formatDay, isoDay } from "./dates"
import { seedPages } from "./seed"

export interface CreatePageInput {
  parentId?: string | null
  title?: string
  icon?: string | null
  cover?: string | null
  content?: JSONContent | null
  font?: PageFont
  system?: Page["system"]
  dailyDate?: string
}

interface State {
  pages: Record<string, Page>
  expanded: Record<string, boolean>
  seeded: boolean

  createPage: (input?: CreatePageInput) => string
  updatePage: (id: string, patch: Partial<Omit<Page, "id">>, touch?: boolean) => void
  movePage: (id: string, targetId: string | null, position: DropPosition) => void
  duplicatePage: (id: string) => string | null
  toggleFavorite: (id: string) => void
  trashPage: (id: string) => void
  restorePage: (id: string) => void
  deleteForever: (id: string) => void
  emptyTrash: () => void
  setExpanded: (id: string, value: boolean) => void
  dailyNote: (date?: Date) => string
  inbox: () => string
  replaceAll: (pages: Record<string, Page>) => void
}

export const selectChildren = (pages: Record<string, Page>, parentId: string | null) =>
  Object.values(pages)
    .filter((p) => p.parentId === parentId && !p.trashedAt)
    .sort((a, b) => a.order - b.order)

export function descendantsOf(pages: Record<string, Page>, id: string): string[] {
  const out: string[] = []
  const stack = [id]
  while (stack.length) {
    const current = stack.pop()!
    for (const p of Object.values(pages)) {
      if (p.parentId === current) {
        out.push(p.id)
        stack.push(p.id)
      }
    }
  }
  return out
}

export function ancestorsOf(pages: Record<string, Page>, id: string): Page[] {
  const chain: Page[] = []
  let current = pages[id]?.parentId
  const seen = new Set<string>()
  while (current && pages[current] && !seen.has(current)) {
    seen.add(current)
    chain.unshift(pages[current])
    current = pages[current].parentId
  }
  return chain
}

function nextOrder(pages: Record<string, Page>, parentId: string | null) {
  const siblings = Object.values(pages).filter((p) => p.parentId === parentId)
  return siblings.length ? Math.max(...siblings.map((s) => s.order)) + 1 : 0
}

function makePage(pages: Record<string, Page>, input: CreatePageInput = {}): Page {
  const now = Date.now()
  const parentId = input.parentId ?? null
  return {
    id: nanoid(10),
    title: input.title ?? "",
    icon: input.icon ?? null,
    cover: input.cover ?? null,
    parentId,
    order: nextOrder(pages, parentId),
    content: input.content ?? null,
    createdAt: now,
    updatedAt: now,
    favorite: false,
    trashedAt: null,
    font: input.font ?? "sans",
    fullWidth: false,
    system: input.system,
    dailyDate: input.dailyDate,
  }
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      pages: {},
      expanded: {},
      seeded: false,

      createPage: (input) => {
        const page = makePage(get().pages, input)
        set((s) => ({
          pages: { ...s.pages, [page.id]: page },
          expanded: page.parentId ? { ...s.expanded, [page.parentId]: true } : s.expanded,
        }))
        return page.id
      },

      updatePage: (id, patch, touch = true) =>
        set((s) => {
          const page = s.pages[id]
          if (!page) return s
          return {
            pages: {
              ...s.pages,
              [id]: { ...page, ...patch, updatedAt: touch ? Date.now() : page.updatedAt },
            },
          }
        }),

      movePage: (id, targetId, position) =>
        set((s) => {
          const page = s.pages[id]
          if (!page || id === targetId) return s
          if (targetId && descendantsOf(s.pages, id).includes(targetId)) return s

          const pages = { ...s.pages }
          if (!targetId) {
            pages[id] = { ...page, parentId: null, order: nextOrder(pages, null) }
            return { pages }
          }
          const target = pages[targetId]
          if (!target) return s

          if (position === "inside") {
            pages[id] = { ...page, parentId: target.id, order: nextOrder(pages, target.id) }
            return { pages, expanded: { ...s.expanded, [target.id]: true } }
          }

          const siblings = selectChildren(pages, target.parentId).filter((p) => p.id !== id)
          const index = siblings.findIndex((p) => p.id === target.id)
          const insertAt = position === "before" ? index : index + 1
          siblings.splice(insertAt, 0, { ...page, parentId: target.parentId })
          siblings.forEach((sib, i) => {
            pages[sib.id] = { ...pages[sib.id], ...sib, parentId: target.parentId, order: i }
          })
          return { pages }
        }),

      duplicatePage: (id) => {
        const source = get().pages[id]
        if (!source) return null
        const now = Date.now()
        const copy: Page = {
          ...structuredClone(source),
          id: nanoid(10),
          title: source.title ? `${source.title} (copie)` : "",
          createdAt: now,
          updatedAt: now,
          favorite: false,
          system: undefined,
          dailyDate: undefined,
          order: source.order + 0.5,
        }
        set((s) => ({ pages: { ...s.pages, [copy.id]: copy } }))
        return copy.id
      },

      toggleFavorite: (id) =>
        set((s) => {
          const page = s.pages[id]
          if (!page) return s
          return { pages: { ...s.pages, [id]: { ...page, favorite: !page.favorite } } }
        }),

      trashPage: (id) =>
        set((s) => {
          const now = Date.now()
          const pages = { ...s.pages }
          for (const pid of [id, ...descendantsOf(pages, id)]) {
            if (!pages[pid].trashedAt) pages[pid] = { ...pages[pid], trashedAt: now }
          }
          return { pages }
        }),

      restorePage: (id) =>
        set((s) => {
          const page = s.pages[id]
          if (!page?.trashedAt) return s
          const pages = { ...s.pages }
          const stamp = page.trashedAt
          for (const pid of [id, ...descendantsOf(pages, id)]) {
            if (pages[pid].trashedAt === stamp) pages[pid] = { ...pages[pid], trashedAt: null }
          }
          const parent = page.parentId ? pages[page.parentId] : null
          if (page.parentId && (!parent || parent.trashedAt)) {
            pages[id] = { ...pages[id], parentId: null, order: nextOrder(pages, null) }
          }
          return { pages }
        }),

      deleteForever: (id) =>
        set((s) => {
          const pages = { ...s.pages }
          for (const pid of [id, ...descendantsOf(pages, id)]) delete pages[pid]
          return { pages }
        }),

      emptyTrash: () =>
        set((s) => ({
          pages: Object.fromEntries(Object.entries(s.pages).filter(([, p]) => !p.trashedAt)),
        })),

      setExpanded: (id, value) => set((s) => ({ expanded: { ...s.expanded, [id]: value } })),

      dailyNote: (date = new Date()) => {
        const day = isoDay(date)
        const { pages, createPage, restorePage } = get()
        const existing = Object.values(pages).find((p) => p.dailyDate === day)
        if (existing) {
          if (existing.trashedAt) restorePage(existing.id)
          return existing.id
        }
        let journal = Object.values(pages).find((p) => p.system === "journal" && !p.trashedAt)
        const journalId =
          journal?.id ?? createPage({ title: "Journal", icon: "📓", system: "journal", cover: "aube" })
        journal = get().pages[journalId]
        return createPage({
          parentId: journal.id,
          title: formatDay(date),
          icon: "☀️",
          dailyDate: day,
          content: dailyNoteContent(),
        })
      },

      inbox: () => {
        const found = Object.values(get().pages).find((p) => p.system === "inbox" && !p.trashedAt)
        if (found) return found.id
        return get().createPage({ title: "Tâches rapides", icon: "📥", system: "inbox" })
      },

      replaceAll: (pages) => set({ pages, expanded: {}, seeded: true }),
    }),
    {
      name: "carnet-data",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pages: s.pages, expanded: s.expanded, seeded: s.seeded }),
      onRehydrateStorage: () => (state) => {
        // Le store n'est pas encore assigné quand l'hydratation est synchrone
        if (state && !state.seeded) {
          queueMicrotask(() => useStore.setState({ pages: seedPages(), seeded: true }))
        }
      },
    }
  )
)
