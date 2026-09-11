import { cn } from "@/lib/utils"

/** Même dessin que l'icône de l'application (build/icon.png) : carnet à reliure sur tuile sombre */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="20 20 984 984" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="carnet-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26272c" />
          <stop offset="1" stopColor="#0b0b0d" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="984" height="984" rx="228" fill="url(#carnet-tile)" />
      <rect x="318" y="206" width="438" height="612" rx="72" fill="#fff" />
      <path d="M452 392h180M452 512h180M452 632h104" stroke="#131316" strokeWidth="44" strokeLinecap="round" />
      <g fill="#fff">
        <rect x="236" y="300" width="150" height="62" rx="31" />
        <rect x="236" y="481" width="150" height="62" rx="31" />
        <rect x="236" y="662" width="150" height="62" rx="31" />
      </g>
      <g fill="#131316">
        <circle cx="352" cy="331" r="17" />
        <circle cx="352" cy="512" r="17" />
        <circle cx="352" cy="693" r="17" />
      </g>
    </svg>
  )
}
