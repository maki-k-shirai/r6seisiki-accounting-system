// components/common/EntranceGuidePanel.tsx
"use client"

export function EntranceGuidePanel() {
  return (
    <section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur">
      <div
        className="pointer-events-none absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#7D2248] via-[#c86d95] to-[#7D2248]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#7D2248]/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 -bottom-24 h-48 w-48 rounded-full bg-[#4a7ebb]/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-5">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
            令和６年基準 会計システム
          </h1>
          <p className="mt-2 whitespace-pre-line text-[16px] font-medium leading-relaxed text-[#7D2248]">
            仕様検討用モックアップ
          </p>
        </div>
      </div>
    </section>
  )
}
