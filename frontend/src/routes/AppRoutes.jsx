import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ServicesPage from '../pages/ServicesPage';
import CeremoniesPage from '../pages/CeremoniesPage';
import BookingPage from '../pages/BookingPage';
import QuoteCalculatorPage from '../pages/QuoteCalculatorPage';
import ContactPage from '../pages/ContactPage';
import EventSubmissionPage from '../pages/EventSubmissionPage';
import FeedbackPage from '../pages/FeedbackPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// Protectors
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/ceremonies" element={<CeremoniesPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/calculator" element={<QuoteCalculatorPage />} />
      <Route path="/submit-event" element={<EventSubmissionPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/feedback/:bookingId" element={<FeedbackPage />} />

      {/* Admin Pages */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
