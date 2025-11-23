import React, { useEffect } from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const primaryColor = '#FF3F01';
const primaryTextColor = '#333333';

/**
 * General Dashboard (Fallback Page).
 * This page should theoretically not be reached as users are redirected by role 
 * immediately after login. It serves as a generic welcome/security landing page.
 */
export default function GeneralDashboard() {
    const navigate = useNavigate();

    // Redundant check: If the user is logged in, try to push them to their specific role dashboard
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role) {
            console.log(`User logged in as ${role}. Redirecting to specific dashboard.`);
            // Redirect based on stored role
            navigate(`/dashboard/${role.toLowerCase()}`, { replace: true });
        }
        // NOTE: If there is no role, the page simply displays the generic message.
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            bgcolor: '#F8F9FA',
            p: 4
        }}>
            <Paper elevation={4} sx={{ p: 5, borderRadius: 3, maxWidth: 600, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} color={primaryColor} gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="h6" fontWeight={700} color={primaryTextColor} mb={2}>
                    Welcome to RedRomero.
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    Your account does not have a predefined entry route, or the automatic redirection failed. 
                    Please ensure you log in via the correct portal.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={handleLogout} 
                    sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Return to Login
                </Button>
            </Paper>
            
            <Box sx={{ py: 3, px: 2, mt: 'auto', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {'Copyright © '}
                    <Link color="inherit" href="#">RedRomero</Link>{' '}
                    {new Date().getFullYear()}
                    {'. All rights reserved.'}
                </Typography>
            </Box>
        </Box>
    );
}