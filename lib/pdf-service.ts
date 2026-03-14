import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Generates and downloads a PDF from a specified DOM element.
 * 
 * @param elementId - The ID of the HTML element to render into a PDF.
 * @param filename - The name of the downloaded file (e.g., 'trip-itinerary.pdf').
 */
export async function downloadPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found.`);
    return;
  }

  try {
    // html-to-image has built-in filtering, we can use that instead of manually hiding
    const filter = (node: HTMLElement) => {
      const exclusionClass = "data-html2canvas-ignore";
      if (node.hasAttribute && node.hasAttribute(exclusionClass)) {
        return false;
      }
      return true;
    };

    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      filter: filter,
      backgroundColor: '#FAFAF8', // Match the page background
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      // Use the element's actual dimensions for the PDF
      format: [element.offsetWidth, element.offsetHeight],
    });

    pdf.addImage(dataUrl, "JPEG", 0, 0, element.offsetWidth, element.offsetHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
