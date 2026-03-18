// app/(screens)/net-assets-statement/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"

// ===== モックデータ =====
// 仕訳例：
//   借方 959000（指定） 1,200,000 / 貸方 959000（一般） 1,200,000
// → 一般純資産列 = 貸方金額のプラス(+1,200,000)
// → 指定純資産列 = 借方金額のマイナス(-1,200,000)

type Row = {
  label: string
  general: number | null  // 一般純資産
  designated: number | null  // 指定純資産
  isTransfer?: boolean  // 振替額行（新規追加行）
  isSubtotal?: boolean
  isTotal?: boolean
  isBold?: boolean
  indent?: number
}

const ROWS: Row[] = [
  {
    label: "当期収益費用差額",
    general: 5_820_000,
    designated: 0,
    isBold: true,
  },
  {
    label: "指定純資産から一般純資産への振替額",
    general: 1_200_000,
    designated: -1_200_000,
    isTransfer: true,
    isBold: true,
  },
  {
    label: "期首一般純資産又は期首指定純資産",
    general: 42_500_000,
    designated: 15_800_000,
    isBold: true,
  },
  {
    label: "期末一般純資産又は期末指定純資産",
    general: 49_520_000,
    designated: 14_600_000,
    isBold: true,
    isTotal: true,
  },
]

// ===== フォーマット =====
function formatAmount(v: number | null): string {
  if (v === null) return ""
  if (v === 0) return "－"
  const abs = Math.abs(v).toLocaleString("ja-JP")
  return v < 0 ? `△${abs}` : abs
}

export default function NetAssetsStatementPage() {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col text-[12px]">
      {/* タイトルバー */}
      <div className="mb-3 flex items-center justify-between border-b border-[#7a9bc4] pb-2">
        <div>
          <div className="text-[14px] font-bold text-[#1a3a6e]">
            財源区分別内訳
          </div>
          <div className="mt-1 text-[11px] text-[#555]">
            令和8年4月1日 〜 令和9年3月31日　　会計：一般財団法人 満喜財団
          </div>
        </div>
        <div className="rounded border border-[#7a9bc4] bg-white px-3 py-1 text-[11px] text-[#555]">
          ※ 仕様検討用モックデータ
        </div>
      </div>

      {/* 説明 */}
      <div className="mb-3 rounded border border-[#c8d8ec] bg-[#f0f4fb] px-3 py-2 text-[11px] text-[#333]">
        <span className="font-bold text-[#1a3a6e]">令和6年基準改正対応：</span>
        「当期収益費用差額」と「期首純資産」の間に
        <span className="mx-1 inline-block rounded bg-[#fff3cd] px-1 font-bold text-[#856404]">
          指定純資産から一般純資産への振替額
        </span>
        行を追加。科目種別3291の金額を財源区分（一般・指定）ごとに集計します。
      </div>

      {/* メインテーブル */}
      <div className="overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#3a5f8a] text-white">
              <th className="border border-[#2a4a70] px-3 py-2 text-left font-normal" style={{ width: "50%" }}>
                科　　目
              </th>
              <th className="border border-[#2a4a70] px-3 py-2 text-right font-normal" style={{ width: "25%" }}>
                一般純資産
              </th>
              <th className="border border-[#2a4a70] px-3 py-2 text-right font-normal" style={{ width: "25%" }}>
                指定純資産
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const isEven = i % 2 === 0
              const bgClass = row.isTransfer
                ? "bg-[#fff8e1]"  // 新規追加行は黄色背景で強調
                : row.isTotal
                ? "bg-[#dce8f5]"
                : isEven
                ? "bg-white"
                : "bg-[#f5f8fd]"

              return (
                <tr key={i} className={bgClass} {...(row.isTransfer ? { "data-specreview": "transfer-row" } : {})}>
                  <td
                    className={[
                      "border border-[#c0cedf] px-3 py-2",
                      row.isBold ? "font-bold" : "",
                      row.isTransfer ? "text-[#7d5a00]" : "",
                      row.isTotal ? "text-[#1a3a6e]" : "",
                    ].join(" ")}
                    style={{ paddingLeft: `${12 + (row.indent ?? 0) * 16}px` }}
                  >
                    <div className="flex items-center gap-2">
                      {row.label}
                      {row.isTransfer && (
                        <span className="rounded bg-[#ffc107] px-1.5 py-0.5 text-[10px] font-bold text-[#4a3000]">
                          R6新規
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={[
                      "border border-[#c0cedf] px-3 py-2 text-right tabular-nums",
                      row.isBold ? "font-bold" : "",
                      row.isTransfer ? "text-[#7d5a00]" : "",
                      row.isTotal ? "text-[#1a3a6e]" : "",
                      row.general !== null && row.general < 0 ? "text-[#c00]" : "",
                    ].join(" ")}
                  >
                    {formatAmount(row.general)}
                  </td>
                  <td
                    className={[
                      "border border-[#c0cedf] px-3 py-2 text-right tabular-nums",
                      row.isBold ? "font-bold" : "",
                      row.isTransfer ? "text-[#7d5a00]" : "",
                      row.isTotal ? "text-[#1a3a6e]" : "",
                      row.designated !== null && row.designated < 0 ? "text-[#c00]" : "",
                    ].join(" ")}
                  >
                    {formatAmount(row.designated)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 仕訳例の注釈 */}
      <div className="mt-4 rounded border border-[#c8d8ec] bg-white p-3">
        <div className="mb-2 font-bold text-[#1a3a6e]">振替仕訳の例（伝票入力）</div>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#e8eef7]">
              <th className="border border-[#c0cedf] px-2 py-1 text-left font-normal">仕訳例</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">借方科目</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">財源区分</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">金額</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">貸方科目</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">財源区分</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#fff8e1]">
              <td className="border border-[#c0cedf] px-2 py-1 text-[#555]">
                事業廃止等で指定解除
              </td>
              <td className="border border-[#c0cedf] px-2 py-1">
                指定純資産から一般純資産への振替額
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-center">
                <span className="rounded bg-[#3a5f8a] px-1.5 py-0.5 text-[10px] text-white">指定</span>
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-right tabular-nums">1,200,000</td>
              <td className="border border-[#c0cedf] px-2 py-1">
                指定純資産から一般純資産への振替額
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-center">
                <span className="rounded bg-[#5a8a3a] px-1.5 py-0.5 text-[10px] text-white">一般</span>
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-right tabular-nums">1,200,000</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 text-[10px] text-[#777]">
          ※ 同一科目コードかつ借方・貸方が指定・一般（逆も可）の組み合わせで入力可能。借方金額はマイナス、貸方金額はプラスで集計。
        </div>
      </div>

      {/* 追加対応ケースの解説 */}
      <div className="mt-4 rounded border border-[#d0d8e8] bg-[#f8f9fc] p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-[#2d3a5a] px-2 py-0.5 text-[10px] font-bold text-white">
            この仕様変更で対応できるようになる別のケース
          </span>
        </div>
        <div className="mb-2 text-[11px] font-bold text-[#1a3a6e]">
          期中の費用を一般で処理し、期末に指定分をまとめて振り替えたい場合
        </div>
        <div className="mb-3 text-[11px] leading-relaxed text-[#444]">
          <span className="font-bold text-[#c00]">現状の課題：</span>
          損益科目（費用・収益）のみで構成される仕訳では、組み合わせに制限がかかりエラーとなる場合があります。
          <br />
          <br />
          <span className="font-bold text-[#2d3a5a]">今回対応できるようになる条件：</span>
          <ul className="mt-1 list-none pl-2">
            <li>・仕訳が１対１（借方１行：貸方１行）</li>
            <li>・借方と貸方が同じ科目コード</li>
            <li>・片方の財源区分が「一般」、もう片方が「指定」</li>
          </ul>
          <br />
          これは「指定純資産から一般純資産への振替」とは別の論点ですが、今回の仕様変更により同じ仕組みで対応できるようになります。
        </div>
        <div className="mb-1 text-[11px] font-bold text-[#1a3a6e]">仕訳例</div>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#e8eef7]">
              <th className="border border-[#c0cedf] px-2 py-1 text-left font-normal">ケース</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">借方科目</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">財源区分</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">金額</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">貸方科目</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">財源区分</th>
              <th className="border border-[#c0cedf] px-2 py-1 text-center font-normal">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-[#c0cedf] px-2 py-1 text-[#555]">
                期中一般処理→期末に指定へ振替
              </td>
              <td className="border border-[#c0cedf] px-2 py-1">給料手当</td>
              <td className="border border-[#c0cedf] px-2 py-1 text-center">
                <span className="rounded bg-[#3a5f8a] px-1.5 py-0.5 text-[10px] text-white">指定</span>
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-right tabular-nums">500,000</td>
              <td className="border border-[#c0cedf] px-2 py-1">給料手当</td>
              <td className="border border-[#c0cedf] px-2 py-1 text-center">
                <span className="rounded bg-[#5a8a3a] px-1.5 py-0.5 text-[10px] text-white">一般</span>
              </td>
              <td className="border border-[#c0cedf] px-2 py-1 text-right tabular-nums">500,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
