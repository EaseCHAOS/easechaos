import { toPng } from "html-to-image";
import html2pdf from "html2pdf.js";

function prepareElement(node: HTMLElement) {
  const timeIndicator = node.querySelector(".time-indicator") as HTMLElement;
  const originalStyles = {
    zoom: node.style.zoom,
    overflowX: node.style.overflowX,
    overflowY: node.style.overflowY,
  };

  if (timeIndicator) {
    timeIndicator.style.display = "none";
  }

  node.style.zoom = "0.67";
  node.style.overflowX = "hidden";
  node.style.overflowY = "hidden";

  return { timeIndicator, originalStyles };
}

function restoreElement(node: HTMLElement, timeIndicator: HTMLElement | null, originalStyles: any) {
  if (timeIndicator) {
    timeIndicator.style.display = "";
  }
  Object.assign(node.style, originalStyles);
}

function getImageBoundaries(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  let minY = canvas.height, maxY = 0, minX = canvas.width, maxX = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  return { minX, maxX, minY, maxY };
}

function createCroppedCanvas(canvas: HTMLCanvasElement, boundaries: ReturnType<typeof getImageBoundaries>, bottomPadding = 0) {
  const { minX, maxX, minY, maxY } = boundaries;
  const width = maxX - minX;
  const height = maxY - minY;

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (croppedCtx) {
    croppedCanvas.width = width;
    croppedCanvas.height = height + bottomPadding;

    if (bottomPadding > 0) {
      croppedCtx.fillStyle = 'white';
      croppedCtx.fillRect(0, 0, width, height + bottomPadding);
    }

    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      width,
      height,
      0,
      0,
      width,
      height
    );
  }

  return { croppedCanvas, width, height };
}

export function downloadElementAsImage(elementId: string, fileName: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  const { timeIndicator, originalStyles } = prepareElement(node as HTMLElement);

  toPng(node, {
    cacheBust: true,
    width: 1920,
    height: 600,
    backgroundColor: "white",
    style: { margin: "0", padding: "0" },
    quality: 1.0,
    pixelRatio: 4,
  })
    .then((dataUrl) => {
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const boundaries = getImageBoundaries(ctx, canvas);
        const { croppedCanvas } = createCroppedCanvas(canvas, boundaries);

        const link = document.createElement("a");
        link.download = fileName;
        link.href = croppedCanvas.toDataURL("image/png", 1.0);
        link.click();
      };
    })
    .catch((error) => console.error("Failed to download image:", error))
    .finally(() => restoreElement(node as HTMLElement, timeIndicator, originalStyles));
}

export function downloadElementAsPDF(elementId: string, fileName: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  const { timeIndicator, originalStyles } = prepareElement(node as HTMLElement);

  toPng(node, {
    cacheBust: true,
    width: 1920,
    height: 600,
    backgroundColor: "white",
    style: { margin: "0", padding: "0" },
    quality: 1.0,
    pixelRatio: 4,
  })
    .then((dataUrl) => {
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const boundaries = getImageBoundaries(ctx, canvas);
        const { croppedCanvas, width, height } = createCroppedCanvas(canvas, boundaries, 40);

        const opt = {
          margin: 0,
          filename: fileName,
          image: { type: 'png', quality: 1.0 },
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'px',
            format: [width, height + 40],
            orientation: width > (height + 40) ? 'landscape' : 'portrait',
            hotfixes: ['px_scaling']
          }
        };

        html2pdf().set(opt).from(croppedCanvas).save();
      };
    })
    .finally(() => restoreElement(node as HTMLElement, timeIndicator, originalStyles));
}