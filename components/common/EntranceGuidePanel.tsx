// components/common/EntranceGuidePanel.tsx
"use client"

import { OVERVIEW_GUIDE_CONTENT } from "@/lib/content/overviewGuide"
import { HeaderTutorialLauncher } from "@/components/tutorial/HeaderTutorialLauncher"
import { useTutorial } from "@/components/tutorial/TutorialProvider"

export function EntranceGuidePanel() {
  const { tutorialMenuOpen } = useTutorial()

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
        {/* タイトル＋タグライン */}
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
            {OVERVIEW_GUIDE_CONTENT.title}
          </h1>
          <p className="mt-2 whitespace-pre-line text-[16px] font-medium leading-relaxed text-[#7D2248]">
            {OVERVIEW_GUIDE_CONTENT.tagline}
          </p>
        </div>

        {/* 詳細説明 */}
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-600">
          {OVERVIEW_GUIDE_CONTENT.detail}
        </p>

        {/* 補足 */}
        <ul className="space-y-1 border-l-2 border-slate-200 pl-4">
          {OVERVIEW_GUIDE_CONTENT.notes.map((note) => (
            <li key={note} className="text-[13px] leading-relaxed text-slate-400">
              {note}
            </li>
          ))}
        </ul>

        {/* CTAエリア */}
        <div className="flex flex-col items-start gap-3 border-t border-slate-100 pt-5">
          <p className="text-[14px] text-slate-500">
            {OVERVIEW_GUIDE_CONTENT.cta}
          </p>
          <HeaderTutorialLauncher
            size="lg"
            className="h-12 px-6 text-[16px]"
            label="変更点を見る"
          />
        </div>
      </div>
    </section>
  )
}
