/**
 * GS Associates — PDF Service
 * Generates branded PDFs for Booking Confirmations and Bills.
 * Matches the maroon/gold premium branding.
 */

const PDFDocument = require('pdfkit');

/**
 * Helper to build a PDF buffer from a PDFKit builder function.
 */
function buildPDF(builderFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));
    try {
      builderFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate Booking Confirmation PDF
 */
function generateBookingConfirmationPDF(booking) {
  return buildPDF(doc => {
    // ─── Header Banner ──────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill('#7A001E');
    doc.rect(0, 110, doc.page.width, 4).fill('#D4AF37');

    doc.fillColor('#D4AF37').fontSize(24).font('Helvetica-Bold').text('GS ASSOCIATES', 40, 30);
    doc.fillColor('#f5e6c8').fontSize(9).font('Helvetica').text('PREMIUM SOUTH INDIAN EVENT MANAGEMENT', 40, 58);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('BOOKING CONFIRMATION', 40, 78);

    // Date
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    doc.fillColor('#f5e6c8').fontSize(10).font('Helvetica').text(`Date: ${today}`, doc.page.width - 150, 30, { align: 'right', width: 110 });

    // ─── Content ────────────────────────────────────────────────────────
    let y = 140;

    // Welcome block
    doc.fillColor('#1A1A1A').fontSize(12).font('Helvetica-Bold').text(`Namaskaram, ${booking.name}!`, 40, y);
    y += 20;
    doc.fillColor('#333333').fontSize(10).font('Helvetica')
       .text('Thank you for trusting GS Associates to plan and manage your auspicious event. Your booking is officially confirmed, and the details are listed below:', 40, y, { width: doc.page.width - 80 });
    y += 40;

    // Status Badge
    doc.rect(40, y, 140, 24).fill('#27ae60');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('STATUS: CONFIRMED', 48, y + 7);
    y += 40;

    // Details Grid Layout
    const col1X = 40;
    const col2X = doc.page.width / 2 + 10;
    const colWidth = doc.page.width / 2 - 50;

    const details = [
      { label: 'Booking ID', value: `GS-BKG-${booking.id}` },
      { label: 'Client Name', value: booking.name },
      { label: 'Phone Number', value: booking.phone },
      { label: 'Email ID', value: booking.email },
      { label: 'Event Date', value: booking.event_date || 'TBD' },
      { label: 'Guest Count', value: `${booking.guest_count} Guests` },
      { label: 'Event Type', value: booking.event_type_name || booking.eventType || 'Custom Event' },
      { label: 'Package Tier', value: booking.package_name || booking.tier || 'Custom Package' },
      { label: 'Total Value', value: `INR ${parseFloat(booking.total_price).toLocaleString('en-IN')}` }
    ];

    details.forEach((item, index) => {
      const isOdd = index % 2 === 0;
      const x = isOdd ? col1X : col2X;
      const currentY = y + Math.floor(index / 2) * 45;

      // Draw dotted underline
      doc.moveTo(x, currentY + 30).lineTo(x + colWidth, currentY + 30).dash(2, { space: 2 }).stroke('#E0D0A0');

      doc.fillColor('#666666').fontSize(9).font('Helvetica-Bold').text(item.label.toUpperCase(), x, currentY);
      doc.fillColor('#1A1A1A').fontSize(11).font('Helvetica-Bold').text(item.value || 'Not Specified', x, currentY + 12);
    });

    y += Math.ceil(details.length / 2) * 45 + 15;

    // ─── Addons List (if any) ──────────────────────────────────────────
    let addonsList = [];
    if (booking.addons) {
      try {
        addonsList = typeof booking.addons === 'string' ? JSON.parse(booking.addons) : booking.addons;
      } catch (e) {
        // Fallback if not JSON
      }
    }

    if (Array.isArray(addonsList) && addonsList.length > 0) {
      doc.fillColor('#7A001E').fontSize(12).font('Helvetica-Bold').text('SELECTED ADD-ONS', 40, y);
      y += 18;

      addonsList.forEach((addon, idx) => {
        // Bullet
        doc.circle(45, y + 6, 3).fill('#D4AF37');
        
        let addonLabel = addon;
        if (typeof addon === 'object' && addon.name) {
          addonLabel = addon.name;
        } else if (!isNaN(parseInt(addon))) {
          addonLabel = `Custom Add-on Service #${addon}`;
        }
        
        doc.fillColor('#333333').fontSize(10).font('Helvetica').text(addonLabel, 55, y);
        y += 18;
      });
      y += 10;
    }

    // ─── Signature Block ────────────────────────────────────────────────
    y = Math.max(y, 650);
    doc.moveTo(40, y).lineTo(200, y).undash().stroke('#1A1A1A');
    doc.moveTo(doc.page.width - 200, y).stroke('#1A1A1A');

    doc.fillColor('#666666').fontSize(9).font('Helvetica')
       .text('Authorized Signature', 40, y + 6, { width: 160 })
       .text('Client Signature', doc.page.width - 200, y + 6, { width: 160, align: 'right' });

    // ─── Footer ────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#FFFDF9');
    doc.moveTo(0, doc.page.height - 50).lineTo(doc.page.width, doc.page.height - 50).stroke('#E0D0A0');
    
    doc.fillColor('#7A001E').fontSize(10).font('Helvetica-Bold').text('GS Associates Event Management Desk', 40, doc.page.height - 35);
    doc.fillColor('#666666').fontSize(9).font('Helvetica')
       .text('Namaskaram 🙏 | gsassociates.in | +91 98867 81380', 40, doc.page.height - 22);
  });
}

/**
 * Generate Bill Invoice PDF
 */
function generateBillPDF(billData) {
  return buildPDF(doc => {
    // Colors
    const maroon = '#7A001E';
    const gold = '#D4AF37';
    const dark = '#1A1A1A';
    const grey = '#666666';
    const borderGold = '#E0D0A0';

    // ─── Header Banner ──────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill(maroon);
    doc.rect(0, 110, doc.page.width, 4).fill(gold);

    doc.fillColor(gold).fontSize(24).font('Helvetica-Bold').text('GS ASSOCIATES', 40, 30);
    doc.fillColor('#f5e6c8').fontSize(9).font('Helvetica').text('PREMIUM SOUTH INDIAN EVENT MANAGEMENT', 40, 58);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('TAX INVOICE / BILL', 40, 78);

    // Bill Number and Date
    doc.fillColor('#f5e6c8').fontSize(10).font('Helvetica-Bold').text(`BILL NO: ${billData.billNo || 'GSBL0000'}`, doc.page.width - 200, 30, { align: 'right', width: 160 });
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    doc.fillColor('#f5e6c8').fontSize(9).font('Helvetica').text(`Date: ${todayStr}`, doc.page.width - 200, 45, { align: 'right', width: 160 });

    // ─── Customer & Event Info Block ──────────────────────────────────
    let y = 135;

    // Box header for Billing Info
    doc.rect(40, y, doc.page.width - 80, 20).fill('#FFFDF9');
    doc.rect(40, y, doc.page.width - 80, 20).stroke(borderGold);
    doc.fillColor(maroon).fontSize(9).font('Helvetica-Bold').text('BILL TO & EVENT DETAILS', 48, y + 6);
    y += 20;

    // Detailed table details
    const colWidth = (doc.page.width - 80) / 2;
    doc.rect(40, y, doc.page.width - 80, 95).stroke(borderGold);

    // Column 1 values
    let colY = y + 10;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('CLIENT NAME:', 50, colY)
       .fillColor(dark).fontSize(10).font('Helvetica-Bold').text(billData.clientName || 'Not Entered', 130, colY);
    
    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('CONTACT PHONE:', 50, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(billData.phone || 'Not Entered', 130, colY);

    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('CLIENT EMAIL:', 50, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(billData.email || 'Not Entered', 130, colY);

    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('PREPARED BY:', 50, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(billData.preparedBy || 'GS Admin Staff', 130, colY);

    // Column 2 values
    colY = y + 10;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('EVENT TYPE:', 40 + colWidth, colY)
       .fillColor(dark).fontSize(10).font('Helvetica-Bold').text(billData.eventType || 'Event', 120 + colWidth, colY);
    
    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('PACKAGE TIER:', 40 + colWidth, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(billData.tier || 'Basic', 120 + colWidth, colY);

    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('EVENT DATE:', 40 + colWidth, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(billData.eventDate || 'TBD', 120 + colWidth, colY);

    colY += 20;
    doc.fillColor(grey).fontSize(8).font('Helvetica-Bold').text('GUEST COUNT:', 40 + colWidth, colY)
       .fillColor(dark).fontSize(9).font('Helvetica').text(`${billData.guestCount || 0} Guests`, 120 + colWidth, colY);

    y += 115;

    // ─── Table Header ──────────────────────────────────────────────────
    doc.rect(40, y, doc.page.width - 80, 24).fill(maroon);
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('DESCRIPTION OF EVENT SERVICES', 48, y + 7);
    doc.text('UNIT PRICE', 320, y + 7, { width: 80, align: 'right' });
    doc.text('QTY', 410, y + 7, { width: 45, align: 'right' });
    doc.text('AMOUNT (INR)', 465, y + 7, { width: 90, align: 'right' });
    
    y += 24;

    // ─── Table Rows ────────────────────────────────────────────────────
    const items = billData.lineItems || [];
    
    items.forEach((item, idx) => {
      // Background shading for alternate rows
      if (idx % 2 === 1) {
        doc.rect(40, y, doc.page.width - 80, 24).fill('#FFFDF9');
      }
      doc.rect(40, y, doc.page.width - 80, 24).stroke(borderGold);

      doc.fillColor(dark).fontSize(8.5).font('Helvetica-Bold');
      doc.text(item.label, 48, y + 7, { width: 260, lineBreak: false });

      doc.font('Helvetica');
      doc.text(parseFloat(item.unitPrice || 0).toLocaleString('en-IN'), 320, y + 7, { width: 80, align: 'right' });
      doc.text(String(item.qty || '1'), 410, y + 7, { width: 45, align: 'right' });
      doc.text(parseFloat(item.amount || 0).toLocaleString('en-IN'), 465, y + 7, { width: 90, align: 'right' });

      y += 24;
    });

    y += 10;

    // ─── Totals and Payment Summary ────────────────────────────────────
    const summaryX = doc.page.width - 240;
    const labelW = 110;
    const valueW = 90;

    const printRow = (label, value, isBold = false) => {
      doc.fillColor(isBold ? maroon : grey).fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(label, summaryX, y);
      doc.fillColor(dark).fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(value, summaryX + labelW, y, { width: valueW, align: 'right' });
      y += 16;
    };

    printRow('Subtotal:', `₹${parseFloat(billData.subtotal || 0).toLocaleString('en-IN')}`);
    
    if (parseFloat(billData.discountAmount || 0) > 0) {
      printRow(`Discount (${billData.discountPercent}%):`, `-₹${parseFloat(billData.discountAmount || 0).toLocaleString('en-IN')}`);
    }
    
    printRow('GST (18%):', `₹${parseFloat(billData.gst || 0).toLocaleString('en-IN')}`);
    
    // Draw total separation line
    doc.moveTo(summaryX, y).lineTo(doc.page.width - 40, y).stroke(maroon);
    y += 6;

    printRow('Grand Total:', `₹${parseFloat(billData.grandTotal || 0).toLocaleString('en-IN')}`, true);
    printRow('Amount Received:', `₹${parseFloat(billData.amountReceived || 0).toLocaleString('en-IN')}`);
    
    // Final balance due separator
    doc.moveTo(summaryX, y).lineTo(doc.page.width - 40, y).stroke(maroon);
    y += 6;

    printRow('Balance Due:', `₹${parseFloat(billData.balanceDue || 0).toLocaleString('en-IN')}`, true);

    // Payment details box on the left side
    let payY = y - 100;
    doc.rect(40, payY, 220, 75).stroke(borderGold);
    doc.rect(40, payY, 220, 16).fill('#FFFDF9');
    doc.rect(40, payY, 220, 16).stroke(borderGold);
    
    doc.fillColor(maroon).fontSize(8).font('Helvetica-Bold').text('PAYMENT RECORD', 46, payY + 4);
    
    payY += 22;
    doc.fillColor(grey).fontSize(7.5).font('Helvetica-Bold').text('MODE:', 46, payY)
       .fillColor(dark).fontSize(8.5).font('Helvetica').text(billData.paymentMode || 'UPI / Razorpay', 105, payY);

    payY += 15;
    doc.fillColor(grey).fontSize(7.5).font('Helvetica-Bold').text('TRANSACTION ID:', 46, payY)
       .fillColor(dark).fontSize(8.5).font('Helvetica').text(billData.transactionId || 'N/A', 105, payY);

    payY += 15;
    doc.fillColor(grey).fontSize(7.5).font('Helvetica-Bold').text('PAID DATE:', 46, payY)
       .fillColor(dark).fontSize(8.5).font('Helvetica').text(todayStr, 105, payY);

    y = Math.max(y, payY + 80) + 10;

    // ─── Signatures ────────────────────────────────────────────────────
    y = Math.max(y, 650);
    doc.moveTo(40, y).lineTo(200, y).stroke('#1A1A1A');
    doc.moveTo(doc.page.width - 200, y).stroke('#1A1A1A');

    doc.fillColor(grey).fontSize(8.5).font('Helvetica')
       .text('Prepared By (Staff)', 40, y + 6, { width: 160 })
       .text('Authorized Signatory', doc.page.width - 200, y + 6, { width: 160, align: 'right' });

    // ─── Footer ────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#FFFDF9');
    doc.moveTo(0, doc.page.height - 50).lineTo(doc.page.width, doc.page.height - 50).stroke(borderGold);
    
    doc.fillColor(maroon).fontSize(10).font('Helvetica-Bold').text('GS Associates Event Management Platform', 40, doc.page.height - 35);
    doc.fillColor(grey).fontSize(9).font('Helvetica')
       .text('Namaskaram 🙏 | gsassociates.in | Thank you for choosing us!', 40, doc.page.height - 22);
  });
}

module.exports = {
  generateBookingConfirmationPDF,
  generateBillPDF
};
