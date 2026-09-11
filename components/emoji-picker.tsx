"use client"

import { EmojiPicker as Picker } from "frimousse"
import { Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const RANDOM = ["📝", "💡", "🚀", "📚", "🎯", "🌿", "🧠", "🎨", "📌", "🗂️", "✨", "🔥", "🌙", "☕", "🎧", "🧩"]

export function EmojiPicker({
  onSelect,
  onRemove,
}: {
  onSelect: (emoji: string) => void
  onRemove?: () => void
}) {
  return (
    <div className="flex w-[21rem] flex-col">
      <Picker.Root
        locale="fr"
        // Données embarquées dans public/ : le sélecteur fonctionne aussi hors ligne
        emojibaseUrl="/emojibase"
        columns={9}
        onEmojiSelect={({ emoji }) => onSelect(emoji)}
        className="isolate flex h-[340px] flex-col"
      >
        <div className="flex items-center gap-1.5 p-2 pb-1">
          <Picker.Search
            placeholder="Rechercher un emoji…"
            className="bg-muted/70 placeholder:text-muted-foreground focus-visible:ring-ring/40 h-8 flex-1 rounded-md px-2.5 text-sm outline-none focus-visible:ring-2"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            title="Au hasard"
            onClick={() => onSelect(RANDOM[Math.floor(Math.random() * RANDOM.length)])}
          >
            <Shuffle />
          </Button>
          {onRemove && (
            <Button variant="ghost" size="icon-sm" title="Retirer l'icône" onClick={onRemove}>
              <Trash2 />
            </Button>
          )}
        </div>
        <Picker.Viewport className="relative flex-1 outline-none">
          <Picker.Loading className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            Chargement…
          </Picker.Loading>
          <Picker.Empty className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            Aucun emoji trouvé
          </Picker.Empty>
          <Picker.List
            className="pb-2 select-none"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  className="bg-popover/95 text-muted-foreground px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide uppercase backdrop-blur"
                  {...props}
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div className="scroll-my-1 px-1.5" {...props}>
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  className="data-active:bg-accent flex size-9 items-center justify-center rounded-md text-xl"
                  {...props}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </Picker.Viewport>
      </Picker.Root>
    </div>
  )
}
