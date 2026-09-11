"use client"

import * as React from "react"
import { ArrowDownToLine } from "lucide-react"
import { desktop } from "@/lib/desktop"
import { useUi } from "@/lib/ui-store"
import { cn } from "@/lib/utils"

/**
 * Même comportement que dans Hublink : sous Windows, la mise à jour se
 * télécharge puis s'installe au redémarrage ; ailleurs, on ouvre l'installeur
 * de la version dans le navigateur.
 */
export function UpdateBadge() {
  const update = useUi((s) => s.update)
  const [auto, setAuto] = React.useState(false)
  const [percent, setPercent] = React.useState<number | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const api = desktop()
    if (!api) return
    api.updater.canInstall().then(setAuto)
    return api.updater.onProgress(({ percent: p }) => setPercent(p))
  }, [])

  const api = desktop()
  if (!update || !api) return null

  const label = ready ? "Redémarrer pour installer" : percent !== null ? `${percent} %` : `Mettre à jour · ${update.version}`

  const onClick = async () => {
    if (!auto) return api.openExternal(update.url)
    if (ready) return api.updater.install()
    if (percent !== null) return
    setPercent(0)
    try {
      await api.updater.download()
      setReady(true)
    } catch {
      // Le téléchargement interne a échoué : la page de la version reste une issue
      setPercent(null)
      api.openExternal(update.page)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={ready ? `Carnet ${update.version} est prêt à s'installer` : `Carnet ${update.version} est disponible`}
      className="animate-in fade-in-0 slide-in-from-bottom-1 bg-brand/12 text-brand hover:bg-brand/20 flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all active:scale-[0.97]"
    >
      <ArrowDownToLine className={cn("size-3.5 shrink-0", percent !== null && !ready && "animate-pulse")} />
      {label}
    </button>
  )
}
