import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '8px', borderBottom: '1px dotted #e0d0a0' }}>
    <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 700, textAlign: 'right' }}>{value || 'Not Entered'}</span>
  </div>
);

export default function BillModal({ isOpen, onClose, bookingData, addonsCatalog = [] }) {
  const [preparedBy, setPreparedBy] = useState('GS Admin Staff');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [amountReceived, setAmountReceived] = useState(0);

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Email states
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Extract variables
  const name = bookingData?.name || bookingData?.clientName || '';
  const phone = bookingData?.phone || '';
  const email = bookingData?.email || '';
  const event_type_name = bookingData?.event_type_name || bookingData?.eventType || 'Event';
  const package_name = bookingData?.package_name || bookingData?.tier || 'Basic';
  const event_date = bookingData?.event_date || bookingData?.eventDate || 'TBD';
  const guest_count = bookingData?.guest_count || bookingData?.guestCount || 0;
  const status = bookingData?.status || 'Pending';
  const billNo = bookingData?.billNo || 'GSBL000000';
  const discountPercent = bookingData?.discount || bookingData?.discountPercent || 0;

  const getBasePrice = (tier) => {
    const basePrices = {
      'Basic':          300000,
      'Basic Wedding':  300000,  
      'Premium':        600000,
      'Premium Wedding':600000,
      'Luxury':        1200000,
      'Luxury Wedding':1200000
    };
    if (tier) {
      const match = Object.keys(basePrices).find(k => tier.toLowerCase().includes(k.toLowerCase()));
      if (match) return basePrices[match];
    }
    return 300000;
  };

  // Resolve addons
  let selectedAddons = [];
  if (bookingData?.addons) {
    try {
      selectedAddons = typeof bookingData.addons === 'string' ? JSON.parse(bookingData.addons) : bookingData.addons;
    } catch (e) {
      console.error(e);
    }
  } else if (bookingData?.addOns) {
    selectedAddons = bookingData.addOns;
  }

  let addonsTotal = 0;
  const resolvedAddons = [];
  if (Array.isArray(selectedAddons)) {
    selectedAddons.forEach(addonKey => {
      let item = null;
      const id = parseInt(addonKey);
      if (!isNaN(id)) {
        item = addonsCatalog.find(a => a.id === id);
      } else if (typeof addonKey === 'string') {
        const keyLower = addonKey.toLowerCase();
        item = addonsCatalog.find(a => {
          const nameLower = a.name.toLowerCase();
          const catLower = a.category.toLowerCase();
          return nameLower.includes(keyLower) || catLower.includes(keyLower) || 
                 (keyLower.includes('priest') && catLower === 'priest');
        });
      }

      if (item) {
        let amt = 0;
        let qtyLabel = '1';
        if (item.category === 'catering') {
          amt = parseFloat(item.base_price) * guest_count;
          qtyLabel = `${guest_count} Guests`;
        } else {
          amt = parseFloat(item.base_price);
          qtyLabel = `1 Event`;
        }
        addonsTotal += amt;
        resolvedAddons.push({
          label: item.name,
          unitPrice: parseFloat(item.base_price),
          qty: qtyLabel,
          amount: amt
        });
      }
    });
  }

  const basePackagePrice = getBasePrice(package_name);
  const subtotal = basePackagePrice + addonsTotal;
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedAmount = subtotal - discountAmount;
  const gst = discountedAmount * 0.18;
  const grandTotal = discountedAmount + gst;
  const balanceDue = grandTotal - amountReceived;

  const lineItems = [
    {
      label: `Base Event Coordination & Management (${package_name})`,
      unitPrice: basePackagePrice,
      qty: '1 Event',
      amount: basePackagePrice
    },
    ...resolvedAddons
  ];

  // Sync default amountReceived
  useEffect(() => {
    setAmountReceived(grandTotal);
  }, [grandTotal]);

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const downloadPDF = async (clientName) => {
    const element = document.getElementById('gs-bill-print');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFDF9'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const pdfImgHeight = pdfWidth / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImgHeight);

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}_${String(today.getMonth() + 1).padStart(2, '0')}_${today.getFullYear()}`;

      pdf.save(`GS_Bill_${clientName.replace(/\s+/g, '_')}_${dateStr}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err.message);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // ─── Razorpay Payment Logic ──────────────────────────────────────────

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(async () => {
    setPaymentLoading(true);
    setPaymentError('');

    const payAmount = balanceDue > 0 ? balanceDue : grandTotal;
    const bookingId = bookingData?.id;

    if (!bookingId) {
      setPaymentError('Booking ID not found. Cannot process payment.');
      setPaymentLoading(false);
      return;
    }

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK.');
      }

      const { data: orderData } = await axios.post('/api/payments/create-order', {
        bookingId,
        amount: Math.round(payAmount)
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'GS Associates',
        description: `${event_type_name} — ${package_name}`,
        order_id: orderData.orderId,
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#7A001E'
        },
        handler: async function (response) {
          try {
            await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });

            setPaymentSuccess(true);
            setAmountReceived(grandTotal);
            setPaymentMode('Razorpay');
            setTransactionId(response.razorpay_payment_id);
          } catch (verifyErr) {
            setPaymentError('Payment verification failed. Contact support with ID: ' + response.razorpay_payment_id);
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setPaymentError(`Payment failed: ${resp.error.description}`);
        setPaymentLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      setPaymentError(err?.response?.data?.error || err.message || 'Payment initiation failed.');
      setPaymentLoading(false);
    }
  }, [bookingData, balanceDue, grandTotal, name, email, phone, event_type_name, package_name]);

  const handleEmailBill = useCallback(async () => {
    setEmailLoading(true);
    setEmailSuccess(false);
    setEmailError('');

    const payload = {
      bookingId: bookingData?.id || null,
      leadId: bookingData?.leadId || null,
      billNo: billNo,
      preparedBy: preparedBy,
      paymentMode: paymentMode,
      transactionId: transactionId,
      amountReceived: parseFloat(amountReceived) || 0,
      discountPercent: parseInt(discountPercent) || 0,
      clientName: name,
      email: email,
      phone: phone,
      eventType: event_type_name,
      tier: package_name,
      eventDate: event_date,
      guestCount: guest_count,
      lineItems: lineItems,
      subtotal: subtotal,
      discountAmount: discountAmount,
      gst: gst,
      grandTotal: grandTotal,
      balanceDue: balanceDue
    };

    if (!email) {
      setEmailError('Customer email address is required to email the bill.');
      setEmailLoading(false);
      return;
    }

    try {
      await axios.post('/api/email/send-bill', payload);
      setEmailSuccess(true);
    } catch (err) {
      console.error('Email bill error:', err);
      setEmailError(err?.response?.data?.error || err.message || 'Failed to email bill.');
    } finally {
      setEmailLoading(false);
    }
  }, [
    bookingData, billNo, preparedBy, paymentMode, transactionId, amountReceived,
    discountPercent, name, email, phone, event_type_name, package_name, event_date,
    guest_count, lineItems, subtotal, discountAmount, gst, grandTotal, balanceDue
  ]);


  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      overflowY: 'auto',
      padding: '40px 0'
    }}>
      {/* Dynamic style block for handling window.print() view overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #gs-bill-print, #gs-bill-print * {
            visibility: visible !important;
          }
          #gs-bill-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 860px !important;
            min-height: 1123px !important;
            padding: 40px 48px !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }
          #modal-action-buttons {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .screen-only {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '860px',
        width: '95%',
        margin: '0 auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        
        {/* Printable Invoice Container */}
        <div style={{ backgroundColor: '#FAF7F0', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          <div id="gs-bill-print" style={{
            width: '100%',
            maxWidth: '860px',
            margin: '0 auto',
            padding: '40px 48px',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            backgroundColor: '#ffffff',
            fontFamily: 'Georgia, serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#1A1A1A',
            minHeight: '1123px',
            borderRadius: '12px',
            border: '1px solid #f0e8d0'
          }}>
            <div>
              
              {/* Bill Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #7A001E', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#7A001E', fontFamily: 'Georgia, serif' }}>FINAL BILL</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666666', letterSpacing: '2px', textTransform: 'uppercase' }}>GS ASSOCIATES — OFFICIAL RECEIPT</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#666666' }}>
                  <div><strong>Bill No:</strong> #{billNo}</div>
                  <div style={{ marginTop: '2px' }}><strong>Date:</strong> {dateStr}</div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{
                      backgroundColor: status === 'Confirmed' ? '#27ae60' : '#f39c12',
                      color: 'white',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {status === 'Confirmed' ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client + Event Details Box */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px 32px', 
                border: '1px solid #D4AF37', 
                borderRadius: '8px', 
                padding: '16px 24px', 
                backgroundColor: '#FFFDF9', 
                marginBottom: '24px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <DetailRow label="Client Name" value={name} />
                <DetailRow label="WhatsApp Number" value={phone} />
                <DetailRow label="Event Type" value={event_type_name} />
                <DetailRow label="Package Tier" value={package_name || 'Custom Package'} />
                <DetailRow label="Event Date" value={event_date} />
                <DetailRow label="Venue/City" value="Bengaluru" />
                <DetailRow label="Guest Count" value={`${guest_count} Guests`} />
                <DetailRow label="Event Duration" value="1 Day" />
              </div>

              {/* Line Items Table */}
              <div style={{ width: '100%', overflowX: 'hidden', tableLayout: 'fixed' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '20px' }}>
                  <colgroup>
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '42%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '16%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: '#7A001E', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', whiteSpace: 'nowrap' }}>#</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>Service/Item</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', whiteSpace: 'nowrap' }}>Unit Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', whiteSpace: 'nowrap' }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', paddingRight: '16px', whiteSpace: 'nowrap' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx} style={{ 
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FFFDF9', 
                        borderBottom: '1px solid #f0e8d0' 
                      }}>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#888', fontSize: '12px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '8px', color: '#1A1A1A' }}>
                          {item.label}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#444' }}>
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#444' }}>
                          {item.qty}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#1A1A1A', paddingRight: '16px', whiteSpace: 'nowrap' }}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Discount Applied Row */}
              {discountPercent > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: '#fff0f0',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '13px'
                }}>
                  <span style={{ fontStyle: 'italic', color: '#7A001E' }}>Discount Applied ({discountPercent}%)</span>
                  <strong style={{ color: '#2e7d32' }}>- ₹{discountAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}

              {/* Totals Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px',
                marginTop: '20px',
                paddingRight: '16px',
                marginBottom: '24px'
              }}>
                {/* Subtotal row */}
                <div style={{ display: 'flex', gap: '40px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600, minWidth: '140px', textAlign: 'right' }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Discount row (if discount > 0) */}
                {discountPercent > 0 && (
                  <div style={{ display: 'flex', gap: '40px', fontSize: '14px' }}>
                    <span style={{ color: '#666' }}>Discount ({discountPercent}%):</span>
                    <span style={{ fontWeight: 600, minWidth: '140px', textAlign: 'right', color: '#2e7d32' }}>
                      - ₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* GST row */}
                <div style={{ display: 'flex', gap: '40px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>GST (18%):</span>
                  <span style={{ fontWeight: 600, minWidth: '140px', textAlign: 'right' }}>
                    + ₹{gst.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ width: '300px', borderTop: '2px solid #7A001E', margin: '4px 0' }} />

                {/* Grand Total */}
                <div style={{
                  backgroundColor: '#7A001E',
                  color: 'white',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '32px',
                  alignItems: 'center',
                  minWidth: '300px',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>
                    GRAND TOTAL:
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 800 }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Details Box */}
              <div style={{
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#FFFDF9',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#7A001E', fontWeight: 'bold' }}>Payment Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666666', display: 'block', fontWeight: '500' }}>Payment Mode</span>
                    <span className="print-only" style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{paymentMode}</span>
                    <select
                      className="screen-only"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px',
                        outline: 'none',
                        background: 'white',
                        color: '#1A1A1A'
                      }}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666666', display: 'block', fontWeight: '500' }}>Transaction ID (if available)</span>
                    <span className="print-only" style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{transactionId || 'N/A'}</span>
                    <input
                      className="screen-only"
                      type="text"
                      placeholder="T12345..."
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px',
                        outline: 'none',
                        color: '#1A1A1A',
                        background: 'white'
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666666', display: 'block', fontWeight: '500' }}>Amount Received</span>
                    <span className="print-only" style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>₹{amountReceived.toLocaleString('en-IN')}</span>
                    <input
                      className="screen-only"
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px',
                        outline: 'none',
                        color: '#1A1A1A',
                        background: 'white'
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#666666', display: 'block', fontWeight: '500' }}>Balance Due</span>
                    <strong style={{ fontSize: '14px', color: balanceDue > 0 ? '#ff6b6b' : '#27ae60' }}>
                      ₹{balanceDue.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Staff Signature Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '0 10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: '#666666' }}>Prepared By</div>
                  <div style={{ marginTop: '24px', borderTop: '1px solid #1A1A1A', paddingTop: '4px', width: '200px' }}>
                    <span className="print-only" style={{ fontSize: '12px', fontWeight: 'bold' }}>{preparedBy || 'GS Admin Staff'}</span>
                    <input
                      className="screen-only"
                      type="text"
                      value={preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      style={{ border: 'none', borderBottom: '1px dashed #ccc', outline: 'none', fontSize: '12px', fontWeight: 'bold', width: '100%', padding: '2px 0', color: '#1A1A1A', background: 'white' }}
                      placeholder="Enter staff name"
                    />
                    <div style={{ fontSize: '10px', color: '#666666', marginTop: '2px' }}>Event Operations Desk</div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#666666' }}>Authorized By</div>
                  <div style={{ marginTop: '24px', borderTop: '1px solid #1A1A1A', paddingTop: '4px', width: '200px' }}>
                    <br />
                    <div style={{ fontSize: '10px', color: '#666666', marginTop: '2px' }}>GS Associates Signature</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#888888', marginTop: '24px' }}>
                This is a computer-generated document.
              </div>
            </div>

            {/* Footer Section */}
            <div style={{ borderTop: '1px solid #D4AF37', paddingTop: '16px', textAlign: 'center', marginTop: '30px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: '#666666' }}>
                Thank you for choosing GS Associates 🌸
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#888888' }}>
                Namaskaram 🙏 | gsassociates.in | +91 98867 81380
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons chrome */}
        <div id="modal-action-buttons" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '20px',
          borderTop: '1px solid #eee',
          backgroundColor: '#f9f9f9',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: '#7A001E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(122, 0, 30, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🖨️ Print Bill
          </button>
          <button
            onClick={() => downloadPDF(name)}
            style={{
              backgroundColor: '#D4AF37',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📥 Download PDF
          </button>
          <button
            onClick={handleEmailBill}
            disabled={emailLoading || emailSuccess}
            style={{
              backgroundColor: emailSuccess ? '#27ae60' : '#7A001E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: emailLoading || emailSuccess ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(122, 0, 30, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: emailLoading ? 0.7 : 1
            }}
          >
            {emailSuccess ? '✉️ Email Sent' : emailLoading ? '⏳ Sending...' : '✉️ Email Bill'}
          </button>
          <button
            onClick={() => {
              const cleanPhone = phone.replace(/[^\d+]/g, '');
              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Your GS Associates bill is ready')}`;
              window.open(waUrl, '_blank');
            }}
            style={{
              backgroundColor: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ✉️ Send to WhatsApp
          </button>
          <button
            onClick={initiatePayment}
            disabled={paymentLoading || paymentSuccess}
            style={{
              backgroundColor: paymentSuccess ? '#27ae60' : '#4A90D9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: paymentLoading || paymentSuccess ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(74, 144, 217, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: paymentLoading ? 0.7 : 1
            }}
          >
            {paymentSuccess ? '✅ Paid' : paymentLoading ? '⏳ Processing...' : '💳 Pay Now'}
          </button>
          {paymentError && (
            <div style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#fff0f0',
              border: '1px solid #ffcdd2',
              borderRadius: '6px',
              color: '#c62828',
              fontSize: '11px',
              textAlign: 'center'
            }}>
              ⚠️ {paymentError}
            </div>
          )}
          {emailError && (
            <div style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#fff0f0',
              border: '1px solid #ffcdd2',
              borderRadius: '6px',
              color: '#c62828',
              fontSize: '11px',
              textAlign: 'center'
            }}>
              ⚠️ {emailError}
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ✖ Close
          </button>
        </div>

      </div>
    </div>
  );
}
