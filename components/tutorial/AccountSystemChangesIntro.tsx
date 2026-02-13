// components/tutorial/AccountSystemChangesIntro.tsx
"use client"

import { useState } from "react"
import { FileText, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog"

type Props = {
  onClose?: () => void
  onStartTutorial: () => void
  variant?: "modal" | "page"
}

export function AccountSystemChangesIntro({
  onClose,
  onStartTutorial,
  variant = "modal",
}: Props) {
  const isPage = variant === "page"
  const [incomeImageOpen, setIncomeImageOpen] = useState(false)
  return (
    <div
      className={
        "flex flex-col rounded-xl bg-white " +
        (isPage
          ? "w-full max-w-none shadow-none"
          : "max-h-[90vh] w-[980px] max-w-[95vw] overflow-hidden shadow-2xl")
      }
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Overview
          </div>
          <div className="text-lg font-semibold text-slate-900">
            科目体系の変更：概要
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="閉じる"
          >
            <XIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {/* 本文エリア */}
      <div
        className={
          "px-5 py-4 text-base text-slate-800 " +
          (isPage ? "" : "min-h-0 flex-1 overflow-y-auto")
        }
      >
        {/* 4つのポイントをカードで並べる */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 1. 基本財産・特定資産の廃止 */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                1
              </span>
              <span className="text-base font-semibold text-slate-900">
                基本財産・特定資産の「箱」がなくなる
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm leading-relaxed text-slate-700">
              <li>貸借対照表の「基本財産」「特定資産」のまとまりが廃止</li>
              <li>中身は「現金預金・有価証券など」に分かれて表示</li>
            </ul>
            {/* 簡易図解 */}
            <div className="mt-3 rounded border border-dashed border-slate-300 bg-white p-2.5">
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    旧：基本財産・特定資産
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    新：現金預金
                  </div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    新：有価証券
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 預金・有価証券配下の管理ラベル */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                2
              </span>
              <span className="text-base font-semibold text-slate-900">
                預金・有価証券科目の下階層で「目的」を持つ
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm leading-relaxed text-slate-700">
              <li>普通預金科目などの下の階層に「（基本財産）」「（特定財産）」などを追加</li>
              <li>外部表示はシンプル、内部管理は従来どおり目的別</li>
            </ul>
            <div className="mt-3 rounded border border-dashed border-slate-300 bg-white p-2.5">
              <div className="mt-2 text-sm leading-snug">
                普通預金
                <br />
                ├ 普通預金A（運転資金）
                <br />
                ├ 普通預金B（基本財産）
                <br />
                └ 普通預金C（特定資産）
              </div>
            </div>
          </div>

          {/* 3. 固定資産の区分とソフトウェア累計額 */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                3
              </span>
              <span className="text-base font-semibold text-slate-900">
                固定資産は3区分＋ソフトウェア累計額
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm leading-relaxed text-slate-700">
              <li>固定資産は「有形・無形・その他」の3分類に変更</li>
              <li>「ソフトウェア減価償却累計額」が新たに追加</li>
            </ul>
            <div className="mt-3 rounded border border-dashed border-slate-300 bg-white p-2.5">
              <div className="text-xs font-semibold text-slate-500">
                固定資産の見え方（旧 → 新）
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    旧：基本財産
                  </div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    旧：特定資産
                  </div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    旧：その他固定資産
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    新：有形固定資産
                  </div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    新：無形固定資産
                  </div>
                  <div className="rounded border bg-slate-50 px-2 py-1 text-center">
                    新：その他固定資産
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm leading-snug text-slate-700">
              無形固定資産の中に
              <span className="font-semibold">「ソフトウェア減価償却累計額」</span>
              が新たに追加されます。
            </p>
          </div>

          {/* 4. 資産運用収入に一本化（選択制） */}
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                4
              </span>
              <span className="text-base font-semibold text-slate-900">
                収支科目の体系を、最初に選択する
              </span>
            </div>
            <ul className="ml-4 list-disc text-sm leading-relaxed text-slate-700">
              <li>正式版では、収支科目の構成に2つの体系があります</li>
              <li>従来の科目体系 or CF計算書科目に準じる科目体系</li>
              <li>どちらの体系を使うかで、収支科目の構成・見え方が変わります</li>
            </ul>
            <div className="mt-3 rounded border border-dashed border-slate-300 bg-white p-2.5">
              <div className="text-xs font-semibold text-slate-500">
                押さえどころ
              </div>
              <div className="mt-2 text-sm leading-snug">
                正式版への移行の際に、
                <br />
                収支科目をどちらの体系で構成するかを最初に決めます（マスタ班より確認）。
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                size="sm"
                className="inline-flex h-8 items-center gap-1 border border-[#7D2248] bg-[#fff0f5] px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                onClick={() => setIncomeImageOpen(true)}
              >
                <FileText className="h-3 w-3" />
                詳細を見る
              </Button>
            </div>
          </div>

        </section>

        {/* まとめ＋次のアクション */}
        <section className="mt-5 rounded-lg border-l-4 border-[#7D2248] bg-[#fff7fb] px-3 py-3">
          <p className="text-base leading-relaxed">
            次のステップでは、実際の画面を使って
            <span className="font-semibold">
              「どこでこの変更が反映されているか」
            </span>
            を確認していきます。
          </p>
        </section>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between gap-2 border-t bg-slate-50 px-5 py-3">
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            閉じる
          </Button>
        ) : (
          <span />
        )}

  <Button
    onClick={onStartTutorial}
    className="
      rounded bg-[#7D2248] px-4 py-2 text-sm font-semibold text-white 
      hover:bg-[#681b3d] transition
    "
  >
    次へ
  </Button>
      </div>
      <PdfPreviewDialog
        open={incomeImageOpen}
        onClose={() => setIncomeImageOpen(false)}
        src="/pdf/income-structure-branching.png"
        title="収支科目の体系（イメージ）"
      />
    </div>
  )
}
