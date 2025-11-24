import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 280;

export default function MainLayout({ children }) {
    const [role, setRole] = useState('');
    const [userInitials, setUserInitials] = useState('');

    useEffect(() => {
        // Load user data from localStorage
        const storedRole = localStorage.getItem('role');
        const storedData = localStorage.getItem('user_data');
        
        if (storedRole) setRole(storedRole);
        
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                const name = parsed.username || 'User';
                setUserInitials(name.substring(0, 2).toUpperCase());
            } catch (e) {
                setUserInitials('US');
            }
        }
    }, []);

    // Avoid rendering until role is loaded
    if (!role) return null; 

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            <CssBaseline />
            
            {/* Sidebar (left fixed) */}
            <Sidebar role={role} />

            {/* Main content area */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    // Removed margin-left because flexbox handles layout
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    overflowX: 'hidden'
                }}
            >
                {/* Top navbar */}
                <Navbar userInitials={userInitials} role={role} />

                {/* Page content */}
                {children}
            </Box>
        </Box>
    );
}
