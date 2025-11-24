import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';

// Import dashboard pages
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import UserManagement from './pages/UserManagement'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/dashboard/representative" element={<RepresentativeDashboard />} />
        
        {/* --- admin routes--- */}
        <Route path="/admin/usuarios" element={<UserManagement />} /> 
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;