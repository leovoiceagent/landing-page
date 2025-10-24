import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import AuthCallback from './components/AuthCallback';
import ResetPassword from './components/ResetPassword';
import VoiceDemo from './components/VoiceDemo';
import ProtectedRoute from './components/ProtectedRoute';
import AppDashboard from './components/AppDashboard';
import AdminDashboard from './components/AdminDashboard';
import ROICalculator from './components/ROICalculator';
import QRWaitlistPage from './components/QRWaitlistPage';
import { RETELL_CONFIG } from './config/retell';

function AppContent() {
  const [showVoiceDemo, setShowVoiceDemo] = useState(false);
  const location = useLocation();

  const handleStartVoiceDemo = () => {
    setShowVoiceDemo(true);
  };

  const handleCloseVoiceDemo = () => {
    setShowVoiceDemo(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] antialiased">
      <Header onStartVoiceDemo={handleStartVoiceDemo} />
      <Routes>
        <Route path="/" element={
          <main>
            <Hero onStartVoiceDemo={handleStartVoiceDemo} />
            <Benefits />
            <HowItWorks />
            <Testimonials onStartVoiceDemo={handleStartVoiceDemo} />
            <FAQ />
          </main>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/roi-calculator" element={<ROICalculator />} />
        <Route path="/waitlist" element={<QRWaitlistPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <AppDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer showCTA={location.pathname !== '/waitlist'} />
      
      {/* Voice Demo Modal */}
      {showVoiceDemo && (
        <VoiceDemo
          agentId={RETELL_CONFIG.DEFAULT_AGENT_ID}
          agentName={RETELL_CONFIG.AGENT_NAME}
          onClose={handleCloseVoiceDemo}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;