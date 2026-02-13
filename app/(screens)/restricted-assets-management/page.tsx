"use client"

import { useRouter } from "next/navigation"
import { RestrictedAssetsManagementGuide } from "@/components/tutorial/RestrictedAssetsManagementGuide"

export default function RestrictedAssetsManagementPage() {
  const router = useRouter()

  return (
    <div className="mx-auto w-full max-w-6xl">
      <RestrictedAssetsManagementGuide
        variant="page"
        onClose={() => router.back()}
      />
    </div>
  )
}
