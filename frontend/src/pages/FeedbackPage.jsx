import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, CheckCircle2, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function FeedbackPage() {
  const { bookingId } = useParams();

  // Booking data
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [bestComment, setBestComment] = useState('');
  const [improveComment, setImproveComment] = useState('');
  const [recommend, setRecommend] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
    checkExistingFeedback();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await axios.get(`/api/feedback/booking/${bookingId}`);
      setBooking(res.data);
    } catch (err) {
      console.error('Error fetching booking:', err.message);
      setLoadError('Unable to find booking details. Please check the link.');
    }
  };

  const checkExistingFeedback = async () => {
    try {
      const res = await axios.get(`/api/feedback/check/${bookingId}`);
      if (res.data.exists) setAlreadySubmitted(true);
    } catch (err) {
      // Ignore
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setSubmitError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await axios.post('/api/feedback', {
        bookingId: parseInt(bookingId),
        overallRating: rating,
        bestComment,
        improveComment,
        recommend
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Submit feedback error:', err);
      if (err.response?.status === 409) {
        setAlreadySubmitted(true);
      } else {
        setSubmitError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Error / Loading States ───────────────────────────────────────────

  if (loadError) {
    return (
      <div style={pageWrapperStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertCircle size={48} color="#e74c3c" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#7A001E', marginBottom: '8px' }}>Booking Not Found</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div style={pageWrapperStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle2 size={48} color="#27ae60" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#7A001E', marginBottom: '8px' }}>Feedback Already Submitted</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Thank you! You've already shared your feedback for this event.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success Screen ───────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={pageWrapperStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={42} color="#2e7d32" />
            </div>
            <h2 style={{ color: '#7A001E', fontSize: '24px', marginBottom: '8px' }}>
              Dhanyavaad! 🙏
            </h2>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
              Thank you for your feedback, <strong>{booking?.name}</strong>. 
              Your review helps us create even more beautiful events.
            </p>
            {rating >= 4 && recommend && (
              <div style={{
                marginTop: '20px',
                padding: '12px 20px',
                backgroundColor: '#FFFDF9',
                border: '1px solid #D4AF37',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#7A001E'
              }}>
                ✨ Your positive review has been submitted for testimonial approval!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Feedback Form ───────────────────────────────────────────────

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7A001E 0%, #5C0016 100%)',
          padding: '32px 28px',
          borderRadius: '16px 16px 0 0',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#D4AF37', fontSize: '24px', margin: 0, fontWeight: '700' }}>
            ✨ GS Associates
          </h1>
          <p style={{ color: '#f5e6c8', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
            Post-Event Feedback
          </p>
        </div>

        {/* Gold accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #D4AF37, #f5e6c8, #D4AF37)' }} />

        {/* Form Body */}
        <div style={{ padding: '32px 28px' }}>

          {/* Greeting */}
          {booking && (
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: '#7A001E', fontSize: '20px', margin: '0 0 6px' }}>
                How was your {booking.event_type_name || 'event'} experience{booking.name ? `, ${booking.name.split(' ')[0]}` : ''}?
              </h2>
              <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
                {booking.event_date && `Event Date: ${new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                {booking.package_name && ` • ${booking.package_name}`}
              </p>
            </div>
          )}

          {/* Star Rating */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <label style={labelStyle}>Overall Rating</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s',
                    transform: (hoverRating >= star || rating >= star) ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  <Star
                    size={36}
                    fill={(hoverRating >= star || rating >= star) ? '#D4AF37' : 'none'}
                    color={(hoverRating >= star || rating >= star) ? '#D4AF37' : '#ccc'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent!'}
              {rating === 0 && 'Tap a star to rate'}
            </p>
          </div>

          {/* Best Comment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>What did we do best?</label>
            <textarea
              value={bestComment}
              onChange={(e) => setBestComment(e.target.value)}
              placeholder="The decor was magical, the food was incredible..."
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Improve Comment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>What can we improve?</label>
            <textarea
              value={improveComment}
              onChange={(e) => setImproveComment(e.target.value)}
              placeholder="Any suggestions to make it even better next time..."
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Recommend Toggle */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Would you recommend us?</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setRecommend(true)}
                style={{
                  ...toggleBtnStyle,
                  backgroundColor: recommend ? '#e8f5e9' : 'white',
                  borderColor: recommend ? '#27ae60' : '#ddd',
                  color: recommend ? '#27ae60' : '#888'
                }}
              >
                <ThumbsUp size={18} /> Yes, absolutely!
              </button>
              <button
                onClick={() => setRecommend(false)}
                style={{
                  ...toggleBtnStyle,
                  backgroundColor: !recommend ? '#fff0f0' : 'white',
                  borderColor: !recommend ? '#e74c3c' : '#ddd',
                  color: !recommend ? '#e74c3c' : '#888'
                }}
              >
                <ThumbsDown size={18} /> Not yet
              </button>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fff0f0',
              border: '1px solid #ffcdd2',
              borderRadius: '8px',
              color: '#c62828',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#7A001E',
              color: 'white',
              fontSize: '15px',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(122, 0, 30, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {/* Footer note */}
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#bbb', marginTop: '16px' }}>
            Your feedback is private. High-rated reviews may appear on our testimonials page with your approval.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

const pageWrapperStyle = {
  minHeight: '100vh',
  backgroundColor: '#FAF7F0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 16px',
  fontFamily: 'var(--font-body, "Outfit", sans-serif)'
};

const cardStyle = {
  width: '100%',
  maxWidth: '520px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#444',
  marginBottom: '6px'
};

const textareaStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical',
  lineHeight: '1.5',
  backgroundColor: '#fafafa',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const toggleBtnStyle = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '10px',
  border: '2px solid',
  background: 'white',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s'
};
