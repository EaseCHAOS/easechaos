import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, RotateCcw } from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "../components/ThemeToggle";
import SEO from "../components/SEO";
import CelebrationOverlay from "../components/CelebrationOverlay";
import ShareCard from "../components/ShareCard";
import TeaserCard from "../components/TeaserCard";
import { downloadElementAsImage } from "../utils/downloadUtils";
import type { CelebrationState } from "../lib/celebration";
import { resetCelebration } from "../lib/celebration";

const PREVIEW_VERSION = "preview-v1";

const states: { id: CelebrationState; label: string; desc: string }[] = [
  { id: "ONE_LEFT", label: "One Left", desc: "1 paper remaining" },
  { id: "LAST_TODAY", label: "Last Today", desc: "single paper is today" },
  { id: "DONE", label: "Done", desc: "all papers finished" },
  { id: "GRADUATE_DONE", label: "Graduate", desc: "4 · all done" },
];

export default function CelebrationPreviewPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<CelebrationState>("GRADUATE_DONE");
  const [show, setShow] = useState(false);
  const [dept] = useState("CE");
  const [yearLabel] = useState("4");

  const trigger = (state: CelebrationState) => {
    resetCelebration(PREVIEW_VERSION);
    setActive(state);
    setShow(false);
    requestAnimationFrame(() => setShow(true));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAFAFA] dark:bg-[#02040A]">
      <SEO title="Celebration Preview" description="Preview the exam celebration overlays" />
      <div className="sticky top-0 z-20 border-b bg-white/80 px-3 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-full border border-black/10 p-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
                Celebration Preview
              </h1>
              <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                Premium glass · 1024² 3D skeuomorphic · canvas-confetti cannon
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Controls */}
          <div className="space-y-4">
            <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-zinc-900">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                States
              </h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Each uses real high-res Icons8 3D Fluency renders (1024² transparent) + Apple/Cursor glass.
              </p>
              <div className="mt-4 grid gap-2">
                {states.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => trigger(s.id)}
                    className={clsx(
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                      active === s.id
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-black/10 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800",
                    )}
                  >
                    <div>
                      <div className="text-sm font-semibold">{s.label}</div>
                      <div
                        className={clsx(
                          "text-xs",
                          active === s.id
                            ? "text-white/70 dark:text-zinc-500"
                            : "text-zinc-500 dark:text-zinc-400",
                        )}
                      >
                        {s.desc}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 opacity-60" />
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => trigger(active)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2457A7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e4a8f] dark:bg-[#4593F8] dark:text-zinc-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  Replay
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-800"
                >
                  Dismiss
                </button>
              </div>

              <div className="mt-6 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Share card
                </h3>
                <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                  1080×1080 square for WhatsApp Status & X. Tap download in the graduate modal or here:
                </p>
                <button
                  onClick={() =>
                    downloadElementAsImage(
                      "celebration-share-card",
                      `easeCHAOS-${dept}-${yearLabel}.png`,
                    )
                  }
                  className="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Download share image
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
              <strong className="font-semibold">Icons:</strong> Icons8 3D Fluency (trophy, grad-cap, rocket, confetti, diploma, medal, sparkles. All 1024 transparent, drop shadow, float animation). Stored in{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
                frontend/assets/celebration/
              </code>
              . Aqua pack reserved as alt.
            </div>
          </div>

          {/* Live canvas */}
          <div className="min-w-0 space-y-4 overflow-hidden">
            <div className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-sm dark:border-white/[0.06] dark:bg-zinc-900">
              <div className="border-b border-black/[0.06] bg-zinc-50 px-5 py-3 dark:border-white/[0.06] dark:bg-zinc-800/50">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Live preview · ExamPage context · {dept} {yearLabel}
                </p>
              </div>
              <div className="relative flex min-h-[520px] items-center justify-center bg-[#FAFAFA] p-6 dark:bg-zinc-950">
                <div className="w-full max-w-[520px] rounded-[24px] border border-black/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-zinc-900">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    CE 4 Exam Schedule
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    This is the ExamView surface the celebration appears over.
                  </p>
                  <div className="mt-4 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800" />
                  <div className="mt-3 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800" />
                </div>

                {show && active ? (
                  <CelebrationOverlay
                    state={active}
                    version={PREVIEW_VERSION}
                    dept={dept}
                    yearLabel={yearLabel}
                    onClose={() => setShow(false)}
                    onShare={() =>
                      downloadElementAsImage(
                        "celebration-share-card",
                        `easeCHAOS-${dept}-${yearLabel}.png`,
                      )
                    }
                  />
                ) : null}
              </div>
            </div>

            {/* Hidden share card DOM (captured via html-to-image) */}
            <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-4 dark:border-white/[0.06] dark:bg-zinc-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Share card DOM (1080 square, captured as PNG)
              </p>
              <div className="flex justify-center overflow-hidden rounded-2xl bg-zinc-950 p-4">
                <div className="h-[346px] w-[346px] overflow-hidden">
                  <div className="scale-[0.32] origin-top-left">
                    <ShareCard
                      dept={dept}
                      yearLabel={yearLabel}
                      isGraduate={active === "GRADUATE_DONE"}
                      totalPapers={8}
                      examPeriod="Aug to Sep 2026"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teaser flyers — feed + story */}
            <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-4 dark:border-white/[0.06] dark:bg-zinc-900">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Teaser flyers — curiosity loop (do not spoil the surprise)
              </p>
              <p className="mb-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Feed 1080 square for WhatsApp Status and X feed. Story 1080 by 1920 for Status full screen. Both use the same premium gift icon and QR.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Feed · 1080 square
                    </span>
                    <button
                      onClick={() => downloadElementAsImage("teaser-card-feed", "easeCHAOS-teaser-feed.png")}
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
                    >
                      Download
                    </button>
                  </div>
                  <div className="flex justify-center overflow-hidden rounded-2xl bg-zinc-950 p-4">
                    <div className="h-[346px] w-[346px] overflow-hidden">
                      <div className="scale-[0.32] origin-top-left">
                        <TeaserCard format="feed" hookIndex={1} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Story · 1080 by 1920
                    </span>
                    <button
                      onClick={() => downloadElementAsImage("teaser-card-story", "easeCHAOS-teaser-story.png")}
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
                    >
                      Download
                    </button>
                  </div>
                  <div className="flex justify-center overflow-hidden rounded-2xl bg-zinc-950 p-4">
                    <div className="h-[365px] w-[206px] overflow-hidden">
                      <div className="scale-[0.19] origin-top-left">
                        <TeaserCard format="story" hookIndex={0} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                Post the teaser before last papers. Let the reveal flyers be posted by students themselves after they finish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
