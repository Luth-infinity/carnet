"use client"

export interface Update {
  version: string
  /** Installeur de la plateforme, à défaut la page de la version */
  url: string
  page: string
  notes: string
}

/** API exposée par `electron/preload.js`, absente dans un navigateur */
export interface CarnetDesktop {
  platform: NodeJS.Platform
  version: string
  openExternal: (url: string) => Promise<void>
  onMenu: (handler: (action: MenuAction) => void) => () => void
  checkUpdate: () => Promise<Update | null>
  onUpdateAvailable: (handler: (update: Update) => void) => () => void
  updater: {
    canInstall: () => Promise<boolean>
    download: () => Promise<void>
    install: () => Promise<void>
    onProgress: (handler: (p: { percent: number }) => void) => () => void
  }
}

export type MenuAction = "new-page" | "today" | "search" | "settings" | "tasks"

declare global {
  interface Window {
    carnet?: CarnetDesktop
  }
}

export const desktop = () => (typeof window === "undefined" ? undefined : window.carnet)

/**
 * Raccourcis de création : Alt dans un navigateur, qui garde Ctrl N et Ctrl J
 * pour lui ; Ctrl (⌘ sur Mac) dans l'application de bureau, où ils sont libres.
 */
export function shortcut(key: "N" | "J" | "K") {
  const d = desktop()
  if (d?.platform === "darwin") return `⌘ ${key}`
  if (key === "K" || d) return `Ctrl ${key}`
  return `Alt ${key}`
}
