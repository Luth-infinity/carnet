"use client"

import * as React from "react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface Crumb {
  id?: string
  href?: string
  label: string
  icon?: React.ReactNode
}

export function Topbar({
  crumbs,
  children,
  className,
}: {
  crumbs: Crumb[]
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "bg-background/80 supports-[backdrop-filter]:bg-background/65 sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 px-3 backdrop-blur-xl",
        className
      )}
    >
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <nav aria-label="Fil d'Ariane" className="flex min-w-0 flex-1 items-center gap-0.5 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          const inner = (
            <>
              {c.icon && <span className="flex size-4 items-center justify-center text-[13px] leading-none">{c.icon}</span>}
              <span className="truncate">{c.label}</span>
            </>
          )
          return (
            <React.Fragment key={c.id ?? `${c.label}-${i}`}>
              {i > 0 && <span className="text-muted-foreground/50 px-0.5">/</span>}
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex max-w-44 min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors"
                >
                  {inner}
                </Link>
              ) : (
                <span className="flex max-w-72 min-w-0 items-center gap-1.5 px-1.5 py-1 font-medium">{inner}</span>
              )}
            </React.Fragment>
          )
        })}
      </nav>
      <div className="flex items-center gap-1">{children}</div>
    </header>
  )
}
