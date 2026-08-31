import easeChaosLogo from "../../assets/easechaos.png";
import gift512 from "../../assets/celebration/gift-512.png";
import gift1024 from "../../assets/celebration/gift-1024.png";
import sparkles512 from "../../assets/celebration/sparkles-512.png";

type TeaserFormat = "feed" | "story";

interface TeaserCardProps {
  format?: TeaserFormat;
  qrData?: string;
  hookIndex?: number;
}

const HOOKS = [
  {
    title: "Something is\nwaiting after\nyour last paper.",
    subtitle: "Finish strong. Open EaseChaos. You will know.",
  },
  {
    title: "EaseChaos has a\nsurprise waiting\nfor you.",
    subtitle: "Your last paper is not the end. Come find what we saved.",
  },
  {
    title: "One more paper.\nThen come see.",
    subtitle: "No spoilers. Just finish and open EaseChaos.",
  },
];

export default function TeaserCard({
  format = "feed",
  qrData = "https://easechaos.xyz",
  hookIndex = 0,
}: TeaserCardProps) {
  const hook = HOOKS[hookIndex % HOOKS.length];
  const isStory = format === "story";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=0A0A0F&margin=10`;

  return (
    <div
      id={`teaser-card-${format}`}
      className="relative flex flex-col overflow-hidden bg-[#0A0A0F]"
      style={{
        width: isStory ? 1080 : 1080,
        height: isStory ? 1920 : 1080,
        fontFamily: "Inter, SF Pro Display, system-ui, sans-serif",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#111827] to-[#1E293B]" />
      <div className="absolute -right-40 -top-40 h-[720px] w-[720px] rounded-full bg-gradient-to-br from-violet-500/15 via-transparent to-transparent blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-blue-500/15 via-transparent to-transparent blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-white/[0.03] to-transparent blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-16 pb-10 pt-16">
        {/* Top bar — same premium as ShareCard (h-14, 22px bold) */}
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
                UMaT
              </span>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70 backdrop-blur">
            Aug to Sep 2026
          </span>
        </div>

        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-b from-white/[0.05] to-transparent blur-2xl" />
            <img
              src={gift512}
              srcSet={`${gift512} 512w, ${gift1024} 1024w`}
              sizes="260px"
              alt=""
              className="relative h-[280px] w-[280px] object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
            />
            <img
              src={sparkles512}
              alt=""
              className="absolute -right-2 -top-1 h-[84px] w-[84px] object-contain drop-shadow-lg"
            />
            <img
              src={sparkles512}
              alt=""
              className="absolute -left-6 bottom-6 h-[52px] w-[52px] object-contain opacity-70 drop-shadow-lg"
            />
          </div>

          <h1 className="mt-10 whitespace-pre-line text-balance text-[62px] font-semibold leading-[0.92] tracking-[-0.03em] text-white">
            {hook.title}
          </h1>
          <p className="mt-6 max-w-[28ch] text-balance text-[22px] leading-7 text-white/80">
            {hook.subtitle}
          </p>

          {!isStory ? (
            <div className="mt-10 flex items-center gap-3 rounded-full bg-white/15 px-6 py-3.5 backdrop-blur">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[15px] font-semibold uppercase tracking-[0.12em] text-white">
                Do not spoil it. Finish and see.
              </span>
            </div>
          ) : null}
        </div>

        {/* Bottom: QR + URL + CTA */}
        <div className="flex items-end justify-between gap-8 border-t border-white/15 pt-8">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl bg-white p-2.5 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR to easechaos.xyz"
                width={isStory ? 132 : 110}
                height={isStory ? 132 : 110}
                className="h-[110px] w-[110px] object-contain sm:h-[132px] sm:w-[132px]"
                style={isStory ? { width: 132, height: 132 } : { width: 110, height: 110 }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[20px] font-bold leading-none tracking-tight text-white">
                easechaos.xyz
              </span>
              <span className="text-[15px] font-medium leading-none text-white/70">
                Check your schedule. Finish. Come back.
              </span>
              <span className="mt-2 inline-flex w-fit rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-zinc-900">
                Scan to open
              </span>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-2 text-right sm:flex">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">
              Share this teaser
            </span>
            <span className="text-[15px] font-medium text-white/80">
              Let them find the surprise.
            </span>
          </div>
        </div>

        {/* Footer brand — same prominent as ShareCard */}
        <div className="mt-6 flex items-center justify-between">
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
          <span className="rounded-full bg-white px-4 py-2 text-[13px] font-bold tracking-wide text-zinc-900">
            #UMaT2026
          </span>
        </div>
      </div>
    </div>
  );
}
