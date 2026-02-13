// app/(screens)/voucher-entry/page.tsx
"use client"

import { useState, useMemo, KeyboardEvent, useEffect,useRef } from "react"
import { useRouter } from "next/navigation"
import { FunctionKeyBar } from "@/components/common/FunctionKeyBar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowDown, Calendar, FileText } from "lucide-react"
import { AccountingSelectModal } from "@/components/account/AccountingSelectModal"
import { AccountSearchDialog, type PickedAccount } from "@/components/account/AccountSearchDialog"
import { RemarkEntryModal } from "@/components/voucher/RemarkEntryModal"
import {
  buildActivityToPLMap,
  buildCodeToParentNameMapFor,
  type AccountNode,
} from "@/components/account/account-data"
import { useTutorial } from "@/components/tutorial/TutorialProvider"
import { TUTORIAL_SCENARIOS } from "@/lib/tutorial/tutorial-scenarios"
import { GuidedFocus } from "@/components/tutorial/GuidedFocus"
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog"
import { resolveAccountKind, isFundingTargetCode, resolveSecuritiesGainLossTarget, type AccountKind } from "@/components/account/account-kind"

type PLMapped = {
  code: string
  parentName: string
  childName: string
  kind: "PL" | "Other"
}

type Option = { code: string; name: string }

function getDesignatedOptionsForLocal(_plCode: string): Option[] {
  return [
    { code: "100101", name: "国庫補助金" },
    { code: "100104", name: "地方公共団体補助金" },

  ]
}

const NET_ASSETS_STATEMENT_PDF = "/pdf/statement-of-changes-in-net-assets.pdf"
const ACTIVITY_STATEMENT_PDF = "/pdf/activity-statement.pdf"

export default function VoucherEntryPage() {
  const router = useRouter()
  const { openTutorialMenu, stopTutorial, startTutorial } = useTutorial()

  // ===== マスタ系（useMemo） =====
  // 収支→PL 紐付け、PL派生ツリーの親科目名マップ
  const activityToPL = useMemo(() => buildActivityToPLMap(), [])
  const plParentMap = useMemo(() => buildCodeToParentNameMapFor("pl"), [])
  // 純資産科目（net_assets）の親科目名マップ
  const netAssetParentMap = useMemo(
    () => buildCodeToParentNameMapFor("net_assets"),
    []
  )

  // ===== チュートリアル共通フラグ =====
  const [isRemarkTutorialScenario, setIsRemarkTutorialScenario] = useState(false)

  // --- 財源（収益・費用）チュートリアル用 ---
  const [isFundingTutorialMode, setIsFundingTutorialMode] = useState(false)
  const [isFundingTutorialGuiding, setIsFundingTutorialGuiding] = useState(false)
  const [isFundingRemarkGuiding, setIsFundingRemarkGuiding] = useState(false)
  const [isFundingTypeGuideActive, setIsFundingTypeGuideActive] = useState(false)
  const [isEnterGuideActive, setIsEnterGuideActive] = useState(false)
  const [isFundingBadgeGuideActive, setIsFundingBadgeGuideActive] = useState(false)
  const [fundingEnterGuideStep, setFundingEnterGuideStep] = useState<
    "none" | "primary" | "secondary"
  >("none")
  const [isDesignatedSelectGuideActive, setIsDesignatedSelectGuideActive] =
    useState(false)

  // *科目体系(基本財産・特定資産) シナリオ用
  const [isBsFundingScenario, setIsBsFundingScenario] = useState(false)
  const CASH_TREE_CODES_FOR_TUTORIAL = [
  "010000","010100","010131", "010132", "010162"
  ]
  const CASH_HIRIGHT_CODES = ["010131","01013101","010132","01013201","01013215","010162","01016211"]
 const CASH_GUIDE_TARGET_CODE = "01013215"
  
  // --- その他有価証券評価差額金チュートリアル用 ---
  const [isOtherSecuritiesTutorialGuiding, setIsOtherSecuritiesTutorialGuiding] =
    useState(false)
  const [isOtherSecuritiesEnterGuideActive, setIsOtherSecuritiesEnterGuideActive] =
    useState(false)
  const [isOtherSecuritiesScenario, setIsOtherSecuritiesScenario] = useState(false)
  const [isOtherSecPreviewGuideActive, setIsOtherSecPreviewGuideActive] =
    useState(false)

  // ===== PDF プレビュー（帳票イメージ） =====
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [pdfSrc, setPdfSrc] = useState<string>("/pdf/funding-breakdown-r6.pdf")
  const [pdfTitle, setPdfTitle] = useState<string>("PDFプレビュー")
  const [pdfTutorialActive, setPdfTutorialActive] = useState<boolean>(false)
  const [pdfTutorialMessage, setPdfTutorialMessage] = useState<string | undefined>(
    undefined
  )
  const [pdfPrimaryLabel, setPdfPrimaryLabel] = useState<string | undefined>(
    undefined
  )
  const [pdfSecondaryLabel, setPdfSecondaryLabel] = useState<string | undefined>(
    undefined
  )
  const [fundingOverviewOpen, setFundingOverviewOpen] = useState(false)
  const [otherSecuritiesOverviewOpen, setOtherSecuritiesOverviewOpen] =
    useState(false)
  const [otherSecuritiesOverviewStep, setOtherSecuritiesOverviewStep] =
    useState<"step1" | "step2" | "step3">("step1")
  const [otherSecuritiesAccountGuideActive, setOtherSecuritiesAccountGuideActive] =
    useState(false)
  const [fundingOverviewSection, setFundingOverviewSection] = useState<
    | "whatChanged"
    | "displayDifference"
    | "whereFunding"
    | "whyInput"
    | "howToInput"
  >("displayDifference")


  // ===== 画面フェーズ & メッセージ =====
  const [phase, setPhase] = useState<
    "header" | "detail" | "transferPreview" | "assignDesignated" | "confirmed"
  >("header")
  const [lastEditablePhase, setLastEditablePhase] =
    useState<"detail" | "header">("detail")

  const [headerMessage, setHeaderMessage] = useState<string>("")
  const [detailMessage, setDetailMessage] = useState<string>("")

  // ===== ヘッダー（伝票情報） =====
  const [era, setEra] = useState("令和")
  const [year, setYear] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [voucherNo, setVoucherNo] = useState("")
  const [inputMode, setInputMode] = useState("振替")
  const [decisionType, setDecisionType] = useState("なし")
  const [category, setCategory] = useState("通常伝票")
  const [fundingType, setFundingType] = useState<"一般" | "指定">("一般")

  // ===== 会計選択（親・子・孫） =====
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  const [parentCodeRaw, setParentCodeRaw] = useState("")
  const [childCodeRaw, setChildCodeRaw] = useState("")
  const [grandchildCodeRaw, setGrandchildCodeRaw] = useState("")
  const [parentName, setParentName] = useState("")
  const [childName, setChildName] = useState("")
  const [grandchildName, setGrandchildName] = useState("")

  const currentAccountingCode = grandchildCodeRaw || childCodeRaw || parentCodeRaw
  const currentAccountingName = grandchildName || childName || parentName

  // ===== 明細（借方・貸方：科目＋金額＋補助情報） =====
  // --- 借方 ---
  const [debitCode, setDebitCode] = useState("")
  const [debitParentName, setDebitParentName] = useState("")
  const [debitChildName, setDebitChildName] = useState("")
  const [debitAmount, setDebitAmount] = useState("")
  const [debitRemark, setDebitRemark] = useState("")
  const [debitTaxInfo, setDebitTaxInfo] = useState("")
  const [debitDueDate, setDebitDueDate] = useState("")
  const [debitBudgetRemain, setDebitBudgetRemain] = useState("")

  // --- 貸方 ---
  const [creditCode, setCreditCode] = useState("")
  const [creditParentName, setCreditParentName] = useState("")
  const [creditChildName, setCreditChildName] = useState("")
  const [creditAmount, setCreditAmount] = useState("")
  const [creditRemark, setCreditRemark] = useState("")
  const [creditTaxInfo, setCreditTaxInfo] = useState("")
  const [creditDueDate, setCreditDueDate] = useState("")
  const [creditBudgetRemain, setCreditBudgetRemain] = useState("")

  // ===== 二次仕訳プレビュー & 指定純資産 =====
  const [previewDebit, setPreviewDebit] = useState<{
    code: string
    parentName: string
    childName: string
    isPL: boolean
  } | null>(null)
  const [previewCredit, setPreviewCredit] = useState<{
    code: string
    parentName: string
    childName: string
    isPL: boolean
  } | null>(null)

  const [debitDesignated, setDebitDesignated] = useState<string>("")
  const [creditDesignated, setCreditDesignated] = useState<string>("")

  // ===== モーダル（科目検索／摘要） =====
  const [debitAccountModalOpen, setDebitAccountModalOpen] = useState(false)
  const [creditAccountModalOpen, setCreditAccountModalOpen] = useState(false)

  const [remarkModalOpen, setRemarkModalOpen] = useState(false)
  const [remarkSide, setRemarkSide] = useState<"debit" | "credit">("debit")

  // ===== ガイド用 ref / テキスト =====
  const headerEnterRef = useRef<HTMLButtonElement | null>(null)
  const remarkButtonRef = useRef<HTMLButtonElement | null>(null)
  const badgeRef = useRef<HTMLSpanElement | null>(null)
  const debitPreviewNameRef = useRef<HTMLDivElement | null>(null)
  const [remarkGuideText, setRemarkGuideText] =
    useState("摘要入力に進みます。")
  const [bsGuideStep, setBsGuideStep] = useState<"step1" | "step2" | "done">("step1")

  // funding-revenue-expense の開始処理を関数化
function startFundingRevenueExpenseScenario() {
  // 1) ヘッダー情報を入力済みにする（値はお好みでOK：現状を踏襲）
  setEra("令和")
  setYear("8")
  setMonth("4")
  setDay("1")
  setVoucherNo("1")
  setParentCodeRaw("1")
  setChildCodeRaw("1")

  // 2) 明細入力フェーズからスタート
  setPhase("detail")
  setLastEditablePhase("detail")

  // 3) チュートリアル開始（TutorialProvider）
  const target = TUTORIAL_SCENARIOS.find((s) => s.id === "funding-revenue-expense")
  if (target) startTutorial(target)

  // 4) この画面専用のガイドをON（現状の funding-revenue-expense と同じ）
  setIsRemarkTutorialScenario(true)
  setIsFundingTutorialMode(true)
  setIsFundingTutorialGuiding(true)
  setIsFundingRemarkGuiding(false)
  setIsOtherSecuritiesTutorialGuiding(false)
}

  function startOtherSecuritiesScenario() {
    setEra("令和")
    setYear("8")
    setMonth("4")
    setDay("1")
    setVoucherNo("1")
    setParentCodeRaw("1")
    setChildCodeRaw("1")

    setPhase("detail")
    setLastEditablePhase("detail")

    const target = TUTORIAL_SCENARIOS.find(
      (s) => s.id === "other-securities-revaluation",
    )
    if (target) startTutorial(target)

    setIsRemarkTutorialScenario(true)
    setIsFundingTutorialMode(false)
    setIsFundingTutorialGuiding(false)
    setIsFundingRemarkGuiding(false)
    setIsOtherSecuritiesTutorialGuiding(true)
    setIsOtherSecuritiesEnterGuideActive(false)
    setIsOtherSecuritiesScenario(true)
  }

  function startOtherSecuritiesNetAssetsSelection() {
    setEra("令和")
    setYear("8")
    setMonth("4")
    setDay("1")
    setVoucherNo("1")
    setParentCodeRaw("1")
    setChildCodeRaw("1")

    setPhase("detail")
    setLastEditablePhase("detail")

    setIsRemarkTutorialScenario(true)
    setIsFundingTutorialMode(false)
    setIsFundingTutorialGuiding(false)
    setIsFundingRemarkGuiding(false)
    setIsOtherSecuritiesTutorialGuiding(false)
    setIsOtherSecuritiesEnterGuideActive(false)
    setIsOtherSecuritiesScenario(true)

    setOtherSecuritiesAccountGuideActive(true)
    setDebitAccountModalOpen(true)
  }

  function startOtherSecuritiesAfterAccountPicked() {
    setEra("令和")
    setYear("8")
    setMonth("4")
    setDay("1")
    setVoucherNo("1")
    setParentCodeRaw("1")
    setChildCodeRaw("1")

    setPhase("detail")
    setLastEditablePhase("detail")

    const target = TUTORIAL_SCENARIOS.find(
      (s) => s.id === "other-securities-revaluation",
    )
    if (target) startTutorial(target)

    setIsRemarkTutorialScenario(true)
    setIsFundingTutorialMode(false)
    setIsFundingTutorialGuiding(false)
    setIsFundingRemarkGuiding(false)
    setIsOtherSecuritiesTutorialGuiding(false)
    setIsOtherSecuritiesEnterGuideActive(false)
    setIsOtherSecuritiesScenario(true)

    // 参ボタン押下後の状態を再現
    setDebitCode("960100")
    setDebitParentName("その他有価証券評価差額金")
    setDebitChildName("その他有価証券評価差額金（評価損）")
    setDebitAmount("1000000")

    setCreditCode("04510101")
    setCreditParentName("投資有価証券")
    setCreditChildName("投資有価証券")
    setCreditAmount("1000000")

    setIsOtherSecuritiesEnterGuideActive(false)
    setRemarkGuideText("その他有価証券の財源を設定します。")
    setIsFundingRemarkGuiding(true)

    setTimeout(() => {
      remarkButtonRef.current?.focus()
      remarkButtonRef.current?.scrollIntoView({ block: "center" })
    }, 0)

    setIsOtherSecuritiesEnterGuideActive(true)
  }


  // ===== ここから useEffect / イベントハンドラ… =====
  useEffect(() => {
  if (phase === "transferPreview" && isOtherSecPreviewGuideActive) {
    const t = setTimeout(() => {
      debitPreviewNameRef.current?.focus()
      debitPreviewNameRef.current?.scrollIntoView({ block: "center" })
    }, 0)
    return () => clearTimeout(t)
  }
}, [phase, isOtherSecPreviewGuideActive])

useEffect(() => {
  const scenario = sessionStorage.getItem("pendingTutorialScenario")
  if (!scenario) return

  if (scenario === "funding-overview-first") {
    sessionStorage.removeItem("pendingTutorialScenario")
    setFundingOverviewSection("displayDifference")
    setFundingOverviewOpen(true)
    setOtherSecuritiesOverviewOpen(false)
    return
  }

  if (scenario === "funding-overview-second") {
    sessionStorage.removeItem("pendingTutorialScenario")
    setFundingOverviewSection("displayDifference")
    setFundingOverviewOpen(true)
    setOtherSecuritiesOverviewOpen(false)
    return
  }

  if (typeof window === "undefined") return

  const pendingScenarioId =
    window.sessionStorage.getItem("pendingTutorialScenario")

// ★ここから：その他の pendingScenario を処理
// scenario には最初の getItem の結果が入っている前提
if (
  scenario === "funding-revenue-expense" ||
  scenario === "other-securities-revaluation" ||
  scenario === "bs-funding-abolish"
) {
  // 1回使ったら削除
  sessionStorage.removeItem("pendingTutorialScenario")

  // funding-revenue-expense は関数で開始
  if (scenario === "funding-revenue-expense") {
    startFundingRevenueExpenseScenario()
    return
  }

  if (scenario === "other-securities-revaluation") {
    setFundingOverviewOpen(false)
    setOtherSecuritiesOverviewOpen(true)
    setOtherSecuritiesOverviewStep("step1")
    return
  }

  // 既存ロジック（あなたの現状を踏襲）
  // other-securities-revaluation / bs-funding-abolish は今の処理のまま
  setEra("令和")
  setYear("8")
  setMonth("4")
  setDay("1")
  setVoucherNo("1")
  setParentCodeRaw("1")
  setChildCodeRaw("1")

  setPhase("detail")
  setLastEditablePhase("detail")

  const target = TUTORIAL_SCENARIOS.find((s) => s.id === scenario)
  if (target) startTutorial(target)

  if (scenario === "bs-funding-abolish") {
    setIsRemarkTutorialScenario(false)
    setIsFundingTutorialMode(false)
    setIsFundingTutorialGuiding(false)
    setIsFundingRemarkGuiding(false)
    setIsOtherSecuritiesTutorialGuiding(false)
    setIsOtherSecuritiesScenario(false)

    setIsBsFundingScenario(true)
    setBsGuideStep("step1")
    setDebitAccountModalOpen(true)
  }
}
}, [startTutorial])

function mapIncomeExpenseToPLLocal(
  code: string,
  side: "debit" | "credit"
): PLMapped {
  const kind = resolveAccountKind(code)

  // ★ 特例：その他有価証券評価差額金（評価益／評価損）は
  //    財源（一般/指定）で 109200 / 109100 へ自動分岐して展開する
  const isOtherSecEvalCode =
    code === "740100" || code === "960100"

 if (isOtherSecEvalCode) { 
  // 108100 を基点に、財源で 109100/109200 に分岐
  const adjustedCode = resolveSecuritiesGainLossTarget("108100", fundingType)

  // 純資産側から親名称を取る（なければ保険で PL 側も見る）
  const parentName =
   netAssetParentMap.get(adjustedCode) ??
   plParentMap.get(adjustedCode) ??
   ""

  // 子科目ラベル（account-data に名称が入っていればそれを使ってもOK）
  const childLabel =
   adjustedCode === "109100"
     ? "（うち指定純資産に係る評価差額金）"
     : adjustedCode === "109200"
        ? "(うち一般純資産に係る評価差額金)"
        : "その他有価証券評価差額金"

    return {
      code: adjustedCode,
      parentName,
      childName: childLabel,
      kind: "PL", // ← ここを "PL" にしておくのがポイント
    }
  }

// ① 収支科目（activity） → PL（account-data の sourceCode 紐付け）
if (kind === "IncomeExpense") {
  // Map<string, AccountNode[]> から、先頭の PL ノードを取り出す
  const plNodes = activityToPL.get(code)
  const plNode = plNodes?.[0] // ← ここがポイント

  if (plNode?.code) {
    const parentName = plParentMap.get(plNode.code) ?? ""
    return {
      code: plNode.code,
      parentName,
      childName: plNode.name1,
      kind: "PL",
    }
  }

  // マッピングが見つからなかった場合
  return {
    code,
    parentName: side === "credit" ? "収益（仮）" : "費用（仮）",
    childName: "（紐付未設定：account-data.ts を確認）",
    kind: "PL",
  }
}

// ② PL科目（pl） → そのまま PL として扱う
if (kind === "PL") {
  // ここも activityToPL は配列なので合わせておく（なくても fallback で動く）
  const plNodes = activityToPL.get(code)
  const plNode = plNodes?.[0]

  const parentName =
    plParentMap.get(code) ??
    (/^4/.test(code)
      ? "収益（PL）"
      : /^5/.test(code)
        ? "費用（PL）"
        : side === "credit"
          ? "収益（PL）"
          : "費用（PL）")

  return {
    code,
    parentName,
    childName: plNode?.name1 ?? "（PL科目）",
    kind: "PL",
  }
}

// ③ それ以外（BS 等）はそのまま
return { code, parentName: "", childName: "", kind: "Other" }
}


  // === キー押下（ヘッダー側）
  function handleHeaderKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && phase === "header") {
      tryMoveHeaderToDetail()
    }
  }

  // 戻る（確定帯）
  function handleBackFromConfirmed() {
    setPhase("header")
    setHeaderMessage("")
    setDetailMessage("")
  }

  function clearPreviewState() {
    setPreviewDebit(null)
    setPreviewCredit(null)
    setDebitDesignated("")
    setCreditDesignated("")
  }

  // 明細側のEnter
  function handleDetailKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Enter") return
    if (phase === "detail") onEnterAtDetail()
    else if (phase === "transferPreview") onEnterAtTransferPreview()
    else if (phase === "assignDesignated") onEnterAtAssignDesignated()
  }
function handleEnterFromBar() {
  // その他有価証券シナリオの Enter ガイドは従来通り
  if (isOtherSecuritiesEnterGuideActive) {
    setIsOtherSecuritiesEnterGuideActive(false)
  }

  // ★ 収益・費用＋財源チュートリアル用：Enterを押したタイミングでステップを進める
  if (fundingEnterGuideStep === "primary") {
    // 一次仕訳を確定 → 二次仕訳プレビューへ進むので、
    // 次のレンダーから「二次仕訳を確定します」に切り替える
    setFundingEnterGuideStep("secondary")
  } else if (fundingEnterGuideStep === "secondary") {
    // 二次仕訳を確定 → 指定純資産科目の入力フェーズへ
    setFundingEnterGuideStep("none")
    setIsDesignatedSelectGuideActive(true)
  }

  // ★ 既存の Enter ロジックはそのまま残す
  if (phase === "header") tryMoveHeaderToDetail()
  else if (phase === "detail") onEnterAtDetail()
  else if (phase === "transferPreview") onEnterAtTransferPreview()
  else if (phase === "assignDesignated") onEnterAtAssignDesignated()
}

  // 戻る(F6)
  function handleBackFromBar() {
    if (phase === "transferPreview" || phase === "confirmed") {
      clearPreviewState()
      setDetailMessage("")
      setPhase(lastEditablePhase)
      return
    }
    setPhase("header")
    setHeaderMessage("")
    setDetailMessage("")
  }

  // 終了(F4)
  function handleExitFromBar() {
    router.push("/home")
  }

  // ヘッダー→明細へ（必須チェック & 伝票番号の自動セット）
  function tryMoveHeaderToDetail() {
    const dateOk = era.trim() !== "" && year.trim() !== "" && month.trim() !== "" && day.trim() !== ""
    const accountingOk = parentCodeRaw.trim() !== ""
    if (!dateOk || !accountingOk) {
      setHeaderMessage("日付・会計を選択してください")
      return
    }
    if (voucherNo.trim() === "") setVoucherNo("1")
    setHeaderMessage("")
    setPhase("detail")
    setLastEditablePhase("detail")
  }

  // 必須チェック（明細）
  function validateDetailRequired(): string | null {
    if (!debitCode || !creditCode) return "科目を入力（または参照選択）してください。"
    if (!debitAmount || !creditAmount) return "金額を入力してください。"
    return null
  }

// 明細で Enter
function onEnterAtDetail() {
  const err = validateDetailRequired()
  if (err) {
    setDetailMessage(err)
    return
  }
  setDetailMessage("")

  const debitKind = resolveAccountKind(debitCode)
  const creditKind = resolveAccountKind(creditCode)

  // ★ 借方：収支 or PL の場合は mapIncomeExpenseToPLLocal に通す
  const d: PLMapped =
    debitKind === "IncomeExpense" || debitKind === "PL"
      ? mapIncomeExpenseToPLLocal(debitCode, "debit")
      : {
          code: debitCode,
          parentName: debitParentName,
          childName: debitChildName,
          kind: "Other",
        }

  // ★ 貸方も同様
  const c: PLMapped =
    creditKind === "IncomeExpense" || creditKind === "PL"
      ? mapIncomeExpenseToPLLocal(creditCode, "credit")
      : {
          code: creditCode,
          parentName: creditParentName,
          childName: creditChildName,
          kind: "Other",
        }

  // ★ プレビュー表示用 state にセット
  setPreviewDebit({
    code: d.code,
    parentName: d.parentName,
    childName: d.childName,
    isPL: d.kind === "PL",
  })
  setPreviewCredit({
    code: c.code,
    parentName: c.parentName,
    childName: c.childName,
    isPL: c.kind === "PL",
  })

  setPhase("transferPreview")
  setLastEditablePhase("detail")
  //その他有価証券シナリオ：プレビュー到達時に仮方科目へ案内
  if (isOtherSecuritiesScenario) {
    setIsOtherSecPreviewGuideActive(true)
  }
}


  // プレビューで Enter
  function onEnterAtTransferPreview() {
    if (fundingType === "指定") {
      setDetailMessage("")
      setPhase("assignDesignated")
      return
    }
    setDetailMessage("")
    setPhase("confirmed")
  }

  // 指定選択で Enter
  function onEnterAtAssignDesignated() {
    const needDebit = previewDebit?.isPL
    const needCredit = previewCredit?.isPL
    if ((needDebit && !debitDesignated) || (needCredit && !creditDesignated)) {
      setDetailMessage("指定純資産科目を選択してください。")
      return
    }
    setDetailMessage("")
    setPhase("confirmed")
  }

// 編集可否
const headerDisabled = phase !== "header"
const detailDisabled = phase !== "detail"
const previewLocked =
  phase === "transferPreview" ||
  phase === "assignDesignated" ||
  phase === "confirmed"

// バッジ表示
const isFundingTarget = (code?: string) =>
  isFundingTargetCode(code || "")

const showDebitBadge =
  (phase === "detail" && isFundingTarget(debitCode)) ||
  (["transferPreview", "assignDesignated", "confirmed"].includes(phase) &&
    !!previewDebit?.isPL)

const showCreditBadge =
  (phase === "detail" && isFundingTarget(creditCode)) ||
  (["transferPreview", "assignDesignated", "confirmed"].includes(phase) &&
    !!previewCredit?.isPL)


  // RemarkEntryModal 用の種別判定
  const resolveAccountKindForSide = (side: "debit" | "credit"): AccountKind => {
    const code = side === "debit" ? debitCode : creditCode

    const group = resolveAccountKind(code)
    return resolveAccountKind(code)
  }

  // 指定純資産セレクタ
function renderDesignatedSelector(side: "debit" | "credit") {
  if (phase === "assignDesignated" || phase === "confirmed") {
    const pv = side === "debit" ? previewDebit : previewCredit
    if (!pv?.isPL || fundingType !== "指定") return null

    const opts = getDesignatedOptionsForLocal(pv.code)
    const value = side === "debit" ? debitDesignated : creditDesignated
    const onChange = (v: string) => {
      if (side === "debit") setDebitDesignated(v)
      else setCreditDesignated(v)
    }

    // ★ 科目が選択済みかどうかでガイドの内容を切り替える
    const hasSelected = !!value

    return (
      <div className="mt-2 inline-block">
        <div className="text-[12px] text-[#1a1a1a] mb-1">
          指定純資産科目
        </div>

        <GuidedFocus
          active={isDesignatedSelectGuideActive && side === "debit"}
          message={
            hasSelected
              ? "ここで設定した内容は財源区分別内訳、貸借対照表に反映されます。"
              : "財源で「指定」が選択された場合、\n対応する指定純資産科目を選択します。"
          }
          placement="right"
          // ★ 枠を select にピッタリ合わせる
          fullWidth={false}
          // ★ 選択済みのときだけ「次へ」ボタンを出す
          nextLabel={hasSelected ? "次へ" : undefined}
onNext={
  hasSelected
    ? () => {
        setIsDesignatedSelectGuideActive(false)
        openPdfPreview({
          src: "/pdf/funding-breakdown-r6.pdf",
          title: "財源区分別内訳",
          tutorial: {
            active: true,
            message: "先ほど入力した「一般・指定」の財源区分が、\n各区分の収益・費用に反映されます。",
            primaryLabel: "変更点ガイドへ",
            secondaryLabel: "終了",
          },
        })
      }
    : undefined
}

        >
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={phase === "confirmed"}
            className="h-[24px] w-[240px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[12px] leading-tight"
          >
            <option value="">選択してください</option>
            {opts.map((o) => (
              <option key={o.code} value={o.code}>
                {o.code} {o.name}
              </option>
            ))}
          </select>
        </GuidedFocus>
      </div>
    )
  }
}

  // 二次仕訳の表示
function PreviewAccountLabel({
  code,
  parentName,
  childName,
}: {
  code?: string
  parentName?: string
  childName?: string
}) {
  // 親があるとき → 上段: 親 / 下段: 子
  // 親がないとき → 上段は出さず / 下段に main を表示
  const hasParent = !!parentName
  const mainName = hasParent
    ? childName || parentName || ""
    : childName || parentName || ""

  const subName = hasParent ? parentName : ""

  return (
    <div className="flex flex-col">
      <div className="text-[14px] text-[#444] tabular-nums">
        {code ?? ""}
      </div>
      {subName && (
        <div className="text-[15px]">
          {subName}
        </div>
      )}
      <div className="text-[16px] font-medium">
        {mainName}
      </div>
    </div>
  )
}

  // 共通オープナー
function openPdfPreview(opts: {
  src: string
  title?: string
  tutorial?: { active?: boolean; message?: string; primaryLabel?: string; secondaryLabel?: string }
}) {
  setPdfSrc(opts.src)
  setPdfTitle(opts.title ?? "PDFプレビュー")
  setPdfTutorialActive(!!opts.tutorial?.active)
  setPdfTutorialMessage(opts.tutorial?.message)
  setPdfPrimaryLabel(opts.tutorial?.primaryLabel)
  setPdfSecondaryLabel(opts.tutorial?.secondaryLabel)
  setIsPdfPreviewOpen(true)
}

// === Enterキーのチュートリアルメッセージ制御 ===
const isFundingEnterGuideActive = fundingEnterGuideStep !== "none"

// Enter ガイドは「摘要誘導中」「モーダル表示中」「一般・指定ガイド中」は出さない
const enterTutorialActive =
  (isOtherSecuritiesEnterGuideActive || isFundingEnterGuideActive) &&
  !remarkModalOpen &&
  !isFundingRemarkGuiding &&
  !isFundingTypeGuideActive

let enterTutorialMessage: string | undefined
if (isOtherSecuritiesEnterGuideActive) {
  enterTutorialMessage = "伝票確定に進みます。"
} else if (fundingEnterGuideStep === "primary") {
  enterTutorialMessage = "一次仕訳を確定します。"
} else if (fundingEnterGuideStep === "secondary") {
  enterTutorialMessage = "二次仕訳を確定します。"
}

  const fundingOverviewMenu = [
    { id: "displayDifference", label: "① 表示の変更点（様式比較）" },
    { id: "whereFunding", label: "② 財源区分はどこへ行った？" },
    { id: "whyInput", label: "③ 仕訳はどう変わった？" },
    { id: "howToInput", label: "④ どうやって入力する？" },
  ] as const

  const handleFundingOverviewExit = () => {
    setFundingOverviewOpen(false)
    stopTutorial()
    setIsRemarkTutorialScenario(false)
    router.push("/home")
  }

  const handleOtherSecuritiesOverviewExit = () => {
    setOtherSecuritiesOverviewOpen(false)
    stopTutorial()
    setIsRemarkTutorialScenario(false)
    router.push("/home")
  }

  const handleFundingOverviewNext = () => {
    if (fundingOverviewSection === "displayDifference") {
      setFundingOverviewSection("whereFunding")
      return
    }
    if (fundingOverviewSection === "whereFunding") {
      setFundingOverviewSection("whyInput")
      return
    }
    if (fundingOverviewSection === "whyInput") {
      setFundingOverviewSection("howToInput")
      return
    }
    setFundingOverviewOpen(false)
    startFundingRevenueExpenseScenario()
  }

  const handleFundingOverviewBack = () => {
    if (fundingOverviewSection === "howToInput") {
      setFundingOverviewSection("whyInput")
      return
    }
    if (fundingOverviewSection === "whyInput") {
      setFundingOverviewSection("whereFunding")
      return
    }
    if (fundingOverviewSection === "whereFunding") {
      setFundingOverviewSection("displayDifference")
    }
  }

  const isAnyOverviewOpen = fundingOverviewOpen || otherSecuritiesOverviewOpen
  
  return (
    <div className="flex flex-col text-[14px] leading-tight text-[#1a1a1a]">
      {!isAnyOverviewOpen && (
        <FunctionKeyBar
          onEnter={handleEnterFromBar}
          onBack={handleBackFromBar}
          onExit={handleExitFromBar}
          enterTutorialActive={enterTutorialActive}
          enterTutorialMessage={enterTutorialMessage}
          onRegisterEnterRef={(el) => (headerEnterRef.current = el)}
        />
      )}

      {fundingOverviewOpen && (
        <section className="mx-auto mt-2 w-full max-w-6xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Overview
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                収益・費用科目での財源区分入力：概要
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleFundingOverviewExit}
            >
              終了
            </Button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="rounded-[6px] border border-[#e3cad7] bg-white p-2">
              {fundingOverviewMenu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFundingOverviewSection(item.id)}
                  className={[
                    "w-full rounded-[4px] px-3 py-2.5 text-left text-[14px] transition",
                    fundingOverviewSection === item.id
                      ? "bg-[#7D2248] text-white"
                      : "text-black hover:bg-[#fff0f5]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-4">
              {fundingOverviewSection === "whatChanged" && (
                <div className="space-y-4 text-slate-800">
                  <div className="text-[16px] font-semibold text-black">
                    ① ゴールの再定義（超重要）
                  </div>
                  <div className="rounded-[6px] border border-[#f3cfe0] bg-[#fff7fb] p-3 text-[14px] leading-relaxed">
                    <div className="font-semibold">この画面のゴールは何か？</div>
                    <div className="mt-2">
                      活動計算書では「本表に財源区分が出ない」<br />
                      だから入力時に財源区分が必要になる
                    </div>
                    <div className="mt-2 font-semibold">
                      ここまで理解できれば勝ち。
                    </div>
                  </div>
                </div>
              )}

              {fundingOverviewSection === "displayDifference" && (
                <div className="space-y-4 text-slate-800">
                  <div className="text-[16px] font-semibold text-black">
                    ① 表示の変更点（様式比較）
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex h-full flex-col rounded-[6px] border border-slate-200 bg-[#eef6ff] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[16px] font-semibold text-[#1f4e79]">
                          正味財産増減計算書
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: NET_ASSETS_STATEMENT_PDF,
                              title: "正味財産増減計算書",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-2 py-[2px] text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          様式を見る
                        </button>
                      </div>
                      <div className="mt-3 rounded-[4px] border border-[#cfe0f5] bg-white px-3 py-3 text-[14px] text-slate-700 leading-relaxed">
                        <div className="font-semibold text-[#1f4e79] text-[15px]">
                          (A) 一般正味財産増減の部
                        </div>
                        <div className="mt-2 rounded-[4px] border border-slate-200 bg-[#f7fbff] p-3">
                          <div>経常増減の部</div>
                          <div className="mt-1 border-t border-dashed border-slate-200 pt-1">
                            経常外増減の部
                          </div>
                        </div>
                        <div className="mt-3 font-semibold text-[#1f4e79] text-[15px]">
                          (B) 指定正味財産増減の部
                        </div>
                        <div className="mt-2 rounded-[4px] border border-slate-200 bg-[#f7fbff] p-3">
                          <div>指定の増減</div>
                          <div className="mt-1 border-t border-dashed border-slate-200 pt-1">
                            指定解除 → 振替
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto pt-4 text-[14px] font-semibold text-black">
                        ・財源ごとの財産の動きを本表で表示
                      </div>
                    </div>

                    <div className="flex h-full flex-col rounded-[6px] border border-slate-200 bg-[#f4edff] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[16px] font-semibold text-[#5a2d82]">
                          活動計算書
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: ACTIVITY_STATEMENT_PDF,
                              title: "活動計算書",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-2 py-[2px] text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          様式を見る
                        </button>
                      </div>
                      <div className="mt-3 rounded-[4px] border border-[#e3d8f5] bg-white px-3 py-3 text-[14px] text-slate-700 leading-relaxed">
                        <div className="font-semibold text-[#5a2d82] text-[15px]">
                          経常活動区分
                        </div>
                        <div className="mt-2 border-t border-dashed border-slate-200 pt-2 font-semibold text-[#5a2d82] text-[15px]">
                          その他活動区分
                        </div>
                      </div>
                      <div className="mt-auto pt-4 text-[14px] font-semibold text-black">
                        <div>・法人全体の財産の動きを表示</div>
                        <div className="mt-1">・財源ごとの動きは本表に出ない</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      disabled
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-[#7D2248] bg-[#fff0f5] px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={handleFundingOverviewNext}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}

              {fundingOverviewSection === "whereFunding" && (
                <div className="space-y-4 text-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] font-semibold text-black">
                      ② 財源区分はどこへ行った？
                    </div>
                  </div>
                  <div className="space-y-2 text-[14px] text-slate-700">
                    <div className="font-semibold text-black">
                      財源ごとの動きは、注記に記載します
                    </div>
                    <div>
                      活動計算書の本表では財源別に表示しないため、財源別の内訳は注記で確認します。
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 rounded-[6px] border border-slate-200 bg-white p-8 leading-relaxed">
                    <div className="min-h-[140px] w-full max-w-[520px] rounded-[6px] border border-slate-200 bg-[#f4edff] p-8 text-center">
                      <div className="text-2xl font-semibold text-[#5a2d82]">
                        活動計算書（本表）
                      </div>
                      <div className="mt-3 text-lg text-slate-800">
                        法人全体で表示
                      </div>
                      <div className="mt-2 text-lg text-slate-800">
                        財源別の内訳は表示しない
                      </div>
                    </div>
                    <div className="text-3xl text-slate-600">↓</div>
                    <div className="min-h-[140px] w-full max-w-[520px] rounded-[6px] border border-slate-200 bg-[#eef6ff] p-8 text-center">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-2xl font-semibold text-[#1f4e79]">
                          注記（財源別内訳）
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: "/pdf/notes-funding-breakdown.pdf",
                              title: "注記（財源別内訳）",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-3 py-1 text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          様式を見る
                        </button>
                      </div>
                      <div className="mt-4 text-lg text-slate-800">
                        財源ごとの財産の動きを表示
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={handleFundingOverviewBack}
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-[#7D2248] bg-[#fff0f5] px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={handleFundingOverviewNext}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}

              {fundingOverviewSection === "whyInput" && (
                <div className="space-y-4 text-slate-800">
                  <div className="text-lg font-semibold text-slate-900">
                    ③ 仕訳（伝票入力）はどう変わった？
                  </div>
                  <div className="text-[16px] leading-relaxed text-slate-800">
                    帳票が変わったことで、入力方法にも影響があります。
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[6px] border border-slate-200 bg-[#f4edff] p-6 text-[16px] leading-relaxed text-slate-800">
                      <div className="text-[18px] font-semibold text-[#5a2d82]">
                        【20年基準（旧）】
                      </div>
                      <div className="mt-4 font-semibold">費用科目：</div>
                      <div>→ 一般正味財産しか持たない</div>
                      <div className="mt-3 font-semibold">収益科目：</div>
                      <div>→ 一般／指定の両方が存在</div>
                      <div className="mt-4 font-semibold">
                        指定財源で費用が発生した場合：
                      </div>
                      <div>① 指定正味財産 → 一般正味財産へ振替</div>
                      <div>② 費用は一般正味財産の部で表示</div>
                      <div className="mt-4 rounded-[6px] border border-slate-200 bg-white p-4 text-center text-[18px] font-semibold text-[#5a2d82]">
                        指定 →（振替）→ 一般 → 費用表示
                      </div>
                      <div className="mt-4 font-semibold text-[#5a2d82]">
                        指定の費用は、最終的に一般で表現していた
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-slate-200 bg-[#eef6ff] p-6 text-[16px] leading-relaxed text-slate-800">
                      <div className="text-[18px] font-semibold text-[#1f4e79]">
                        【令和6年基準】
                      </div>
                      <div className="mt-4">・一般正味財産への振替が廃止</div>
                      <div>・指定純資産でも費用科目ごとに減少を表示</div>
                      <div className="mt-4 rounded-[6px] border border-slate-200 bg-white p-4 text-center text-[18px] font-semibold text-[#1f4e79]">
                        指定 →（そのまま）→ 指定純資産の減少として表示
                      </div>
                      <div className="mt-4 font-semibold text-[#1f4e79]">
                        指定でも“費用科目単位”で減少を示す必要がある
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={handleFundingOverviewBack}
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-[#7D2248] bg-[#fff0f5] px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={handleFundingOverviewNext}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}

              {fundingOverviewSection === "howToInput" && (
                <div className="space-y-4 text-slate-800">
                  <div className="rounded-[6px] border border-[#f3cfe0] bg-[#fff7fb] p-4 text-center text-[18px] font-semibold text-slate-800">
                    では、どうやって入力で区別する？
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[6px] border border-slate-200 bg-white p-5 text-[16px] leading-relaxed text-slate-800">
                      <div className="text-[17px] font-semibold">
                        案①：科目を財源ごとに分ける
                      </div>
                      <div className="mt-3">
                        収益・費用科目を<br />
                        ・一般用<br />
                        ・指定用<br />
                        で分ける
                      </div>
                      <div className="mt-4 font-semibold text-slate-700">
                        * 科目が増える<br />
                        * 選択が煩雑<br />
                        * 管理が複雑
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-[#7D2248] bg-[#fff7fb] p-5 text-[16px] leading-relaxed text-slate-800">
                      <div className="text-[17px] font-semibold text-[#7D2248]">
                        案②：科目は共通＋入力時に財源選択（採用案）
                      </div>
                      <div className="mt-3">
                        収益・費用科目は共通<br />
                        ↓<br />
                        入力時に<br />
                        「一般／指定」を選択
                      </div>
                      <div className="mt-4 font-semibold text-slate-700">
                        * 科目体系がシンプル<br />
                        * 管理がしやすい
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-[#7D2248] bg-[#fff0f5] p-4 text-center text-[20px] font-bold text-[#7D2248]">
                    入力時に財源を持たせる方式を採用
                  </div>
                  <div className="text-center text-[16px] text-slate-700">
                    科目を増やさずに、帳票構造に対応するための設計です。
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={handleFundingOverviewBack}
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-[#7D2248] bg-[#fff0f5] px-3 text-xs font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={handleFundingOverviewNext}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3" />
        </section>
      )}

      {otherSecuritiesOverviewOpen && (
        <section className="mx-auto mt-2 w-full max-w-6xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Overview
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                その他有価証券評価差額金：概要
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleOtherSecuritiesOverviewExit}
            >
              終了
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="rounded-[6px] border border-[#e3cad7] bg-white p-2">
              {[
                { id: "step1", label: "① その他有価証券とは？" },
                { id: "step2", label: "② どうやって金額を変える？" },
                { id: "step3", label: "③ どうやって入力する？" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setOtherSecuritiesOverviewStep(
                      item.id as "step1" | "step2" | "step3",
                    )
                  }
                  className={[
                    "w-full rounded-[4px] px-3 py-2.5 text-left text-[14px] transition",
                    otherSecuritiesOverviewStep === item.id
                      ? "bg-[#7D2248] text-white"
                      : "text-black hover:bg-[#fff0f5]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-slate-800">
              {otherSecuritiesOverviewStep === "step1" && (
                <div className="space-y-4">
                  <div className="text-xl font-semibold">
                    その他有価証券とは
                  </div>

                  <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-base leading-relaxed">
                    <div className="font-semibold">定義</div>
                    <ul className="mt-2 list-disc pl-5">
                      <li>
                        売買目的／満期保有／子会社関連に該当しない有価証券
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-base leading-relaxed">
                    <div className="font-semibold">貸借対照表に載せる金額（評価）の原則</div>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div className="rounded-[6px] border border-slate-200 bg-[#eef6ff] p-4">
                        <div className="text-lg font-semibold text-[#1f4e79]">
                          市場価格あり
                        </div>
                        <div className="mt-3 font-semibold text-slate-800">
                          貸借対照表に載せる金額
                        </div>
                        <div>→ 決算日時点の市場価格（時価）</div>
                        <div className="mt-3 font-semibold text-slate-800">
                          どうなる？
                        </div>
                        <div>・買った金額と違っていても、いまの価格で表示する</div>
                        <div className="mt-2">・値上がり／値下がり分が発生する</div>
                      </div>
                      <div className="rounded-[6px] border border-slate-200 bg-[#f4edff] p-4">
                        <div className="text-lg font-semibold text-[#5a2d82]">
                          市場価格なし
                        </div>
                        <div className="mt-3 font-semibold text-slate-800">
                          貸借対照表に載せる金額
                        </div>
                        <div>→ 買ったときの金額（取得価額）</div>
                        <div className="mt-3 font-semibold text-slate-800">
                          どうなる？
                        </div>
                        <div>・基本は金額を変更しない</div>
                        <div className="mt-2">
                          ・ただし、時価が半額以下になり回復の見込みがない場合は、損失として記録する</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={() => setOtherSecuritiesOverviewStep("step2")}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}

              {otherSecuritiesOverviewStep === "step2" && (
                <div className="space-y-4">
                  <div className="text-xl font-semibold">
                    どうやって金額を変えるか？
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-[6px] border border-slate-200 bg-[#f4edff] p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xl font-semibold text-[#5a2d82]">
                          OLD（20年基準）
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: "/pdf/old20_othersecurities_display_position.pdf",
                              title: "表示位置（20年基準）",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-2 py-[2px] text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          帳票イメージを見る
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col items-center gap-3 text-lg">
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-white p-4 text-center flex items-center justify-center">
                          有価証券評価損益（損益科目）
                        </div>
                        <ArrowDown className="h-8 w-8 text-slate-600" />
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-white p-4 text-center flex items-center justify-center">
                          正味財産増減計算書
                        </div>
                        <ArrowDown className="h-8 w-8 text-slate-600" />
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-white p-4 text-center flex flex-col items-center justify-center">
                          貸借対照表
                          <div className="mt-2 text-base text-slate-700">
                            （有価証券の価額 + 正味財産の増減）
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-base text-slate-700">
                        損益として計上し、正味財産増減計算書を通して貸借対照表へ反映
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-slate-200 bg-[#eef6ff] p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xl font-semibold text-[#1f4e79]">
                          NEW（令和6年基準）
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: "/pdf/r6_standard_other_securities_evaluation_display.pdf",
                              title: "表示位置（令和6年基準）",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-2 py-[2px] text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          帳票イメージを見る
                        </button>
                      </div>
                      <div className="relative mt-4 flex flex-col items-center gap-3 text-lg">
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-white p-4 text-center flex items-center justify-center">
                          その他有価証券評価差額金（純資産科目）
                        </div>
                        <ArrowDown className="h-8 w-8 text-slate-600 opacity-0" />
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-slate-100 p-3 text-center text-base text-slate-600 flex flex-col items-center justify-center">
                          活動計算書
                          <div className="mt-1 text-sm">※ここは通らない</div>
                        </div>
                        <ArrowDown className="h-8 w-8 text-slate-600 opacity-0" />
                        <div className="w-full h-[72px] rounded-[6px] border border-slate-200 bg-white p-4 text-center flex flex-col items-center justify-center">
                          貸借対照表
                          <div className="mt-2 text-base text-slate-700">
                            （有価証券の価額 + 純資産の増減）
                          </div>
                        </div>
                        <div className="pointer-events-none absolute left-1/2 top-[72px] bottom-[72px] z-20 w-[2px] -translate-x-1/2 bg-slate-500" />
                        <ArrowDown
                          className="pointer-events-none absolute left-1/2 z-20 h-9 w-9 -translate-x-1/2 text-slate-600"
                          style={{ bottom: "64px" }}
                        />
                      </div>
                      <div className="mt-4 text-base text-slate-700">
                        活動計算書を通さず、純資産を直接増減させる
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-[#f3cfe0] bg-[#fff7fb] p-4 text-center text-lg font-semibold text-slate-800">
                    旧基準は損益を通して金額を変える。新基準は純資産を直接変える。
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 px-4 text-sm"
                      onClick={() => setOtherSecuritiesOverviewStep("step1")}
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={() => setOtherSecuritiesOverviewStep("step3")}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              )}

              {otherSecuritiesOverviewStep === "step3" && (
                <div className="space-y-4">
                  <div className="text-xl font-semibold">
                    会計システムではどう入力する？
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-base leading-relaxed">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                          1
                        </span>
                        <div className="text-lg font-semibold">科目選択</div>
                      </div>
                      <div className="mt-3 space-y-2 text-base">
                        <div className="rounded-[4px] border border-slate-200 bg-[#eef6ff] p-2 text-slate-800">
                          評価益の場合：<br />
                          その他有価証券評価差額金（評価益）
                        </div>
                        <div className="rounded-[4px] border border-slate-200 bg-[#ffecec] p-2 text-slate-800">
                          評価損の場合：<br />
                          その他有価証券評価差額金（評価損）
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-base leading-relaxed">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                          2
                        </span>
                        <div className="text-lg font-semibold">財源の選択</div>
                      </div>
                      <div className="mt-3 space-y-2 text-base text-slate-800">
                        <div>・一般（純資産）</div>
                        <div>・指定（純資産）</div>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        貸借対照表のうち書き表示のため、その他有価証券を購入した財源を選択します。
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            openPdfPreview({
                              src: "/pdf/r6_standard_other_securities_evaluation_display.pdf",
                              title: "表示位置（令和6年基準）",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#7D2248] bg-white px-2 py-[2px] text-[12px] font-semibold text-[#7D2248] hover:bg-[#fff0f5]"
                        >
                          <FileText className="h-3 w-3" />
                          帳票イメージを見る
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[6px] border border-slate-200 bg-white p-4 text-base leading-relaxed">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7D2248] text-xs font-semibold text-white">
                          3
                        </span>
                        <div className="text-lg font-semibold">反映先</div>
                      </div>
                      <div className="mt-3 space-y-1 text-base text-slate-800">
                        <div>貸借対照表</div>
                        <div className="ml-2">- その他有価証券（資産）</div>
                        <div className="ml-2">- その他有価証券評価差額金（純資産） + うち書き</div>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        活動計算書は通りません
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-[#7D2248] bg-[#fff0f5] p-4 text-center text-lg font-semibold text-[#7D2248]">
                    <div>「その他有価証券評価差額金」という科目で純資産を直接増減します。</div>
                    <div>入力時は、評価益・評価損の区分に応じた科目を選択します。</div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 px-4 text-sm"
                      onClick={() => setOtherSecuritiesOverviewStep("step2")}
                    >
                      戻る
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 border border-[#7D2248] bg-[#fff0f5] px-4 text-sm font-semibold text-[#7D2248] hover:bg-[#7D2248] hover:text-white"
                      onClick={() => {
                        setOtherSecuritiesOverviewOpen(false)
                        startOtherSecuritiesNetAssetsSelection()
                      }}
                    >
                      システム画面で確認する
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!isAnyOverviewOpen && (
        <>
      {/* 確定帯 */}
      {phase === "confirmed" && (
        <div className="mt-2 flex items-center justify-between rounded-[4px] border border-[#4a8f4a] bg-[#e6ffe6] px-3 py-2 text-[13px]">
          <div className="font-semibold text-[#1a4a1a]">伝票を確定しました。</div>
          <Button className="h-[28px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[13px]" onClick={handleBackFromConfirmed}>
            戻る
          </Button>
        </div>
      )}

      {/* メッセージ */}
      {headerMessage && phase === "header" && (
        <div className="mt-2 rounded-[4px] border border-[#c7a000] bg-[#fff9d6] px-3 py-2 text-[13px] text-[#4a3b00]">
          {headerMessage}
        </div>
      )}
      {detailMessage && (phase === "detail" || phase === "transferPreview") && (
        <div className="mt-2 rounded-[4px] border border-[#c7a000] bg-[#fff9d6] px-3 py-2 text-[13px] text-[#4a3b00]">
          {detailMessage}
        </div>
      )}

      {/* ===== 伝票ヘッダーエリア ===== */}
      <div
        className={["mt-2 rounded-[4px] border border-[#7a9bc4] bg-[#d4e4ff]", headerDisabled ? "opacity-60 pointer-events-none" : ""].join(" ")}
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.6) inset, 0 1px 1px rgba(0,0,0,0.05)" }}
        onKeyDown={handleHeaderKeyDown}
      >
        {/* 上段ヘッダー */}
        <div className="px-3 py-3">
          <div className="grid grid-cols-[400px_auto_auto_auto_auto] gap-x-4 gap-y-2">
            {/* 伝票日付 */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1">
                <div className="text-[#1a1a1a] leading-tight">伝票日付</div>
                <select
                  value={era}
                  onChange={(e) => setEra(e.target.value)}
                  disabled={headerDisabled}
                  className="h-[28px] min-w-[60px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[14px] leading-tight"
                >
                  <option value="">　</option>
                  <option>令和</option>
                  <option>平成</option>
                  <option>昭和</option>
                </select>
                <Input value={year} onChange={(e) => setYear(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[40px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[14px]" />
                <div className="text-[14px]">年</div>
                <Input value={month} onChange={(e) => setMonth(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[32px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[14px]" />
                <div className="text-[14px]">月</div>
                <Input value={day} onChange={(e) => setDay(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[32px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[14px]" />
                <div className="text-[14px]">日</div>
                <button className="ml-1 flex h-[28px] w-[28px] items-center justify-center rounded-[2px] border border-[#7a9bc4] bg-white">
                  <Calendar className="h-[16px] w-[16px] text-[#4a5a7a]" />
                </button>
              </div>
              <div className="h-[28px]" />
            </div>

            {/* 伝票番号 */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[#1a1a1a] leading-tight">伝票番号</div>
                <Input value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[80px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[14px]" />
              </div>
              <div className="h-[28px]" />
            </div>

            {/* 入力 */}
            <div className="flex flex-col gap-2 min-w-[140px]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[#1a1a1a] leading-tight">入力</div>
                <select value={inputMode} onChange={(e) => setInputMode(e.target.value)} disabled={headerDisabled} className="h-[28px] min-w-[72px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[14px]">
                  <option value="">　</option>
                  <option>振替</option>
                  <option>入金</option>
                  <option>出金</option>
                </select>
              </div>
              <div className="h-[28px]" />
            </div>

            {/* 決裁区分/分類 */}
            <div className="flex flex-col gap-2 min-w-[220px]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-[64px]">決裁区分</div>
                <select value={decisionType} onChange={(e) => setDecisionType(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[80px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[14px]">
                  <option value="">　</option>
                  <option>なし</option>
                  <option>　</option>
                </select>
                <button className="flex h-[28px] w-[32px] items-center justify-center rounded-[2px] border border-[#7a9bc4] bg-white text-[12px]">参</button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="w-[64px]">分類</div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={headerDisabled} className="h-[28px] w-[112px] rounded-[2px] border border-[#7a9bc4] bg-white px-2 text-[14px]">
                  <option value="">　</option>
                  <option>通常伝票</option>
                  <option>決算伝票</option>
                </select>
              </div>
            </div>

            {/* Ctrl + F1/F2 */}
            <div className="flex flex-row items-start gap-2 min-w-[240px]">
              <div className="flex h-[60px] items-center justify-center px-3 text-[13px] font-semibold text-[#0066cc] select-none">
                Ctrl +
              </div>
              <div className="flex flex-col gap-2">
                <button className="h-[28px] rounded-[2px] border border-[#7a9bc4] bg-white px-3 text-left text-[13px] hover:bg-[#eef4ff]" disabled={headerDisabled}>
                  F1 設定
                </button>
                <button className="h-[28px] rounded-[2px] border border-[#7a9bc4] bg-white px-3 text-left text-[13px] hover:bg-[#eef4ff]" disabled={headerDisabled}>
                  F2 過去履歴
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 下段: 会計ブロック */}
        <div className="px-3 py-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-start gap-1 w-[48px]">
              <div className="leading-[28px]">会計</div>
              <button
                className="flex h-[28px] w-[32px] items-center justify-center rounded-[2px] border border-[#7a9bc4] bg-white text-[12px]"
                disabled={headerDisabled}
                onClick={() => { if (!headerDisabled) setAccountModalOpen(true) }}
              >
                参
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {/* 親 */}
              <div className="flex h-[28px] items-center">
                <Input value={parentCodeRaw} readOnly className="h-[28px] w-[60px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[13px] read-only:bg-[#f3f3f3]" />
                <div className="ml-2 text-[13px] whitespace-nowrap">{parentName}</div>
              </div>
              {/* 子 */}
              <div className="flex h-[28px] items-center">
                <Input value={childCodeRaw} readOnly className="h-[28px] w-[60px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[13px] read-only:bg-[#f3f3f3]" />
                <div className="ml-2 text-[13px] whitespace-nowrap">{childName}</div>
              </div>
              {/* 孫 */}
              <div className="flex h-[28px] items-center">
                <Input value={grandchildCodeRaw} readOnly className="h-[28px] w-[60px] rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-[13px] read-only:bg-[#f3f3f3]" />
                <div className="ml-2 text-[13px] whitespace-nowrap">{grandchildName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 明細エリア ===== */}
      <div
        className={["mt-3 flex flex-col rounded-[4px] border border-[#7a9bc4] bg-white text-[12px]", phase === "header" ? "opacity-60 pointer-events-none" : ""].join(" ")}
        onKeyDown={handleDetailKeyDown}
      >
        {/* ヘッダー行 */}
        <div className="grid w-full grid-cols-[40px_1fr_1fr] border-b border-[#7a9bc4] bg-[#6d8fc9] text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
          <div className="border-r border-[#7a9bc4] px-2 py-2 flex items-center">No</div>
          <div className="border-r border-[#7a9bc4] px-2 py-2">
            <div className="flex items-baseline justify-between">
              <span>借方 / 科目</span>
              <span className="text-[12px] font-normal opacity-90">金額</span>
            </div>
          </div>
          <div className="px-2 py-2">
            <div className="flex items-baseline justify-between">
              <span>貸方 / 科目</span>
              <span className="text-[12px] font-normal opacity-90">金額</span>
            </div>
          </div>
        </div>

        {/* 1行目 上段 */}
        <div className="grid grid-cols-[40px_1fr_1fr] bg-[#eaf3ff]">
          {/* No */}
          <div className="flex flex-col items-center justify-between border-r border-[#7a9bc4] bg-[#f2f6fb] text-[13px] text-[#333]">
            <div className="flex-1 flex items:end justify-center font-medium pb-[2px]">1</div>
            <div className="h-[24px]" />
          </div>

          {/* 借方 上段 */}
          <div className="border-r border-[#7a9bc4] px-2 py-2 relative">
{showDebitBadge && (
  <div className="absolute right-2 top-2">
    <GuidedFocus
      // 収益・費用シナリオのときだけバブルを出す
      active={isFundingBadgeGuideActive && isFundingTutorialMode}
      message={"設定した財源はここに表示されます。"}
      placement="top"
      nextLabel="次へ"
      onNext={() => {
        //このステップのガイドは終了
        setIsFundingBadgeGuideActive(false)
        // ★ 次は Enter キーで一次仕訳を確定するガイドへ
        setFundingEnterGuideStep("primary")
      }}
    >
      <span
        ref={badgeRef}
        className="
          inline-flex items-center justify-center
          rounded-full border border-[#7a9bc4] bg-white
          px-2 py-[1px]
          text-[10px] leading-none
          whitespace-nowrap
        "
        aria-label="funding-type-badge"
        tabIndex={-1}
      >
        {fundingType}
      </span>
    </GuidedFocus>
  </div>
)}

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
<div className="flex items-start gap-1">
  {!previewLocked ? (
    <>
      <Input
        value={debitCode}
        onChange={(e) => setDebitCode(e.target.value)}
        disabled={detailDisabled}
        className="h-[24px] w-[180px] rounded-[2px] border border-[#7a9bc4] bg-white px-1"
        placeholder="コード"
      />
      <div className="flex-shrink-0">
        <GuidedFocus
          active={
            (isFundingTutorialGuiding ||
              isOtherSecuritiesTutorialGuiding) &&
            !detailDisabled
          }
          message={
            isOtherSecuritiesTutorialGuiding
              ? "その他有価証券評価差額金は純資産科目ですが、仕訳上では損益科目を使用します。"
              : "収支入力の場合：収入・支出科目\n損益入力の場合：収益・費用科目\nを選択します。"
          }
          placement="right"
        >
          <button
            className="flex h-[24px] w-[28px] flex-shrink-0 items-center justify-center rounded-[2px] border border-[#7a9bc4] bg-white text-[12px]"
            title="参"
            disabled={detailDisabled}
            onClick={() => {
              if (detailDisabled) return

              if (isFundingTutorialGuiding) {
                // ★ 既存：収益・費用科目の財源チュートリアル
                setDebitCode("332500")
                setDebitParentName("事業費支出")
                setDebitChildName("消耗品費支出")
                setDebitAmount("100000")
                setCreditCode("01013101")
                setCreditParentName("普通預金")
                setCreditChildName("普通預金 みずほ銀行 新宿支店")
                setCreditAmount("100000")

                setIsFundingTutorialGuiding(false)
                setIsFundingRemarkGuiding(true)
              } else if (isOtherSecuritiesTutorialGuiding) {
                
                // ★ 新規：その他有価証券評価差額金チュートリアル
                // 指定科目をセット
                setDebitCode("960100")
                setDebitParentName("その他有価証券評価差額金") // 親科目なし
                setDebitChildName("その他有価証券評価差額金（評価損）")
                setDebitAmount("10000")

                setCreditCode("04510101")
                setCreditParentName("投資有価証券")
                setCreditChildName("投資有価証券")
                setCreditAmount("10000")

                // このシナリオの「参」ガイドはここで終了
                setIsOtherSecuritiesTutorialGuiding(false)
                setIsOtherSecuritiesEnterGuideActive(false)
                setRemarkGuideText("その他有価証券の財源を設定します。") 
                setIsFundingRemarkGuiding(true) 

                  // 摘要エリア（ボタン）へフォーカス
                setTimeout(() => {
                  remarkButtonRef.current?.focus()
                  remarkButtonRef.current?.scrollIntoView({ block: "center" })
                }, 0)

                // Enter ボタンの GuidedFocus をON
                setIsOtherSecuritiesEnterGuideActive(true)

              } else {
                // 通常モード
                setDebitAccountModalOpen(true)
              }
            }}
          >
            参
          </button>
        </GuidedFocus>
      </div>
    </>
  ) : (
    <>
   {isOtherSecPreviewGuideActive ? (
     <GuidedFocus
       active={true}
       placement="right"
       message={"財源（一般/指定）に応じて科目を自動展開し、貸借対照表の“うち書き”に反映します。"}
       nextLabel="次へ"
       onNext={() => {
        setIsOtherSecPreviewGuideActive(false)
        openPdfPreview({
          src: "/pdf/bs-of-which-breakdown.pdf",
          title: "貸借対照表（うち書き）",
          tutorial: {
            active: true,
            message: "入力した内容に応じて、貸借対照表の純資産の部、その他有価証券評価差額金とうち書きに反映されます。",
            primaryLabel: "変更点ガイドへ",
            secondaryLabel: "終了",
      },
    })
  }}
     >
       <div ref={debitPreviewNameRef} tabIndex={-1}>
         <PreviewAccountLabel
            code={previewDebit?.code}
            parentName={previewDebit?.parentName}
           childName={previewDebit?.childName}
      />
     </div>
   </GuidedFocus>
    ) : (
     <div ref={debitPreviewNameRef} tabIndex={-1}>
        <PreviewAccountLabel
         code={previewDebit?.code}
         parentName={previewDebit?.parentName}
         childName={previewDebit?.childName}
       />
     </div>
    )}
 </>
)}
</div>

                {!previewLocked && (
                  <>
                    <div className="mt-1 px-[2px] text-[14px] leading-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {debitParentName}
                    </div>
                    <div className="px-[2px] text-[15px] font-medium leading-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {debitChildName}
                    </div>
                  </>
                )}

                {renderDesignatedSelector("debit")}
              </div>

              <div className="w-[120px] flex items-end self-end">
                <Input
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                  disabled={previewLocked || detailDisabled}
                  className="h-[24px] w-full rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-right"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* 貸方 上段 */}
          <div className="px-2 py-2 relative">
            {showCreditBadge && (
              <span className="absolute right-2 top-2 inline-block rounded-full border border-[#7a9bc4] bg-white px-2 py-[1px] text-[10px] leading-none" aria-label="funding-type-badge">
                {fundingType}
              </span>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1">
                  {!previewLocked ? (
                    <>
                      <Input
                        value={creditCode}
                        onChange={(e) => setCreditCode(e.target.value)}
                        disabled={detailDisabled}
                        className="h-[24px] w-[180px] rounded-[2px] border border-[#7a9bc4] bg-white px-1"
                        placeholder="コード"
                      />
                      <button
                        className="flex h-[24px] w-[28px] flex-shrink-0 items-center justify-center rounded-[2px] border border-[#7a9bc4] bg-white text-[12px]"
                        title="参"
                        disabled={detailDisabled}
                        onClick={() => { if (!detailDisabled) setCreditAccountModalOpen(true) }}
                      >
                        参
                      </button>
                    </>
                  ) : (
<PreviewAccountLabel
    code={previewCredit?.code}
    parentName={previewCredit?.parentName}
    childName={previewCredit?.childName}
  />
                  )}
                </div>

                {!previewLocked && (
                  <>
                    <div className="mt-1 px-[2px] text-[14px] leading-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {creditParentName}
                    </div>
                    <div className="px-[2px] text-[15px] font-medium leading-[16px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {creditChildName}
                    </div>
                  </>
                )}

                {renderDesignatedSelector("credit")}
              </div>

              <div className="w-[120px] flex items-end self-end">
                <Input
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  disabled={previewLocked || detailDisabled}
                  className="h-[24px] w-full rounded-[2px] border border-[#7a9bc4] bg-white px-1 text-right"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 1行目 下段（摘要など） */}
        <div className="grid grid-cols-[40px_1fr_1fr] border-b border-[#7a9bc4] bg-[#ffffff]">
          {/* No列 / 削 */}
          <div className="flex flex-col items-center justify-end border-r border-[#7a9bc4] bg-[#f2f6fb] text-[13px] text-[#333] py-2">
            <button className="text-[11px] px-2 py-[2px] border border-[#7a9bc4] rounded-sm bg-[#e9edf5]" disabled={previewLocked || detailDisabled}>
              削
            </button>
          </div>

          {/* 借方 摘要ブロック（クリックでモーダル） */}
          <div className="border-r border-[#7a9bc4]">
<GuidedFocus
  active={isFundingRemarkGuiding && !detailDisabled}
  message={remarkGuideText}
  placement="bottom"
>
  <button
    type="button"
    ref={remarkButtonRef}
    disabled={previewLocked || detailDisabled}
    onClick={() => {
      if (detailDisabled) return

      // 摘要モーダルを開く
      setRemarkSide("debit")
      setRemarkModalOpen(true)

      // 摘要エリアのガイドは終了
      if (isFundingRemarkGuiding) {
        setIsFundingRemarkGuiding(false)
      }

      // ★ モーダル内「一般・指定」プルダウンのガイドを開始
      if (isRemarkTutorialScenario){
        setIsFundingTypeGuideActive(true)
        setIsEnterGuideActive(false)
      }
    }}
    className={["border border-[#7a9bc4] bg-[#eef5ff] w-full text-left",
      "text-[12px] leading-[16px] p-0",
      previewLocked || detailDisabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-pointer hover:bg-[#fffde8]",
    ].join(" ")}
  >
              <div className="grid grid-cols-2">
                <div className="grid grid-rows-[20px_20px_20px] border-r border-[#7a9bc4]">
                  <div className="grid grid-cols-[24px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">関</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis" />
                  </div>
                  <div className="grid grid-cols-[24px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">摘</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                      {debitRemark || <span className="text-[#888]"></span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-[24px_1fr]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">事</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis" />
                  </div>
                </div>

                <div className="grid grid-rows-[20px_20px_20px]">
                  <div className="grid grid-cols-[40px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">税</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{debitTaxInfo}</div>
                  </div>
                  <div className="grid grid-cols-[40px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">予定日</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{debitDueDate}</div>
                  </div>
                  <div className="grid grid-cols-[40px_1fr]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">予算残</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{debitBudgetRemain}</div>
                  </div>
                </div>
              </div>
            </button>
            </GuidedFocus>
          </div>

          {/* 貸方 摘要ブロック */}
          <div>
            <button
              type="button"
              disabled={previewLocked || detailDisabled}
              onClick={() => { if (!detailDisabled) { setRemarkSide("credit"); setRemarkModalOpen(true) } }}
              className={["border border-[#7a9bc4] bg-[#eef5ff] w-full text-left", "text-[12px] leading-[16px] p-0", previewLocked || detailDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#fffde8]"].join(" ")}
            >
              <div className="grid grid-cols-2">
                <div className="grid grid-rows-[20px_20px_20px] border-r border-[#7a9bc4]">
                  <div className="grid grid-cols-[24px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">関</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis" />
                  </div>
                  <div className="grid grid-cols-[24px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">摘</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                      {creditRemark || <span className="text-[#888]"></span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-[24px_1fr]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">事</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis" />
                  </div>
                </div>

                <div className="grid grid-rows-[20px_20px_20px]">
                  <div className="grid grid-cols-[40px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">税</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{creditTaxInfo}</div>
                  </div>
                  <div className="grid grid-cols-[40px_1fr] border-b border-[#7a9bc4]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">予定日</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{creditDueDate}</div>
                  </div>
                  <div className="grid grid-cols-[40px_1fr]">
                    <div className="bg-[#e0e0e0] border-r border-[#7a9bc4] text-center">予算残</div>
                    <div className="px-1 flex items-center whitespace-nowrap overflow-hidden text-ellipsis">{creditBudgetRemain}</div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-2 py-4 text-[11px] leading-tight text-[#6b6b6b] bg-white border-t border-[#7a9bc4]">
          （この下に明細2行目以降が続く想定）
        </div>
      </div>

      {/* ===== 会計選択モーダル ===== */}
      <AccountingSelectModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSelect={({ parentCode, parentName, childCode, childName, grandchildCode, grandchildName, }) => {
          if (phase === "header") {
            setParentCodeRaw(parentCode || "")
            setChildCodeRaw(childCode || "")
            setGrandchildCodeRaw(grandchildCode || "")
            setParentName(parentName || "")
            setChildName(childName || "")
            setGrandchildName(grandchildName || "")
          }
          setAccountModalOpen(false)
        }}
      />

{/* ===== 借方 科目検索モーダル ===== */}
<AccountSearchDialog
  open={debitAccountModalOpen}
  onClose={() => {
    setDebitAccountModalOpen(false)
    setOtherSecuritiesAccountGuideActive(false)
  }}
  title="科目検索"
  onPick={(row: PickedAccount) => {
    setDebitCode(row.code || "")

    // ★ 表示名のレイアウト調整
    if (row.childName) {
      // 親あり・子あり → 上段: 親 / 下段: 子
      setDebitParentName(row.parentName || "")
      setDebitChildName(row.childName)
    } else {
      // 親なし or 事実上1階層 → 上段は空 / 下段に表示
      setDebitParentName("")
      setDebitChildName(row.parentName || row.name || "")
    }

    setDebitAccountModalOpen(false)
    setOtherSecuritiesAccountGuideActive(false)
  }}

  initialCategoryId={
    isBsFundingScenario
      ? "bs"
      : otherSecuritiesAccountGuideActive
        ? "netAssetsPl"
        : undefined
  }
  initialExpandedCodes={isBsFundingScenario ? CASH_TREE_CODES_FOR_TUTORIAL : undefined}
  
  guideHighlightCodes={
    otherSecuritiesAccountGuideActive
      ? ["960100", "740100"]
      : CASH_HIRIGHT_CODES
  }
  guideTargetCode={
    otherSecuritiesAccountGuideActive
      ? "960100"
      : !isBsFundingScenario
        ? undefined
        : bsGuideStep === "step1"
          ? "01013215"
          : bsGuideStep === "step2"
            ? "010132"
            : undefined
  }  

  guideMessage={
    otherSecuritiesAccountGuideActive
      ? "「純資産科目」タブで、その他有価証券評価差額金（評価益）または（評価損）を選択します。"
      : !isBsFundingScenario
        ? undefined
        : bsGuideStep === "step1"
          ? "基本財産・特定資産がなくなったことにより普通預金・定期預金等の科目の階層を1つ下げ、\n基本財産・特定資産用の科目を新設します。"
          : bsGuideStep === "step2"
            ? "これにより、現預金出納帳・総勘定元帳を\n中科目レベルで出力できるよう機能追加しました。"
            : undefined
  }

onGuideNext={() => {
  if (otherSecuritiesAccountGuideActive) {
    setOtherSecuritiesAccountGuideActive(false)
    setDebitAccountModalOpen(false)
    setFundingOverviewOpen(false)
    setOtherSecuritiesOverviewOpen(false)
    startOtherSecuritiesAfterAccountPicked()
    return
  }

  // step1 → step2 は普通に更新
  if (bsGuideStep === "step1") {
    setBsGuideStep("step2")
    return
  }

  // step2 → done は「state更新」と「遷移」を分離
  if (bsGuideStep === "step2") {
    setBsGuideStep("done")
    setDebitAccountModalOpen(false)
    router.push("/cashbook?tutorial=cashbookLevel")
    return
  }
}}

/>

{/* ===== 貸方 科目検索モーダル ===== */}
<AccountSearchDialog
  open={creditAccountModalOpen}
  onClose={() => setCreditAccountModalOpen(false)}
  title="科目検索"
  onPick={(row: PickedAccount) => {
    setCreditCode(row.code || "")

    // ★ 表示名のレイアウト調整（借方と同じロジック）
    if (row.childName) {
      setCreditParentName(row.parentName || "")
      setCreditChildName(row.childName)
    } else {
      setCreditParentName("")
      setCreditChildName(row.parentName || row.name || "")
    }

    setCreditAccountModalOpen(false)
  }}
/>

      {/* ===== 摘要入力モーダル ===== */}
<RemarkEntryModal
  open={remarkModalOpen}
  onClose={() => {
    setRemarkModalOpen(false)
    // モーダルを閉じたらモーダル側のガイドはリセット
    setIsFundingTypeGuideActive(false)
    setIsEnterGuideActive(false)
  }}
  side={remarkSide}
  initialRemark={remarkSide === "debit" ? debitRemark : creditRemark}
  lineLabel={remarkSide === "debit" ? "借方 1行目" : "貸方 1行目"}
  accountKind={resolveAccountKindForSide(remarkSide)}
  initialFundingType={fundingType}
  autoFocusField="fundingType"
  onSubmit={(p) => {
    if (remarkSide === "debit") {
      setDebitRemark(p.remarkMain)
      setDebitTaxInfo(p.tax.display)
    } else {
      setCreditRemark(p.remarkMain)
      setCreditTaxInfo(p.tax.display)
    }

    const ft = (p.fundingType ?? (p as any).funding) as
      | "一般"
      | "指定"
      | undefined
    if (ft === "一般" || ft === "指定") {
      setFundingType(ft)
    }

    // 追加：モーダル閉じてからEnterにフォーカス
    setRemarkModalOpen(false)
    if (isFundingTutorialMode) {
    // 収益・費用シナリオ：従来どおり Enter にフォーカス
    setTimeout(() => headerEnterRef.current?.focus(), 0)
    } else {
   // その他有価証券シナリオ：バッジへフォーカス（バブルは非表示）
    setTimeout(() => badgeRef.current?.focus(), 0)
  }

    // Enterで確定したあと、モーダル内ガイドはここで終わり
    setIsFundingTypeGuideActive(false)
    setIsEnterGuideActive(false)
  }}
  accountingCode={currentAccountingCode}
  accountingDisplayCode={currentAccountingCode}
  accountingName={currentAccountingName}
  // ▼ チュートリアル用の追加 props（各1回だけ）
  tutorialFundingGuideActive={isFundingTypeGuideActive}
  tutorialEnterGuideActive={isEnterGuideActive}
  onTutorialFundingCompleted={() => {
    // 一般・指定を選んだら → Enterガイドへ
    setIsFundingTypeGuideActive(false)
    setIsEnterGuideActive(true)
  }}
  onTutorialEnterCompleted={() => {
    // Enter確定後 → バッジガイドへ
    setIsEnterGuideActive(false)
    if (isFundingTutorialMode) {
      // 収益・費用：バッジにバブルを出す
      setIsFundingBadgeGuideActive(true)
       } else {
        // その他有価証券：バッジにだけフォーカス（バブルは出さない）
        setIsFundingBadgeGuideActive(false)
      }
  }}
/>

{/* ===== 帳票イメージ PDF プレビュー（チュートリアル用） ===== */}
        </>
      )}

      {/* ===== 帳票イメージ PDF プレビュー（チュートリアル用） ===== */}
      <PdfPreviewDialog
        open={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        src={pdfSrc}
        title={pdfTitle}
        tutorialActive={pdfTutorialActive}
        tutorialMessage={pdfTutorialMessage}
        tutorialPrimaryLabel={pdfPrimaryLabel}
        tutorialOnPrimary={() => {
          // 既存の挙動（例：財源区分別内訳PDFなどはメニューへ戻す）
          setIsPdfPreviewOpen(false)
          setIsRemarkTutorialScenario(false)
          openTutorialMenu()
        }}
        tutorialSecondaryLabel={pdfSecondaryLabel}
        tutorialOnSecondary={() => {
          setIsPdfPreviewOpen(false)
          stopTutorial()
          setIsRemarkTutorialScenario(false)
          router.push("/home")
        }}
      />
    </div>
  )
}
