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

      <div className="relative z-10">
        <h1 className="text-[30px] font-semibold tracking-tight text-slate-900">
          {OVERVIEW_GUIDE_CONTENT.title}
        </h1>
        {OVERVIEW_GUIDE_CONTENT.subcopy ? (
          <p className="mt-3 whitespace-pre-line text-[16px] text-slate-700">
            {OVERVIEW_GUIDE_CONTENT.subcopy}
          </p>
        ) : null}

        <dl className="mt-6 space-y-4">
          {OVERVIEW_GUIDE_CONTENT.sections.map((section) => (
            <div
              key={section.label}
              className="rounded-lg border border-slate-200/80 bg-white px-3 py-3 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)]"
            >
              <dt className="text-[18px] font-semibold text-slate-900">
                {section.label}
              </dt>
              {Array.isArray(section.body) ? (
                <dd className="mt-1 text-[16px] text-slate-700">
                  <ul className="space-y-1">
                    {section.body.map((line) => (
                      <li key={line}>
                        {"・"}
                        {line}
                      </li>
                    ))}
                  </ul>
                </dd>
              ) : (
                <dd className="mt-1 text-[16px] text-slate-700">
                  {section.body}
                </dd>
              )}
            </div>
          ))}
        </dl>

        {OVERVIEW_GUIDE_CONTENT.helper ? (
          <div className="mt-6 text-[15px] text-slate-700">
            {OVERVIEW_GUIDE_CONTENT.helper}
          </div>
        ) : null}

        <div className="mt-3">
          <HeaderTutorialLauncher
            size="lg"
            className="h-12 px-6 text-[16px]"
          />
        </div>
      </div>
    </section>
  )
}
