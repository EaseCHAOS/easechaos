import { toPng } from "html-to-image";
import html2pdf from "html2pdf.js";

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

  // Detect theme by checking if body has dark-theme class
  const isDarkTheme = document.body.classList.contains("dark-theme");
  const backgroundColor = isDarkTheme ? "#121212" : "white"; // Using a dark gray for dark mode

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
