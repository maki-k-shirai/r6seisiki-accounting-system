// lib/content/overviewGuide.ts

export const OVERVIEW_GUIDE_CONTENT = {
  title: "正式版 変更点ナビ",
  subcopy:
    "正式版で何が変わったのか。\nまずは一覧で見てみてください。",
  sections: [
    {
      label: "この画面でできること",
      body: [
        "正式版の変更点を一覧でざっと眺める",
        "気になる変更点を選んで確認する",
        "操作イメージを見ながら、触る前の準備をする",
      ],
    },
    {
      label: "ここまで分かればOK",
      body: [
        "どこが変わったのか（全体像）",
        "自分の業務に関係ありそうか",
        "次に確認すべき項目はどれか",
      ],
    },
  ],
  helper: "",
} as const
