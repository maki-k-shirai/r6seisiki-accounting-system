// app/(screens)/account-system-changes/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { AccountSystemChangesIntro } from "@/components/tutorial/AccountSystemChangesIntro"

export default function AccountSystemChangesPage() {
  const router = useRouter()

  const handleStartTutorial = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "pendingTutorialScenario",
        "bs-funding-abolish",
      )
    }
    router.push("/voucher-entry")
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <AccountSystemChangesIntro
        variant="page"
        onClose={() => router.back()}
        onStartTutorial={handleStartTutorial}
      />
    </div>
  )
}
