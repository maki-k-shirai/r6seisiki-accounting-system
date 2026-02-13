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

  // ★ チュートリアルメニューの開閉
  tutorialMenuOpen: boolean
  openTutorialMenu: () => void
  closeTutorialMenu: () => void
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

  // ★ メニューの状態
  const [tutorialMenuOpen, setTutorialMenuOpen] = useState(false)

  const openTutorialMenu = useCallback(() => {
    setTutorialMenuOpen(true)
  }, [])

  const closeTutorialMenu = useCallback(() => {
    setTutorialMenuOpen(false)
  }, [])

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
  ])

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay />
    </TutorialContext.Provider>
  )
}

/**
 * v0用の簡易オーバーレイ
 * targetSelector が見つかればその近くに、なければ画面右下に表示
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
  } = useTutorial()

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isActive || !currentStep?.targetSelector) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(
      currentStep.targetSelector,
    ) as HTMLElement | null
    if (!el) {
      setTargetRect(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setTargetRect(rect)
  }, [isActive, currentStep?.targetSelector])

  if (!isActive || !scenario || !currentStep) return null

  const totalSteps = scenario.steps.length

  // オーバーレイの位置計算（超ざっくり v0）
  const style: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: Math.min(targetRect.bottom + 8, window.innerHeight - 200),
        left: Math.min(targetRect.left, window.innerWidth - 360),
        zIndex: 2000,
      }
    : {
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
      }

  return (
    <div
      className="max-w-sm rounded-xl border border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur"
      style={style}
    >
      <div className="mb-1 text-xs font-semibold text-slate-500">
        チュートリアル: {scenario.title}
      </div>
      <div className="mb-1 text-sm font-semibold text-slate-900">
        {currentStepIndex + 1} / {totalSteps} {currentStep.title}
      </div>
      <div className="mb-3 text-xs leading-relaxed text-slate-700">
        {currentStep.description}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={stopTutorial}
          className="text-xs text-slate-500 underline underline-offset-2"
        >
          終了
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="rounded bg-[#7D2248] px-3 py-1 text-xs font-semibold text-white"
          >
            {currentStepIndex === totalSteps - 1 ? "完了" : "次へ"}
          </button>
        </div>
      </div>
    </div>
  )
}
