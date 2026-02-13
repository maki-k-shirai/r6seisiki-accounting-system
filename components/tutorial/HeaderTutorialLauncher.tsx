// components/tutorial/HeaderTutorialLauncher.tsx
"use client"

import { useRouter, usePathname } from "next/navigation"
import { GraduationCap, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTutorial } from "@/components/tutorial/TutorialProvider"
import { cn } from "@/lib/utils"
import { TUTORIAL_SCENARIOS } from "@/lib/tutorial/tutorial-scenarios"

type HeaderTutorialLauncherProps = {
  size?: "sm" | "default" | "lg"
  className?: string
  label?: string
}

export function HeaderTutorialLauncher({
  size = "sm",
  className,
  label = "変更点ガイド",
}: HeaderTutorialLauncherProps) {
  const routes = {
    accountSystemChanges: "/account-system-changes",
    restrictedAssetsManagement: "/restricted-assets-management",
    voucherEntry: "/voucher-entry",
  } as const

  const {
    startTutorial,
    isActive,
    stopTutorial,
    scenario,
    tutorialMenuOpen,
    openTutorialMenu,
    closeTutorialMenu,
  } = useTutorial()

  const router = useRouter()
  const pathname = usePathname()

  const navigateRequiredScenarioIds = new Set([
    "funding-revenue-expense",
    "other-securities-revaluation",
    "bs-funding-abolish",
  ])

  const pendingScenarioIdMap: Record<string, string> = {
    "funding-revenue-expense": "funding-overview-first",
  }

  const handleSelectTutorial = (
    scenarioId: string,
    options?: { navigateTo?: string },
  ) => {
    const navigateTo = options?.navigateTo

    // 伝票入力画面に遷移してから開始するチュートリアル
    const shouldNavigateToVoucher =
      navigateRequiredScenarioIds.has(scenarioId) && !!navigateTo

    if (shouldNavigateToVoucher && navigateTo) {
      if (typeof window !== "undefined") {
        const pendingId = pendingScenarioIdMap[scenarioId] ?? scenarioId
        window.sessionStorage.setItem("pendingTutorialScenario", pendingId)
      }

      closeTutorialMenu()

      if (pathname === navigateTo) {
        // 同一パスの場合はリロードしてから開始
        window.location.href = navigateTo
      } else {
        router.push(navigateTo)
      }
      return
    }

    // それ以外はこの画面上で開始
    const target = TUTORIAL_SCENARIOS.find((s) => s.id === scenarioId)
    if (!target) {
      console.warn("Tutorial scenario not found:", scenarioId)
      return
    }

    startTutorial(target)
    closeTutorialMenu()
  }

  const handleOpenAccountSystemIntro = () => {
    closeTutorialMenu()
    router.push(routes.accountSystemChanges)
  }

  const handleOpenRestrictedAssetsManagementGuide = () => {
    closeTutorialMenu()
    router.push(routes.restrictedAssetsManagement)
  }

  const tutorialCardBaseClass =
    "h-full w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left text-[13px] " +
    "shadow-sm transition hover:-translate-y-[1px] hover:border-[#7D2248] hover:bg-white hover:shadow-md"

  const tutorialCards = [
    {
      title: "科目体系の変更点",
      description:
        "令和6年基準に合わせた科目体系の全体像と、実務に影響するポイントを事前に確認します。",
      onClick: handleOpenAccountSystemIntro,
    },
    {
      title: "収益・費用科目での財源区分入力",
      description:
        "伝票入力画面での財源区分の新しい入力方法を、実際の画面をたどりながら確認します。",
      onClick: () =>
        handleSelectTutorial("funding-revenue-expense", {
          navigateTo: routes.voucherEntry,
        }),
    },
    {
      title: "その他有価証券評価差額金の新しい仕訳",
      description:
        "評価差額金の期末・期首振替の仕訳手順と、科目の持ち方を確認します。",
      onClick: () =>
        handleSelectTutorial("other-securities-revaluation", {
          navigateTo: routes.voucherEntry,
        }),
    },
    {
      title: "使途拘束資産の管理",
      description:
        "新たに追加された使途拘束資産管理機能の基本的な考え方と、画面での操作の流れを確認します。",
      onClick: handleOpenRestrictedAssetsManagementGuide,
    },
  ]

  return (
    <>
      {/* ヘッダー右上のチュートリアルボタン */}
      <Button
        variant="outline"
        size={size}
        onClick={openTutorialMenu}
        className={cn(
          "flex items-center gap-2 border-[#7D2248] bg-[#fff0f5] text-xs font-semibold text-[#7D2248] transition-all duration-200 hover:bg-[#7D2248] hover:text-white hover:shadow-md",
          className,
        )}
      >
        <GraduationCap className="h-4 w-4" />
        <span>{label}</span>
      </Button>

      {/* チュートリアルメニュー（画面中央のオーバーレイ） */}
      {tutorialMenuOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/20">
          <div
            className="
              w-[860px] max-w-[94vw] min-h-[520px] rounded-2xl border border-[#e3cad7]
              bg-gradient-to-br from-white via-[#fff4f8] to-white
              p-5 shadow-2xl backdrop-blur
            "
          >
            {/* 上部アクセントバー */}
            <div className="mb-3 h-1.5 w-full rounded-full bg-gradient-to-r from-[#7D2248] via-[#c86d95] to-[#7D2248]" />

            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="text-[22px] font-semibold text-[#7D2248]">
                  変更点ガイド
                </div>
                <div className="mt-3 text-[16px] font-medium text-slate-800">
                  どの変更点から確認しますか？
                </div>
                <div className="mt-2 text-[14px] leading-relaxed text-slate-600">
                  クリックすると、変更点を画面上で確認できます。<br />
                  気になるところだけ、気軽に見てみてください。
                </div>
              </div>
              <button
                type="button"
                onClick={closeTutorialMenu}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="閉じる"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {tutorialCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={card.onClick}
                  className={tutorialCardBaseClass}
                >
                  <div className="mb-1 text-[18px] font-semibold text-slate-900">
                    {card.title}
                  </div>
                  <div className="text-[14px] leading-snug text-slate-700">
                    {card.description}
                  </div>
                </button>
              ))}
            </div>

            {isActive && scenario && (
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-600">
                <div>
                  実行中のチュートリアル：
                  <span className="font-semibold">{scenario.title}</span>
                </div>
                <button
                  type="button"
                  onClick={stopTutorial}
                  className="rounded border border-slate-300 px-2 py-1 text-[10px] hover:bg-slate-100"
                >
                  チュートリアルを終了
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 科目体系の変更点：概要ページはフル画面へ遷移 */}
    </>
  )
}
