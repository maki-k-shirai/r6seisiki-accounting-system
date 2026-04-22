// app/(screens)/related-party-check/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"

const KAIKEI_LIST = [
  { no: "001", name: "公益会計" },
  { no: "002", name: "収益会計" },
  { no: "003", name: "法人会計" },
]

export default function RelatedPartyCheckPage() {
  const router = useRouter()

  const [accountScope, setAccountScope] = useState<"all" | "parent">("parent")
  const [selectedKaikei, setSelectedKaikei] = useState("001")
  const [outputDateTime, setOutputDateTime] = useState(true)
  const [outputPageNo, setOutputPageNo] = useState(true)
  const [kijun, setKijun] = useState<"r6" | "h20">("r6")

  const handleEnter = () => {
    router.push(`/related-party-check/preview?kijun=${kijun}`)
  }

  return (
    <div className="flex h-full flex-col bg-[#e6f1ff] text-[13px] text-[#1a1a1a]">
      <FunctionKeyBar
        onEnter={handleEnter}
        onExit={() => console.log("終了")}
        onBack={() => router.back()}
        onF9={handleEnter}
        onF9Label="エンター"
      />

      <div className="flex-1 p-4">
          <div className="flex items-start gap-6">
            {/* 左カラム */}
            <div className="flex-1 max-w-[480px]">
              {/* 年度指定 */}
              <div className="mb-1 flex items-center gap-2">
                <div className="h-[12px] w-[12px] bg-black" />
                <div className="font-semibold">年度指定</div>
              </div>
              <div className="mb-4 flex items-center gap-2 pl-4">
                <select
                  className="h-[24px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
                  defaultValue="令和6年度 (2024)"
                >
                  <option>令和6年度 (2024)</option>
                  <option>令和7年度 (2025)</option>
                  <option>令和8年度 (2026)</option>
                </select>
              </div>

              {/* 会計選択 */}
              <div className="mb-1 flex items-center gap-2">
                <div className="h-[12px] w-[12px] bg-black" />
                <div className="font-semibold">会計選択</div>
              </div>
              <div className="mb-4 pl-4">
                <div className="mb-2 flex items-center gap-4 text-[12px]">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="accountScope"
                      value="all"
                      checked={accountScope === "all"}
                      onChange={() => setAccountScope("all")}
                      className="h-[14px] w-[14px]"
                    />
                    <span>法人全体</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="accountScope"
                      value="parent"
                      checked={accountScope === "parent"}
                      onChange={() => setAccountScope("parent")}
                      className="h-[14px] w-[14px]"
                    />
                    <span>親会計選択</span>
                  </label>
                </div>
                {accountScope === "parent" && (
                  <select
                    value={selectedKaikei}
                    onChange={(e) => setSelectedKaikei(e.target.value)}
                    className="h-[26px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
                  >
                    {KAIKEI_LIST.map((k) => (
                      <option key={k.no} value={k.no}>
                        {k.name}（{k.no}）
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 会計基準（確認用） */}
              <div className="mb-1 flex items-center gap-2">
                <div className="h-[12px] w-[12px] bg-black" />
                <div className="font-semibold">
                  会計基準（確認用）
                  <span className="ml-2 text-[10px] font-normal text-[#888]">
                    ※ 実システムでは法人設定から自動判定
                  </span>
                </div>
              </div>
              <div className="mb-4 pl-4 space-y-1 text-[12px]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kijun"
                    value="r6"
                    checked={kijun === "r6"}
                    onChange={() => setKijun("r6")}
                    className="h-[14px] w-[14px]"
                  />
                  <span>令和６年基準（新）</span>
                  <span className="rounded bg-[#2d3a5a] px-1.5 py-0.5 text-[10px] text-white">
                    区分1〜10
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kijun"
                    value="h20"
                    checked={kijun === "h20"}
                    onChange={() => setKijun("h20")}
                    className="h-[14px] w-[14px]"
                  />
                  <span>平成20年基準（旧）</span>
                  <span className="rounded bg-[#888] px-1.5 py-0.5 text-[10px] text-white">
                    区分1〜4
                  </span>
                </label>
              </div>
            </div>

            {/* 右カラム：出力項目 */}
            <div className="w-[200px]">
              <div className="mb-1 flex items-center gap-2">
                <div className="h-[12px] w-[12px] bg-black" />
                <div className="font-semibold">出力項目</div>
              </div>
              <div className="rounded-[2px] border border-[#7a9bc4] bg-white p-3 text-[12px]">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-[14px] w-[14px]"
                      checked={outputDateTime}
                      onChange={(e) => setOutputDateTime(e.target.checked)}
                    />
                    <span>出力日時</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-[14px] w-[14px]"
                      checked={outputPageNo}
                      onChange={(e) => setOutputPageNo(e.target.checked)}
                    />
                    <span>ページ番号</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
