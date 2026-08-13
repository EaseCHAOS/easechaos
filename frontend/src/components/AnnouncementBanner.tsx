import { useState, useEffect, type ReactNode } from "react";
import { announcements, type Announcement } from "../config/announcements";
import { X } from "lucide-react";

function activeAnnouncements(items: Announcement[]): Announcement | null {
  return items.find((a) => a.active) ?? null;
}

const STORAGE_KEY_PREFIX = "dismissed_announcement_";

const variantStyles: Record<string, string> = {
  info: "bg-blue-200 border-blue-700 text-gray-900 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-400",
  success: "bg-green-200 border-green-700 text-gray-900 dark:bg-green-900/80 dark:text-green-100 dark:border-green-400",
  warning: "bg-yellow-200 border-yellow-700 text-yellow-900 dark:bg-yellow-900/80 dark:text-yellow-100 dark:border-yellow-400",
};

const variantIcons: Record<string, ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5" aria-label="Info">
      <title>Info</title>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" strokeWidth="1.5" strokeLinejoin="round" className="stroke-current" fill="none" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5" aria-label="Success">
      <title>Success</title>
      <path d="M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z" strokeWidth="1.5" strokeLinejoin="round" className="stroke-current" />
      <path d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z" strokeWidth="1.5" strokeLinejoin="round" className="stroke-current" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5" aria-label="Warning">
      <title>Warning</title>
      <path d="M12 7v6M12 17h0" strokeWidth="2" strokeLinecap="round" className="stroke-current" />
      <path d="M12 2L2 22h20L12 2z" strokeWidth="1.5" strokeLinejoin="round" className="stroke-current" fill="none" />
    </svg>
  ),
};

export default function AnnouncementBanner() {
  const announcement = activeAnnouncements(announcements);
  const [mounted, setMounted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    const dismissed = localStorage.getItem(STORAGE_KEY_PREFIX + announcement.id);
    if (!dismissed) {
      setMounted(true);
    }
  }, [announcement]);

  if (!announcement || !mounted) return null;

  const dismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setMounted(false);
      localStorage.setItem(STORAGE_KEY_PREFIX + announcement.id, "1");
    }, 500);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] flex justify-center">
      <div
        className={`flex items-center gap-2 px-3 py-2 border-2 rounded-full max-w-[calc(100vw-2rem)] sm:max-w-md ${
          variantStyles[announcement.variant]
        } ${fadeOut ? "animate-fade-out" : "animate-slide-in"}`}
      >
        <span className="shrink-0">{variantIcons[announcement.variant]}</span>
        <span className="text-xs sm:text-sm leading-tight">{announcement.body}</span>
        <button type="button" onClick={dismiss} className="shrink-0 p-0.5 rounded-full hover:opacity-70 transition-opacity" aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
