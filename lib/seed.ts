import { nanoid } from "nanoid"
import type { JSONContent } from "@tiptap/react"
import type { Page } from "./types"
import { bullets, callout, doc, h, hr, p, t, tasks } from "./templates"
import { desktop, shortcut } from "./desktop"

const mention = (id: string, label: string): JSONContent => ({
  type: "mention",
  attrs: { id, label },
})

export function seedPages(): Record<string, Page> {
  const now = Date.now()
  const ids = {
    welcome: nanoid(10),
    ideas: nanoid(10),
    projects: nanoid(10),
    site: nanoid(10),
  }

  const base = (id: string, patch: Partial<Page>): Page => ({
    id,
    title: "",
    icon: null,
    cover: null,
    parentId: null,
    order: 0,
    content: null,
    createdAt: now,
    updatedAt: now,
    favorite: false,
    trashedAt: null,
    font: "sans",
    fullWidth: false,
    seed: true,
    ...patch,
  })

  return {
    [ids.welcome]: base(ids.welcome, {
      title: "Bienvenue dans Carnet",
      icon: "👋",
      cover: "lavande",
      favorite: true,
      order: 0,
      content: doc(
        p(
          `Carnet est un espace de notes rapide et local : tout est enregistré ${desktop() ? "sur cet ordinateur" : "dans ce navigateur"}, au fil de la frappe.`
        ),
        callout(
          "idea",
          t("Astuce : ", "bold"),
          "tapez ",
          t("/", "code"),
          " sur une ligne vide pour insérer un bloc, et ",
          t("@", "code"),
          " pour lier une autre page."
        ),
        h(2, "Pour démarrer"),
        tasks(
          [`Ouvrir la palette de commandes avec ${shortcut("K")}`, false],
          [`Créer une page avec ${shortcut("N")}`, false],
          [`Ouvrir la note du jour avec ${shortcut("J")}`, false],
          ["Sélectionner du texte pour le mettre en forme", false],
          ["Lire cette page", true]
        ),
        h(2, "Ce que vous pouvez faire"),
        bullets(
          "Imbriquer les pages et les réorganiser par glisser-déposer dans la barre latérale",
          "Retrouver toutes les cases à cocher de toutes les pages dans la vue Tâches",
          "Choisir une icône, une couverture et une police pour chaque page",
          "Exporter une page en Markdown ou tout le carnet en sauvegarde JSON"
        ),
        p("Exemple de lien vers une autre page : ", mention(ids.site, "Refonte du site"), "."),
        hr(),
        p(
          "Les raccourcis Markdown fonctionnent aussi : ",
          t("#", "code"),
          " pour un titre, ",
          t("-", "code"),
          " pour une liste, ",
          t("[]", "code"),
          " pour une tâche, ",
          t(">", "code"),
          " pour une citation."
        )
      ),
    }),
    [ids.ideas]: base(ids.ideas, {
      title: "Idées en vrac",
      icon: "💡",
      order: 1,
      content: doc(
        p("Tout ce qui passe par la tête, à trier plus tard."),
        bullets("Tester une couverture sombre", "Un carnet de lectures", "")
      ),
    }),
    [ids.projects]: base(ids.projects, {
      title: "Projets",
      icon: "🗂️",
      order: 2,
      content: doc(p("Une page par projet, rangée ici.")),
    }),
    [ids.site]: base(ids.site, {
      title: "Refonte du site",
      icon: "🚀",
      cover: "lagon",
      parentId: ids.projects,
      order: 0,
      content: doc(
        callout("idea", t("Objectif : ", "bold"), "un site plus clair, en ligne avant la fin du mois."),
        h(2, "Étapes"),
        tasks(
          ["Lister les pages existantes", true],
          ["Maquettes de l'accueil", false],
          ["Rédiger les textes", false],
          ["Mise en ligne", false]
        )
      ),
    }),
  }
}
