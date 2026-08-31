import { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";

const STORAGE_KEY = "easechaos:teaser-banner:dismissed:2026-08";
const START = new Date("2026-08-25T00:00:00");
const END = new Date("2026-09-15T23:59:59");

function isInWindow(): boolean {
  const now = new Date();
  return now >= START && now <= END;
}

export default function TeaserBanner() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isInWindow()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // ignore
    }
    const t = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setFadeOut(true);
    window.setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }, 280);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3 sm:top-4">
      <div
        className={`pointer-events-auto flex max-w-[560px] items-center gap-3 rounded-full border bg-zinc-900 px-3 py-2 shadow-xl backdrop-blur-xl transition-all duration-300 dark:bg-zinc-900 sm:gap-3 sm:px-4 sm:py-2.5 ${
          fadeOut ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        } border-white/10 shadow-black/20`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm sm:h-9 sm:w-9">
          <Gift className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[13px] font-semibold leading-tight text-white sm:text-[14px]">
            Psst. EaseChaos has a surprise waiting.
          </p>
          <p className="hidden truncate text-xs leading-tight text-white/60 sm:block">
            Finish your last paper and open your schedule to find it.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss teaser"
          className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
