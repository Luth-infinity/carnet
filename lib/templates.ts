import type { JSONContent } from "@tiptap/react"
import { formatFullDay } from "./dates"

/* ---------- Petits constructeurs de contenu ---------- */

type Mark = "bold" | "italic" | "code" | "highlight"

export const t = (text: string, ...marks: Mark[]): JSONContent => ({
  type: "text",
  text,
  ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}),
})

export const p = (...parts: (string | JSONContent)[]): JSONContent => ({
  type: "paragraph",
  content: parts.filter(Boolean).map((x) => (typeof x === "string" ? t(x) : x)),
})

export const h = (level: 1 | 2 | 3, text: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
})

export const tasks = (...items: [string, boolean?][]): JSONContent => ({
  type: "taskList",
  content: items.map(([text, checked]) => ({
    type: "taskItem",
    attrs: { checked: Boolean(checked) },
    content: [p(text)],
  })),
})

export const bullets = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((text) => ({ type: "listItem", content: [p(text)] })),
})

export const callout = (tone: string, ...parts: (string | JSONContent)[]): JSONContent => ({
  type: "callout",
  attrs: { tone },
  content: [p(...parts)],
})

export const hr = (): JSONContent => ({ type: "horizontalRule" })

export const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content })

/* ---------- Modèles ---------- */

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  title?: string
  build: () => JSONContent
}

export const TEMPLATES: Template[] = [
  {
    id: "todo",
    name: "Liste de tâches",
    description: "Des cases à cocher, rien d'autre",
    icon: "✅",
    build: () => doc(tasks(["", false])),
  },
  {
    id: "meeting",
    name: "Réunion",
    description: "Participants, ordre du jour, décisions",
    icon: "🗓️",
    title: "Réunion",
    build: () =>
      doc(
        p(t("Date : ", "bold"), formatFullDay(new Date())),
        p(t("Participants : ", "bold")),
        h(2, "Ordre du jour"),
        bullets(""),
        h(2, "Notes"),
        p(""),
        h(2, "Décisions"),
        callout("success", ""),
        h(2, "Actions"),
        tasks([""])
      ),
  },
  {
    id: "project",
    name: "Projet",
    description: "Objectif, étapes et ressources",
    icon: "🚀",
    title: "Nouveau projet",
    build: () =>
      doc(
        callout("idea", t("Objectif : ", "bold"), "ce que ce projet doit permettre, en une phrase."),
        h(2, "Contexte"),
        p(""),
        h(2, "Étapes"),
        tasks(["Cadrer le besoin"], ["Première version"], ["Retours et ajustements"]),
        h(2, "Ressources"),
        bullets("")
      ),
  },
  {
    id: "journal",
    name: "Journal",
    description: "Humeur, priorités, gratitude",
    icon: "📓",
    build: () =>
      doc(
        h(2, "Priorités du jour"),
        tasks([""]),
        h(2, "Notes"),
        p(""),
        h(2, "Ce qui s'est bien passé"),
        bullets("")
      ),
  },
]

export function dailyNoteContent() {
  return doc(
    h(2, "Priorités"),
    tasks([""]),
    h(2, "Notes"),
    p("")
  )
}
