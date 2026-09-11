import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** Faux pendant le rendu serveur et l'hydratation, vrai ensuite */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
