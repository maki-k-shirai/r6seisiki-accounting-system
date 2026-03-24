// app/(screens)/fixed-assets-export/page.tsx
// 固定資産システム（UniKote）UKR04010「使途拘束資産情報出力」モック画面
"use client"

import * as React from "react"

// ===== 型定義 =====
type PhaseState = "idle" | "extracted" | "saved"

// ===== 定数 =====

type MenuItem = { id: number; label: string; active: boolean; current?: boolean }

const MENU_ITEMS: MenuItem[] = [
  { id: 1, label: "償却費抽出", active: true },
  { id: 2, label: "財産目録情報抽出", active: true },
  { id: 3, label: "使途拘束資産情報出力", active: true, current: true },
  { id: 4, label: "財務諸表に係る注記", active: false },
  { id: 5, label: "償却費仕訳情報リスト", active: true },
]

const CSV_COLUMNS = [
  { no: "01", name: "親会計コード", note: "資産が属する会計の親会計コード" },
  { no: "02", name: "勘定科目コード", note: "固定資産の勘定科目コード" },
  { no: "03", name: "資産コード", note: "資産コード１・２をハイフン区切りで結合（例：123456-001）" },
  { no: "04", name: "資産名", note: "固定資産の名称" },
  {
    no: "05",
    name: "場所・物量等",
    note: "土地・建物：地積㎡＋所在地＋構造　／　その他：個数＋単位名称",
  },
  {
    no: "06",
    name: "使用目的等",
    note: "公益目的財産区分に応じた文章（認定前・後・その他公益・法人活動）＋会計名",
  },
  {
    no: "07",
    name: "金額",
    note: "現在残金額＝減少金額 のとき 0、それ以外は期末簿価",
  },
  {
    no: "08",
    name: "号",
    note: "公益目的財産区分 [1][2][3]→1号　[4]→2号　それ以外→未設定",
  },
  { no: "09", name: "場所", note: "所在地・地番・家屋番号・建物番号" },
  { no: "10", name: "面積、構造、物量等", note: "地積・面積・構造・取得個数" },
  { no: "11", name: "財産の使用状況", note: "使用目的フィールドの内容" },
  {
    no: "12",
    name: "前期末",
    note: "当期増加資産 → 0　それ以外 → 期首簿価",
  },
  {
    no: "13",
    name: "当期減少額",
    note: "現在残金額＝減少金額 のとき 減少金額、それ以外は 減少金額＋減価償却額",
  },
  {
    no: "14",
    name: "当期増加額",
    note: "当期増加資産 → 現在残金額、それ以外 → 0",
  },
  {
    no: "15",
    name: "評価差額",
    note: "減損あり → 減損損失額、それ以外 → 0",
  },
  {
    no: "16",
    name: "期末",
    note: "現在残金額＝減少金額 のとき 0、それ以外は期末簿価",
  },
  {
    no: "17",
    name: "不可欠特定財産",
    note: "公益目的財産区分 [1][2]→1　それ以外→未設定",
  },
  {
    no: "18",
    name: "取得時期",
    note: "公益目的財産区分 [1]→1（認定前）　[2]→2（認定後）　それ以外→未設定",
  },
]

// ===== サブコンポーネント =====

function TitleBar() {
  return (
    <div
      className="flex h-[28px] flex-shrink-0 items-center justify-between px-3"
      style={{ background: "linear-gradient(to bottom, #1158a8, #0d3f7a)" }}
    >
      <span className="text-[12px] font-bold text-white tracking-wide">
        公益財団法人 ○○○○○　本部　- Ver2.5.0　[UKR04010]
      </span>
      <div className="flex gap-1">
        {["─", "□", "×"].map((c) => (
          <span
            key={c}
            className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-sm border border-[#4a7fcb] bg-[#1a68c4] text-[11px] text-white hover:bg-[#2278e0]"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

function MenuBar() {
  return (
    <div className="flex h-[22px] flex-shrink-0 items-center gap-4 border-b border-[#888] bg-[#f0f0f0] px-2">
      {["メニュー(M)", "環境設定(K)"].map((label) => (
        <span
          key={label}
          className="cursor-default text-[12px] text-[#000] hover:bg-[#d0d8e8] px-1"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function FnKeyBar({
  phase,
  onEnter,
  onOk,
  onExit,
}: {
  phase: PhaseState
  onEnter: () => void
  onOk: () => void
  onExit: () => void
}) {
  // phase に応じてどのキーが有効か
  const enterEnabled = phase === "idle"
  const okEnabled = phase === "extracted"
  const exitEnabled = true

  const keys = [
    {
      keyName: "↵ Enter",
      label: "Enter",
      enabled: enterEnabled,
      isEnter: true,
      onClick: onEnter,
    },
    { keyName: "F1", label: "OK", enabled: okEnabled, onClick: onOk },
    { keyName: "F2", label: "ーー", enabled: false },
    { keyName: "F3", label: "ーー", enabled: false },
    { keyName: "F4", label: "終了", enabled: exitEnabled, onClick: onExit },
    { keyName: "F5", label: "一覧", enabled: false },
    { keyName: "F6", label: "ーー", enabled: false },
    { keyName: "F7", label: "ーー", enabled: false },
    { keyName: "F8", label: "ーー", enabled: false },
    { keyName: "F9", label: "ーー", enabled: false },
    { keyName: "F10", label: "ーー", enabled: false },
    { keyName: "F11", label: "ーー", enabled: false },
    { keyName: "F12", label: "ーー", enabled: false },
  ]

  return (
    <div className="flex flex-shrink-0 gap-[3px] border-b border-[#b0b8cc] bg-[#e8f0fb] px-2 py-[4px]">
      {keys.map((k) => {
        const base =
          "flex flex-1 items-center justify-center rounded-[3px] border text-[11px] font-medium h-[32px] select-none"
        const style = k.enabled
          ? "bg-white border-[#8090b0] text-[#1a1a1a] cursor-pointer hover:bg-[#ddeaff] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          : "bg-[#ebebeb] border-[#ccc] text-[#aaa] cursor-default"
        return (
          <button
            key={k.keyName}
            type="button"
            className={`${base} ${style}`}
            disabled={!k.enabled}
            onClick={k.enabled ? k.onClick : undefined}
          >
            {k.isEnter ? (
              <span className="flex items-center gap-[3px]">
                <span className="text-[12px] text-[#002b7f]">↵</span>
                <span>Enter</span>
              </span>
            ) : (
              <span className="flex flex-col items-center leading-[1.1]">
                <span className={k.enabled ? "text-[#1a3a7a]" : "text-[#bbb]"}>
                  {k.keyName}
                </span>
                <span>{k.label}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function SideMenu() {
  return (
    <div className="flex w-[190px] flex-shrink-0 flex-col bg-[#d0e8c0] border-r border-[#98b880]">
      {/* Zボタン */}
      <div className="flex items-center gap-2 border-b border-[#98b880] bg-[#4a7a30] px-2 py-1.5">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-[#2a5a18] text-[11px] font-bold text-white">
          Z
        </span>
        <span className="text-[11px] font-semibold text-white">メニュー表示切替</span>
      </div>
      {/* Sボタン */}
      <div className="flex items-center gap-2 border-b border-[#98b880] bg-[#5a8a40] px-2 py-1.5 cursor-pointer hover:bg-[#6a9a50]">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-[#3a6a28] text-[11px] font-bold text-white">
          S
        </span>
        <span className="text-[11px] font-semibold text-white">メインメニュー</span>
      </div>
      {/* セクションヘッダー */}
      <div className="border-b border-[#98b880] bg-[#4a7030] px-2 py-1.5">
        <span className="text-[12px] font-bold text-white">5. 会計連動</span>
      </div>
      {/* メニュー項目 */}
      <div className="flex flex-col">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className={[
              "flex items-center gap-2 border-b border-[#98b880] px-2 py-1.5",
              item.current
                ? "bg-[#2a5a18] cursor-default"
                : item.active
                  ? "bg-[#5a8a40] cursor-pointer hover:bg-[#6a9a50]"
                  : "bg-[#c0d8b0] cursor-default",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-sm text-[11px] font-bold",
                item.current
                  ? "bg-[#fff] text-[#2a5a18]"
                  : item.active
                    ? "bg-[#3a6a28] text-white"
                    : "bg-[#a8c898] text-[#666]",
              ].join(" ")}
            >
              {item.id}
            </span>
            <span
              className={[
                "text-[11px] leading-tight",
                item.current
                  ? "font-bold text-white"
                  : item.active
                    ? "text-white"
                    : "text-[#888]",
              ].join(" ")}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {/* 戻るボタン */}
      <div className="mt-auto flex items-center gap-2 border-t border-[#98b880] bg-[#4a7a30] px-2 py-1.5 cursor-pointer hover:bg-[#5a8a40]">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-[#2a5a18] text-[11px] font-bold text-white">
          X
        </span>
        <span className="text-[11px] font-semibold text-white">戻る</span>
      </div>
    </div>
  )
}

function MainContent({
  phase,
}: {
  phase: PhaseState
}) {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#b8d0e8]">
      {/* 画面タイトルバー */}
      <div className="flex h-[32px] flex-shrink-0 items-center bg-[#5a8a40] px-4">
        <span className="text-[14px] font-bold text-white">使途拘束資産情報出力</span>
      </div>

      {/* 年度表示 */}
      <div className="flex h-[28px] flex-shrink-0 items-center justify-center bg-[#c8dff0] border-b border-[#a0b8cc]">
        <span className="text-[12px] text-[#1a2a4a]">会計年度　令和 7 年度</span>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col gap-4 p-5 overflow-auto">
        {/* 状態に応じたメッセージ */}
        {phase === "idle" && (
          <div className="rounded border border-[#8090b0] bg-white px-5 py-4 text-[13px] text-[#1a2a4a] shadow-sm">
            使途拘束資産情報の抽出処理を行います。<br />
            <span className="mt-2 block text-[12px] text-[#555]">
              「Enter」キーを押すとデータ抽出を開始します。
            </span>
          </div>
        )}

        {phase === "extracted" && (
          <div className="rounded border border-[#5a9a30] bg-[#eafbe8] px-5 py-4 text-[13px] text-[#1a3a1a] shadow-sm">
            <span className="font-semibold">データ抽出が完了しました。</span><br />
            <span className="mt-1 block text-[12px] text-[#555]">
              「F1:OK」キーを押すとCSVファイルを出力します。
            </span>
          </div>
        )}

        {phase === "saved" && (
          <>
            <div className="rounded border border-[#5a9a30] bg-[#eafbe8] px-5 py-4 text-[13px] text-[#1a3a1a] shadow-sm">
              <span className="font-semibold">CSVファイルを出力しました。</span><br />
              <span className="mt-1 block text-[12px] text-[#555]">
                出力先：C:\UniKote\KoteOut_sito.csv
              </span>
            </div>
            <CsvColumnTable />
          </>
        )}
      </div>
    </div>
  )
}

function CsvColumnTable() {
  return (
    <div className="rounded border border-[#8090b0] bg-white shadow-sm overflow-hidden">
      <div className="bg-[#2d3a5a] px-4 py-2">
        <span className="text-[13px] font-semibold text-white">
          出力CSVレイアウト（KoteOut_sito.csv）
        </span>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#e8edf8] border-b border-[#c0c8d8]">
              <th className="w-[36px] border-r border-[#c0c8d8] px-2 py-1.5 text-center font-semibold text-[#2d3a5a]">
                №
              </th>
              <th className="w-[160px] border-r border-[#c0c8d8] px-3 py-1.5 text-left font-semibold text-[#2d3a5a]">
                項目名
              </th>
              <th className="px-3 py-1.5 text-left font-semibold text-[#2d3a5a]">
                設定内容・条件
              </th>
            </tr>
          </thead>
          <tbody>
            {CSV_COLUMNS.map((col, i) => (
              <tr
                key={col.no}
                className={i % 2 === 0 ? "bg-white" : "bg-[#f5f7fc]"}
              >
                <td className="border-r border-b border-[#d8dde8] px-2 py-1.5 text-center text-[#444]">
                  {col.no}
                </td>
                <td className="border-r border-b border-[#d8dde8] px-3 py-1.5 font-medium text-[#1a2a4a]">
                  {col.name}
                </td>
                <td className="border-b border-[#d8dde8] px-3 py-1.5 leading-snug text-[#444]">
                  {col.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 抽出対象条件の補足 */}
      <div className="border-t border-[#c0c8d8] bg-[#f8f9fd] px-4 py-3">
        <div className="text-[12px] font-semibold text-[#2d3a5a] mb-1.5">
          抽出対象資産の主な条件
        </div>
        <ul className="space-y-0.5 text-[11px] text-[#444]">
          <li>・増加情報（枝番=0）が基本対象。減少情報（枝番≠0）は減少日付が当年度のものが対象</li>
          <li>・リース：所有権移転ファイナンスリース または 売買処理の所有権移転外ファイナンスリースのみ対象</li>
          <li>・現在残金額がゼロの資産は対象外（ただし当年度以降の減少予定分を加算して再判定）</li>
          <li>・会計年度と償却計算の当年度が一致していること</li>
        </ul>
      </div>
    </div>
  )
}

// ===== メインページ =====

export default function FixedAssetsExportPage() {
  const [phase, setPhase] = React.useState<PhaseState>("idle")
  const [showMsg, setShowMsg] = React.useState<string | null>(null)

  const showTemporaryMsg = (msg: string) => {
    setShowMsg(msg)
    setTimeout(() => setShowMsg(null), 2500)
  }

  const handleEnter = () => {
    // データ抽出シミュレーション
    showTemporaryMsg("固定資産情報を抽出しています...")
    setTimeout(() => {
      setPhase("extracted")
    }, 800)
  }

  const handleOk = () => {
    showTemporaryMsg("CSV出力中...")
    setTimeout(() => {
      setPhase("saved")
    }, 600)
  }

  const handleExit = () => {
    setPhase("idle")
  }

  return (
    <div
      data-tutorial="fixed-assets-export-root"
      className="flex h-full flex-col overflow-hidden"
    >
      {/* ========== UniKoteモックウィンドウ ========== */}
      <div
        className="flex flex-col overflow-hidden rounded border border-[#4a6a9a] shadow-2xl"
        style={{ height: "100%" }}
      >
        {/* タイトルバー */}
        <TitleBar />

        {/* メニューバー */}
        <MenuBar />

        {/* ファンクションキーバー */}
        <FnKeyBar
          phase={phase}
          onEnter={handleEnter}
          onOk={handleOk}
          onExit={handleExit}
        />

        {/* ボディ：サイドメニュー ＋ メインコンテンツ */}
        <div className="flex min-h-0 flex-1">
          <SideMenu />
          <MainContent phase={phase} />
        </div>
      </div>

      {/* 一時メッセージオーバーレイ */}
      {showMsg && (
        <div className="fixed left-1/2 top-1/3 z-50 -translate-x-1/2 rounded border border-[#8090b0] bg-white px-6 py-3 text-[13px] text-[#1a2a4a] shadow-xl">
          {showMsg}
        </div>
      )}
    </div>
  )
}
