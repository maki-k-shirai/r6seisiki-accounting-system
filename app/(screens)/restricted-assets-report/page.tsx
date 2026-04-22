// app/(screens)/restricted-assets-report/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"
import { Input } from "@/components/ui/input"

const DUMMY_PARENT_ACCOUNTS = [
  "公益目的事業会計",
  "収益事業等会計",
  "法人会計",
]

export default function RestrictedAssetsReportPage() {
  const router = useRouter()

  // 年月指定
  const [year, setYear] = useState("8")
  const [month, setMonth] = useState("3")

  // 会計選択
  const [accountScope, setAccountScope] = useState<"all" | "parent">("all")
  const [selectedParentAccount, setSelectedParentAccount] = useState(
    DUMMY_PARENT_ACCOUNTS[0]
  )

  // 出力オプション
  const [outputDateTime, setOutputDateTime] = useState(false)
  const [outputPageNo, setOutputPageNo] = useState(false)
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="flex h-full flex-col bg-[#e6f1ff] text-[13px] text-[#1a1a1a]">
      <FunctionKeyBar
        onExit={() => console.log("終了")}
        onBack={() => router.back()}
        onF7={() => console.log("PDF出力", { year, month, accountScope, outputDateTime, outputPageNo, showCode })}
        onF9={() => {
          router.push("/restricted-assets-report/preview")
        }}
      />

      <div className="flex-1 p-4">
        <div className="flex items-start gap-6">
          {/* 左カラム：入力項目 */}
          <div className="flex-1 max-w-[480px]">
            {/* 年月指定 */}
            <div className="mb-1 flex items-center gap-2">
              <div className="h-[12px] w-[12px] bg-black" />
              <div className="font-semibold">年月指定</div>
            </div>
            <div className="mb-4 flex items-center gap-2 pl-4">
              <select
                value="令和"
                className="h-[24px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
                disabled
              >
                <option value="令和">令和</option>
              </select>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-[24px] w-[40px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
              />
              <span>年</span>
              <Input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-[24px] w-[40px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
              />
              <span>月</span>
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
                  <span>親会計</span>
                </label>
              </div>
              {accountScope === "parent" && (
                <select
                  value={selectedParentAccount}
                  onChange={(e) => setSelectedParentAccount(e.target.value)}
                  className="h-[26px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[12px]"
                >
                  {DUMMY_PARENT_ACCOUNTS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 右カラム：出力オプション */}
          <div className="w-[200px]">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-[12px] w-[12px] bg-black" />
              <div className="font-semibold">出力オプション</div>
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-[14px] w-[14px]"
                    checked={showCode}
                    onChange={(e) => setShowCode(e.target.checked)}
                  />
                  <span>コード表示</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
