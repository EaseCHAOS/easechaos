import { toPng } from "html-to-image";
import html2pdf from "html2pdf.js";

interface CalendarExportEvent {
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
}

const QUALITY = {
  mobile: {
    pixelRatio: 1.5,
    quality: 0.8,
    pdfScale: 1.2,
  },
  desktop: {
    pixelRatio: 2,
    quality: 0.95,
    pdfScale: 1.2,
  },
};

const settings = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  ? QUALITY.mobile
  : QUALITY.desktop;

async function prepareElement(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) throw new Error("Element not found");

  const isDarkTheme = document.documentElement.classList.contains("dark");
  const backgroundColor = isDarkTheme ? "#02040A" : "#FAFAFA";

  // Hide time indicator if exists
  const timeIndicator = node.querySelector(".time-indicator") as HTMLElement;
  if (timeIndicator) timeIndicator.style.display = "none";

  // Generate image
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor,
    quality: settings.quality,
    pixelRatio: settings.pixelRatio,
    style: {
      padding: "20px",
      backgroundColor, // Ensure padding area also has the correct background color
    },
  });

  // Restore time indicator
  if (timeIndicator) timeIndicator.style.display = "";

  return { dataUrl, backgroundColor }; // Return both for PDF generation
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function formatUtcIcsTimestamp(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export async function downloadElementAsImage(
  elementId: string,
  fileName: string
) {
  try {
    const { dataUrl } = await prepareElement(elementId);

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download image:", error);
    alert("Failed to download image. Please try again.");
  }
}

export function downloadEventsAsICS(
  events: CalendarExportEvent[],
  fileName: string,
  calendarName = "EaseCHAOS Exam Schedule"
) {
  try {
    const dtStamp = formatUtcIcsTimestamp(new Date());
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EaseCHAOS//Exam Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    ];

    events.forEach((event, index) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${formatIcsDateTime(event.start)}-${index}@easechaos.app`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${formatIcsDateTime(event.start)}`,
        `DTEND:${formatIcsDateTime(event.end)}`,
        `SUMMARY:${escapeIcsText(event.summary)}`,
      );

      if (event.location) {
        lines.push(`LOCATION:${escapeIcsText(event.location)}`);
      }

      if (event.description) {
        lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
      }

      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    downloadBlob(
      new Blob([lines.join("\r\n")], {
        type: "text/calendar;charset=utf-8",
      }),
      fileName
    );
  } catch (error) {
    console.error("Failed to download ICS:", error);
    alert("Failed to download calendar file. Please try again.");
  }
}

export async function downloadElementAsPDF(
  elementId: string,
  fileName: string
) {
  try {
    const { dataUrl, backgroundColor } = await prepareElement(elementId);

    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: "png", quality: settings.quality },
      html2canvas: {
        scale: settings.pdfScale,
        useCORS: true,
        backgroundColor,
        width: img.width,
        height: img.height
      },
      jsPDF: {
        unit: "px",
        format: [img.width * settings.pdfScale, img.height * settings.pdfScale],
        orientation: "landscape",
        compress: true,
        hotfixes: ["px_scaling"],
      },
    };

    await html2pdf().set(opt).from(img).save();
  } catch (error) {
    console.error("Failed to download PDF:", error);
    alert("Failed to download PDF. Please try again.");
  }
}
