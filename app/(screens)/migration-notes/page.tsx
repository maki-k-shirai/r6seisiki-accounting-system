"use client"

import { useRouter } from "next/navigation"
import { MigrationNotesGuide } from "@/components/tutorial/MigrationNotesGuide"

export default function MigrationNotesPage() {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-6xl">
      <MigrationNotesGuide
        variant="page"
        onClose={() => router.back()}
      />
    </div>
  )
}
