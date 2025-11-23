import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import GeneralDashboard from './pages/GeneralDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login />} />
        
        
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/dashboard/representative" element={<RepresentativeDashboard />} />
        
        <Route path="/dashboard" element={<GeneralDashboard />} /> 

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;