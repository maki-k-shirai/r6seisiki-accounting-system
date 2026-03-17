"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, FileDown } from "lucide-react"

type Props = {
  onClose?: () => void
  variant?: "modal" | "page"
}

export function MigrationNotesGuide({
  onClose,
  variant = "modal",
}: Props) {
  const isPage = variant === "page"

  const steps = useMemo(
    () => [
      { id: "overview", title: "移行の仕組み" },
      { id: "partial", title: "引き継がれない設定" },
      { id: "csv", title: "変換不可データリスト" },
      { id: "checklist", title: "移行後の確認事項" },
    ] as const,
    [],
  )

  const [activeStepId, setActiveStepId] = useState<(typeof steps)[number]["id"]>(
    "overview",
  )
  const activeIndex = steps.findIndex((step) => step.id === activeStepId)
  const isLastStep = activeIndex === steps.length - 1

  const handleNextStep = () => {
    if (isLastStep) return
    setActiveStepId(steps[activeIndex + 1].id)
  }

  return (
    <section
      className={
        isPage
          ? "mt-2"
          : "mt-2 max-h-[90vh] w-[980px] max-w-[95vw] overflow-y-auto"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            はじめにお読みください
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            移行時の注意点：マスタ設定について
          </div>
        </div>
        {onClose ? (
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            終了
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
        {/* ステップナビ */}
        <div className="rounded-[6px] border border-[#e3cad7] bg-white p-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepId(step.id)}
              className={[
                "w-full rounded-[4px] px-3 py-2.5 text-left text-[14px] transition",
                activeStepId === step.id
                  ? "bg-[#7D2248] text-white"
                  : "text-black hover:bg-[#fff0f5]",
              ].join(" ")}
            >
              {index + 1}. {step.title}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-slate-800">

          {/* ── ステップ1：移行の仕組み ── */}
          {activeStepId === "overview" && (
            <div className="space-y-5">
              <div className="text-xl font-semibold">1. 移行の仕組み</div>

              <div className="rounded-[6px] border border-[#f3cfe0] bg-[#fff7fb] p-4 text-[15px] leading-relaxed">
                旧基準でご利用いただいていた一部のマスタ設定は、新基準への移行時に
                <span className="font-semibold">新しい科目コードへ変換したうえで引き継がれます。</span>
                <br />
                基本的には、移行後すぐにご利用いただけるように設定が反映されます。
              </div>

              <div className="rounded-[8px] border border-[#cfe0f5] bg-[#eef6ff] p-4">
                <div className="text-[14px] font-semibold text-[#1f4e79]">変換の前提条件</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[6px] border border-[#cfe0f5] bg-white p-3 text-[13px] text-slate-700">
                    <div className="font-semibold text-slate-800">会計体系の構成が変わっていないこと</div>
                    <div className="mt-1">旧基準と新基準で、会計の組み立て方が同じであることが前提です</div>
                  </div>
                  <div className="rounded-[6px] border border-[#cfe0f5] bg-white p-3 text-[13px] text-slate-700">
                    <div className="font-semibold text-slate-800">旧・新の科目が対応していること</div>
                    <div className="mt-1">旧基準の科目と新基準の科目が1対1で対応しているものを対象に変換します</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                  onClick={handleNextStep}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}

          {/* ── ステップ2：引き継がれない設定 ── */}
          {activeStepId === "partial" && (
            <div className="space-y-5">
              <div className="text-xl font-semibold">2. 引き継がれない設定</div>

              <div className="rounded-[6px] border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="text-[14px] leading-relaxed text-amber-800">
                    すべての設定が完全に引き継がれるとは限りません。
                    新基準に対応する科目が存在しない場合や、旧・新の科目が単純に対応づけられない場合は、
                    <span className="font-semibold">一部の設定が移行されないことがあります。</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-[14px] font-semibold text-slate-700">
                  特に移行結果を確認していただきたい設定
                </div>
                <ul className="mt-3 grid gap-1.5 md:grid-cols-2">
                  {[
                    "摘要",
                    "消費税区分",
                    "按分設定",
                    "関係者別科目",
                    "決裁区分条件設定",
                    "起案・伺書設定",
                    "科目ユーザー設定",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7D2248]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("overview")}
                >
                  戻る
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                  onClick={handleNextStep}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}

          {/* ── ステップ3：変換不可データリスト ── */}
          {activeStepId === "csv" && (
            <div className="space-y-5">
              <div className="text-xl font-semibold">3. 変換不可データリスト</div>

              <div className="text-[14px] leading-relaxed text-slate-700">
                移行できなかった設定がある場合、以下のファイルが出力されます。
              </div>

              <div className="rounded-[8px] border border-[#cfe0f5] bg-[#eef6ff] p-4">
                <div className="flex items-center gap-3">
                  <FileDown className="h-8 w-8 shrink-0 text-[#1f4e79]" />
                  <div>
                    <div className="text-[16px] font-bold text-[#1f4e79]">変換不可データリスト.csv</div>
                    <div className="mt-0.5 text-[13px] text-[#2d6ca8]">移行後に出力されるファイルです</div>
                  </div>
                </div>
                <div className="mt-3 rounded-[6px] border border-[#cfe0f5] bg-white p-3 text-[13px] leading-relaxed text-slate-700">
                  このファイルには、変換できなかった設定の内容が一覧で記載されています。
                  <br />
                  <span className="font-semibold">移行後に必ずご確認ください。</span>
                </div>
              </div>

              <div className="rounded-[6px] border border-slate-200 bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-600">
                ファイルが出力されなかった場合は、すべての設定が正常に引き継がれています。
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("partial")}
                >
                  戻る
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                  onClick={handleNextStep}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}

          {/* ── ステップ4：移行後の確認事項 ── */}
          {activeStepId === "checklist" && (
            <div className="space-y-5">
              <div className="text-xl font-semibold">4. 移行後の確認事項</div>

              <div className="text-[14px] leading-relaxed text-slate-700">
                移行後は、以下の点を重点的にご確認ください。
              </div>

              <div className="space-y-2">
                {[
                  { label: "必要な摘要が引き継がれているか", sub: "よく使う摘要が登録されているかを確認してください" },
                  { label: "消費税区分が正しく設定されているか", sub: "各科目に設定された消費税区分に誤りがないか確認してください" },
                  { label: "按分設定に漏れがないか", sub: "按分が必要な科目で設定が残っているかを確認してください" },
                  { label: "科目に関連する各種条件設定が利用できるか", sub: "決裁・起案・関係者など、科目と紐づく設定を確認してください" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-[6px] border border-slate-200 bg-white p-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7D2248]" />
                    <div>
                      <div className="text-[14px] font-semibold text-slate-800">{item.label}</div>
                      <div className="mt-0.5 text-[12px] text-slate-500">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[6px] border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
                個別の設定内容によっては、移行後に一部を見直していただく必要があります。
                不明な点は担当者にご相談ください。
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("csv")}
                >
                  戻る
                </Button>
                {onClose && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                    onClick={onClose}
                  >
                    閉じる
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
