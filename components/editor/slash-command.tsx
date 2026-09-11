"use client"

import { Extension } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { PluginKey } from "@tiptap/pm/state"
import {
  AtSign,
  CalendarDays,
  ChevronRight,
  Code2,
  FilePlus2,
  Heading1,
  Heading2,
  Heading3,
  Lightbulb,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Table2,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { formatFullDay } from "@/lib/dates"
import { normalize, suggestionRenderer, type MenuItem } from "./suggestion-menu"

function slashItems(pageId: string): MenuItem[] {
  return [
    {
      id: "text",
      title: "Texte",
      description: "Un paragraphe simple",
      group: "Blocs de base",
      icon: <Pilcrow />,
      keywords: ["paragraphe", "p"],
      run: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run(),
    },
    {
      id: "h1",
      title: "Titre 1",
      description: "Grand titre de section",
      group: "Blocs de base",
      icon: <Heading1 />,
      shortcut: "#",
      keywords: ["heading", "h1", "titre"],
      run: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      title: "Titre 2",
      description: "Titre de sous-section",
      group: "Blocs de base",
      icon: <Heading2 />,
      shortcut: "##",
      keywords: ["heading", "h2", "sous-titre"],
      run: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run(),
    },
    {
      id: "h3",
      title: "Titre 3",
      description: "Petit titre",
      group: "Blocs de base",
      icon: <Heading3 />,
      shortcut: "###",
      keywords: ["heading", "h3"],
      run: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run(),
    },
    {
      id: "todo",
      title: "Liste de tâches",
      description: "Des cases à cocher",
      group: "Blocs de base",
      icon: <ListChecks />,
      shortcut: "[]",
      keywords: ["todo", "tache", "checkbox", "case"],
      run: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
    },
    {
      id: "bullet",
      title: "Liste à puces",
      description: "Une liste simple",
      group: "Blocs de base",
      icon: <List />,
      shortcut: "-",
      keywords: ["ul", "puces", "liste"],
      run: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
    },
    {
      id: "ordered",
      title: "Liste numérotée",
      description: "Une liste ordonnée",
      group: "Blocs de base",
      icon: <ListOrdered />,
      shortcut: "1.",
      keywords: ["ol", "numeros", "ordre"],
      run: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
    },
    {
      id: "quote",
      title: "Citation",
      description: "Mettre un passage en retrait",
      group: "Blocs de base",
      icon: <Quote />,
      shortcut: ">",
      keywords: ["blockquote", "citation"],
      run: (e, r) => e.chain().focus().deleteRange(r).setBlockquote().run(),
    },
    {
      id: "callout",
      title: "Encadré",
      description: "Faire ressortir une information",
      group: "Avancé",
      icon: <Lightbulb />,
      keywords: ["callout", "note", "info", "alerte", "encadre"],
      run: (e, r) => e.chain().focus().deleteRange(r).setCallout("idea").run(),
    },
    {
      id: "toggle",
      title: "Section dépliante",
      description: "Masquer du contenu sous un titre",
      group: "Avancé",
      icon: <ChevronRight />,
      keywords: ["toggle", "details", "depliant", "accordeon"],
      run: (e, r) => e.chain().focus().deleteRange(r).setDetails().run(),
    },
    {
      id: "table",
      title: "Tableau",
      description: "Lignes et colonnes",
      group: "Avancé",
      icon: <Table2 />,
      keywords: ["table", "grille", "colonnes"],
      run: (e, r) =>
        e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: "code",
      title: "Bloc de code",
      description: "Avec coloration syntaxique",
      group: "Avancé",
      icon: <Code2 />,
      shortcut: "```",
      keywords: ["code", "pre", "snippet"],
      run: (e, r) => e.chain().focus().deleteRange(r).setCodeBlock().run(),
    },
    {
      id: "divider",
      title: "Séparateur",
      description: "Une ligne horizontale",
      group: "Avancé",
      icon: <Minus />,
      shortcut: "---",
      keywords: ["hr", "ligne", "separateur", "divider"],
      run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
    },
    {
      id: "date",
      title: "Date du jour",
      description: formatFullDay(new Date()),
      group: "Avancé",
      icon: <CalendarDays />,
      keywords: ["date", "aujourdhui", "jour"],
      run: (e, r) => e.chain().focus().deleteRange(r).insertContent(formatFullDay(new Date())).run(),
    },
    {
      id: "subpage",
      title: "Sous-page",
      description: "Créer une page à l'intérieur de celle-ci",
      group: "Pages",
      icon: <FilePlus2 />,
      keywords: ["page", "sous-page", "enfant"],
      run: (e, r) => {
        const id = useStore.getState().createPage({ parentId: pageId })
        e.chain()
          .focus()
          .deleteRange(r)
          .insertContent([
            { type: "mention", attrs: { id, label: "Sans titre" } },
            { type: "text", text: " " },
          ])
          .run()
      },
    },
    {
      id: "mention",
      title: "Lien vers une page",
      description: "Mentionner une page existante",
      group: "Pages",
      icon: <AtSign />,
      shortcut: "@",
      keywords: ["lien", "mention", "page", "link"],
      run: (e, r) => e.chain().focus().deleteRange(r).insertContent("@").run(),
    },
  ]
}

export function SlashCommand(pageId: string) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion<MenuItem>({
          editor: this.editor,
          char: "/",
          pluginKey: new PluginKey("slashCommand"),
          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from)
            return $from.parent.type.name !== "codeBlock"
          },
          items: ({ query }) => {
            const q = normalize(query)
            if (!q) return slashItems(pageId)
            return slashItems(pageId).filter((item) =>
              [item.title, ...(item.keywords ?? [])].some((k) => normalize(k).includes(q))
            )
          },
          command: ({ editor, range, props }) => props.run?.(editor, range),
          render: suggestionRenderer("Aucun bloc ne correspond"),
        }),
      ]
    },
  })
}
