import easeChaosLogo from "../../assets/easechaos.png";
import trophy512 from "../../assets/celebration/trophy-512.png";
import gradCap512 from "../../assets/celebration/graduation-cap-512.png";
import sparkles512 from "../../assets/celebration/sparkles-512.png";

interface ShareCardProps {
  dept: string;
  yearLabel: string;
  isGraduate: boolean;
  totalPapers: number;
  examPeriod: string;
}

export default function ShareCard({
  dept,
  yearLabel,
  isGraduate,
  totalPapers,
  examPeriod,
}: ShareCardProps) {
  return (
    <div
      id="celebration-share-card"
      className="relative flex h-[1080px] w-[1080px] flex-col overflow-hidden bg-[#0A0A0F] p-0"
      style={{ fontFamily: "Inter, SF Pro Display, system-ui, sans-serif" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#111827] to-[#1E293B]" />
      <div className="absolute inset-0 bg-[url('/assets/light_pattern.svg')] opacity-[0.04] mix-blend-soft-light" />
      <div className="absolute -right-40 -top-40 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-amber-400/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute -left-40 -bottom-40 h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-16 pb-10 pt-16">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={easeChaosLogo}
              alt="easeCHAOS"
              className="h-14 w-14 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-white/20"
            />
            <div className="flex flex-col">
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em] text-white">
                easeCHAOS
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/70">
                UMaT · {dept} {yearLabel}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur">
            {examPeriod}
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-b from-white/[0.06] to-transparent blur-2xl" />
            <img
              src={isGraduate ? gradCap512 : trophy512}
              alt=""
              className="relative h-[220px] w-[220px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
            />
            <img
              src={sparkles512}
              alt=""
              className="absolute -right-6 -top-2 h-[72px] w-[72px] object-contain drop-shadow-lg"
            />
          </div>

          <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-amber-300">
            {isGraduate ? "Class of 2026. Graduate" : "All papers done"}
          </p>
          <h1 className="mt-4 max-w-[18ch] text-balance text-[64px] font-semibold leading-[0.95] tracking-[-0.03em] text-white">
            {isGraduate ? (
              <>
                You made it,
                <br />
                Graduate.
              </>
            ) : (
              <>
                You did it.
                <br />
                Papers done.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-[30ch] text-balance text-[22px] leading-7 text-white/80">
            {isGraduate
              ? `Four years of showing up and refusing to quit. ${dept} ${yearLabel}. Welcome to the alumni.`
              : `Every early morning and late night paid off, ${dept} ${yearLabel}. ${totalPapers} papers. You showed up and finished.`}
          </p>

          {/* Pill stats */}
          <div className="mt-10 flex items-center gap-3">
            <span className="rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-zinc-900">
              {dept} {yearLabel}
            </span>
            <span className="rounded-full bg-white/10 px-5 py-2.5 text-[15px] font-semibold text-white backdrop-blur">
              {totalPapers} papers
            </span>
            {isGraduate ? (
              <span className="rounded-full bg-amber-400 px-5 py-2.5 text-[15px] font-semibold text-zinc-900">
                Graduate 🎓
              </span>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/15 pt-7">
          <div className="flex items-center gap-3">
            <img
              src={easeChaosLogo}
              alt="easeCHAOS"
              className="h-9 w-9 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-white/20"
            />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold leading-none tracking-tight text-white">
                easeCHAOS
              </span>
              <span className="text-[13px] font-medium tracking-wide text-white/60">
                easechaos.xyz
              </span>
            </div>
          </div>
          <span className="rounded-full bg-white px-4 py-2.5 text-[14px] font-bold tracking-wide text-zinc-900">
            #UMaT2026
          </span>
        </div>
      </div>
    </div>
  );
}
