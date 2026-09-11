"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Download, Laptop, Moon, Sun, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { useUi } from "@/lib/ui-store"
import { useStore } from "@/lib/store"
import { exportBackup, importBackup } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { desktop, shortcut } from "@/lib/desktop"

const THEMES = [
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
  { id: "system", label: "Système", icon: Laptop },
]

const SHORTCUTS: [string, string][] = [
  ["Palette de commandes", "K"],
  ["Nouvelle page", "N"],
  ["Note du jour", "J"],
]

const EDITOR_SHORTCUTS: [string, string[]][] = [
  ["Afficher ou masquer la barre latérale", ["Ctrl", "\\"]],
  ["Insérer un bloc", ["/"]],
  ["Lier une page", ["@"]],
  ["Cocher la tâche courante", ["Ctrl", "Entrée"]],
  ["Indenter une tâche ou une puce", ["Tab"]],
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</h3>
      {children}
    </section>
  )
}

function AboutSection() {
  const api = desktop()!
  const setUpdate = useUi((s) => s.setUpdate)
  const [state, setState] = React.useState<"idle" | "checking" | "uptodate" | "found">("idle")

  const check = async () => {
    setState("checking")
    const update = await api.checkUpdate()
    if (update) setUpdate(update)
    setState(update ? "found" : "uptodate")
  }

  return (
    <>
      <Separator />
      <Section title="À propos">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span>
            Carnet {api.version}
            <span className="text-muted-foreground">
              {state === "uptodate" && " · à jour"}
              {state === "found" && " · nouvelle version dans la barre latérale"}
            </span>
          </span>
          <Button variant="outline" size="sm" onClick={check} disabled={state === "checking"}>
            {state === "checking" ? "Recherche…" : "Rechercher une mise à jour"}
          </Button>
        </div>
      </Section>
    </>
  )
}

export function SettingsDialog() {
  const open = useUi((s) => s.settingsOpen)
  const setOpen = useUi((s) => s.setSettingsOpen)
  const { theme, setTheme } = useTheme()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const stats = useStore((s) => {
    const all = Object.values(s.pages)
    return `${all.filter((p) => !p.trashedAt).length} pages · ${all.filter((p) => p.trashedAt).length} dans la corbeille`
  })
  const size = React.useMemo(() => {
    if (!open) return null
    try {
      const bytes = new Blob([localStorage.getItem("carnet-data") ?? ""]).size
      return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`
    } catch {
      return null
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Réglages</DialogTitle>
          <DialogDescription>Apparence, sauvegarde et raccourcis clavier.</DialogDescription>
        </DialogHeader>

        <Section title="Apparence">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  "ring-border hover:bg-muted flex flex-col items-center gap-2 rounded-lg py-3 text-sm ring-1 transition-all",
                  theme === t.id && "ring-foreground bg-muted ring-2"
                )}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </div>
        </Section>

        <Separator />

        <Section title="Données">
          <p className="text-muted-foreground text-sm">
            Tout est enregistré {desktop() ? "sur cet ordinateur" : "dans ce navigateur"} ({stats}
            {size ? ` · ${size}` : ""}). Exportez une sauvegarde de temps en temps pour ne rien perdre.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportBackup}>
              <Download />
              Exporter une sauvegarde
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload />
              Restaurer…
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ""
                if (!file) return
                if (!window.confirm("Restaurer cette sauvegarde remplacera toutes les pages actuelles. Continuer ?")) return
                if (await importBackup(file)) setOpen(false)
              }}
            />
          </div>
        </Section>

        <Separator />

        <Section title="Raccourcis">
          <ul className="flex flex-col gap-2 text-sm">
            {[
              ...SHORTCUTS.map(([label, key]): [string, string[]] => [label, shortcut(key as "K").split(" ")]),
              ...EDITOR_SHORTCUTS,
            ].map(([label, keys]) => (
              <li key={label} className="flex items-center justify-between gap-4">
                <span>{label}</span>
                <KbdGroup>
                  {keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </KbdGroup>
              </li>
            ))}
          </ul>
        </Section>

        {desktop() && <AboutSection />}
      </DialogContent>
    </Dialog>
  )
}
