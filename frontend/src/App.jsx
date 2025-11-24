import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Layouts ---
import MainLayout from './components/common/MainLayout';

// --- Auth & General ---
import Login from './pages/Login';
import GeneralDashboard from './pages/GeneralDashboard';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// --- Employee Pages ---
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

// --- Volunteer Pages ---
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

// --- Representative Pages ---
import RepresentativeDashboard from './pages/representative/RepresentativeDashboard';

// Wrapper for layout with Sidebar / Navbar
const DashboardWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public access */}
        <Route path="/" element={<Login />} />
        
        {/* Protected routes (with layout) */}
        <Route element={<DashboardWrapper />}>

            {/* General dashboard */}
            <Route path="/dashboard" element={<GeneralDashboard />} />

            {/* Admin routes */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<UserManagement />} />

            {/* Employee routes */}
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            
            {/* Volunteer routes */}
            <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
            
            {/* Representative routes */}
            <Route path="/dashboard/representative" element={<RepresentativeDashboard />} />

        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
