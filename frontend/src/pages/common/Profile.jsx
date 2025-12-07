import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // REAL CONNECTION
import { 
    Box, Typography, TextField, Button, Paper, Grid, 
    Avatar, Divider, Chip, CircularProgress, Alert, Snackbar,
    InputAdornment, IconButton
} from '@mui/material';
import { 
    Save, Person, Email, Phone, Home, VpnKey, 
    Visibility, VisibilityOff, Badge, ArrowBack 
} from '@mui/icons-material';

const primaryColor = '#FF3F01'; 

export default function Profile() {
    const navigate = useNavigate(); 
    
    // --- STATES ---
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',    
        address: '',  
        role: ''      
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '', // Required to validate before changing
        new_password: '',
        confirm_password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- 1. REAL DATA LOAD (GET) ---
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); // Redirect if no token
                return;
            }

            try {
                // Call to the endpoint created in Django
                const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error loading profile:', error);
                setNotification({ open: true, message: 'Error loading data from server', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    // --- 2. REAL UPDATE (PUT) ---
    const handleUpdate = async (type) => {
        setUpdating(true);
        const token = localStorage.getItem('token');

        try {
            let payload = {};

            if (type === 'info') {
                // Send personal and employee data (if applicable)
                payload = {
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                };
            } 
            else if (type === 'password') {
                if (passwordData.new_password !== passwordData.confirm_password) {
                    throw new Error("Passwords do not match");
                }
                if (!passwordData.new_password) return;
                
                // Send only the new password
                payload = {
                    password: passwordData.new_password
                };
            }

            // PUT call to the same endpoint
            await axios.put('http://127.0.0.1:8000/api/profile/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotification({ 
                open: true, 
                message: type === 'info' ? 'Information updated' : 'Password changed', 
                severity: 'success' 
            });

            if (type === 'password') {
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            }

        } catch (error) {
            console.error('Update error:', error);
            setNotification({ 
                open: true, 
                message: error.response?.data?.detail || 'Error updating profile', 
                severity: 'error' 
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress sx={{ color: primaryColor }} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, margin: '0 auto', pb: 4 }}>
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
            >
                Back
            </Button>

            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">My Profile</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your personal information.</Typography>
                </Box>
                <Chip 
                    label={userData.role || 'USER'} 
                    sx={{ bgcolor: '#FFF0EB', color: primaryColor, fontWeight: 800, px: 1 }} 
                />
            </Box>

            <Grid container spacing={4}>
                {/* LEFT COLUMN: DATA */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Avatar sx={{ bgcolor: primaryColor, width: 56, height: 56 }}>
                                {userData.first_name?.[0]}{userData.last_name?.[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1E293B">General Information</Typography>
                                <Typography variant="caption" color="text.secondary">Visible to administration</Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth label="First Name" name="first_name"
                                    value={userData.first_name} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{color:'#94a3b8'}}/></InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth label="Last Name" name="last_name"
                                    value={userData.last_name} onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth label="Email" name="email"
                                    value={userData.email} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{color:'#94a3b8'}}/></InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth label="Username" name="username"
                                    value={userData.username} disabled
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{color:'#94a3b8'}}/></InputAdornment> }}
                                />
                            </Grid>
                        </Grid>

                        {/* CONDITIONAL RENDER FOR EMPLOYEES */}
                        {userData.role === 'EMPLOYEE' && (
                            <>
                                <Divider sx={{ my: 3 }} >
                                    <Chip label="Workforce Data" size="small" />
                                </Divider>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth label="Phone" name="phone"
                                            value={userData.phone || ''} onChange={handleChange}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{color:'#94a3b8'}}/></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth label="Address" name="address"
                                            value={userData.address || ''} onChange={handleChange}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Home sx={{color:'#94a3b8'}}/></InputAdornment> }}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                variant="contained" 
                                onClick={() => handleUpdate('info')}
                                disabled={updating}
                                startIcon={updating ? <CircularProgress size={20} color="inherit"/> : <Save />}
                                sx={{ bgcolor: primaryColor, fontWeight: 700, px: 4, '&:hover': { bgcolor: '#D93602' } }}
                            >
                                {updating ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* RIGHT COLUMN: PASSWORD */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <VpnKey sx={{ color: primaryColor }} />
                            <Typography variant="h6" fontWeight={700} color="#1E293B">Security</Typography>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth type="password" label="New Password" 
                                    name="new_password"
                                    value={passwordData.new_password} onChange={handlePasswordChange}
                                    size="small"
                                    InputProps={{ 
                                        endAdornment: (
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        ) 
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth type="password" label="Confirm Password" 
                                    name="confirm_password"
                                    value={passwordData.confirm_password} onChange={handlePasswordChange}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Button 
                            variant="outlined" fullWidth 
                            onClick={() => handleUpdate('password')}
                            disabled={updating || !passwordData.new_password}
                            sx={{ mt: 3, color: '#64748B', borderColor: '#E2E8F0', fontWeight: 700, '&:hover': { borderColor: primaryColor, color: primaryColor } }}
                        >
                            Change Password
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar 
                open={notification.open} autoHideDuration={6000} 
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant="filled" onClose={() => setNotification({ ...notification, open: false })}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
