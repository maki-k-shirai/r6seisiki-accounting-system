// components/tutorial/GuidedFocus.tsx
"use client"

import React, {
  useEffect,
  useRef,
  cloneElement,
  ReactElement,
} from "react"
import { MousePointerClick } from "lucide-react"

type GuidedFocusProps = {
  active: boolean
  message: string
  placement?: "right" | "bottom" | "top" | "left"
  children: ReactElement
  variant?: "normal" | "wide"

  // 「ここをクリックしてください」みたいなヒント用バッジの表示有無
  showClickHint?: boolean

  // 既存の「次へ」用（後方互換）
  onNext?: () => void
  nextLabel?: string

  // レイアウト調整（デフォルト true）
  fullWidth?: boolean

  // 汎用アクションボタン（PDFプレビューなどで使う）
  primaryLabel?: string
  onPrimary?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

export function GuidedFocus({
  active,
  message,
  placement = "right",
  children,
  onNext,
  nextLabel,
  variant = "normal",
  showClickHint = true,        // ← デフォルトは従来どおり Click を表示
  fullWidth = true,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: GuidedFocusProps) {
  const innerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (active && innerRef.current) {
      innerRef.current.focus()
    }
  }, [active])

  const bubblePositionClass =
    placement === "right"
      ? "left-full ml-3 top-1/2 -translate-y-1/2"
      : placement === "bottom"
      ? "top-full mt-3 left-1/2 -translate-x-1/2"
      : placement === "top"
      ? "bottom-full mb-3 left-1/2 -translate-x-1/2"
      : "right-full mr-3 top-0" // left の場合

  // ボックスサイズ
  const bubbleWidthClass =
    variant === "wide"
      ? "w-[360px] max-w-[5000px]" // 横長バージョン
      : "w-[280px] max-w-[320px]"  // 従来どおり

  // ボタン周り（後方互換：onNext があれば primary として扱う）
  const primaryHandler = onPrimary ?? onNext
  const primaryText = primaryLabel ?? nextLabel ?? "次へ"
  const hasMessage = message.trim().length > 0

  const secondaryHandler = onSecondary
  const secondaryText = secondaryLabel ?? "戻る"

  const hasFooter = !!(primaryHandler || secondaryHandler)
  const isClickBadgeOnly = showClickHint && !hasMessage && !hasFooter

  const childWithRef = cloneElement(children as ReactElement<any>, {
    ...(children.props as any),
    ref: (node: HTMLElement | null) => {
      innerRef.current = node
      const originalRef: any = (children as any).props?.ref
      if (typeof originalRef === "function") {
        originalRef(node)
      } else if (originalRef && typeof originalRef === "object") {
        originalRef.current = node
      }
    },
  } as any)

  const containerClass = fullWidth
    ? "relative inline-flex w-full"
    : "relative inline-flex"

  return (
    <div className={containerClass}>
      {childWithRef}

      {active && (
        <span
          className="pointer-events-none absolute -inset-1 rounded-md ring-2 ring-[#7D2248] ring-offset-2 ring-offset-white"
          aria-hidden="true"
        />
      )}

      {active && (
        <div className={`absolute z-[6000] ${bubblePositionClass}`}>
          {isClickBadgeOnly ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-[#f6e8f2] px-2 py-[2px] text-[10px] font-semibold text-[#7D2248] shadow-sm">
              <MousePointerClick className="h-3 w-3" />
              <span>Click</span>
            </div>
          ) : (
            <div
              className={`
                relative
                ${bubbleWidthClass}
                rounded-md border border-[#7D2248]/30
                bg-[#fff7fb]
                px-3.5 py-2.5
                text-[12px] leading-relaxed
                text-[#333]
                shadow-lg
                whitespace-normal break-words
              `}
            >
            {/* 吹き出しの三角形 */}
            {placement === "right" && (
              <div className="absolute -left-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-l border-t border-[#7D2248]/30 bg-[#fff7fb]" />
            )}
            {placement === "bottom" && (
              <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rotate-45 border-l border-t border-[#7D2248]/30 bg-[#fff7fb]" />
            )}
            {placement === "top" && (
              <div className="absolute left-1/2 bottom-0 h-2.5 w-2.5 translate-y-1/2 -translate-x-1/2 rotate-45 border-b border-r border-[#7D2248]/30 bg-[#fff7fb]" />
            )}
            {placement === "left" && (
              <div className="absolute -right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-[#7D2248]/30 bg-[#fff7fb]" />
            )}

            {/* 上部ラベル（Click ヒント） */}
            {showClickHint && (
              <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#f6e8f2] px-2 py-[2px] text-[10px] font-semibold text-[#7D2248]">
                <MousePointerClick className="h-3 w-3" />
                <span>Click</span>
              </div>
            )}

            {/* メインメッセージ */}
            <div className={hasMessage ? "mt-0.5" : ""}>
              {hasMessage &&
                message.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}

              {hasFooter && (
                <div className="mt-2 flex justify-end gap-2">
                  {secondaryHandler && (
                    <button
                      type="button"
                      onClick={secondaryHandler}
                      className="rounded-[4px] border border-[#7D2248]/30 bg-white/90 px-3 py-[3px] text-[11px] font-semibold text-[#555] shadow-sm hover:bg-[#f3e9f3]"
                    >
                      {secondaryText}
                    </button>
                  )}
                  {primaryHandler && (
                    <button
                      type="button"
                      onClick={primaryHandler}
                      className="rounded-[4px] border border-[#7D2248]/40 bg-white/90 px-3 py-[3px] text-[11px] font-semibold text-[#7D2248] shadow-sm hover:bg-[#7D2248] hover:text-white"
                    >
                      {primaryText}
                    </button>
                  )}
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
