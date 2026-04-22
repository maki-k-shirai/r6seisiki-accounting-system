// app/(screens)/restricted-assets-report/preview/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"

// ===== 金額フォーマット =====
function fmt(v: number | null): string {
  if (v === null) return ""
  if (v === 0) return "－"
  const abs = Math.abs(v).toLocaleString("ja-JP")
  return v < 0 ? `△${abs}` : abs
}

// ===== 1号：公益目的保有財産 =====
type S1Row = {
  no: number
  name: string
  location: string
  area: string
  usage: string
  prevEnd: number
  decrease: number
  increase: number
  evalDiff: number
  essential: "○" | "－"
  acquired: "認定前" | "認定後"
}

const S1_ROWS: S1Row[] = [
  {
    no: 1,
    name: "公益事業用建物",
    location: "東京都千代田区○○1-2-3",
    area: "RC造 3階建 延床面積 1,200㎡",
    usage: "講座・研修事業に使用",
    prevEnd: 50_000_000,
    decrease: 1_000_000,
    increase: 0,
    evalDiff: 0,
    essential: "○",
    acquired: "認定後",
  },
  {
    no: 2,
    name: "公益事業用土地",
    location: "東京都千代田区○○1-2-3",
    area: "900㎡",
    usage: "上記建物の敷地",
    prevEnd: 30_000_000,
    decrease: 0,
    increase: 0,
    evalDiff: 0,
    essential: "○",
    acquired: "認定前",
  },
]

// ===== 2号：法人活動保有財産 =====
type S2Row = {
  no: number
  name: string
  location: string
  division: string
  usage: string
  prevEnd: number
  decrease: number
  increase: number
  evalDiff: number
}

const S2_ROWS: S2Row[] = [
  {
    no: 1,
    name: "法人運営用建物",
    location: "東京都港区△△2-3-4",
    division: "管理",
    usage: "事務局として使用",
    prevEnd: 20_000_000,
    decrease: 500_000,
    increase: 0,
    evalDiff: 0,
  },
]

// ===== 4号・5号共通型 =====
type S45Row = {
  name: string
  division: string
  prevEnd: number
  decrease: number
  increase: number
  evalDiff: number
}

const S4_ROWS: S45Row[] = [
  {
    name: "研究設備取得資金",
    division: "公1",
    prevEnd: 5_000_000,
    decrease: 0,
    increase: 500_000,
    evalDiff: 0,
  },
]

const S5_ROWS: S45Row[] = [
  {
    name: "創立30周年記念事業準備資金",
    division: "管",
    prevEnd: 3_000_000,
    decrease: 0,
    increase: 500_000,
    evalDiff: 0,
  },
]

// ===== 6号：指定寄附資金 =====
type S6Row = {
  name: string
  division: string
  usage: string
  prevEnd: number
  decrease: number
  increase: number
  evalDiff: number
}

const S6_ROWS: S6Row[] = [
  {
    name: "○○財団奨学基金",
    division: "公1",
    usage: "学生への奨学金支給",
    prevEnd: 8_000_000,
    decrease: 200_000,
    increase: 0,
    evalDiff: 100_000,
  },
  {
    name: "△△記念研究基金",
    division: "公2",
    usage: "若手研究者への助成",
    prevEnd: 5_000_000,
    decrease: 0,
    increase: 1_000_000,
    evalDiff: 50_000,
  },
]

// ===== 共通スタイル =====
const TH = "border border-[#7a9bc4] bg-[#d6e8f7] px-2 py-1 text-center font-semibold text-[11px]"
const TD = "border border-[#b0c8e0] px-2 py-1 text-[11px]"
const TD_NUM = "border border-[#b0c8e0] px-2 py-1 text-right text-[11px]"
const TD_TOTAL = "border border-[#b0c8e0] bg-[#f0f5fb] px-2 py-1 text-right text-[11px] font-semibold"

function calcEnd(row: { prevEnd: number; decrease: number; increase: number; evalDiff: number }) {
  return row.prevEnd - row.decrease + row.increase + row.evalDiff
}

function sumField(rows: { prevEnd: number; decrease: number; increase: number; evalDiff: number }[], field: keyof Pick<typeof rows[0], "prevEnd" | "decrease" | "increase" | "evalDiff">) {
  return rows.reduce((acc, r) => acc + r[field], 0)
}

// ===== セクションタイトル =====
function SectionTitle({ no, title }: { no: string; title: string }) {
  return (
    <div className="mb-2 mt-6 text-[13px] font-bold text-[#1a3a6e]">
      {no}．{title}
    </div>
  )
}

export default function RestrictedAssetsPreviewPage() {
  const router = useRouter()

  // 3号
  const s3 = { prevEnd: 10_000_000, decrease: 500_000, increase: 1_000_000, evalDiff: 200_000 }
  const s3End = calcEnd(s3)

  // 1号集計
  const s1PrevEnd = sumField(S1_ROWS, "prevEnd")
  const s1Decrease = sumField(S1_ROWS, "decrease")
  const s1Increase = sumField(S1_ROWS, "increase")
  const s1EvalDiff = sumField(S1_ROWS, "evalDiff")
  const s1End = s1PrevEnd - s1Decrease + s1Increase + s1EvalDiff

  // 2号集計
  const s2PrevEnd = sumField(S2_ROWS, "prevEnd")
  const s2Decrease = sumField(S2_ROWS, "decrease")
  const s2Increase = sumField(S2_ROWS, "increase")
  const s2EvalDiff = sumField(S2_ROWS, "evalDiff")
  const s2End = s2PrevEnd - s2Decrease + s2Increase + s2EvalDiff

  // 4号集計
  const s4PrevEnd = sumField(S4_ROWS, "prevEnd")
  const s4Decrease = sumField(S4_ROWS, "decrease")
  const s4Increase = sumField(S4_ROWS, "increase")
  const s4EvalDiff = sumField(S4_ROWS, "evalDiff")
  const s4End = s4PrevEnd - s4Decrease + s4Increase + s4EvalDiff

  // 5号集計
  const s5PrevEnd = sumField(S5_ROWS, "prevEnd")
  const s5Decrease = sumField(S5_ROWS, "decrease")
  const s5Increase = sumField(S5_ROWS, "increase")
  const s5EvalDiff = sumField(S5_ROWS, "evalDiff")
  const s5End = s5PrevEnd - s5Decrease + s5Increase + s5EvalDiff

  // 6号集計
  const s6PrevEnd = sumField(S6_ROWS, "prevEnd")
  const s6Decrease = sumField(S6_ROWS, "decrease")
  const s6Increase = sumField(S6_ROWS, "increase")
  const s6EvalDiff = sumField(S6_ROWS, "evalDiff")
  const s6End = s6PrevEnd - s6Decrease + s6Increase + s6EvalDiff

  return (
    <div className="flex h-full flex-col text-[12px]">
      <FunctionKeyBar
        onExit={() => console.log("終了")}
        onBack={() => router.push("/restricted-assets-report")}
      />

      {/* ヘッダー */}
      <div className="mb-2 flex items-center justify-between border-b border-[#7a9bc4] px-4 pb-2 pt-3">
        <div>
          <div className="text-[14px] font-bold text-[#1a3a6e]">使途拘束資産内訳</div>
          <div className="mt-1 text-[11px] text-[#555]">
            令和8年3月31日現在　　一般財団法人 満喜財団
          </div>
        </div>
        <div className="rounded border border-[#7a9bc4] bg-white px-3 py-1 text-[11px] text-[#555]">
          ※ 仕様検討用モックデータ
        </div>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* 注記タイトル */}
        <div className="mb-1 mt-2 text-[12px] text-[#333]">４．貸借対照表の注記</div>
        <div className="mb-4 text-[12px] font-semibold text-[#1a1a1a]">
          　(3) 使途拘束資産（控除対象財産）の内訳と増減額及び残高
        </div>

        {/* ===== 1号 ===== */}
        <SectionTitle no="１" title="公益目的保有財産" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 36 }}>番号</th>
                <th className={TH} style={{ width: 140 }}>財産の名称</th>
                <th className={TH} style={{ width: 160 }}>場所</th>
                <th className={TH} style={{ width: 160 }}>面積・構造・物量等</th>
                <th className={TH} style={{ width: 140 }}>財産の使用状況</th>
                <th className={TH} style={{ width: 90 }}>前期末</th>
                <th className={TH} style={{ width: 90 }}>当期減少額</th>
                <th className={TH} style={{ width: 90 }}>当期増加額</th>
                <th className={TH} style={{ width: 80 }}>評価差額</th>
                <th className={TH} style={{ width: 90 }}>期末</th>
                <th className={TH} style={{ width: 80 }}>不可欠特定財産</th>
                <th className={TH} style={{ width: 70 }}>取得時期</th>
              </tr>
            </thead>
            <tbody>
              {S1_ROWS.map((r) => (
                <tr key={r.no}>
                  <td className={TD + " text-center"}>{r.no}</td>
                  <td className={TD}>{r.name}</td>
                  <td className={TD}>{r.location}</td>
                  <td className={TD}>{r.area}</td>
                  <td className={TD}>{r.usage}</td>
                  <td className={TD_NUM}>{fmt(r.prevEnd)}</td>
                  <td className={TD_NUM}>{fmt(r.decrease)}</td>
                  <td className={TD_NUM}>{fmt(r.increase)}</td>
                  <td className={TD_NUM}>{fmt(r.evalDiff)}</td>
                  <td className={TD_NUM}>{fmt(calcEnd(r))}</td>
                  <td className={TD + " text-center"}>{r.essential}</td>
                  <td className={TD + " text-center"}>{r.acquired}</td>
                </tr>
              ))}
              <tr>
                <td className={TD_TOTAL + " text-center"} colSpan={5}>計</td>
                <td className={TD_TOTAL}>{fmt(s1PrevEnd)}</td>
                <td className={TD_TOTAL}>{fmt(s1Decrease)}</td>
                <td className={TD_TOTAL}>{fmt(s1Increase)}</td>
                <td className={TD_TOTAL}>{fmt(s1EvalDiff)}</td>
                <td className={TD_TOTAL}>{fmt(s1End)}</td>
                <td className={TD_TOTAL} colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 2号 ===== */}
        <SectionTitle no="２" title="法人活動保有財産" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 36 }}>番号</th>
                <th className={TH} style={{ width: 140 }}>財産の名称</th>
                <th className={TH} style={{ width: 160 }}>場所</th>
                <th className={TH} style={{ width: 70 }}>事業区分</th>
                <th className={TH} style={{ width: 140 }}>財産の使用状況</th>
                <th className={TH} style={{ width: 90 }}>前期末</th>
                <th className={TH} style={{ width: 90 }}>当期減少額</th>
                <th className={TH} style={{ width: 90 }}>当期増加額</th>
                <th className={TH} style={{ width: 80 }}>評価差額</th>
                <th className={TH} style={{ width: 90 }}>期末</th>
              </tr>
            </thead>
            <tbody>
              {S2_ROWS.map((r) => (
                <tr key={r.no}>
                  <td className={TD + " text-center"}>{r.no}</td>
                  <td className={TD}>{r.name}</td>
                  <td className={TD}>{r.location}</td>
                  <td className={TD + " text-center"}>{r.division}</td>
                  <td className={TD}>{r.usage}</td>
                  <td className={TD_NUM}>{fmt(r.prevEnd)}</td>
                  <td className={TD_NUM}>{fmt(r.decrease)}</td>
                  <td className={TD_NUM}>{fmt(r.increase)}</td>
                  <td className={TD_NUM}>{fmt(r.evalDiff)}</td>
                  <td className={TD_NUM}>{fmt(calcEnd(r))}</td>
                </tr>
              ))}
              <tr>
                <td className={TD_TOTAL + " text-center"} colSpan={5}>計</td>
                <td className={TD_TOTAL}>{fmt(s2PrevEnd)}</td>
                <td className={TD_TOTAL}>{fmt(s2Decrease)}</td>
                <td className={TD_TOTAL}>{fmt(s2Increase)}</td>
                <td className={TD_TOTAL}>{fmt(s2EvalDiff)}</td>
                <td className={TD_TOTAL}>{fmt(s2End)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 3号 ===== */}
        <SectionTitle no="３" title="公益充実資金" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 100 }}>前期末</th>
                <th className={TH} style={{ width: 100 }}>取崩額</th>
                <th className={TH} style={{ width: 100 }}>積立額</th>
                <th className={TH} style={{ width: 100 }}>評価差額</th>
                <th className={TH} style={{ width: 100 }}>期末</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD_NUM}>{fmt(s3.prevEnd)}</td>
                <td className={TD_NUM}>{fmt(s3.decrease)}</td>
                <td className={TD_NUM}>{fmt(s3.increase)}</td>
                <td className={TD_NUM}>{fmt(s3.evalDiff)}</td>
                <td className={TD_NUM}>{fmt(s3End)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 4号 ===== */}
        <SectionTitle no="４" title="資産取得資金" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 160 }}>資金の名称</th>
                <th className={TH} style={{ width: 60 }}>区分</th>
                <th className={TH} style={{ width: 100 }}>前期末</th>
                <th className={TH} style={{ width: 100 }}>取崩額</th>
                <th className={TH} style={{ width: 100 }}>積立額</th>
                <th className={TH} style={{ width: 100 }}>評価差額</th>
                <th className={TH} style={{ width: 100 }}>期末</th>
              </tr>
            </thead>
            <tbody>
              {S4_ROWS.map((r, i) => (
                <tr key={i}>
                  <td className={TD}>{r.name}</td>
                  <td className={TD + " text-center"}>{r.division}</td>
                  <td className={TD_NUM}>{fmt(r.prevEnd)}</td>
                  <td className={TD_NUM}>{fmt(r.decrease)}</td>
                  <td className={TD_NUM}>{fmt(r.increase)}</td>
                  <td className={TD_NUM}>{fmt(r.evalDiff)}</td>
                  <td className={TD_NUM}>{fmt(calcEnd(r))}</td>
                </tr>
              ))}
              <tr>
                <td className={TD_TOTAL} colSpan={2}>計</td>
                <td className={TD_TOTAL}>{fmt(s4PrevEnd)}</td>
                <td className={TD_TOTAL}>{fmt(s4Decrease)}</td>
                <td className={TD_TOTAL}>{fmt(s4Increase)}</td>
                <td className={TD_TOTAL}>{fmt(s4EvalDiff)}</td>
                <td className={TD_TOTAL}>{fmt(s4End)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 5号 ===== */}
        <SectionTitle no="５" title="特定費用準備資金" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 200 }}>資金の名称</th>
                <th className={TH} style={{ width: 60 }}>区分</th>
                <th className={TH} style={{ width: 100 }}>前期末</th>
                <th className={TH} style={{ width: 100 }}>取崩額</th>
                <th className={TH} style={{ width: 100 }}>積立額</th>
                <th className={TH} style={{ width: 100 }}>評価差額</th>
                <th className={TH} style={{ width: 100 }}>期末</th>
              </tr>
            </thead>
            <tbody>
              {S5_ROWS.map((r, i) => (
                <tr key={i}>
                  <td className={TD}>{r.name}</td>
                  <td className={TD + " text-center"}>{r.division}</td>
                  <td className={TD_NUM}>{fmt(r.prevEnd)}</td>
                  <td className={TD_NUM}>{fmt(r.decrease)}</td>
                  <td className={TD_NUM}>{fmt(r.increase)}</td>
                  <td className={TD_NUM}>{fmt(r.evalDiff)}</td>
                  <td className={TD_NUM}>{fmt(calcEnd(r))}</td>
                </tr>
              ))}
              <tr>
                <td className={TD_TOTAL} colSpan={2}>計</td>
                <td className={TD_TOTAL}>{fmt(s5PrevEnd)}</td>
                <td className={TD_TOTAL}>{fmt(s5Decrease)}</td>
                <td className={TD_TOTAL}>{fmt(s5Increase)}</td>
                <td className={TD_TOTAL}>{fmt(s5EvalDiff)}</td>
                <td className={TD_TOTAL}>{fmt(s5End)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== 6号 ===== */}
        <SectionTitle no="６" title="指定寄附資金" />
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className={TH} style={{ width: 160 }}>資金の名称</th>
                <th className={TH} style={{ width: 60 }}>区分</th>
                <th className={TH} style={{ width: 160 }}>交付者の定めた使途</th>
                <th className={TH} style={{ width: 90 }}>前期末</th>
                <th className={TH} style={{ width: 90 }}>当期減少額</th>
                <th className={TH} style={{ width: 90 }}>当期増加額</th>
                <th className={TH} style={{ width: 80 }}>評価差額</th>
                <th className={TH} style={{ width: 90 }}>期末</th>
              </tr>
            </thead>
            <tbody>
              {S6_ROWS.map((r, i) => (
                <tr key={i}>
                  <td className={TD}>{r.name}</td>
                  <td className={TD + " text-center"}>{r.division}</td>
                  <td className={TD}>{r.usage}</td>
                  <td className={TD_NUM}>{fmt(r.prevEnd)}</td>
                  <td className={TD_NUM}>{fmt(r.decrease)}</td>
                  <td className={TD_NUM}>{fmt(r.increase)}</td>
                  <td className={TD_NUM}>{fmt(r.evalDiff)}</td>
                  <td className={TD_NUM}>{fmt(calcEnd(r))}</td>
                </tr>
              ))}
              <tr>
                <td className={TD_TOTAL} colSpan={3}>計</td>
                <td className={TD_TOTAL}>{fmt(s6PrevEnd)}</td>
                <td className={TD_TOTAL}>{fmt(s6Decrease)}</td>
                <td className={TD_TOTAL}>{fmt(s6Increase)}</td>
                <td className={TD_TOTAL}>{fmt(s6EvalDiff)}</td>
                <td className={TD_TOTAL}>{fmt(s6End)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
