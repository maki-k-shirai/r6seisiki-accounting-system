"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type Props = {
  onClose?: () => void
  variant?: "modal" | "page"
}

const NOTE_RESTRICTED_ASSETS_PDF = "/pdf/note_restricted_assets_r6_sample.pdf"

export function RestrictedAssetsManagementGuide({
  onClose,
  variant = "modal",
}: Props) {
  const isPage = variant === "page"
  const router = useRouter()

  const steps = useMemo(
    () => [
      { id: "what", title: "使途拘束資産とは？" },
      { id: "why", title: "何が変わった？" },
      { id: "report", title: "何を報告する？" },
      { id: "how", title: "どう管理する？" },
    ] as const,
    [],
  )

  const [activeStepId, setActiveStepId] = useState<(typeof steps)[number]["id"]>(
    "what",
  )
  const [reportPdfOpen, setReportPdfOpen] = useState(false)
  const [goUnitModalOpen, setGoUnitModalOpen] = useState(false)
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
            Overview
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            使途拘束資産の管理：概要
          </div>
        </div>
        {onClose ? (
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            終了
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
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

        <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-slate-800">
          {activeStepId === "what" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-xl font-semibold">1. 使途拘束資産とは？</div>
                <div className="rounded-[6px] border border-[#f3cfe0] bg-[#fff7fb] p-4 text-base leading-relaxed">
                  <div className="font-semibold">使い道が決まっている資産のこと。</div>
                </div>

                <div className="space-y-2">
                  <div className="rounded-[6px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 text-left text-[14px] font-semibold text-slate-600 sm:text-[15px]">
                      「誰が使い道を決めたか？」により３種類あります。
                    </div>
                    <div className="relative mx-auto h-[340px] w-[340px] overflow-hidden sm:h-[380px] sm:w-[380px]">
                      <div className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50/70" />

                      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-slate-300 bg-white px-3 py-1 text-[16px] font-bold text-slate-700 sm:text-[17px]">
                        使途拘束資産（広義）
                      </div>

                      <div className="absolute left-[29%] top-[31%] z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-slate-300 bg-slate-100 p-2 text-center sm:h-28 sm:w-28">
                        <div className="text-[12px] font-semibold leading-tight text-slate-700">
                          法人
                          <br />
                          （内部）
                        </div>
                      </div>

                      <div className="absolute left-1/2 top-1/2 z-30 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#cfe0f5] bg-[#eef6ff] p-3 text-center shadow-[0_8px_18px_rgba(31,78,121,0.24)] sm:h-44 sm:w-44">
                        <div className="text-[15px] font-bold leading-tight text-[#1f4e79] sm:text-[16px]">
                          法律
                        </div>
                        <div className="mt-1 text-[13px] font-semibold text-[#1f4e79]">
                          （控除対象財産）
                        </div>
                      </div>

                      <div className="absolute left-[71%] top-[69%] z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-slate-300 bg-slate-100 p-2 text-center sm:h-28 sm:w-28">
                        <div className="text-[12px] font-semibold leading-tight text-slate-700">
                          　　資金提供者
                          <br />
                          　　（外部）
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[6px] border border-[#cfe0f5] bg-[#eef6ff] p-2 text-[14px] font-semibold text-[#1f4e79]">
                    今回の対象は、『法律によって、使い道が拘束されている資産 = 控除対象財産』です。
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
          ) : null}

          {activeStepId === "why" ? (
            <div className="space-y-4">
              <div className="text-xl font-semibold">2. 何が変わった？</div>
              <div className="text-[14px] leading-relaxed text-slate-700">
                控除対象財産（使途拘束資産）は、公益法人がルールを守っているかの算定基礎となるため、行政庁への報告が必要です。
              </div>
              <div className="space-y-4">
                <div className="rounded-[8px] border border-slate-300 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-700">従来</div>
                  <div className="mt-3 rounded-[6px] border border-slate-300 bg-white p-4">
                    <div className="grid h-[72px] grid-cols-[minmax(94px,1fr)_64px_minmax(110px,1fr)_32px_minmax(100px,1fr)] items-center gap-2">
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-slate-300 bg-slate-50 px-2 text-center font-semibold text-slate-700">
                        会計データ
                      </div>
                      <div className="whitespace-nowrap text-center text-[12px] font-semibold text-slate-600">
                        →（転記）→
                      </div>
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-slate-300 bg-slate-50 px-2 text-center font-semibold text-slate-700">
                        定期提出書類
                      </div>
                      <div className="text-center text-xl text-slate-500">→</div>
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-slate-300 bg-white px-4 text-center font-semibold text-slate-700">
                        行政庁
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#cfe0f5] bg-[#eef6ff] p-4">
                  <div className="text-sm font-semibold text-[#1f4e79]">令和6年基準</div>
                  <div className="mt-3 rounded-[6px] border border-[#cfe0f5] bg-white p-4">
                    <div className="grid h-[72px] grid-cols-[minmax(120px,1fr)_32px_minmax(140px,1fr)_32px_minmax(100px,1fr)] items-center gap-2">
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-[#cfe0f5] bg-[#f7fbff] px-4 text-center font-semibold text-[#1f4e79]">
                        会計データ
                      </div>
                      <div className="mx-auto h-[2px] w-full rounded-full bg-[#8ab2d6]" />
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-[#cfe0f5] bg-[#f7fbff] px-4 text-center font-semibold text-[#1f4e79]">
                        決算書（注記）
                      </div>
                      <div className="text-center text-xl text-[#8ab2d6]">→</div>
                      <div className="flex h-[52px] items-center justify-center rounded-[6px] border border-[#cfe0f5] bg-white px-4 text-center font-semibold text-[#1f4e79]">
                        行政庁
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm font-semibold text-slate-800">
                行政提出書類ではなく、会計書類として報告することになりました。
                <br />
                そこで、会計システムが管理・出力を引き受けます。
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("what")}
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
          ) : null}

          {activeStepId === "report" ? (
            <div className="space-y-6">
              <div className="text-xl font-semibold">3. 何を報告する？</div>
              <div className="text-[14px] leading-relaxed text-slate-700">
                法令に基づく控除対象財産について、
                <br />
                区分ごとに内容・増減・残高を報告します。
              </div>
              <div className="rounded-[8px] border border-[#cfe0f5] bg-[#eef6ff] p-4">
                <div className="rounded-[6px] border border-[#cfe0f5] bg-white p-4 text-[14px] leading-relaxed text-slate-800">
                  <div className="font-semibold">控除対象財産（⚪︎号）</div>
                  <div className="mt-2">・名称</div>
                  <div>・内容（場所や使用状況など）</div>
                  <div>・期首残高</div>
                  <div>・当期増減</div>
                  <div>・期末残高</div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setReportPdfOpen(true)}
                  className="inline-flex h-8 items-center gap-1 rounded border border-[#7D2248] bg-white px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                >
                  <FileText className="h-3 w-3" />
                  実際の注記を見る
                </button>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("why")}
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
          ) : null}

          {activeStepId === "how" ? (
            <div className="space-y-5">
              <div className="text-xl font-semibold">4. どう管理する？</div>
              <div className="text-[15px] leading-relaxed text-slate-700">
                控除対象財産を「号」という単位で整理し、
                <br />
                対象科目を紐付け、
                <br />
                決算時に注記へ自動反映します。
              </div>
              <div className="rounded-[8px] border border-[#cfe0f5] bg-[#eef6ff] p-4">
                <div className="mx-auto flex max-w-[430px] flex-col items-center text-center text-[15px] font-semibold text-slate-800">
                  <div className="relative w-[260px]">
                    <div className="w-[260px] rounded-[6px] border border-[#cfe0f5] bg-white px-4 py-3">
                      ① 号を設定
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoUnitModalOpen(true)}
                      className="absolute left-full top-1/2 ml-2 inline-flex h-8 min-w-max -translate-y-1/2 items-center whitespace-nowrap rounded border border-[#7D2248] bg-[#fff0f5] px-4 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                    >
                      ▶ 「号」について詳しく見る
                    </button>
                  </div>
                  <div className="py-2 text-lg text-[#8ab2d6]">↓</div>
                  <div className="w-[260px] rounded-[6px] border border-[#cfe0f5] bg-white px-4 py-3">
                    ② 対象科目を紐付け
                  </div>
                  <div className="py-2 text-lg text-[#8ab2d6]">↓</div>
                  <div className="w-[260px] rounded-[6px] border border-[#cfe0f5] bg-white px-4 py-3">
                    ③ 注記へ自動反映
                  </div>
                </div>
              </div>
              <div className="text-[14px] leading-relaxed text-slate-700">
                事前に整理しておくことで、決算時に自動で反映されます。
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 text-sm"
                  onClick={() => setActiveStepId("report")}
                >
                  戻る
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() =>
                    router.push("/home?workspace=blank&menuGuide=master-root")
                  }
                >
                  システム画面を見る
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={reportPdfOpen} onOpenChange={setReportPdfOpen}>
        <DialogContent
          titleText="使途拘束資産 注記（サンプル）"
          className="h-[min(80vh,800px)] w-[min(90vw,1000px)] rounded-[6px] border border-[#7a9bc4] bg-white p-0"
        >
          <div className="flex items-center justify-between border-b border-[#7a9bc4] bg-[#eef2fa] px-3 py-2 text-[12px]">
            <span className="font-medium text-[#1a1a1a]">使途拘束資産 注記（サンプル）</span>
            <button
              type="button"
              onClick={() => setReportPdfOpen(false)}
              className="h-[20px] w-[20px] rounded-[3px] border border-[#7a9bc4] bg-white text-[12px] text-[#1a1a1a] hover:bg-[#e6edf9]"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
          <div className="h-[calc(100%-32px)] w-full bg-[#dfe6f5]">
            <iframe
              src={NOTE_RESTRICTED_ASSETS_PDF}
              title="使途拘束資産 注記（サンプル）"
              className="h-full w-full bg-white"
            />
          </div>
          <div className="border-t border-[#7a9bc4] bg-[#eef2fa] px-3 py-2 text-[12px] text-slate-700">
            この形式で、控除対象財産の状況を報告します。
          </div>
          <DialogTitle className="sr-only">使途拘束資産 注記（サンプル）</DialogTitle>
        </DialogContent>
      </Dialog>

      <Dialog open={goUnitModalOpen} onOpenChange={setGoUnitModalOpen}>
        <DialogContent
          titleText="使途拘束資産（控除対象財産）とは？"
          className="w-[min(860px,95vw)] max-w-[860px] rounded-[6px] border border-[#7a9bc4] bg-white p-0"
        >
          <div className="flex items-center justify-between border-b border-[#7a9bc4] bg-[#eef2fa] px-3 py-2 text-[12px]">
            <span className="font-medium text-[#1a1a1a]">使途拘束資産（控除対象財産）とは？</span>
            <button
              type="button"
              onClick={() => setGoUnitModalOpen(false)}
              className="h-[20px] w-[20px] rounded-[3px] border border-[#7a9bc4] bg-white text-[12px] text-[#1a1a1a] hover:bg-[#e6edf9]"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
          <div className="max-h-[72vh] overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-800">
            <div className="space-y-3">
              <div>
                法人が保有する財産のうち、
                <br />
                具体的な使い道が決まっており、現に使用している、または将来使う予定のある財産です。
              </div>
              <div>
                公益法人は「使い道の決まっていない財産」を過大に持てませんが、
                <br />
                これらはその計算から控除できる財産です。
              </div>
            </div>

            <div className="mt-4 rounded-[8px] border border-[#cfe0f5] bg-[#f7fbff] p-3">
              <div className="font-semibold text-[#1f4e79]">各号（カテゴリー）の概要</div>
              <div className="mt-2 space-y-2">
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">1号：公益目的保有財産</summary>
                  <div className="mt-1 text-slate-700">
                    公益事業のために継続して使う財産
                    <br />
                    例：事業用の土地・建物、基本財産
                  </div>
                </details>
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">2号：法人活動保有財産</summary>
                  <div className="mt-1 text-slate-700">
                    管理業務や収益事業で使っている財産
                    <br />
                    例：管理部門の設備、収益事業用資産
                  </div>
                </details>
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">3号：公益充実資金</summary>
                  <div className="mt-1 text-slate-700">
                    将来の公益事業のために計画的に積み立てた資金
                    <br />
                    例：新規公益プロジェクトの準備資金
                  </div>
                </details>
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">4号：資産取得資金</summary>
                  <div className="mt-1 text-slate-700">
                    公益以外の用途で特定の資産取得のために積み立てた資金
                  </div>
                </details>
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">5号：特定費用準備資金</summary>
                  <div className="mt-1 text-slate-700">
                    公益以外の用途で将来発生する特定の費用のための積立資金
                  </div>
                </details>
                <details className="rounded-[6px] border border-slate-200 bg-white p-2">
                  <summary className="cursor-pointer font-semibold">6号：指定寄附資金</summary>
                  <div className="mt-1 text-slate-700">
                    寄附者が使い道を指定した資金
                  </div>
                </details>
              </div>
            </div>

            <div className="mt-4 rounded-[8px] border border-[#e3cad7] bg-[#fff7fb] p-3">
              <div className="font-semibold text-[#7D2248]">なぜ分けるのか？</div>
              <div className="mt-2 text-slate-700">家計に例えると：</div>
              <div className="mt-2 grid gap-2 md:grid-cols-[0.8fr_1.6fr]">
                <div className="rounded-[6px] border border-slate-200 bg-white p-3">
                  <div className="font-semibold">使途不特定財産</div>
                  <div className="mt-1 text-slate-700">ただの貯金</div>
                </div>
                <div className="rounded-[6px] border border-slate-200 bg-white p-3">
                  <div className="font-semibold">控除対象財産</div>
                  <div className="mt-1 text-slate-700">・今使っている家や仕事道具（1・2号）</div>
                  <div className="mt-1 text-slate-700">・将来の旅行や車の買い替えのために貯めているお金（3〜5号）</div>
                  <div className="mt-1 text-slate-700">・親から“孫の学費に使ってね”と預かったお金（6号）</div>
                </div>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-[0.8fr_1.6fr]">
                <div className="hidden md:block" />
                <div className="text-slate-700">
                  これらは正当な理由があって保有している財産として区別されます。
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t bg-slate-50 px-3 py-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setGoUnitModalOpen(false)}>
              閉じる
            </Button>
          </div>
          <DialogTitle className="sr-only">使途拘束資産（控除対象財産）とは？</DialogTitle>
        </DialogContent>
      </Dialog>
    </section>
  )
}
