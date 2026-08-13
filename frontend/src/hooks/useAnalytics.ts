import { track } from "@vercel/analytics";
import { useMemo } from "react";

export function useAnalytics() {
  return useMemo(
    () => ({
      trackTimetableView: (dept: string, year: string) => {
        track("view_timetable", { dept, year });
      },
      trackExamView: (dept: string, year: string) => {
        track("view_exam", { dept, year });
      },
      trackDownloadPDF: (page: "timetable" | "exam") => {
        track("download_pdf", { page });
      },
      trackDownloadImage: (page: "timetable" | "exam") => {
        track("download_image", { page });
      },
      trackDownloadICS: () => {
        track("download_ics");
      },
      trackThemeChange: (theme: string) => {
        track("theme_change", { theme });
      },
    }),
    [],
  );
}
