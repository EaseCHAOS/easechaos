import { toPng } from "html-to-image";
import html2pdf from "html2pdf.js";
import { saveAs } from 'file-saver';

type ElementStyles = {
  zoom: string;
  overflowX: string;
  overflowY: string;
};

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


const DIMENSIONS = {
  WIDTH: 4961,  
  HEIGHT: 2500, 
  PADDING: 100  
};

const QUALITY_SETTINGS = {
  pixelRatio: isMobile ? 1.5 : 2,
  imageQuality: isMobile ? 0.8 : 0.95,
  pdfScale: isMobile ? 1.2 : 1.5
};

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

  node.style.zoom = "1";
  node.style.overflowX = "hidden";
  node.style.overflowY = "hidden";

  return { timeIndicator, originalStyles };
}

function restoreElement(node: HTMLElement, timeIndicator: HTMLElement | null, originalStyles: ElementStyles) {
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

function createCroppedCanvas(
  canvas: HTMLCanvasElement, 
  boundaries: ReturnType<typeof getImageBoundaries>,
  padding = DIMENSIONS.PADDING
) {
  const { minX, maxX, minY, maxY } = boundaries;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (croppedCtx) {
    croppedCanvas.width = DIMENSIONS.WIDTH;
    croppedCanvas.height = DIMENSIONS.HEIGHT;

    croppedCtx.fillStyle = 'white';
    croppedCtx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

    const widthScale = (DIMENSIONS.WIDTH - padding * 2) / contentWidth;
    
    const scaledWidth = contentWidth * widthScale;
    const scaledHeight = contentHeight * widthScale;

    const xOffset = (DIMENSIONS.WIDTH - scaledWidth) / 2;
    const yOffset = Math.max(padding, (DIMENSIONS.HEIGHT - scaledHeight) / 2);

    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      contentWidth,
      contentHeight,
      xOffset,
      yOffset,
      scaledWidth,
      scaledHeight
    );

    croppedCtx.strokeStyle = '#f0f0f0';
    croppedCtx.lineWidth = 1;
    croppedCtx.strokeRect(
      padding, 
      padding, 
      DIMENSIONS.WIDTH - padding * 2, 
      DIMENSIONS.HEIGHT - padding * 2
    );
  }

  return { 
    croppedCanvas, 
    width: DIMENSIONS.WIDTH, 
    height: DIMENSIONS.HEIGHT 
  };
}

function downloadFile(content: string | Blob, fileName: string, mimeType: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const link = document.createElement('a');
    link.download = fileName;
    
    if (content instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function() {
        link.href = reader.result as string;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      };
      reader.readAsDataURL(content);
    } else {
      link.href = content;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    }
    return;
  }

  const blob = content instanceof Blob 
    ? new Blob([content], { type: content.type }) 
    : new Blob([content], { type: mimeType });
    
  const blobWithName = new File([blob], fileName, { 
    type: blob.type,
    lastModified: new Date().getTime()
  });
  
  saveAs(blobWithName, fileName);
}

export function downloadElementAsImage(elementId: string, fileName: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  const { timeIndicator, originalStyles } = prepareElement(node as HTMLElement);

  const config = {
    width: DIMENSIONS.WIDTH,
    height: DIMENSIONS.HEIGHT,
    pixelRatio: QUALITY_SETTINGS.pixelRatio,
    padding: DIMENSIONS.PADDING
  };

  toPng(node, {
    cacheBust: true,
    width: config.width,
    height: config.height,
    backgroundColor: "white",
    style: { margin: "0", padding: "0" },
    quality: QUALITY_SETTINGS.imageQuality,
    pixelRatio: config.pixelRatio,
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
        
        croppedCanvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, fileName, 'image/png');
          }
        }, 'image/png', QUALITY_SETTINGS.imageQuality);
      };
    })
    .catch((error) => {
      console.error("Failed to download image:", error);
      alert("Failed to download image. Please try again.");
    })
    .finally(() => restoreElement(node as HTMLElement, timeIndicator, originalStyles));
}

export function downloadElementAsPDF(elementId: string, fileName: string) {
  const node = document.getElementById(elementId);
  if (!node) return;

  const { timeIndicator, originalStyles } = prepareElement(node as HTMLElement);

  const config = {
    width: DIMENSIONS.WIDTH,
    height: DIMENSIONS.HEIGHT,
    pixelRatio: QUALITY_SETTINGS.pixelRatio,
    padding: DIMENSIONS.PADDING
  };

  toPng(node, {
    cacheBust: true,
    width: config.width,
    height: config.height,
    backgroundColor: "white",
    style: { margin: "0", padding: "0" },
    quality: QUALITY_SETTINGS.imageQuality,
    pixelRatio: config.pixelRatio,
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

        const opt = {
          margin: 0,
          filename: fileName,
          image: { type: 'png', quality: QUALITY_SETTINGS.imageQuality },
          html2canvas: { 
            scale: QUALITY_SETTINGS.pdfScale,
            useCORS: true,
            allowTaint: true
          },
          jsPDF: {
            unit: 'px',
            format: [DIMENSIONS.WIDTH, DIMENSIONS.HEIGHT],
            orientation: 'landscape',
            hotfixes: ['px_scaling'],
            compress: true
          },
          forceDownload: true,
          outputPdf: 'save'
        };

        // Handle iOS devices differently
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          opt.outputPdf = 'dataurlstring';
          html2pdf()
            .set(opt)
            .from(croppedCanvas)
            .outputPdf()
            .then((pdfData: string) => {
              downloadFile(pdfData, fileName, 'application/pdf');
            })
            .catch((error: Error) => {
              console.error("Failed to download PDF:", error);
              alert("Failed to download PDF. Please try again.");
            });
        } else {
          html2pdf()
            .set(opt)
            .from(croppedCanvas)
            .save()
            .catch((error: Error) => {
              console.error("Failed to download PDF:", error);
              alert("Failed to download PDF. Please try again.");
            });
        }
      };
    })
    .finally(() => restoreElement(node as HTMLElement, timeIndicator, originalStyles));
}