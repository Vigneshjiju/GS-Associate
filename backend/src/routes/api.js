const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const inquiryController = require('../controllers/inquiryController');
const bookingController = require('../controllers/bookingController');
const panchangController = require('../controllers/panchangController');
const dashboardController = require('../controllers/dashboardController');
const paymentController = require('../controllers/paymentController');
const feedbackController = require('../controllers/feedbackController');
const catalogController = require('../controllers/catalogController');
const emailController = require('../controllers/emailController');

const authMiddleware = require('../middleware/authMiddleware');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

// Catalog routes (public)
router.get('/catalog/event-types', catalogController.getEventTypes);
router.get('/catalog/packages', catalogController.getPackages);
router.get('/catalog/addons', catalogController.getAddons);
router.get('/catalog/ceremonies', catalogController.getCeremonies);
router.get('/catalog/vendors', catalogController.getVendors);
router.get('/catalog/gallery', catalogController.getGallery);
router.get('/catalog/testimonials', catalogController.getTestimonials);

// Inquiries/Leads routes
router.post('/inquiries', inquiryController.createInquiry); // public lead submission (chat/forms)
router.get('/inquiries', authMiddleware, inquiryController.getInquiries); // admin view
router.put('/inquiries/:id/status', authMiddleware, inquiryController.updateInquiryStatus); // admin edit
router.patch('/inquiries/:id', authMiddleware, inquiryController.updateInquiryStatus); // admin edit status
router.delete('/inquiries/:id', authMiddleware, inquiryController.deleteInquiry); // admin delete lead
router.post('/inquiries/:id/convert', authMiddleware, inquiryController.convertInquiryToBooking); // admin convert lead to booking

// Bookings routes
router.post('/bookings', bookingController.createBooking); // public wizard submission
router.get('/bookings', authMiddleware, bookingController.getBookings); // admin view
router.put('/bookings/:id/status', authMiddleware, bookingController.updateBookingStatus); // admin edit
router.put('/bookings/:id/discount', authMiddleware, bookingController.updateBookingDiscount); // admin edit discount

// Panchang / Muhurthams routes
router.get('/panchang/dates', panchangController.getAuspiciousDates);
router.post('/panchang/dates', authMiddleware, panchangController.createAuspiciousDate);
router.delete('/panchang/dates/:id', authMiddleware, panchangController.deleteAuspiciousDate);

// Payment routes
router.post('/payments/create-order', paymentController.createOrder);
router.post('/payments/verify', paymentController.verifyPayment);
router.get('/payments/:bookingId', paymentController.getPaymentStatus);

// Dashboard routes (admin only)
router.get('/dashboard/stats', authMiddleware, dashboardController.getStats);

// Feedback routes
router.post('/feedback', feedbackController.submitFeedback);                                // public: submit feedback
router.get('/feedback/check/:bookingId', feedbackController.checkFeedback);                 // public: check if already submitted
router.get('/feedback/booking/:bookingId', feedbackController.getBookingForFeedback);       // public: get booking details for form
router.get('/feedback', authMiddleware, feedbackController.getAllFeedback);                  // admin: list all
router.get('/feedback/stats', authMiddleware, feedbackController.getFeedbackStats);          // admin: stats
router.put('/feedback/testimonials/:testimonialId/approve', authMiddleware, feedbackController.approveTestimonial);
router.put('/feedback/testimonials/:testimonialId/reject', authMiddleware, feedbackController.rejectTestimonial);

// Email routes
router.post('/email/send-bill', authMiddleware, emailController.sendBillEmail);

module.exports = router;
