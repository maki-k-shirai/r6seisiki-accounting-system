// lib/tutorial/tutorial-scenarios.ts
import type { TutorialScenario } from "./tutorial-types"

export const TUTORIAL_SCENARIOS: TutorialScenario[] = [
  {
    id: "r6-voucher-secondary-entry",
    title: "令和6年基準：二次仕訳の流れを体験する",
    description: "伝票ヘッダーから二次仕訳、指定純資産科目の選択までを一通り体験します。",
    estimatedMinutes: 5,
    targetScreen: "voucher-entry",
    steps: [
    ],
  },
]

// ===== 仕様検討シナリオ =====
// 正式版仕様検討のシナリオ。今後追加していく。

export const SPEC_REVIEW_SCENARIOS: TutorialScenario[] = [
  {
    id: "spec-transfer-between-net-assets",
    title: "指定純資産と一般純資産の間の振替",
    description:
      "令和6年基準改正対応。科目検索タブの変更・振替仕訳の伝票入力・財源区分別内訳の新行、3点の仕様変更を順番に確認します。",
    estimatedMinutes: 5,
    mode: "specReview",
    steps: [
      {
        id: "step-account-search-tab",
        title: "① 科目検索：損益タブへ移動",
        description:
          "「指定純資産から一般純資産への振替額」（コード：959000）が「純資産科目」タブから「損益科目」タブへ移動しました。\n\n" +
          "借方の「参」ボタンを押して科目検索ダイアログを開き、「損益科目」タブで「指定純資産から一般純資産への振替額」が表示されることを確認してください。",
        path: "/voucher-entry",
      },
      {
        id: "step-voucher-transfer-entry",
        title: "② 伝票入力：一般↔指定の振替仕訳",
        description:
          "同一科目コードで借方・貸方に異なる財源区分（一般・指定）を設定した振替仕訳が入力できるようになりました。\n\n" +
          "借方の摘要エリアをクリックして確認してみましょう。",
        path: "/voucher-entry",
      },
      {
        id: "step-fund-breakdown",
        title: "③ 財源区分別内訳：振替額行の追加",
        description:
          "財源区分別内訳に「指定純資産から一般純資産への振替額」行が追加されました。\n\n" +
          "「当期収益費用差額」と「期首純資産」の間に【R6新規】バッジ付きで表示されています。\n" +
          "借方はマイナス、貸方はプラスで集計されます。",
        path: "/net-assets-statement",
      },
    ],
  },
]