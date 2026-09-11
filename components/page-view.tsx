"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useShallow } from "zustand/react/shallow"
import { useEditorState, type Editor as TiptapEditor } from "@tiptap/react"
import { Selection } from "@tiptap/pm/state"
import {
  ArrowUpRight,
  Check,
  FileText,
  ImagePlus,
  Link2,
  MoreHorizontal,
  RotateCcw,
  SmilePlus,
  Star,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Editor } from "@/components/editor/editor"
import { EmojiPicker } from "@/components/emoji-picker"
import { PageMenuItems } from "@/components/page-menu"
import { Topbar, type Crumb } from "@/components/topbar"
import { ancestorsOf, selectChildren, useStore } from "@/lib/store"
import { COVERS, coverCss, randomCover } from "@/lib/covers"
import { collectMentions, collectTasks, snippet, wordCount } from "@/lib/doc"
import { formatRelative } from "@/lib/dates"
import { TEMPLATES } from "@/lib/templates"
import type { Page, PageFont } from "@/lib/types"
import { cn } from "@/lib/utils"
import { pageHref } from "@/lib/routes"

const FONTS: { id: PageFont; label: string; sample: string; className: string }[] = [
  { id: "sans", label: "Défaut", sample: "Ag", className: "font-sans" },
  { id: "serif", label: "Serif", sample: "Ag", className: "font-serif" },
  { id: "mono", label: "Mono", sample: "Ag", className: "font-mono" },
]

export function PageView({ id }: { id: string }) {
  const page = useStore((s) => s.pages[id])

  if (!page) return <MissingPage />

  return (
    <div className="flex h-[calc(100svh-1rem)] flex-col max-md:h-svh">
      <PageTopbar page={page} />
      <div className="relative flex-1 overflow-y-auto" data-font={page.font}>
        <motion.div
          key={page.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <PageBody page={page} />
        </motion.div>
      </div>
    </div>
  )
}

/* ---------------- Barre du haut ---------------- */

function PageTopbar({ page }: { page: Page }) {
  const ancestors = useStore(useShallow((s) => ancestorsOf(s.pages, page.id)))
  const { toggleFavorite, updatePage } = useStore.getState()
  const words = wordCount(page.content)
  const tasks = collectTasks(page.content).filter((t) => t.text)
  const done = tasks.filter((t) => t.checked).length

  const crumbs: Crumb[] = [
    ...ancestors.map((a) => ({ id: a.id, href: pageHref(a.id), label: a.title || "Sans titre", icon: a.icon })),
    { id: page.id, label: page.title || "Sans titre", icon: page.icon },
  ]

  return (
    <Topbar crumbs={crumbs}>
      <span className="text-muted-foreground mr-2 hidden text-xs lg:inline">
        Modifiée {formatRelative(page.updatedAt)}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleFavorite(page.id)}
            aria-label={page.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star
              className={cn(
                "transition-all",
                page.favorite ? "scale-110 fill-amber-400 text-amber-400" : "text-muted-foreground"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{page.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Options de la page">
            <MoreHorizontal className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Police</DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 px-1 pb-1">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updatePage(page.id, { font: f.id }, false)}
                className={cn(
                  "hover:bg-accent flex flex-col items-center rounded-md py-1.5 transition-colors",
                  page.font === f.id && "bg-accent"
                )}
              >
                <span className={cn("text-xl leading-tight", f.className, page.font === f.id && "text-brand")}>
                  {f.sample}
                </span>
                <span className="text-muted-foreground text-[11px]">{f.label}</span>
              </button>
            ))}
          </div>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              updatePage(page.id, { fullWidth: !page.fullWidth }, false)
            }}
            className="justify-between"
          >
            Pleine largeur
            <Switch checked={page.fullWidth} className="pointer-events-none" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <PageMenuItems pageId={page.id} />
          <DropdownMenuSeparator />
          <div className="text-muted-foreground space-y-0.5 px-2 py-1.5 text-xs">
            <div>
              {words} mot{words > 1 ? "s" : ""}
              {tasks.length > 0 && ` · ${done}/${tasks.length} tâches`}
            </div>
            <div>Créée {formatRelative(page.createdAt)}</div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </Topbar>
  )
}

/* ---------------- Corps de page ---------------- */

function PageBody({ page }: { page: Page }) {
  const router = useRouter()
  const { updatePage, restorePage, deleteForever } = useStore.getState()
  const [editor, setEditor] = React.useState<TiptapEditor | null>(null)
  const [iconOpen, setIconOpen] = React.useState(false)
  const trashed = Boolean(page.trashedAt)
  const cover = coverCss(page.cover)

  return (
    <>
      {trashed && (
        <div className="bg-destructive/10 text-destructive flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm">
          Cette page est dans la corbeille.
          <Button size="xs" variant="outline" onClick={() => restorePage(page.id)}>
            <RotateCcw /> Restaurer
          </Button>
          <Button
            size="xs"
            variant="destructive"
            onClick={() => {
              if (!window.confirm("Supprimer définitivement cette page et ses sous-pages ?")) return
              deleteForever(page.id)
              router.push("/corbeille")
            }}
          >
            <Trash2 /> Supprimer définitivement
          </Button>
        </div>
      )}

      {cover && <CoverBanner page={page} css={cover} readOnly={trashed} />}

      <div
        className={cn(
          "mx-auto w-full px-6 sm:px-16",
          page.fullWidth ? "max-w-none" : "max-w-[46rem]",
          cover ? "pt-0" : "pt-14"
        )}
      >
        <div className="group/header relative">
          {page.icon && (
            <Popover open={iconOpen} onOpenChange={setIconOpen}>
              <PopoverTrigger asChild disabled={trashed}>
                <button
                  type="button"
                  className={cn(
                    "hover:bg-accent/60 relative z-10 flex size-20 items-center justify-center rounded-xl text-[64px] leading-none transition-transform active:scale-95",
                    cover && "-mt-11"
                  )}
                  aria-label="Changer l'icône"
                >
                  <span className="drop-shadow-sm">{page.icon}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <EmojiPicker
                  onSelect={(emoji) => {
                    updatePage(page.id, { icon: emoji })
                    setIconOpen(false)
                  }}
                  onRemove={() => {
                    updatePage(page.id, { icon: null })
                    setIconOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          )}

          {!trashed && (!page.icon || !page.cover) && (
            <div
              className={cn(
                "text-muted-foreground flex h-8 items-center gap-1 opacity-0 transition-opacity group-hover/header:opacity-100 focus-within:opacity-100 has-data-[state=open]:opacity-100",
                page.icon ? "mt-1" : cover ? "mt-4" : ""
              )}
            >
              {!page.icon && (
                <Popover open={iconOpen} onOpenChange={setIconOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <SmilePlus /> Ajouter une icône
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <EmojiPicker
                      onSelect={(emoji) => {
                        updatePage(page.id, { icon: emoji })
                        setIconOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
              {!page.cover && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => updatePage(page.id, { cover: randomCover() })}
                >
                  <ImagePlus /> Ajouter une couverture
                </Button>
              )}
            </div>
          )}

          <TitleInput page={page} editor={editor} readOnly={trashed} />
        </div>

        <div className="mt-3">
          <Editor key={page.id} page={page} editable={!trashed} onReady={setEditor} />
        </div>

        {editor && !trashed && <TemplatePicker page={page} editor={editor} />}

        {/* Zone vide sous le texte : un clic place le curseur à la fin */}
        <div
          aria-hidden
          className={cn("h-[28vh] cursor-text", trashed && "cursor-default")}
          onClick={() => editor?.isEditable && editor.commands.focus("end")}
        />
      </div>

      <PageFooter page={page} />
    </>
  )
}

function TitleInput({ page, editor, readOnly }: { page: Page; editor: TiptapEditor | null; readOnly: boolean }) {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const updatePage = useStore((s) => s.updatePage)

  const resize = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  React.useLayoutEffect(resize, [page.title, page.font, page.fullWidth, resize])

  React.useEffect(() => {
    // Une page toute neuve s'ouvre avec le curseur dans le titre
    if (!page.title && !page.content && !readOnly) ref.current?.focus()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={page.title}
      readOnly={readOnly}
      placeholder="Sans titre"
      onChange={(e) => updatePage(page.id, { title: e.target.value.replace(/\n/g, "") })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || (e.key === "ArrowDown" && e.currentTarget.selectionStart === page.title.length)) {
          e.preventDefault()
          if (!editor) return
          // Focus synchrone : `commands.focus` attend une frame, et la touche suivante tombait encore dans le titre
          editor.view.dispatch(editor.state.tr.setSelection(Selection.atStart(editor.state.doc)))
          editor.view.focus()
        }
      }}
      className="page-title placeholder:text-muted-foreground/40 mt-1 block w-full resize-none overflow-hidden bg-transparent text-[2.5rem] leading-[1.15] font-bold tracking-tight outline-none"
    />
  )
}

function CoverBanner({ page, css, readOnly }: { page: Page; css: string; readOnly: boolean }) {
  const updatePage = useStore((s) => s.updatePage)
  return (
    <div className="group/cover relative h-48 w-full sm:h-56" style={{ background: css }}>
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.07%22/></svg>')] mix-blend-overlay" />
      {!readOnly && (
        <div className="absolute right-4 bottom-3 flex gap-1.5 opacity-0 transition-opacity group-hover/cover:opacity-100 has-data-[state=open]:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="xs" variant="secondary" className="bg-background/80 backdrop-blur">
                Changer
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="text-muted-foreground text-xs font-medium">Couvertures</div>
              <div className="grid grid-cols-4 gap-2">
                {COVERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    title={c.name}
                    onClick={() => updatePage(page.id, { cover: c.id })}
                    className={cn(
                      "ring-foreground/10 relative h-12 rounded-md ring-1 transition-transform hover:scale-105",
                      page.cover === c.id && "ring-foreground ring-2"
                    )}
                    style={{ background: c.css }}
                  >
                    {page.cover === c.id && <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            size="xs"
            variant="secondary"
            className="bg-background/80 backdrop-blur"
            onClick={() => updatePage(page.id, { cover: null })}
          >
            Retirer
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------------- Modèles pour page vide ---------------- */

function TemplatePicker({ page, editor }: { page: Page; editor: TiptapEditor }) {
  const isEmpty = useEditorState({ editor, selector: ({ editor: e }) => e.isEmpty })
  const updatePage = useStore((s) => s.updatePage)
  if (!isEmpty) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6"
    >
      <div className="text-muted-foreground mb-2 text-xs font-medium">Partir d&apos;un modèle</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => {
              editor.commands.setContent(tpl.build(), { emitUpdate: true })
              updatePage(page.id, {
                title: page.title || tpl.title || "",
                icon: page.icon ?? tpl.icon,
              })
              editor.commands.focus("end")
            }}
            className="group/tpl bg-card hover:bg-accent/50 ring-border hover:ring-foreground/20 flex items-center gap-3 rounded-xl p-3 text-left ring-1 transition-all hover:-translate-y-px hover:shadow-sm"
          >
            <span className="bg-muted flex size-9 items-center justify-center rounded-lg text-lg transition-transform group-hover/tpl:scale-110">
              {tpl.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{tpl.name}</span>
              <span className="text-muted-foreground block truncate text-xs">{tpl.description}</span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ---------------- Sous-pages et rétroliens ---------------- */

function PageFooter({ page }: { page: Page }) {
  const children = useStore(useShallow((s) => selectChildren(s.pages, page.id)))
  const backlinks = useStore(
    useShallow((s) =>
      Object.values(s.pages).filter((p) => p.id !== page.id && !p.trashedAt && collectMentions(p.content).has(page.id))
    )
  )
  if (!children.length && !backlinks.length) return null

  return (
    <div className={cn("mx-auto w-full px-6 pb-24 sm:px-16", page.fullWidth ? "max-w-none" : "max-w-[46rem]")}>
      <div className="border-t pt-6">
        {children.length > 0 && (
          <section className="mb-8">
            <h2 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <FileText className="size-3.5" /> Sous-pages · {children.length}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {children.map((c) => (
                <PageCard key={c.id} page={c} />
              ))}
            </div>
          </section>
        )}
        {backlinks.length > 0 && (
          <section>
            <h2 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <Link2 className="size-3.5" /> Mentionnée dans · {backlinks.length}
            </h2>
            <div className="flex flex-col gap-1">
              {backlinks.map((b) => (
                <Link
                  key={b.id}
                  href={pageHref(b.id)}
                  className="group/bl hover:bg-accent flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors"
                >
                  <span className="flex size-5 items-center justify-center">
                    {b.icon ?? <FileText className="text-muted-foreground size-4" />}
                  </span>
                  <span className="truncate">{b.title || "Sans titre"}</span>
                  <ArrowUpRight className="text-muted-foreground ml-auto size-3.5 opacity-0 transition-opacity group-hover/bl:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export function PageCard({ page, className }: { page: Page; className?: string }) {
  const cover = coverCss(page.cover)
  const text = snippet(page.content, 90)
  return (
    <Link
      href={pageHref(page.id)}
      className={cn(
        "group/card bg-card ring-border hover:ring-foreground/20 relative flex flex-col overflow-hidden rounded-xl ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="bg-muted h-12 w-full transition-[height] duration-300" style={cover ? { background: cover } : undefined} />
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-3 pt-0">
        <span className="bg-card ring-card -mt-4 flex size-8 items-center justify-center rounded-lg text-xl ring-4">
          {page.icon ?? <FileText className="text-muted-foreground size-4" />}
        </span>
        <span className="truncate text-sm font-medium">{page.title || "Sans titre"}</span>
        <span className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs">{text || "Page vide"}</span>
        <span className="text-muted-foreground/80 mt-auto pt-1 text-[11px]">{formatRelative(page.updatedAt)}</span>
      </div>
    </Link>
  )
}

function MissingPage() {
  return (
    <div className="flex h-[calc(100svh-1rem)] flex-col">
      <Topbar crumbs={[{ label: "Page introuvable" }]} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="text-5xl">🫥</div>
        <h1 className="text-xl font-semibold">Cette page n&apos;existe pas</h1>
        <p className="text-muted-foreground max-w-sm text-sm">Elle a peut-être été supprimée définitivement.</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  )
}

