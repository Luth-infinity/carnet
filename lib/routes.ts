"use client"

import { usePathname, useSearchParams } from "next/navigation"

/**
 * Une page s'ouvre sur `/p/?id=…` et non `/p/[id]` : l'application de bureau
 * embarque un export statique, qui ne sait pas générer une route par page
 * créée après la compilation.
 */
export const pageHref = (id: string) => `/p/?id=${encodeURIComponent(id)}`

export function useActivePageId(): string | null {
  const pathname = usePathname()
  const params = useSearchParams()
  return pathname.replace(/\/$/, "") === "/p" ? params.get("id") : null
}
