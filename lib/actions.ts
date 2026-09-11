"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useStore, type CreatePageInput } from "./store"
import { toMarkdown } from "./doc"
import type { Page } from "./types"
import { pageHref } from "@/lib/routes"

export function useNavigateActions() {
  const router = useRouter()

  const newPage = useCallback(
    (input?: CreatePageInput) => {
      const id = useStore.getState().createPage(input)
      router.push(pageHref(id))
      return id
    },
    [router]
  )

  const openToday = useCallback(() => {
    const id = useStore.getState().dailyNote()
    router.push(pageHref(id))
  }, [router])

  return { newPage, openToday }
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const safeName = (s: string) =>
  (s || "Sans titre").replace(/[\\/:*?"<>|]+/g, "-").trim().slice(0, 80) || "page"

export function exportMarkdown(page: Page) {
  const { pages } = useStore.getState()
  const titleOf = (id: string) => pages[id]?.title || "Sans titre"
  const heading = `# ${page.icon ? `${page.icon} ` : ""}${page.title || "Sans titre"}`
  const body = toMarkdown(page.content, titleOf)
  download(`${safeName(page.title)}.md`, `${heading}\n\n${body}\n`, "text/markdown;charset=utf-8")
  toast.success("Page exportée en Markdown")
}

export function exportBackup() {
  const { pages } = useStore.getState()
  const payload = {
    app: "carnet",
    version: 1,
    exportedAt: new Date().toISOString(),
    pages,
  }
  const day = new Date().toISOString().slice(0, 10)
  download(`carnet-sauvegarde-${day}.json`, JSON.stringify(payload, null, 2), "application/json")
  toast.success("Sauvegarde téléchargée", {
    description: `${Object.keys(pages).length} pages exportées`,
  })
}

export async function importBackup(file: File) {
  try {
    const data = JSON.parse(await file.text())
    if (data?.app !== "carnet" || typeof data.pages !== "object") {
      throw new Error("format")
    }
    useStore.getState().replaceAll(data.pages as Record<string, Page>)
    toast.success("Sauvegarde restaurée", {
      description: `${Object.keys(data.pages).length} pages importées`,
    })
    return true
  } catch {
    toast.error("Fichier illisible", { description: "Choisissez une sauvegarde exportée depuis Carnet." })
    return false
  }
}
