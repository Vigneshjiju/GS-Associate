/**
 * GS Associates — Email Controller
 * Handles HTTP requests for sending bills/invoices manually from the dashboard.
 */

const { generateBillPDF } = require('../services/pdfService');
const { sendEmail } = require('../services/emailService');
const { getBillNotificationEmail } = require('../services/emailTemplates');

/**
 * POST /api/email/send-bill
 * Generates and emails invoice bill PDF to the customer
 */
exports.sendBillEmail = async (req, res) => {
  const billData = req.body;

  if (!billData || !billData.email || !billData.clientName || !billData.billNo) {
    return res.status(400).json({ error: 'Please provide full billing details including email, clientName, and billNo.' });
  }

  try {
    console.log(`[EMAIL BILL START]: Generating invoice PDF for ${billData.clientName} (Bill: ${billData.billNo})`);

    // 1. Generate PDF in memory
    const pdfBuffer = await generateBillPDF(billData);

    // 2. Construct HTML email body
    const html = getBillNotificationEmail(billData);

    // 3. Send the email with the PDF attached
    const subject = `Invoice ${billData.billNo} — GS Associates`;
    const result = await sendEmail({
      to: billData.email,
      subject,
      html,
      attachments: [
        {
          filename: `GS_Invoice_${billData.billNo}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`[EMAIL BILL SUCCESS]: Bill ${billData.billNo} successfully emailed to ${billData.email}`);
    
    res.json({
      success: true,
      message: 'Bill invoice emailed successfully',
      simulated: !!result.simulated,
      messageId: result.messageId
    });
  } catch (error) {
    console.error(`[EMAIL BILL ERROR] Failed to email invoice for Bill ${billData.billNo}:`, error.message);
    res.status(500).json({ error: `Failed to email invoice: ${error.message}` });
  }
};
