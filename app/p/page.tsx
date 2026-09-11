"use client"

import { Suspense } from "react"
import { PageView } from "@/components/page-view"
import { useActivePageId } from "@/lib/routes"

function CurrentPage() {
  const id = useActivePageId()
  return <PageView key={id} id={id ?? ""} />
}

export default function Page() {
  return (
    <Suspense>
      <CurrentPage />
    </Suspense>
  )
}
