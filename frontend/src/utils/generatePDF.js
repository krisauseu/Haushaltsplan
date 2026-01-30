import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a PDF report of the Haushaltsplan
 * @param {number} year - The year for the report
 * @returns {Promise<void>}
 */
export async function generatePDF(year) {
    // Create PDF in A4 landscape format
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = margin;

    // Add PDF header
    currentY = addPDFHeader(pdf, year, margin, pageWidth, currentY);

    // Get the main content container
    const appContainer = document.querySelector('.max-w-\\[1800px\\]');
    if (!appContainer) {
        console.error('App container not found');
        return;
    }

    // Temporarily hide elements that shouldn't appear in PDF
    const elementsToHide = [
        ...document.querySelectorAll('[data-pdf-hide]'),
        ...document.querySelectorAll('.edit-mode-controls'),
        ...document.querySelectorAll('button'),
        document.querySelector('[data-tab-nav]')
    ].filter(Boolean);

    const originalStyles = elementsToHide.map(el => ({
        element: el,
        display: el.style.display
    }));

    // Hide elements
    elementsToHide.forEach(el => {
        el.style.display = 'none';
    });

    // Store current theme and force light mode for PDF
    const htmlElement = document.documentElement;
    const wasDarkMode = htmlElement.classList.contains('dark');
    if (wasDarkMode) {
        htmlElement.classList.remove('dark');
    }

    // Small delay to let styles recalculate
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Skip Summary Cards to reduce whitespace
        // const summaryCards = document.querySelector('[data-pdf-summary-cards]');
        // if (summaryCards) {
        //     currentY = await captureElementToPDF(pdf, summaryCards, margin, currentY, contentWidth, pageHeight);
        //     currentY += 5;
        // }

        // Capture Analysis Section (QuickStats + Charts)
        const analysisSection = document.querySelector('[data-pdf-analysis]');
        if (analysisSection) {
            currentY = await captureElementToPDF(pdf, analysisSection, margin, currentY, contentWidth, pageHeight);
            currentY += 5;
        }

        // Capture Budget Table - let captureElementToPDF handle pagination
        const budgetTable = document.querySelector('[data-pdf-budget-table]');
        if (budgetTable) {
            await captureElementToPDF(pdf, budgetTable, margin, currentY, contentWidth, pageHeight);
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        pdf.save(`Haushaltsplan_${year}_${timestamp}.pdf`);

    } finally {
        // Restore hidden elements
        originalStyles.forEach(({ element, display }) => {
            element.style.display = display;
        });

        // Restore original theme
        if (wasDarkMode) {
            htmlElement.classList.add('dark');
        }
    }
}

/**
 * Add styled header to PDF page
 */
function addPDFHeader(pdf, year, margin, pageWidth, startY, isContinuation = false) {
    const headerHeight = isContinuation ? 12 : 20;

    // Header background
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.rect(0, 0, pageWidth, headerHeight + 5, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(isContinuation ? 12 : 16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Haushaltsplan Bericht ${year}${isContinuation ? ' (Fortsetzung)' : ''}`, margin, startY + (isContinuation ? 8 : 10));

    // Date
    const dateStr = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Erstellt am: ${dateStr}`, pageWidth - margin - 50, startY + (isContinuation ? 8 : 10));

    // Reset text color for content
    pdf.setTextColor(0, 0, 0);

    return startY + headerHeight + 10;
}

/**
 * Capture a DOM element and add it to the PDF
 */
async function captureElementToPDF(pdf, element, margin, startY, contentWidth, pageHeight) {
    // Capture element with high resolution
    const canvas = await html2canvas(element, {
        scale: 2, // High resolution for sharp text
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc', // slate-50 background
        onclone: (clonedDoc, clonedElement) => {
            // Ensure all backgrounds are rendered
            clonedElement.style.backgroundColor = '#f8fafc';
        }
    });

    // Calculate dimensions to fit within content width
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Check if we need a new page
    if (startY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        startY = margin + 25; // Leave space for continuation header
    }

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, startY, imgWidth, imgHeight);

    return startY + imgHeight;
}

export default generatePDF;
