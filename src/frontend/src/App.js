import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Nurse Pages
import NurseDashboard from './pages/nurse/Dashboard';
import VitalSignsForm from './pages/nurse/VitalSignsForm';
import PreviousVisits from './pages/nurse/PreviousVisits';
import DailyTipsForm from './pages/nurse/DailyTipsForm';
import MedicalConditions from './pages/nurse/MedicalConditions';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import EmergencyAlert from './pages/patient/EmergencyAlert';
import DailyInfoForm from './pages/patient/DailyInfoForm';
import SymptomsChecklist from './pages/patient/SymptomsChecklist';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        <Container className="flex-grow-1 py-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Nurse Routes */}
            <Route path="/nurse/dashboard" element={
              <ProtectedRoute role="nurse">
                <NurseDashboard />
              </ProtectedRoute>
            } />
            <Route path="/nurse/vital-signs" element={
              <ProtectedRoute role="nurse">
                <VitalSignsForm />
              </ProtectedRoute>
            } />
            <Route path="/nurse/previous-visits" element={
              <ProtectedRoute role="nurse">
                <PreviousVisits />
              </ProtectedRoute>
            } />
            <Route path="/nurse/daily-tips" element={
              <ProtectedRoute role="nurse">
                <DailyTipsForm />
              </ProtectedRoute>
            } />
            <Route path="/nurse/medical-conditions" element={
              <ProtectedRoute role="nurse">
                <MedicalConditions />
              </ProtectedRoute>
            } />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/emergency-alert" element={
              <ProtectedRoute role="patient">
                <EmergencyAlert />
              </ProtectedRoute>
            } />
            <Route path="/patient/daily-info" element={
              <ProtectedRoute role="patient">
                <DailyInfoForm />
              </ProtectedRoute>
            } />
            <Route path="/patient/symptoms" element={
              <ProtectedRoute role="patient">
                <SymptomsChecklist />
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

export default App;
