"use client"

import { create } from "zustand"
import type { Update } from "./desktop"

interface UiState {
  commandOpen: boolean
  settingsOpen: boolean
  /** Nouvelle version signalée par l'application de bureau */
  update: Update | null
  setCommandOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setUpdate: (update: Update | null) => void
}

export const useUi = create<UiState>()((set) => ({
  commandOpen: false,
  settingsOpen: false,
  update: null,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setUpdate: (update) => set({ update }),
}))
