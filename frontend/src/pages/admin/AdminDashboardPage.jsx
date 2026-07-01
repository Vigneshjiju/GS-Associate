import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, TrendingUp, DollarSign, Archive, CheckCircle2, UserCheck, Shield, Star, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BillModal from './BillModal';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addonsCatalog, setAddonsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  // State management for discounts, delete confirmations, and bill modal
  const [editingDiscounts, setEditingDiscounts] = useState({});
  const [savingDiscounts, setSavingDiscounts] = useState({});
  const [billModal, setBillModal] = useState({ open: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [convertConfirm, setConvertConfirm] = useState(null);
  const [convertDiscount, setConvertDiscount] = useState('');
  const [savingConversion, setSavingConversion] = useState(false);

  // Feedback states
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [approvingIds, setApprovingIds] = useState({});

  // Panchang states
  const [panchangDates, setPanchangDates] = useState([]);
  const [newPanchang, setNewPanchang] = useState({
    date: '',
    tithi: '',
    nakshatram: '',
    lagnam: '',
    auspicious_time: '',
    event_type: 'Marriage'
  });
  const [addingPanchang, setAddingPanchang] = useState(false);
  const [deletingPanchangId, setDeletingPanchangId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/api/dashboard/stats');
      setStats(statsRes.data.summary);
      
      const leadsRes = await axios.get('/api/inquiries');
      setLeads(leadsRes.data);
      
      const bookingsRes = await axios.get('/api/bookings');
      setBookings(bookingsRes.data);

      const pkRes = await axios.get('/api/catalog/packages');
      setPackages(pkRes.data);

      const adRes = await axios.get('/api/catalog/addons');

      // Feedback data
      try {
        const fbRes = await axios.get('/api/feedback');
        setFeedbackList(fbRes.data);
        const fbStatsRes = await axios.get('/api/feedback/stats');
        setFeedbackStats(fbStatsRes.data);
      } catch (fbErr) {
        console.warn('Could not load feedback data:', fbErr.message);
      }

      // Panchang dates
      try {
        const pcRes = await axios.get('/api/panchang/dates');
        setPanchangDates(pcRes.data);
      } catch (pcErr) {
        console.warn('Could not load panchang dates:', pcErr.message);
      }

      setAddonsCatalog(adRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBasePrice = (tier) => {
    const basePrices = {
      'Basic':          300000,    // ₹3,00,000
      'Basic Wedding':  300000,    // ₹3,00,000  
      'Premium':        600000,    // ₹6,00,000
      'Premium Wedding':600000,    // ₹6,00,000
      'Luxury':        1200000,    // ₹12,00,000
      'Luxury Wedding':1200000     // ₹12,00,000
    }
    return basePrices[tier] || 300000;
  };

  const getCorrectedBookingPrice = (booking) => {
    const basePackagePrice = getBasePrice(booking.package_name);
    let selectedAddonIds = [];
    try {
      if (booking.addons) {
        selectedAddonIds = typeof booking.addons === 'string' ? JSON.parse(booking.addons) : booking.addons;
      }
    } catch (e) {
      console.error(e);
    }
    
    let addonsTotal = 0;
    selectedAddonIds.forEach(id => {
      const item = addonsCatalog.find(a => a.id === id);
      if (item) {
        if (item.category === 'catering') {
          addonsTotal += parseFloat(item.base_price) * booking.guest_count;
        } else {
          addonsTotal += parseFloat(item.base_price);
        }
      }
    });
    return basePackagePrice + addonsTotal;
  };

  const extractTierFromMessage = (msg) => {
    if (!msg) return 'Basic';
    if (msg.toLowerCase().includes('luxury')) return 'Luxury';
    if (msg.toLowerCase().includes('premium')) return 'Premium';
    return 'Basic';
  };

  const extractAmountFromMessage = (msg) => {
    if (!msg) return 0;
    const match = msg.match(/₹([\d,]+)/);
    if (match) return parseInt(match[1].replace(/,/g, ''));
    return 0;
  };

  const extractAddonsFromMessage = (msg) => {
    if (!msg) return [];
    const addons = [];
    if (msg.toLowerCase().includes('catering')) addons.push('Catering');
    if (msg.toLowerCase().includes('decor')) addons.push('Decor');
    if (msg.toLowerCase().includes('photography')) addons.push('Photography');
    if (msg.toLowerCase().includes('purohit') || 
        msg.toLowerCase().includes('priest')) addons.push('Priest Services');
    if (msg.toLowerCase().includes('transport')) addons.push('Transport');
    return addons;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'New':        { bg: '#fef3c7', color: '#92400e', label: 'New' },
      'Contacted':  { bg: '#dbeafe', color: '#1e40af', label: 'Contacted' },
      'Converted':  { bg: '#dcfce7', color: '#166534', label: 'Converted' },
      'Archived':   { bg: '#f3f4f6', color: '#6b7280', label: 'Archived' },
      'VIP':        { bg: '#fdf4ff', color: '#7e22ce', label: 'VIP' }
    };
    return styles[status] || styles['New'];
  };

  const openBill = (booking) => {
    const ts = String(Date.now()).slice(-6);
    const billNo = `GSBL${ts}`;
    setBillModal({
      open: true,
      data: {
        ...booking,
        billNo
      }
    });
  };

  const handleCloseBill = () => {
    setBillModal({ open: false, data: null });
  };

  const handleGenerateBill = async (lead) => {
    const billData = {
      clientName:   lead.name,
      phone:        lead.phone,
      email:        lead.email || '',
      eventType:    lead.event_type,
      tier:         lead.package_tier || extractTierFromMessage(lead.message),
      eventDate:    lead.tentative_date || lead.date || 'TBD',
      venue:        lead.city || lead.venue || 'Bengaluru',
      guestCount:   lead.guest_count || lead.guests || 0,
      days:         lead.days || 1,
      addOns:       lead.addons || extractAddonsFromMessage(lead.message) || [],
      estimatedAmt: lead.estimated_amount || extractAmountFromMessage(lead.message) || 0,
      status:       lead.status || 'Pending',
      leadId:       lead.id,
      billNo:       'GSBL' + Date.now().toString().slice(-6)
    };

    if (lead.status === 'New' || lead.status === 'Pending') {
      try {
        // Update local state immediately (optimistic update)
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'Contacted' } : l));
        // Call: PATCH /api/inquiries/:id with { status: 'Contacted' }
        await axios.patch(`/api/inquiries/${lead.id}`, { status: 'Contacted' });
      } catch (err) {
        console.error('Failed to update lead status to Contacted:', err.message);
      }
    }

    setBillModal({ open: true, data: billData });
  };

  const handleDeleteClick = (leadId) => {
    setDeleteConfirm(leadId);
  };

  const handleConfirmDelete = async (leadId) => {
    try {
      await axios.delete(`/api/inquiries/${leadId}`);
      // Remove row from local state immediately
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      console.error('Failed to delete lead:', err.message);
      alert('Error deleting lead: ' + err.message);
    }
    setDeleteConfirm(null);
  };

  const handleConfirmConvert = async (lead) => {
    setSavingConversion(true);
    try {
      const tier = lead.package_tier || extractTierFromMessage(lead.message);
      const category = lead.event_type || 'Weddings';
      
      // Look up event_type_id and package_id based on category and tier
      let eventTypeId = 1; // default to Weddings
      let packageId = 1; // default to Basic Wedding
      
      // Match category
      const catLower = category.toLowerCase();
      if (catLower.includes('wedding')) {
        eventTypeId = 1;
      } else if (catLower.includes('corporate')) {
        eventTypeId = 2;
      } else if (catLower.includes('social')) {
        eventTypeId = 3;
      } else if (catLower.includes('ceremon') || catLower.includes('priest') || catLower.includes('tradit')) {
        eventTypeId = 4;
      }

      // Match package
      if (packages.length > 0) {
        const matchedPkg = packages.find(p => {
          const nameLower = p.name.toLowerCase();
          const matchesTier = nameLower.includes(tier.toLowerCase());
          const matchesCategory = nameLower.includes(category.toLowerCase()) || 
                                  (category.toLowerCase().includes('wedding') && nameLower.includes('wedding')) ||
                                  (category.toLowerCase().includes('corporate') && nameLower.includes('corporate')) ||
                                  (category.toLowerCase().includes('ceremon') && nameLower.includes('ceremony'));
          return matchesTier && matchesCategory;
        });
        if (matchedPkg) {
          packageId = matchedPkg.id;
          eventTypeId = matchedPkg.event_type_id;
        } else {
          // fallback package match by tier
          const tierPkg = packages.find(p => p.event_type_id === eventTypeId && p.name.toLowerCase().includes(tier.toLowerCase()));
          if (tierPkg) {
            packageId = tierPkg.id;
          } else {
            // fallback to first package of that event type
            const firstPkg = packages.find(p => p.event_type_id === eventTypeId);
            if (firstPkg) packageId = firstPkg.id;
          }
        }
      }

      // Parse date, guest count, and estimated price
      const eventDate = lead.tentative_date || lead.date || new Date().toISOString().split('T')[0];
      const guestCount = lead.guest_count || lead.guests || 100;
      const totalPrice = lead.estimated_amount || extractAmountFromMessage(lead.message) || 300000;

      // Parse addons to array of catalog IDs
      const parsedAddonNames = lead.addons || extractAddonsFromMessage(lead.message) || [];
      const matchedAddonIds = [];
      parsedAddonNames.forEach(name => {
        const nameStr = String(name).toLowerCase();
        const item = addonsCatalog.find(a => 
          a.category.toLowerCase() === nameStr || 
          a.name.toLowerCase().includes(nameStr)
        );
        if (item) {
          matchedAddonIds.push(item.id);
        }
      });

      const discountPercent = parseInt(convertDiscount) || 0;

      // Call API to convert inquiry to booking
      const res = await axios.post(`/api/inquiries/${lead.id}/convert`, {
        event_type_id: eventTypeId,
        package_id: packageId,
        event_date: eventDate,
        guest_count: guestCount,
        addons: matchedAddonIds,
        total_price: totalPrice,
        discount: discountPercent
      });

      const { booking } = res.data;

      // Close popover
      setConvertConfirm(null);
      setConvertDiscount('');

      // Refresh pipeline tables immediately
      await fetchDashboardData();

      // Launch bill modal directly for the newly created booking!
      if (booking) {
        openBill(booking);
      }
    } catch (err) {
      console.error('Failed to convert inquiry to booking:', err.message);
      alert('Error converting inquiry: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingConversion(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await axios.put(`/api/inquiries/${leadId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update lead status:', err.message);
      alert('Error updating lead status: ' + err.message);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update booking status:', err.message);
      alert('Error updating booking status: ' + err.message);
    }
  };

  const saveDiscount = async (bookingId, discountVal) => {
    // If empty or invalid, treat as 0
    const percent = discountVal === '' ? 0 : Math.min(100, Math.max(0, parseInt(discountVal) || 0));
    setSavingDiscounts(prev => ({ ...prev, [bookingId]: 'saving' }));
    try {
      await axios.put(`/api/bookings/${bookingId}/discount`, { discount: percent });
      setSavingDiscounts(prev => ({ ...prev, [bookingId]: 'saved' }));
      setTimeout(() => {
        setSavingDiscounts(prev => ({ ...prev, [bookingId]: null }));
      }, 1500);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to save booking discount:', err.message);
      setSavingDiscounts(prev => ({ ...prev, [bookingId]: 'error' }));
      alert('Error saving discount: ' + err.message);
    }
  };

  const handleAddPanchang = async (e) => {
    e.preventDefault();
    if (!newPanchang.date || !newPanchang.event_type) {
      alert('Date and Event Category are required.');
      return;
    }
    setAddingPanchang(true);
    try {
      const res = await axios.post('/api/panchang/dates', newPanchang);
      setPanchangDates(prev => [...prev, res.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setNewPanchang({
        date: '',
        tithi: '',
        nakshatram: '',
        lagnam: '',
        auspicious_time: '',
        event_type: 'Marriage'
      });
    } catch (err) {
      console.error('Failed to add panchang date:', err.message);
      alert('Error adding panchang date: ' + (err.response?.data?.error || err.message));
    } finally {
      setAddingPanchang(false);
    }
  };

  const handleDeletePanchang = async (id) => {
    setDeletingPanchangId(id);
    try {
      await axios.delete(`/api/panchang/dates/${id}`);
      setPanchangDates(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete panchang date:', err.message);
      alert('Error deleting panchang date: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingPanchangId(null);
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading operations center...</div>;
  }

  const getBtnStyle = (btnType, leadId) => {
    const base = {
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s, color 0.2s',
      padding: 0
    };
    const key = `${btnType}-${leadId}`;
    const isHovered = hoveredBtn === key;
    
    if (btnType === 'check') {
      return {
        ...base,
        color: '#27ae60',
        backgroundColor: isHovered ? 'rgba(39, 174, 96, 0.1)' : 'transparent'
      };
    } else if (btnType === 'bill') {
      return {
        ...base,
        color: '#7A001E',
        backgroundColor: isHovered ? 'rgba(122, 0, 30, 0.1)' : 'transparent'
      };
    } else if (btnType === 'delete') {
      return {
        ...base,
        color: '#dc2626',
        backgroundColor: isHovered ? 'rgba(220, 38, 38, 0.1)' : 'transparent'
      };
    }
    return base;
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', padding: '40px 0', backgroundColor: '#faf9f6' }}>
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
        @media (max-width: 640px) {
          .actions-cell-wrapper {
            flex-direction: column !important;
            gap: 4px !important;
          }
        }
      `}</style>

      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid var(--accent-gold-light)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--primary-maroon-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={26} color="var(--primary-maroon)" />
              Operations Center
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Admin dashboard & real-time client pipeline</p>
          </div>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--primary-maroon)',
              backgroundColor: 'white',
              color: 'var(--primary-maroon)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh Pipeline Data
          </button>
        </div>

        {/* Analytics Grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {/* Leads count */}
            <div className="glass-card" style={{ padding: '20px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Inquiries / Leads</span>
                <Users size={18} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '28px', margin: 0 }}>{stats.totalLeads}</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aggregate leads generated</span>
            </div>

            {/* Bookings count */}
            <div className="glass-card" style={{ padding: '20px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Bookings Placed</span>
                <Calendar size={18} color="var(--primary-maroon)" />
              </div>
              <h3 style={{ fontSize: '28px', margin: 0 }}>{stats.totalBookings}</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending & Confirmed calendar slots</span>
            </div>

            {/* Confirmed revenue */}
            <div className="glass-card" style={{ padding: '20px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Confirmed Bookings Value</span>
                <DollarSign size={18} color="#27ae60" />
              </div>
              <h3 style={{ fontSize: '24px', margin: 0, color: '#27ae60' }}>₹{stats.confirmedRevenue.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cleared invoice value</span>
            </div>

            {/* Conversion rate */}
            <div className="glass-card" style={{ padding: '20px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Lead Conversion Rate</span>
                <TrendingUp size={18} color="var(--accent-gold)" />
              </div>
              <h3 style={{ fontSize: '28px', margin: 0 }}>{stats.conversionRate}%</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leads marked as 'Converted'</span>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Leads Management Table */}
          <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="var(--primary-maroon)" />
              Leads & Inquiry Inbox
            </h3>
            {leads.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                No inquiries received yet. Submit messages through the chatbot or contact forms to populate this table!
              </div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-cream-dark)', color: 'var(--text-dark)', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                      <th style={{ padding: '14px' }}>Client Info</th>
                      <th style={{ padding: '14px' }}>Event Target</th>
                      <th style={{ padding: '14px' }}>Message Details</th>
                      <th style={{ padding: '14px' }}>Status</th>
                      <th style={{ padding: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '14px' }}>
                          <strong style={{ display: 'block' }}>{lead.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📞 {lead.phone}</span>
                          {lead.email && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>✉️ {lead.email}</span>}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ fontWeight: '600' }}>{lead.event_type}</span>
                          {lead.tentative_date && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Date: {lead.tentative_date}</span>}
                          {lead.guest_count && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Guests: {lead.guest_count}</span>}
                        </td>
                        <td style={{ padding: '14px', maxWidth: '250px' }}>
                          <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4' }}>{lead.message}</p>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Received: {new Date(lead.created_at).toLocaleDateString('en-IN')}</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {(() => {
                            const badge = getStatusBadge(lead.status);
                            return (
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: badge.bg,
                                color: badge.color
                              }}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '14px', position: 'relative' }}>
                          <div className="actions-cell-wrapper" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              style={getBtnStyle('check', lead.id)}
                              onMouseEnter={() => setHoveredBtn(`check-${lead.id}`)}
                              onMouseLeave={() => setHoveredBtn(null)}
                              onClick={() => {
                                setConvertConfirm(lead);
                                setConvertDiscount('');
                              }}
                              title="Convert to Booking"
                            >
                              ✓
                            </button>
                            <button
                              style={getBtnStyle('bill', lead.id)}
                              onMouseEnter={() => setHoveredBtn(`bill-${lead.id}`)}
                              onMouseLeave={() => setHoveredBtn(null)}
                              onClick={() => handleGenerateBill(lead)}
                              title="Generate Bill"
                            >
                              🧾
                            </button>
                            <button
                              style={getBtnStyle('delete', lead.id)}
                              onMouseEnter={() => setHoveredBtn(`delete-${lead.id}`)}
                              onMouseLeave={() => setHoveredBtn(null)}
                              onClick={() => handleDeleteClick(lead.id)}
                              title="Remove Lead"
                            >
                              🗑
                            </button>
                          </div>

                          {/* Convert to Booking Confirmation Popover */}
                          {convertConfirm && convertConfirm.id === lead.id && (
                            <div style={{
                              position: 'absolute',
                              right: '100%',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              marginRight: '8px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '16px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              zIndex: 999,
                              width: '240px',
                              textAlign: 'left',
                              color: '#1A1A1A'
                            }}>
                              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '13px' }}>Convert to Booking?</p>
                              <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                This will move {lead.name} to active Bookings & delete them from the Inquiry Inbox.
                              </p>
                              
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#444' }}>
                                  Discount Percentage (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                  value={convertDiscount}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    setConvertDiscount(val);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    border: '1px solid #D4AF37',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white',
                                    color: '#1A1A1A'
                                  }}
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setConvertConfirm(null)}
                                  disabled={savingConversion}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'transparent',
                                    color: '#666',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleConfirmConvert(lead)}
                                  disabled={savingConversion}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    opacity: savingConversion ? 0.7 : 1
                                  }}
                                >
                                  {savingConversion ? 'Saving...' : 'Yes, Convert'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Delete Confirmation Popover */}
                          {deleteConfirm === lead.id && (
                            <div style={{
                              position: 'absolute',
                              right: '100%',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              marginRight: '8px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '16px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              zIndex: 999,
                              width: '220px',
                              textAlign: 'left',
                              color: '#1A1A1A'
                            }}>
                              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '13px' }}>Remove this lead?</p>
                              <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#666' }}>
                                This will permanently delete {lead.name}'s inquiry.
                              </p>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'transparent',
                                    color: '#666',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleConfirmDelete(lead.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Yes, Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bookings Table Section */}
          <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} color="var(--primary-maroon)" />
              Bookings & Operations Table
            </h3>
            {bookings.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                No active calendar slots locked. Submit requests via the Booking Wizard page!
              </div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-cream-dark)', color: 'var(--text-dark)', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                      <th style={{ padding: '14px' }}>Client Info</th>
                      <th style={{ padding: '14px' }}>Event Details</th>
                      <th style={{ padding: '14px' }}>Amount/Package</th>
                      <th style={{ padding: '14px' }}>Discount</th>
                      <th style={{ padding: '14px' }}>Status</th>
                      <th style={{ padding: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => {
                      const originalPrice = getCorrectedBookingPrice(b);
                      const currentDiscount = editingDiscounts[b.id] !== undefined ? editingDiscounts[b.id] : (b.discount || 0);
                      const discountPercent = parseInt(currentDiscount) || 0;
                      const savedAmount = (originalPrice * discountPercent) / 100;
                      const finalAmount = originalPrice - savedAmount;
                      
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{ padding: '14px' }}>
                            <strong style={{ display: 'block' }}>{b.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📞 {b.phone}</span>
                            {b.email && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>✉️ {b.email}</span>}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{ fontWeight: '600' }}>{b.event_type_name}</span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>📅 Date: {b.event_date}</span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>👥 Guests: {b.guest_count}</span>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <strong style={{ display: 'block' }}>{b.package_name || 'Custom Package'}</strong>
                            {discountPercent > 0 ? (
                              <div>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '11px', marginRight: '6px' }}>
                                  ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                                <strong style={{ color: 'var(--primary-maroon-dark)' }}>
                                  ₹{finalAmount.toLocaleString('en-IN')}
                                </strong>
                              </div>
                            ) : (
                              <strong>₹{originalPrice.toLocaleString('en-IN')}</strong>
                            )}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0%"
                                  value={currentDiscount === 0 && editingDiscounts[b.id] === undefined ? '' : currentDiscount}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    setEditingDiscounts(prev => ({ ...prev, [b.id]: val }));
                                  }}
                                  onBlur={() => saveDiscount(b.id, currentDiscount)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  style={{
                                    width: '70px',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    border: '1px solid #D4AF37',
                                    borderRadius: '6px',
                                    background: 'white',
                                    color: '#1A1A1A',
                                    outline: 'none'
                                  }}
                                />
                                <span style={{ fontSize: '12px', color: '#1A1A1A', fontWeight: '600' }}>%</span>
                              </div>
                              {savingDiscounts[b.id] === 'saving' && (
                                <span style={{ fontSize: '11px', color: '#D4AF37', fontWeight: '500' }}>
                                  Saving...
                                </span>
                              )}
                              {savingDiscounts[b.id] === 'saved' && (
                                <span style={{ fontSize: '11px', color: '#27ae60', fontWeight: 'bold' }}>
                                  Saved ✓
                                </span>
                              )}
                              {savingDiscounts[b.id] === 'error' && (
                                <span style={{ fontSize: '11px', color: '#ff6b6b', fontWeight: 'bold' }}>
                                  Error!
                                </span>
                              )}
                              {!savingDiscounts[b.id] && savedAmount > 0 && (
                                <span style={{ fontSize: '11px', color: '#27ae60', fontWeight: '500' }}>
                                  Save ₹{savedAmount.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                width: 'fit-content',
                                backgroundColor: 
                                  b.status === 'Confirmed' ? '#badc58' :
                                  b.status === 'Completed' ? '#dbb6ee' :
                                  b.status === 'Pending' ? '#ffeaa7' : '#e0e0e0',
                                color:
                                  b.status === 'Confirmed' ? '#27ae60' :
                                  b.status === 'Completed' ? '#8e44ad' :
                                  b.status === 'Pending' ? '#d35400' : '#666'
                              }}>
                                {b.status}
                              </span>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                {b.status === 'Pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'Confirmed')}
                                    style={{ border: 'none', background: 'none', color: '#27ae60', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                    title="Confirm Booking"
                                  >
                                    Approve
                                  </button>
                                )}
                                {b.status === 'Confirmed' && (
                                  <button
                                    onClick={() => {
                                      updateBookingStatus(b.id, 'Completed');
                                      // Open WhatsApp feedback link
                                      const cleanPhone = (b.phone || '').replace(/[^\d+]/g, '');
                                      const fbUrl = `${window.location.origin}/feedback/${b.id}`;
                                      const waMsg = `Namaskaram ${b.name} 🙏 Thank you for choosing GS Associates! We'd love your feedback: ${fbUrl}`;
                                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`, '_blank');
                                    }}
                                    style={{ border: 'none', background: 'none', color: '#8e44ad', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                    title="Mark as Completed & Send Feedback Link"
                                  >
                                    Complete ✓
                                  </button>
                                )}
                                {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'Cancelled')}
                                    style={{ border: 'none', background: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                                    title="Cancel Booking"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <button
                              onClick={() => openBill(b)}
                              style={{
                                backgroundColor: '#7A001E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a0016'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7A001E'}
                            >
                              🧾 Bill
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ════════════ Feedback & Reviews Section ════════════ */}
          <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={22} color="var(--primary-maroon)" />
              Feedback & Reviews
            </h3>

            {/* Feedback Stats Cards */}
            {feedbackStats && feedbackStats.totalReviews > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* Avg Rating */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #D4AF37',
                  backgroundColor: '#FFFDF9',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Star size={20} fill="#D4AF37" color="#D4AF37" />
                    <span style={{ fontSize: '28px', fontWeight: '800', color: '#7A001E' }}>{feedbackStats.avgRating}</span>
                    <span style={{ fontSize: '14px', color: '#999' }}>/5</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Average Rating</span>
                </div>

                {/* Total Reviews */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#7A001E', marginBottom: '6px' }}>
                    {feedbackStats.totalReviews}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Reviews</span>
                </div>

                {/* Recommend Rate */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#27ae60', marginBottom: '6px' }}>
                    {feedbackStats.recommendPercent}%
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Recommend Rate</span>
                </div>

                {/* Rating Breakdown */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: 'white'
                }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = feedbackStats.ratingBreakdown?.[star] || 0;
                    const pct = feedbackStats.totalReviews > 0 ? (count / feedbackStats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', width: '20px', textAlign: 'right', color: '#888' }}>{star}★</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#D4AF37', borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '10px', color: '#888', width: '20px' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback Table */}
            {feedbackList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                No feedback received yet. Feedback links are sent when bookings are marked as Completed.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-cream-dark)', color: 'var(--text-dark)', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                      <th style={{ padding: '14px' }}>Client</th>
                      <th style={{ padding: '14px' }}>Event</th>
                      <th style={{ padding: '14px' }}>Date</th>
                      <th style={{ padding: '14px' }}>Rating</th>
                      <th style={{ padding: '14px' }}>Comments</th>
                      <th style={{ padding: '14px' }}>Testimonial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackList.map(fb => (
                      <tr key={fb.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '14px' }}>
                          <strong>{fb.client_name || 'N/A'}</strong>
                          {fb.email && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{fb.email}</span>}
                        </td>
                        <td style={{ padding: '14px', fontWeight: '500' }}>
                          {fb.event_type_name || '—'}
                        </td>
                        <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {fb.event_date ? new Date(fb.event_date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={14}
                                fill={s <= fb.overall_rating ? '#D4AF37' : 'none'}
                                color={s <= fb.overall_rating ? '#D4AF37' : '#ddd'}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '10px', color: fb.recommend ? '#27ae60' : '#e74c3c' }}>
                            {fb.recommend ? '👍 Recommends' : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', maxWidth: '220px' }}>
                          {fb.best_comment && (
                            <p style={{ margin: '0 0 4px', fontSize: '12px', lineHeight: '1.4' }}>
                              <strong style={{ color: '#27ae60' }}>Best:</strong> {fb.best_comment}
                            </p>
                          )}
                          {fb.improve_comment && (
                            <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4', color: '#888' }}>
                              <strong>Improve:</strong> {fb.improve_comment}
                            </p>
                          )}
                          {!fb.best_comment && !fb.improve_comment && (
                            <span style={{ fontSize: '12px', color: '#ccc' }}>No comments</span>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          {fb.has_testimonial ? (
                            <div>
                              {fb.testimonial_status === 'approved' && (
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  backgroundColor: '#dcfce7',
                                  color: '#166534'
                                }}>✓ Published</span>
                              )}
                              {fb.testimonial_status === 'pending_approval' && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={async () => {
                                      setApprovingIds(prev => ({ ...prev, [fb.id]: 'approving' }));
                                      try {
                                        // Find testimonial by feedback_id
                                        const tRes = await axios.get('/api/catalog/testimonials');
                                        // We need to find the pending one — let's use a targeted approach
                                        await axios.put(`/api/feedback/testimonials/${fb.id}/approve`);
                                        fetchDashboardData();
                                      } catch (err) {
                                        // Try with the feedback id directly as testimonial lookup
                                        try {
                                          // Get all testimonials to find the one with this feedback_id
                                          const allT = await db?.query?.('SELECT id FROM testimonials WHERE feedback_id = ?', [fb.id]);
                                        } catch(e) {}
                                        console.error('Approve error:', err.message);
                                      }
                                      setApprovingIds(prev => ({ ...prev, [fb.id]: null }));
                                    }}
                                    disabled={approvingIds[fb.id]}
                                    style={{
                                      border: 'none',
                                      background: '#27ae60',
                                      color: 'white',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setApprovingIds(prev => ({ ...prev, [fb.id]: 'rejecting' }));
                                      try {
                                        await axios.put(`/api/feedback/testimonials/${fb.id}/reject`);
                                        fetchDashboardData();
                                      } catch (err) {
                                        console.error('Reject error:', err.message);
                                      }
                                      setApprovingIds(prev => ({ ...prev, [fb.id]: null }));
                                    }}
                                    disabled={approvingIds[fb.id]}
                                    style={{
                                      border: '1px solid #ffcdd2',
                                      background: 'white',
                                      color: '#e74c3c',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {fb.testimonial_status === 'rejected' && (
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  backgroundColor: '#fff0f0',
                                  color: '#e74c3c'
                                }}>✗ Rejected</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#ccc' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ════════════ Panchang & Auspicious Dates Section ════════════ */}
          <div className="glass-card" style={{ padding: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} color="var(--primary-maroon)" />
              Panchang & Auspicious Dates Management
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              {/* Left Column: Form to Add Date */}
              <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', backgroundColor: '#FFFDF9' }}>
                <h4 style={{ color: 'var(--primary-maroon-dark)', marginBottom: '16px', fontSize: '15px' }}>Add Auspicious Date</h4>
                <form onSubmit={handleAddPanchang} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Date *</label>
                    <input
                      type="date"
                      required
                      value={newPanchang.date}
                      onChange={(e) => setNewPanchang(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Event Category *</label>
                    <select
                      value={newPanchang.event_type}
                      onChange={(e) => setNewPanchang(prev => ({ ...prev, event_type: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                    >
                      <option value="Marriage">Marriage</option>
                      <option value="Upanayanam">Upanayanam</option>
                      <option value="Griha Pravesh">Griha Pravesh</option>
                      <option value="Seemantham">Seemantham</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Auspicious Time (Timings)</label>
                    <input
                      type="text"
                      placeholder="e.g., 09:30 AM - 11:00 AM"
                      value={newPanchang.auspicious_time}
                      onChange={(e) => setNewPanchang(prev => ({ ...prev, auspicious_time: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Tithi</label>
                    <input
                      type="text"
                      placeholder="e.g., Dasami"
                      value={newPanchang.tithi}
                      onChange={(e) => setNewPanchang(prev => ({ ...prev, tithi: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Nakshatram</label>
                      <input
                        type="text"
                        placeholder="e.g., Rohini"
                        value={newPanchang.nakshatram}
                        onChange={(e) => setNewPanchang(prev => ({ ...prev, nakshatram: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1A' }}>Lagnam</label>
                      <input
                        type="text"
                        placeholder="e.g., Simha Lagnam"
                        value={newPanchang.lagnam}
                        onChange={(e) => setNewPanchang(prev => ({ ...prev, lagnam: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #D4AF37', borderRadius: '8px', outline: 'none', backgroundColor: 'white', color: '#1A1A1A' }}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={addingPanchang}
                    style={{
                      marginTop: '10px',
                      padding: '10px 20px',
                      borderRadius: '30px',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--primary-maroon) 0%, var(--primary-maroon-dark) 100%)',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(122,0,30,0.15)',
                      opacity: addingPanchang ? 0.7 : 1
                    }}
                  >
                    {addingPanchang ? 'Saving Date...' : 'Add Auspicious Date'}
                  </button>
                </form>
              </div>

              {/* Right Column: List of Dates */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ color: 'var(--primary-maroon-dark)', marginBottom: '16px', fontSize: '15px' }}>Current Auspicious Dates</h4>
                
                {panchangDates.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', border: '1px solid #eee', borderRadius: '12px', color: '#999' }}>
                    No dates configured. Use the form to add some dates!
                  </div>
                ) : (
                  <div style={{ overflowY: 'auto', maxHeight: '420px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-cream-dark)', color: 'var(--text-dark)', borderBottom: '1px solid #eee' }}>
                          <th style={{ padding: '10px 14px' }}>Date</th>
                          <th style={{ padding: '10px 14px' }}>Category</th>
                          <th style={{ padding: '10px 14px' }}>Panchang Info</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {panchangDates.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <strong style={{ display: 'block' }}>{p.date}</strong>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.auspicious_time || '—'}</span>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: '600' }}>
                              {p.event_type}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: '11px' }}>
                              {p.tithi && <span style={{ display: 'block' }}>Tithi: {p.tithi}</span>}
                              {p.nakshatram && <span style={{ display: 'block' }}>Star: {p.nakshatram}</span>}
                              {p.lagnam && <span style={{ display: 'block' }}>Lagnam: {p.lagnam}</span>}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeletePanchang(p.id)}
                                disabled={deletingPanchangId === p.id}
                                style={{
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  padding: '4px',
                                  opacity: deletingPanchangId === p.id ? 0.5 : 1
                                }}
                                title="Delete Auspicious Date"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Standalone Bill Modal */}
      {billModal.open && (
        <BillModal
          isOpen={billModal.open}
          onClose={handleCloseBill}
          bookingData={billModal.data}
          addonsCatalog={addonsCatalog}
        />
      )}

    </div>
  );
}
