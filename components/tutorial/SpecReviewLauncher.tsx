// components/tutorial/SpecReviewLauncher.tsx
"use client"

import { FlaskConical, XIcon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTutorial } from "@/components/tutorial/TutorialProvider"
import { SPEC_REVIEW_SCENARIOS } from "@/lib/tutorial/tutorial-scenarios"

export function SpecReviewLauncher({
  size = "sm",
  className,
}: {
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const {
    specReviewMenuOpen,
    openSpecReviewMenu,
    closeSpecReviewMenu,
    startTutorial,
    isActive,
    scenario,
    stopTutorial,
  } = useTutorial()

  const handleStart = (scenarioId: string) => {
    const target = SPEC_REVIEW_SCENARIOS.find((s) => s.id === scenarioId)
    if (!target) return
    closeSpecReviewMenu()
    startTutorial(target)
  }

  const currentlyRunning =
    isActive && scenario?.mode === "specReview" ? scenario : null

  return (
    <>
      {/* ヘッダーボタン */}
      <Button
        variant="outline"
        size={size}
        onClick={openSpecReviewMenu}
        className={cn(
          "flex items-center gap-2 border-[#4a5568] bg-[#f0f4ff] text-xs font-semibold text-[#2d3a5a]",
          "transition-all duration-200 hover:bg-[#2d3a5a] hover:text-white hover:shadow-md",
          currentlyRunning && "border-[#2d3a5a] bg-[#2d3a5a] text-white",
          className,
        )}
      >
        <FlaskConical className="h-4 w-4" />
        <span>仕様検討</span>
        {currentlyRunning && (
          <span className="rounded-full bg-white/30 px-1.5 py-0.5 text-[10px]">
            実行中
          </span>
        )}
      </Button>

      {/* モーダル */}
      {specReviewMenuOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/20">
          <div
            className="
              w-[860px] max-w-[94vw] rounded-2xl border border-[#c8d0e8]
              bg-gradient-to-br from-white via-[#f5f7ff] to-white
              p-5 shadow-2xl backdrop-blur
            "
          >
            {/* アクセントバー */}
            <div className="mb-3 h-1.5 w-full rounded-full bg-gradient-to-r from-[#2d3a5a] via-[#5b7bbf] to-[#2d3a5a]" />

            {/* ヘッダー */}
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-[22px] font-semibold text-[#2d3a5a]">
                  <FlaskConical className="h-5 w-5" />
                  仕様検討
                </div>
                <div className="mt-2 text-[14px] leading-relaxed text-slate-600">
                  検討中の仕様変更を画面上で操作して確認できます。<br />
                  シナリオを選ぶと、ステップに沿って各画面をガイドします。
                </div>
              </div>
              <button
                type="button"
                onClick={closeSpecReviewMenu}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="閉じる"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* シナリオ一覧 */}
            <div className="space-y-3">
              {SPEC_REVIEW_SCENARIOS.map((scenario) => (
                <div
                  key={scenario.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-slate-900">
                        {scenario.title}
                      </div>
                      <div className="mt-1 text-[13px] leading-snug text-slate-600">
                        {scenario.description}
                      </div>
                      {/* ステップ一覧 */}
                      <div className="mt-3 space-y-1.5">
                        {scenario.steps.map((step, i) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2 text-[12px] text-slate-500"
                          >
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#e8edf8] text-[10px] font-bold text-[#2d3a5a]">
                              {i + 1}
                            </span>
                            {step.title}
                          </div>
                        ))}
                      </div>
                      {scenario.estimatedMinutes && (
                        <div className="mt-2 text-[11px] text-slate-400">
                          目安：約{scenario.estimatedMinutes}分
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStart(scenario.id)}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-[#2d3a5a] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1a2540] hover:shadow-md"
                    >
                      ガイド開始
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 実行中バナー */}
            {currentlyRunning && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-[#c8d0e8] bg-[#eef1f8] px-3 py-2 text-[11px] text-[#2d3a5a]">
                <div>
                  実行中：
                  <span className="font-semibold">{currentlyRunning.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopTutorial()
                    closeSpecReviewMenu()
                  }}
                  className="rounded border border-[#2d3a5a] px-2 py-1 text-[10px] hover:bg-[#2d3a5a] hover:text-white"
                >
                  ガイドを終了
                </button>
              </div>
            )}

            {/* フッター */}
            <div className="mt-4 text-[11px] text-slate-400">
              ※ このメニューはプロダクトチームの仕様検討用です。シナリオは随時追加されます。
            </div>
          </div>
        </div>
      )}
    </>
  )
}
