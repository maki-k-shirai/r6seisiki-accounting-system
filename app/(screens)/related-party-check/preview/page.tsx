// app/(screens)/related-party-check/preview/page.tsx
"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"

// ===== モックデータ =====

const mockShuukei = {
  shisan: 150_000_000,      // 資産合計 1.5億
  keijyoShueki: 80_000_000, // 経常収益合計 8千万
  keijyoHiyou: 75_000_000,  // 経常費用合計 7.5千万
  ippanSeimi: 5_000_000,    // 一般正味増減（旧基準のみ表示）
}

const KANREN_KBN = [
  { kbn: 1,  circled: "①", name: "当該公益法人を支配する法人",                      syubetsu: "法人", isNew: false },
  { kbn: 2,  circled: "②", name: "当該公益法人によって支配される法人",              syubetsu: "法人", isNew: false },
  { kbn: 3,  circled: "③", name: "当該公益法人と同一の支配法人をもつ法人",          syubetsu: "法人", isNew: false },
  { kbn: 4,  circled: "④", name: "当該公益法人の役員及びその近親者",                syubetsu: "個人", isNew: false },
  { kbn: 5,  circled: "⑤", name: "当該公益法人の役員等が支配する法人",              syubetsu: "法人", isNew: true  },
  { kbn: 6,  circled: "⑥", name: "当該公益法人の従業員及びその近親者",              syubetsu: "個人", isNew: true  },
  { kbn: 7,  circled: "⑦", name: "当該公益社団法人の非法人社員又は基金拠出者等",    syubetsu: "個人", isNew: true  },
  { kbn: 8,  circled: "⑧", name: "当該公益財団法人の非法人設立者等",                syubetsu: "個人", isNew: true  },
  { kbn: 9,  circled: "⑨", name: "当該公益法人の法人社員・基金拠出者・設立者",      syubetsu: "法人", isNew: true  },
  { kbn: 10, circled: "⑩", name: "区分９の法人の親法人又は子法人",                  syubetsu: "法人", isNew: true  },
]

type Torihiki = {
  kanrenKbn: number
  kankName: string
  checkKbn: 11 | 12  // 11=ア.正味財産増減計算書, 12=イ.貸借対照表
  kamokuCd: string
  kamokuName: string
  kingaku: number
  naiyo: string
}

const MOCK_TORIHIKI: Torihiki[] = [
  {
    kanrenKbn: 1, kankName: "○○ホールディングス株式会社",
    checkKbn: 11, kamokuCd: "0100", kamokuName: "受取会費",
    kingaku: 1_200_000, naiyo: "経常収益合計の100分の10 以上",
  },
  {
    kanrenKbn: 1, kankName: "○○ホールディングス株式会社",
    checkKbn: 12, kamokuCd: "1100", kamokuName: "未収金",
    kingaku: 2_000_000, naiyo: "資産合計の100分の1 以上",
  },
  {
    kanrenKbn: 4, kankName: "山田 太郎",
    checkKbn: 11, kamokuCd: "0210", kamokuName: "支払報酬",
    kingaku: 1_200_000, naiyo: "100万円 以上",
  },
  {
    kanrenKbn: 5, kankName: "△△コンサルティング合同会社",
    checkKbn: 11, kamokuCd: "0210", kamokuName: "支払報酬",
    kingaku: 1_500_000, naiyo: "経常費用合計の100分の10 以上",
  },
  {
    kanrenKbn: 6, kankName: "鈴木 花子",
    checkKbn: 12, kamokuCd: "1100", kamokuName: "未収金",
    kingaku: 1_500_000, naiyo: "100万円 以上",
  },
]

// ===== ユーティリティ =====

function fmtKingaku(v: number): string {
  return v.toLocaleString("ja-JP") + "円"
}

function fmtKijun(v: number): string {
  return v.toLocaleString("ja-JP") + "円"
}

// ===== コンポーネント =====

function KijunToggle({
  kijun,
  onChange,
}: {
  kijun: "r6" | "h20"
  onChange: (v: "r6" | "h20") => void
}) {
  return (
    <div className="flex items-center gap-1 rounded border border-[#7a9bc4] bg-white p-1 text-[11px]">
      <button
        type="button"
        onClick={() => onChange("r6")}
        className={`rounded px-3 py-1 font-semibold transition ${
          kijun === "r6"
            ? "bg-[#2d3a5a] text-white"
            : "text-[#555] hover:bg-[#eef]"
        }`}
      >
        令和６年基準
      </button>
      <button
        type="button"
        onClick={() => onChange("h20")}
        className={`rounded px-3 py-1 font-semibold transition ${
          kijun === "h20"
            ? "bg-[#666] text-white"
            : "text-[#555] hover:bg-[#eef]"
        }`}
      >
        平成20年基準（旧）
      </button>
    </div>
  )
}

function PreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialKijun = searchParams.get("kijun") === "h20" ? "h20" : "r6"

  const [kijun, setKijun] = useState<"r6" | "h20">(initialKijun)

  const isR6 = kijun === "r6"

  // 基準金額計算
  const kijunShisan   = Math.floor(mockShuukei.shisan / 100)
  const kijunShueki   = Math.floor(mockShuukei.keijyoShueki / 10)
  const kijunHiyou    = Math.floor(mockShuukei.keijyoHiyou / 10)
  const kijunSeimi    = Math.floor(mockShuukei.ippanSeimi / 10)

  // 表示する区分（旧基準は1〜4のみ）
  const visibleKbn = isR6
    ? KANREN_KBN
    : KANREN_KBN.filter((k) => k.kbn <= 4)

  // 区分別・関係者別に取引をグルーピング
  const torihikiByKbn: Record<number, Record<string, Torihiki[]>> = {}
  for (const t of MOCK_TORIHIKI) {
    if (!isR6 && t.kanrenKbn > 4) continue
    if (!torihikiByKbn[t.kanrenKbn]) torihikiByKbn[t.kanrenKbn] = {}
    if (!torihikiByKbn[t.kanrenKbn][t.kankName]) torihikiByKbn[t.kanrenKbn][t.kankName] = []
    torihikiByKbn[t.kanrenKbn][t.kankName].push(t)
  }

  return (
    <div className="flex h-full flex-col text-[12px]">
      <FunctionKeyBar
        onExit={() => console.log("終了")}
        onBack={() => router.push("/related-party-check")}
        onF7={() => console.log("CSV出力")}
        onF7Label="CSV"
      />

      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-[#7a9bc4] px-4 pb-2 pt-3">
        <div>
          <div className="text-[14px] font-bold text-[#1a3a6e]">関連当事者への取引チェック</div>
          <div className="mt-0.5 text-[11px] text-[#555]">
            公益会計（001）　一般財団法人 公益サポート機構　令和6年度
          </div>
          <div className="text-[10px] text-[#888]">出力日時：2024/03/27 10:00</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <KijunToggle kijun={kijun} onChange={setKijun} />
          <div className="rounded border border-[#7a9bc4] bg-white px-3 py-1 text-[11px] text-[#555]">
            ※ 仕様検討用モックデータ
          </div>
        </div>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {/* ===== 基準金額セクション ===== */}
        <div className="mt-4 mb-1 text-[11px] font-semibold text-[#333]">【基準金額】</div>

        <div className="mb-1 w-[460px] rounded border border-[#7a9bc4] bg-white">
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr className="border-b border-[#e0e8f0]">
                <td className="px-3 py-1.5 text-[#333]">資産合計の100分の1</td>
                <td className="px-3 py-1.5 text-right font-semibold text-[#1a1a1a]">
                  {fmtKijun(kijunShisan)}
                </td>
              </tr>
              <tr className="border-b border-[#e0e8f0]">
                <td className="px-3 py-1.5 text-[#333]">経常収益合計の100分の10</td>
                <td className="px-3 py-1.5 text-right font-semibold text-[#1a1a1a]">
                  {fmtKijun(kijunShueki)}
                </td>
              </tr>
              <tr className={isR6 ? "" : "border-b border-[#e0e8f0]"}>
                <td className="px-3 py-1.5 text-[#333]">経常費用合計の100分の10</td>
                <td className="px-3 py-1.5 text-right font-semibold text-[#1a1a1a]">
                  {fmtKijun(kijunHiyou)}
                </td>
              </tr>
              {/* 旧基準のみ表示 or 令和6年はグレーアウト */}
              {!isR6 ? (
                <tr>
                  <td className="px-3 py-1.5 text-[#333]">一般正味財産増減額の100分の10</td>
                  <td className="px-3 py-1.5 text-right font-semibold text-[#1a1a1a]">
                    {fmtKijun(kijunSeimi)}
                  </td>
                </tr>
              ) : (
                <tr className="bg-[#f5f5f5]">
                  <td className="px-3 py-1.5 text-[#aaa] line-through">
                    一般正味財産増減額の100分の10
                  </td>
                  <td className="px-3 py-1.5 text-right text-[10px] text-[#aaa]">
                    令和６年では非表示
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-4 mt-1 h-[2px] w-full bg-[#4a7ebb]" />

        {/* ===== 関連当事者ごとの取引一覧 ===== */}
        <div className="mb-2 text-[11px] font-semibold text-[#333]">
          【関連当事者ごとの取引一覧】
          <span className="ml-2 text-[10px] font-normal text-[#888]">
            {isR6 ? "区分1〜10（令和６年基準）" : "区分1〜4（平成20年基準）"}
          </span>
        </div>

        <div className="space-y-4">
          {visibleKbn.map((kbnInfo) => {
            const kankMap = torihikiByKbn[kbnInfo.kbn]

            return (
              <div key={kbnInfo.kbn}>
                {/* 区分見出し */}
                <div
                  className={`flex items-center gap-2 px-2 py-1 text-[12px] font-bold ${
                    kbnInfo.isNew
                      ? "bg-[#e8f0ff] text-[#1a3a6e]"
                      : "bg-[#d6e8f7] text-[#1a3a6e]"
                  }`}
                >
                  <span>{kbnInfo.circled}</span>
                  <span>{kbnInfo.name}</span>
                  <span className="text-[10px] font-normal text-[#666]">
                    （{kbnInfo.syubetsu}）
                  </span>
                  {kbnInfo.isNew && (
                    <span className="rounded bg-[#e55] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      🆕 令和６年追加
                    </span>
                  )}
                </div>

                {/* 取引データ */}
                {!kankMap ? (
                  <div className="border border-[#d0dce8] bg-white px-3 py-1.5 text-[11px] text-[#aaa]">
                    （該当取引なし）
                  </div>
                ) : (
                  Object.entries(kankMap).map(([kankName, torihikis]) => {
                    const アRows = torihikis.filter((t) => t.checkKbn === 11)
                    const イRows = torihikis.filter((t) => t.checkKbn === 12)

                    return (
                      <div
                        key={kankName}
                        className="border border-t-0 border-[#c8d8e8] bg-white"
                      >
                        {/* 関係者名 */}
                        <div className="border-b border-[#e0eaf4] bg-[#f5f8fd] px-4 py-1 text-[11px] font-semibold text-[#333]">
                          {kankName}
                        </div>

                        {/* ア. 正味財産増減計算書項目 */}
                        {アRows.length > 0 && (
                          <div className="px-4 py-1">
                            <div className="mb-0.5 text-[10px] text-[#666]">
                              ア．正味財産増減計算書項目に係わる関連当事者との取引
                            </div>
                            <table className="w-full border-collapse text-[11px]">
                              <thead>
                                <tr className="bg-[#eef3fa]">
                                  <th className="w-[70px] border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    科目コード
                                  </th>
                                  <th className="w-[140px] border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    科目名称
                                  </th>
                                  <th className="w-[100px] border border-[#c8d8e8] px-2 py-0.5 text-right text-[10px] font-semibold">
                                    取引金額
                                  </th>
                                  <th className="border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    判定理由
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {アRows.map((t, i) => (
                                  <tr key={i}>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-[#555]">
                                      {t.kamokuCd}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5">
                                      {t.kamokuName}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-right font-semibold">
                                      {fmtKingaku(t.kingaku)}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-[#555]">
                                      {t.naiyo}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* イ. 貸借対照表項目 */}
                        {イRows.length > 0 && (
                          <div className="px-4 py-1">
                            <div className="mb-0.5 text-[10px] text-[#666]">
                              イ．貸借対照表項目等に係わる関連当事者との取引
                            </div>
                            <table className="w-full border-collapse text-[11px]">
                              <thead>
                                <tr className="bg-[#eef3fa]">
                                  <th className="w-[70px] border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    科目コード
                                  </th>
                                  <th className="w-[140px] border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    科目名称
                                  </th>
                                  <th className="w-[100px] border border-[#c8d8e8] px-2 py-0.5 text-right text-[10px] font-semibold">
                                    取引金額
                                  </th>
                                  <th className="border border-[#c8d8e8] px-2 py-0.5 text-left text-[10px] font-semibold">
                                    判定理由
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {イRows.map((t, i) => (
                                  <tr key={i}>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-[#555]">
                                      {t.kamokuCd}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5">
                                      {t.kamokuName}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-right font-semibold">
                                      {fmtKingaku(t.kingaku)}
                                    </td>
                                    <td className="border border-[#d8e4f0] px-2 py-0.5 text-[#555]">
                                      {t.naiyo}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* ア・イ 両方なし（マスタにあるが取引なし） */}
                        {アRows.length === 0 && イRows.length === 0 && (
                          <div className="px-4 py-1.5 text-[11px] text-[#aaa]">
                            （対象取引なし）
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function RelatedPartyCheckPreviewPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-white" />}>
      <PreviewContent />
    </Suspense>
  )
}
