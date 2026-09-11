"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useShallow } from "zustand/react/shallow"
import { toast } from "sonner"
import { FileText, RotateCcw, Trash2 } from "lucide-react"
import { Topbar } from "@/components/topbar"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { descendantsOf, useStore } from "@/lib/store"
import { formatRelative } from "@/lib/dates"
import { snippet } from "@/lib/doc"
import { pageHref } from "@/lib/routes"

export default function TrashPage() {
  const pages = useStore((s) => s.pages)
  // On n'affiche que les pages supprimées « à la racine » : leurs sous-pages partent et reviennent avec elles
  const trashed = useStore(
    useShallow((s) =>
      Object.values(s.pages)
        .filter((p) => p.trashedAt && !(p.parentId && s.pages[p.parentId]?.trashedAt === p.trashedAt))
        .sort((a, b) => (b.trashedAt ?? 0) - (a.trashedAt ?? 0))
    )
  )
  const { restorePage, deleteForever, emptyTrash } = useStore.getState()
  const [confirmId, setConfirmId] = React.useState<string | null>(null)

  return (
    <div className="flex h-[calc(100svh-1rem)] flex-col max-md:h-svh">
      <Topbar crumbs={[{ label: "Corbeille" }]} />
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-3xl px-6 pt-12 pb-24 sm:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Corbeille</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Les pages supprimées restent ici jusqu&apos;à ce que vous vidiez la corbeille.
              </p>
            </div>
            {trashed.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 /> Vider la corbeille
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Vider la corbeille ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Les pages seront supprimées définitivement de ce navigateur. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        emptyTrash()
                        toast.success("Corbeille vidée")
                      }}
                    >
                      Tout supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {trashed.map((p) => {
                const children = descendantsOf(pages, p.id).length
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-card ring-border flex items-center gap-3 rounded-xl p-3 ring-1"
                  >
                    <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg text-lg">
                      {p.icon ?? <FileText className="text-muted-foreground size-4" />}
                    </span>
                    <Link href={pageHref(p.id)} className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.title || "Sans titre"}</div>
                      <div className="text-muted-foreground truncate text-xs">
                        Supprimée {formatRelative(p.trashedAt!)}
                        {children > 0 && ` · ${children} sous-page${children > 1 ? "s" : ""}`}
                        {snippet(p.content, 60) && ` · ${snippet(p.content, 60)}`}
                      </div>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => restorePage(p.id)}>
                      <RotateCcw /> Restaurer
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Supprimer définitivement"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmId(p.id)}
                    >
                      <Trash2 />
                    </Button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {!trashed.length && (
              <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center text-sm">
                <span className="text-3xl">🧺</span>
                La corbeille est vide.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AlertDialog open={Boolean(confirmId)} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {confirmId ? pages[confirmId]?.title || "Sans titre" : ""} » et ses sous-pages seront effacées de ce
              navigateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmId) deleteForever(confirmId)
                setConfirmId(null)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
