import React from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LiveChatWidget from './components/common/LiveChatWidget';
import AppRoutes from './routes/AppRoutes';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <AppRoutes />
          </main>
          <Footer />
          <LiveChatWidget />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
