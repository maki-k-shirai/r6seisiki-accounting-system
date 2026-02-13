// app/(screens)/home/page.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { EntranceGuidePanel } from "@/components/common/EntranceGuidePanel"

export default function HomePage() {
  const searchParams = useSearchParams()
  const blankWorkspace = searchParams.get("workspace") === "blank"

  if (blankWorkspace) {
    return <div className="h-full w-full bg-white" />
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f7f9ff] via-white to-[#fff4f8] text-sm text-[#4a4a4a]">
      <EntranceGuidePanel />
    </div>
  )
}
