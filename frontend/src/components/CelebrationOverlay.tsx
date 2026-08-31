import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import confetti from "canvas-confetti";
import { X, Share2, Download } from "lucide-react";
import type { CelebrationState } from "../lib/celebration";
import { dismissCelebration } from "../lib/celebration";

// High-res 3D skeuomorphic assets (Icons8 3D Fluency, 1024² transparent)
import trophy512 from "../../assets/celebration/trophy-512.png";
import trophy1024 from "../../assets/celebration/trophy-1024.png";
import gradCap512 from "../../assets/celebration/graduation-cap-512.png";
import gradCap1024 from "../../assets/celebration/graduation-cap-1024.png";
import confetti512 from "../../assets/celebration/confetti-512.png";
import confetti1024 from "../../assets/celebration/confetti-1024.png";
import rocket512 from "../../assets/celebration/rocket-512.png";
import rocket1024 from "../../assets/celebration/rocket-1024.png";
import sparkles512 from "../../assets/celebration/sparkles-512.png";
import sparkles1024 from "../../assets/celebration/sparkles-1024.png";
import diploma512 from "../../assets/celebration/diploma-512.png";
import diploma1024 from "../../assets/celebration/diploma-1024.png";
import medal512 from "../../assets/celebration/medal-512.png";
import medal1024 from "../../assets/celebration/medal-1024.png";
import checked512 from "../../assets/celebration/checked-512.png";
import goal512 from "../../assets/celebration/goal-512.png";
import goal1024 from "../../assets/celebration/goal-1024.png";
import fire512 from "../../assets/celebration/fire-512.png";
import fire1024 from "../../assets/celebration/fire-1024.png";

interface CelebrationOverlayProps {
  state: CelebrationState;
  version: string;
  dept: string;
  yearLabel: string;
  onClose: () => void;
  onShare?: () => void;
}

interface CopyConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
}

function getCopy(
  state: CelebrationState,
  dept: string,
  yearLabel: string,
): CopyConfig {
  switch (state) {
    case "ONE_LEFT":
      return {
        eyebrow: "Almost there",
        title: "One more to go",
        subtitle: `Every page you turned brought you here, ${dept} ${yearLabel}. One final paper to prove what you already know.`,
        cta: "Finish strong",
      };
    case "LAST_TODAY":
      return {
        eyebrow: "Today is the day",
        title: "Last paper today",
        subtitle: `Walk in steady, ${dept} ${yearLabel}. Trust your preparation. Walk out knowing you gave it everything.`,
        cta: "Own it",
      };
    case "DONE":
      return {
        eyebrow: "You did it",
        title: "All papers done",
        subtitle:
          "Every early morning and late night paid off. Take a breath and own this moment. You earned it.",
        cta: "Celebrate",
      };
    case "GRADUATE_DONE":
      return {
        eyebrow: "Class of 2026",
        title: "You made it, Graduate",
        subtitle: `Four years of showing up and refusing to quit, ${dept} ${yearLabel}. You did not just earn a degree. You earned proof of who you are. Welcome to the alumni.`,
        cta: "Share the moment",
      };
    default:
      return { eyebrow: "", title: "", subtitle: "", cta: "Close" };
  }
}

function IconStack({ state }: { state: CelebrationState }) {
  const iconWrap =
    "absolute will-change-transform select-none pointer-events-none";
  const shadow = "drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)]";

  if (state === "GRADUATE_DONE") {
    return (
      <div className="relative mx-auto h-[168px] w-[220px]">
        <img
          src={gradCap512}
          srcSet={`${gradCap512} 512w, ${gradCap1024} 1024w`}
          sizes="140px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "left-1/2 top-[8px] h-[108px] w-[108px] -translate-x-1/2 object-contain",
            "animate-[float_3s_ease-in-out_infinite]",
          )}
        />
        <img
          src={trophy512}
          srcSet={`${trophy512} 512w, ${trophy1024} 1024w`}
          sizes="96px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "left-[12px] top-[64px] h-[84px] w-[84px] object-contain",
            "animate-[float_3.2s_ease-in-out_infinite_0.3s]",
          )}
        />
        <img
          src={diploma512}
          srcSet={`${diploma512} 512w, ${diploma1024} 1024w`}
          sizes="92px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "right-[10px] top-[72px] h-[80px] w-[80px] object-contain",
            "animate-[float_3s_ease-in-out_infinite_0.5s]",
          )}
        />
        <img
          src={sparkles512}
          srcSet={`${sparkles512} 512w, ${sparkles1024} 1024w`}
          sizes="48px"
          alt=""
          className={clsx(
            iconWrap,
            "right-[22px] top-[4px] h-[44px] w-[44px] object-contain opacity-90",
            "animate-[twinkle_1.8s_ease-in-out_infinite]",
          )}
        />
        <img
          src={medal512}
          srcSet={`${medal512} 512w, ${medal1024} 1024w`}
          sizes="52px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "left-[62px] top-[118px] h-[48px] w-[48px] object-contain",
            "animate-[float_2.8s_ease-in-out_infinite_0.7s]",
          )}
        />
      </div>
    );
  }

  if (state === "DONE") {
    return (
      <div className="relative mx-auto h-[148px] w-[200px]">
        <img
          src={trophy512}
          srcSet={`${trophy512} 512w, ${trophy1024} 1024w`}
          sizes="120px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "left-1/2 top-[6px] h-[104px] w-[104px] -translate-x-1/2 object-contain",
            "animate-[float_3s_ease-in-out_infinite]",
          )}
        />
        <img
          src={confetti512}
          srcSet={`${confetti512} 512w, ${confetti1024} 1024w`}
          sizes="88px"
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "left-[10px] top-[62px] h-[76px] w-[76px] object-contain",
            "animate-[float_3.2s_ease-in-out_infinite_0.2s]",
          )}
        />
        <img
          src={checked512}
          alt=""
          className={clsx(
            iconWrap,
            shadow,
            "right-[14px] top-[72px] h-[64px] w-[64px] object-contain",
            "animate-[float_3s_ease-in-out_infinite_0.4s]",
          )}
        />
        <img
          src={sparkles512}
          srcSet={`${sparkles512} 512w, ${sparkles1024} 1024w`}
          sizes="42px"
          alt=""
          className={clsx(
            iconWrap,
            "right-[6px] top-[8px] h-[36px] w-[36px] object-contain",
            "animate-[twinkle_1.8s_ease-in-out_infinite]",
          )}
        />
      </div>
    );
  }

  // ONE_LEFT / LAST_TODAY
  return (
    <div className="relative mx-auto h-[148px] w-[200px]">
      <img
        src={rocket512}
        srcSet={`${rocket512} 512w, ${rocket1024} 1024w`}
        sizes="116px"
        alt=""
        className={clsx(
          iconWrap,
          shadow,
          "left-1/2 top-[4px] h-[104px] w-[104px] -translate-x-1/2 object-contain",
          "animate-[float_3s_ease-in-out_infinite]",
        )}
      />
      <img
        src={fire512}
        srcSet={`${fire512} 512w, ${fire1024} 1024w`}
        sizes="72px"
        alt=""
        className={clsx(
          iconWrap,
          shadow,
          "left-[14px] top-[68px] h-[64px] w-[64px] object-contain",
          "animate-[float_3.2s_ease-in-out_infinite_0.2s]",
        )}
      />
      <img
        src={goal512}
        srcSet={`${goal512} 512w, ${goal1024} 1024w`}
        sizes="72px"
        alt=""
        className={clsx(
          iconWrap,
          shadow,
          "right-[14px] top-[70px] h-[64px] w-[64px] object-contain",
          "animate-[float_3s_ease-in-out_infinite_0.4s]",
        )}
      />
      <img
        src={sparkles512}
        srcSet={`${sparkles512} 512w, ${sparkles1024} 1024w`}
        sizes="38px"
        alt=""
        className={clsx(
          iconWrap,
          "right-[2px] top-[10px] h-[34px] w-[34px] object-contain",
          "animate-[twinkle_1.8s_ease-in-out_infinite]",
        )}
      />
    </div>
  );
}

function fireConfetti(state: CelebrationState) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const colors =
    state === "GRADUATE_DONE"
      ? ["#D4AF37", "#FFD700", "#1A1A1A", "#2457A7", "#FFFFFF"]
      : state === "DONE"
        ? ["#2457A7", "#4593F8", "#22C55E", "#F59E0B", "#FFFFFF"]
        : ["#F59E0B", "#EF4444", "#2457A7", "#FFFFFF"];

  const duration = state === "GRADUATE_DONE" ? 4200 : 2800;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: state === "GRADUATE_DONE" ? 4 : 3,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      gravity: 0.9,
      scalar: state === "GRADUATE_DONE" ? 1.1 : 0.95,
      ticks: 220,
    });
    confetti({
      particleCount: state === "GRADUATE_DONE" ? 4 : 3,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      gravity: 0.9,
      scalar: state === "GRADUATE_DONE" ? 1.1 : 0.95,
      ticks: 220,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  // Center burst
  setTimeout(() => {
    confetti({
      particleCount: state === "GRADUATE_DONE" ? 90 : 60,
      spread: 90,
      origin: { x: 0.5, y: 0.55 },
      colors,
      gravity: 0.85,
      scalar: 1,
      ticks: 260,
    });
  }, 260);
}

export default function CelebrationOverlay({
  state,
  version,
  dept,
  yearLabel,
  onClose,
  onShare,
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copy = getCopy(state, dept, yearLabel);
  const isGraduate = state === "GRADUATE_DONE";
  const isBanner = state === "ONE_LEFT" || state === "LAST_TODAY";

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    fireConfetti(state);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleClose = () => {
    dismissCelebration(version, state);
    setVisible(false);
    setTimeout(onClose, 260);
  };

  // ONE_LEFT / LAST_TODAY → premium banner (not blocking)
  if (isBanner) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[10px] sm:pt-3">
        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.9)}}`}</style>
        <div
          className={clsx(
            "pointer-events-auto w-full max-w-[560px] overflow-hidden rounded-[20px] border bg-white/90 shadow-xl backdrop-blur-2xl transition-all duration-300 dark:bg-zinc-900/90",
            "border-black/[0.08] dark:border-white/[0.08]",
            visible
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0",
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <img
                src={rocket512}
                alt=""
                className="h-7 w-7 object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
                {copy.eyebrow}
              </p>
              <p className="truncate text-[14px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                {copy.title}
                <span className="font-normal text-zinc-600 dark:text-zinc-400">
                  {" "}· {copy.subtitle}
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Dismiss"
              className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-zinc-600 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/15"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DONE / GRADUATE_DONE → full modal
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.75;transform:scale(0.92)}} @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>

      {/* Backdrop */}
      <button
        aria-label="Close celebration"
        onClick={handleClose}
        className="absolute inset-0 bg-[#0A0A0F]/40 backdrop-blur-[16px]"
      />

      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className={clsx(
          "relative w-full max-w-[440px] overflow-hidden rounded-[32px] border bg-white shadow-2xl transition-all duration-300 dark:bg-zinc-900",
          "border-black/[0.06] dark:border-white/[0.08]",
          "shadow-[0_24px_64px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.6)_inset] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
          visible ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
        )}
      >
        {/* Top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 dark:via-white/10" />

        {/* Header gradient */}
        <div
          className={clsx(
            "relative overflow-hidden px-6 pb-8 pt-10 sm:px-8 sm:pb-9 sm:pt-10",
            isGraduate
              ? "bg-gradient-to-b from-amber-50 via-white to-white dark:from-amber-950/30 dark:via-zinc-900 dark:to-zinc-900"
              : "bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900",
          )}
        >
          {/* Shimmer */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 [animation:shimmer_2.2s_ease_0.6s_1] dark:via-white/5" />
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-zinc-500 backdrop-blur hover:bg-black/10 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/15"
          >
            <X className="h-4 w-4" />
          </button>

          <IconStack state={state} />

          <div className="relative mt-2 text-center">
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                isGraduate
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-blue-600 dark:text-blue-400",
              )}
            >
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 text-balance text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-zinc-900 dark:text-white sm:text-[28px]">
              {copy.title}
            </h2>
            <p className="mx-auto mt-3 max-w-[32ch] text-balance text-[14px] leading-6 text-zinc-600 dark:text-zinc-400">
              {copy.subtitle}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 bg-zinc-50/80 px-6 py-5 dark:bg-zinc-900 sm:px-8">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className={clsx(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors",
                isGraduate
                  ? "bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  : "bg-[#2457A7] text-white hover:bg-[#1e4a8f] dark:bg-[#4593F8] dark:text-zinc-900 dark:hover:bg-[#5ba3fa]",
              )}
            >
              {copy.cta}
            </button>
            {onShare ? (
              <button
                onClick={onShare}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-[14px] font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            ) : null}
          </div>
          <p className="text-center text-[11px] leading-4 text-zinc-500 dark:text-zinc-500">
            Share your moment. Let your friends find theirs.
          </p>
          {onShare && isGraduate ? (
            <button
              onClick={onShare}
              className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download share image
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
