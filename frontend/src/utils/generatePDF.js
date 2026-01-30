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

    const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const headerHeight = 20;
    const usableHeight = pageHeight - margin - headerHeight - 5;

    // Store current theme and force light mode for PDF
    const htmlElement = document.documentElement;
    const wasDarkMode = htmlElement.classList.contains('dark');
    if (wasDarkMode) {
        htmlElement.classList.remove('dark');
    }

    // Temporarily hide elements that shouldn't appear in PDF
    const elementsToHide = [
        ...document.querySelectorAll('[data-pdf-hide]'),
        ...document.querySelectorAll('.edit-mode-controls'),
        ...document.querySelectorAll('button'),
        document.querySelector('[data-tab-nav]')
    ].filter(Boolean);

    const originalDisplayStyles = elementsToHide.map(el => ({
        element: el,
        display: el.style.display
    }));

    elementsToHide.forEach(el => {
        el.style.display = 'none';
    });

    // Store and fix position of off-screen elements (they're rendered but positioned off-screen during export)
    const analysisSection = document.querySelector('[data-pdf-analysis]');
    const budgetTableWrapper = analysisSection?.parentElement?.previousElementSibling;
    const budgetTable = document.querySelector('[data-pdf-budget-table]');

    const offscreenElements = [];

    // Move off-screen elements back into view temporarily for capture
    [analysisSection?.parentElement, budgetTableWrapper].filter(Boolean).forEach(el => {
        if (el && el.style.position === 'absolute' && el.style.left === '-9999px') {
            offscreenElements.push({
                element: el,
                originalStyle: {
                    position: el.style.position,
                    left: el.style.left,
                    top: el.style.top
                }
            });
            // Make it visible but off the visible page (we'll use scrollWidth/Height)
            el.style.position = 'fixed';
            el.style.left = '0';
            el.style.top = '0';
            el.style.zIndex = '-1';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        }
    });

    // Prepare elements with special PDF styling
    const pdfStyleOverrides = [];

    // Remove truncate from legend items for full text visibility
    const truncateElements = document.querySelectorAll('[data-pdf-analysis] .truncate');
    truncateElements.forEach(el => {
        pdfStyleOverrides.push({
            element: el,
            className: el.className,
            styles: {
                overflow: el.style.overflow,
                whiteSpace: el.style.whiteSpace,
                textOverflow: el.style.textOverflow
            }
        });
        el.classList.remove('truncate');
        el.style.overflow = 'visible';
        el.style.whiteSpace = 'normal';
        el.style.textOverflow = 'clip';
    });

    // Make overflow elements visible
    const overflowElements = document.querySelectorAll('[data-pdf-analysis] .overflow-y-auto, [data-pdf-analysis] .overflow-hidden, [data-pdf-analysis] .max-h-56');
    overflowElements.forEach(el => {
        pdfStyleOverrides.push({
            element: el,
            className: el.className,
            styles: {
                overflow: el.style.overflow,
                maxHeight: el.style.maxHeight
            }
        });
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.classList.remove('overflow-y-auto', 'overflow-hidden', 'max-h-56');
    });

    // Small delay to let styles recalculate
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        // --- PAGE 1: Analysis Section (QuickStats + Charts) ---
        if (analysisSection) {
            // Temporarily make it fully visible for capture
            const parent = analysisSection.parentElement;
            const wasHidden = parent && parent.style.opacity === '0';
            if (wasHidden) {
                parent.style.opacity = '1';
                parent.style.position = 'static';
                parent.style.zIndex = 'auto';
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            // Add header to page 1
            addPDFHeader(pdf, year, margin, pageWidth, margin);

            const canvas = await html2canvas(analysisSection, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f8fafc',
                windowWidth: 1400,
                onclone: (clonedDoc, clonedElement) => {
                    clonedElement.style.backgroundColor = '#f8fafc';
                    // Ensure all text is visible in clone
                    clonedElement.querySelectorAll('.truncate').forEach(el => {
                        el.style.overflow = 'visible';
                        el.style.whiteSpace = 'normal';
                        el.style.textOverflow = 'clip';
                    });
                    clonedElement.querySelectorAll('.overflow-y-auto, .overflow-hidden, .max-h-56').forEach(el => {
                        el.style.overflow = 'visible';
                        el.style.maxHeight = 'none';
                    });
                }
            });

            if (wasHidden) {
                parent.style.opacity = '0';
                parent.style.position = 'fixed';
                parent.style.zIndex = '-1';
            }

            // Calculate dimensions to fit within page
            const startY = margin + headerHeight + 5;
            const availableHeight = usableHeight;

            const aspectRatio = canvas.width / canvas.height;
            let imgWidth = contentWidth;
            let imgHeight = imgWidth / aspectRatio;

            if (imgHeight > availableHeight) {
                imgHeight = availableHeight;
                imgWidth = imgHeight * aspectRatio;
            }

            const xOffset = margin + (contentWidth - imgWidth) / 2;
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', xOffset, startY, imgWidth, imgHeight);
        }

        // --- PAGE 2: Budget Table (Full Page) ---
        if (budgetTable) {
            // Temporarily make it fully visible for capture
            const wrapper = budgetTable.parentElement?.parentElement;
            const wasHidden = wrapper && wrapper.style.opacity === '0';
            if (wasHidden) {
                wrapper.style.opacity = '1';
                wrapper.style.position = 'static';
                wrapper.style.zIndex = 'auto';
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            pdf.addPage();
            addPDFHeader(pdf, year, margin, pageWidth, margin, true);

            const canvas = await html2canvas(budgetTable, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f8fafc',
                windowWidth: 1800,
                onclone: (clonedDoc, clonedElement) => {
                    clonedElement.style.backgroundColor = '#f8fafc';
                    clonedElement.style.width = 'auto';
                    clonedElement.style.maxWidth = 'none';
                }
            });

            if (wasHidden) {
                wrapper.style.opacity = '0';
                wrapper.style.position = 'fixed';
                wrapper.style.zIndex = '-1';
            }

            const startY = margin + headerHeight;
            const availableHeight = usableHeight + 5;

            const aspectRatio = canvas.width / canvas.height;
            let imgWidth = contentWidth;
            let imgHeight = imgWidth / aspectRatio;

            if (imgHeight > availableHeight) {
                imgHeight = availableHeight;
                imgWidth = imgHeight * aspectRatio;
            }

            const xOffset = margin + (contentWidth - imgWidth) / 2;
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', xOffset, startY, imgWidth, imgHeight);
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        pdf.save(`Haushaltsplan_${year}_${timestamp}.pdf`);

    } finally {
        // Restore hidden elements
        originalDisplayStyles.forEach(({ element, display }) => {
            element.style.display = display;
        });

        // Restore off-screen elements
        offscreenElements.forEach(({ element, originalStyle }) => {
            element.style.position = originalStyle.position;
            element.style.left = originalStyle.left;
            element.style.top = originalStyle.top;
            element.style.zIndex = '';
            element.style.opacity = '';
            element.style.pointerEvents = '';
        });

        // Restore PDF style overrides
        pdfStyleOverrides.forEach(({ element, className, styles }) => {
            if (className) element.className = className;
            if (styles) {
                Object.entries(styles).forEach(([key, value]) => {
                    element.style[key] = value || '';
                });
            }
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
    const headerHeight = isContinuation ? 12 : 18;

    // Header background - dark blue
    pdf.setFillColor(30, 41, 59);
    pdf.rect(0, 0, pageWidth, headerHeight + 2, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(isContinuation ? 11 : 14);
    pdf.setFont('helvetica', 'bold');

    const titleText = isContinuation
        ? `Haushaltsplan ${year} - Budgettabelle`
        : `Haushaltsplan Bericht ${year}`;
    pdf.text(titleText, margin, startY + (isContinuation ? 7 : 11));

    // Date - right aligned
    const dateStr = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const dateWidth = pdf.getTextWidth(`Erstellt am: ${dateStr}`);
    pdf.text(`Erstellt am: ${dateStr}`, pageWidth - margin - dateWidth, startY + (isContinuation ? 7 : 11));

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    return startY + headerHeight + 5;
}

export default generatePDF;
