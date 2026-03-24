// components/tutorial/TutorialProvider.tsx
"use client"

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type {
  TutorialScenario,
  TutorialStep,
} from "@/lib/tutorial/tutorial-types"

type TutorialState = {
  activeScenario?: TutorialScenario
  currentStepIndex: number
}

type TutorialContextValue = {
  isActive: boolean
  scenario?: TutorialScenario
  currentStep?: TutorialStep
  currentStepIndex: number
  startTutorial: (scenario: TutorialScenario) => void
  stopTutorial: () => void
  nextStep: () => void
  prevStep: () => void

  // チュートリアルメニュー（変更点ガイド）
  tutorialMenuOpen: boolean
  openTutorialMenu: () => void
  closeTutorialMenu: () => void

  // 仕様検討メニュー
  specReviewMenuOpen: boolean
  openSpecReviewMenu: () => void
  closeSpecReviewMenu: () => void
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

export function useTutorial() {
  const ctx = useContext(TutorialContext)
  if (!ctx) {
    throw new Error("useTutorial must be used within TutorialProvider")
  }
  return ctx
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<TutorialState>({
    activeScenario: undefined,
    currentStepIndex: 0,
  })

  const [tutorialMenuOpen, setTutorialMenuOpen] = useState(false)
  const [specReviewMenuOpen, setSpecReviewMenuOpen] = useState(false)

  const openTutorialMenu = useCallback(() => setTutorialMenuOpen(true), [])
  const closeTutorialMenu = useCallback(() => setTutorialMenuOpen(false), [])
  const openSpecReviewMenu = useCallback(() => setSpecReviewMenuOpen(true), [])
  const closeSpecReviewMenu = useCallback(() => setSpecReviewMenuOpen(false), [])

  const startTutorial = useCallback(
    (scenario: TutorialScenario) => {
      setState({ activeScenario: scenario, currentStepIndex: 0 })
      const first = scenario.steps[0]
      if (first?.path && first.path !== pathname) {
        router.push(first.path)
      }
    },
    [pathname, router],
  )

  const stopTutorial = useCallback(() => {
    setState({ activeScenario: undefined, currentStepIndex: 0 })
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.activeScenario) return prev
      const maxIndex = prev.activeScenario.steps.length - 1
      const nextIndex = Math.min(prev.currentStepIndex + 1, maxIndex)
      const nextStep = prev.activeScenario.steps[nextIndex]
      if (nextStep?.path && nextStep.path !== pathname) {
        router.push(nextStep.path)
      }
      return { ...prev, currentStepIndex: nextIndex }
    })
  }, [pathname, router])

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (!prev.activeScenario) return prev
      const nextIndex = Math.max(prev.currentStepIndex - 1, 0)
      const nextStep = prev.activeScenario.steps[nextIndex]
      if (nextStep?.path && nextStep.path !== pathname) {
        router.push(nextStep.path)
      }
      return { ...prev, currentStepIndex: nextIndex }
    })
  }, [pathname, router])

  const value: TutorialContextValue = useMemo(() => {
    const scenario = state.activeScenario
    const currentStep = scenario?.steps[state.currentStepIndex]
    return {
      isActive: !!scenario,
      scenario,
      currentStep,
      currentStepIndex: state.currentStepIndex,
      startTutorial,
      stopTutorial,
      nextStep,
      prevStep,
      tutorialMenuOpen,
      openTutorialMenu,
      closeTutorialMenu,
      specReviewMenuOpen,
      openSpecReviewMenu,
      closeSpecReviewMenu,
    }
  }, [
    state,
    startTutorial,
    stopTutorial,
    nextStep,
    prevStep,
    tutorialMenuOpen,
    openTutorialMenu,
    closeTutorialMenu,
    specReviewMenuOpen,
    openSpecReviewMenu,
    closeSpecReviewMenu,
  ])

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  )
}

/**
 * チュートリアル / 仕様検討 共通オーバーレイ
 * scenario.mode === "specReview" のときは紺色テーマで表示し、
 * 「仕様検討メニューに戻る」ボタンを出す
 */
function TutorialOverlay() {
  const {
    isActive,
    scenario,
    currentStep,
    nextStep,
    prevStep,
    stopTutorial,
    currentStepIndex,
    openSpecReviewMenu,
  } = useTutorial()

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isActive || !currentStep?.targetSelector) {
      setTargetRect(null)
      return
    }
    // targetSelector が見つかるまで最大500ms待機（画面遷移後のレンダリング考慮）
    let attempts = 0
    const tryFind = () => {
      const el = document.querySelector(currentStep.targetSelector!) as HTMLElement | null
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else if (attempts < 10) {
        attempts++
        setTimeout(tryFind, 50)
      } else {
        setTargetRect(null)
      }
    }
    tryFind()
  }, [isActive, currentStep?.targetSelector, currentStep?.id])

  if (!isActive || !scenario || !currentStep) return null

  const isSpecReview = scenario.mode === "specReview"
  const totalSteps = scenario.steps.length
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === totalSteps - 1

  // オーバーレイ位置
  const style: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: Math.min(targetRect.bottom + 12, window.innerHeight - 240),
        left: Math.max(8, Math.min(targetRect.left, window.innerWidth - 380)),
        zIndex: 11000,
      }
    : isSpecReview
    ? {
        // specReview はヘッダー直下の右上に固定（ページ本文を隠さない）
        position: "fixed",
        top: 72,
        right: 24,
        zIndex: 11000,
      }
    : {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 11000,
      }

  // テーマカラー
  const theme = isSpecReview
    ? {
        accent: "bg-[#2d3a5a]",
        accentText: "text-white",
        accentHover: "hover:bg-[#1a2540]",
        label: "text-[#5b7bbf]",
        nextBtn: "bg-[#2d3a5a] hover:bg-[#1a2540] text-white",
        badge: "bg-[#e8edf8] text-[#2d3a5a]",
        border: "border-[#c8d0e8]",
        progressFill: "bg-[#2d3a5a]",
      }
    : {
        accent: "bg-[#7D2248]",
        accentText: "text-white",
        accentHover: "hover:bg-[#5a1933]",
        label: "text-[#9b4d6e]",
        nextBtn: "bg-[#7D2248] hover:bg-[#5a1933] text-white",
        badge: "bg-[#fce8ef] text-[#7D2248]",
        border: "border-slate-200",
        progressFill: "bg-[#7D2248]",
      }

  return (
    <div
      className={`w-[360px] rounded-xl border ${theme.border} bg-white/97 shadow-2xl backdrop-blur`}
      style={style}
    >
      {/* カラーバー */}
      <div className={`h-1 w-full rounded-t-xl ${theme.accent}`} />

      <div className="p-4">
        {/* ラベル行 */}
        <div className="mb-2 flex items-center justify-between">
          <span className={`text-[11px] font-semibold ${theme.label}`}>
            {isSpecReview ? "仕様検討" : "変更点ガイド"}：{scenario.title}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${theme.badge}`}>
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* プログレスバー */}
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.progressFill}`}
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* ステップタイトル */}
        <div className="mb-1.5 text-[14px] font-bold text-slate-900">
          {currentStep.title}
        </div>

        {/* 説明（改行対応） */}
        <div className="mb-3 whitespace-pre-line text-[12px] leading-relaxed text-slate-700">
          {currentStep.description}
        </div>

        {/* ナビゲーション */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isSpecReview && (
              <button
                type="button"
                onClick={() => {
                  stopTutorial()
                  openSpecReviewMenu()
                }}
                className="text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-600"
              >
                メニューに戻る
              </button>
            )}
            {!isSpecReview && (
              <button
                type="button"
                onClick={stopTutorial}
                className="text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-600"
              >
                終了
              </button>
            )}
          </div>
          {/* 次へ／完了ボタン */}
          <div className="flex items-center gap-2">
            {!isSpecReview && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirst}
                className="rounded border border-slate-200 px-3 py-1.5 text-[11px] disabled:opacity-30 hover:bg-slate-50"
              >
                ← 前へ
              </button>
            )}
            <button
              type="button"
              onClick={isLast ? stopTutorial : nextStep}
              className={`rounded px-3 py-1.5 text-[11px] font-semibold transition ${theme.nextBtn}`}
            >
              {isLast ? "完了" : "次へ →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
