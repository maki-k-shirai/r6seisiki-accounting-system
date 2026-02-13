// lib/tutorial/tutorial-types.ts
export type TutorialTargetPlacement = "top" | "bottom" | "left" | "right" | "center"

export type TutorialEventType =
  | "none"            // v0: 手動で「次へ」
  | "click"
  | "change"
  | "submit"
  | "keydown:Enter"

export interface TutorialStep {
  id: string
  title: string
  description: string
  path: string          // このステップでいるべきURL（例: "/voucher-entry"）
  targetSelector?: string  // 強調したい要素（例: '[data-tutorial="voucher-date"]'）
  placement?: TutorialTargetPlacement
  expectedEvent?: TutorialEventType
}

export interface TutorialScenario {
  id: string
  title: string
  description?: string
  estimatedMinutes?: number
  steps: TutorialStep[]
  // どの画面向けのチュートリアルかを絞る用
  targetScreen?: "voucher-entry" | "cash-name-change" | "global" | string
}
