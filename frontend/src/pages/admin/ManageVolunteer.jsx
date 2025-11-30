import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, Switch, Button, Chip, 
    Drawer, CircularProgress, Grid, InputBase
} from '@mui/material';
import { 
    Search, Add, Edit, Close
} from '@mui/icons-material';

const primaryColor = '#FF3F01';

export default function VolunteerManagement() {
    
    // --- STATE ---
    const [volunteers, setVolunteers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        volunteer_id: null,
        first_name: '',
        last_name: '',
        birth_date: '',
        address: '',
        email: '',
        phone: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchVolunteers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/volunteers/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVolunteers(response.data); 
        } catch (error) {
            console.error("Error fetching volunteers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const handleSaveVolunteer = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.volunteer_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/volunteers/update/', {
                    volunteer_id: formData.volunteer_id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    birth_date: formData.birth_date,
                    address: formData.address,
                    email: formData.email,
                    phone: formData.phone,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/volunteers/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchVolunteers(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving volunteer:", error);
            alert("Failed to save volunteer. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const volunteerToUpdate = volunteers.find(v => v.volunteer_id === id);
        
        if (!volunteerToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/volunteers/update/', { 
                 ...volunteerToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchVolunteers(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (volunteer = null) => {
        if (volunteer) {
            // Edit Mode
            setFormData({
                volunteer_id: volunteer.volunteer_id,
                first_name: volunteer.first_name,
                last_name: volunteer.last_name,
                birth_date: volunteer.birth_date,
                address: volunteer.address || '',
                email: volunteer.email,
                phone: volunteer.phone || '',
                status: volunteer.status
            });
        } else {
            // New Volunteer Mode
            setFormData({
                volunteer_id: null,
                first_name: '',
                last_name: '',
                birth_date: '',
                address: '',
                email: '',
                phone: '',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredVolunteers = () => {
        let filtered = volunteers;
        if (searchTerm) {
            filtered = filtered.filter(v => 
                (v.first_name && v.first_name.toLowerCase().includes(searchTerm)) || 
                (v.last_name && v.last_name.toLowerCase().includes(searchTerm)) ||
                (v.email && v.email.toLowerCase().includes(searchTerm))
            );
        }
        return filtered;
    };

    const getStatusChip = (status) => {
        const isActive = status === 'Active';
        return (
            <Chip 
                label={status} 
                size="small" 
                sx={{ 
                    bgcolor: isActive ? '#E8F5E9' : '#FFEBEE', 
                    color: isActive ? '#2E7D32' : '#C62828',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                }} 
            />
        );
    };

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Volunteer Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage volunteer profiles and contact information.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New Volunteer
                </Button>
            </Box>

            {/* CONTENT CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                
                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                </Box>
                
                {/* TABLE */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>First Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Last Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Birth Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredVolunteers().map((volunteer) => (
                                    <TableRow key={volunteer.volunteer_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {volunteer.first_name}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {volunteer.last_name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.birth_date}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.address || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.email}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.phone || '-'}</TableCell>
                                        <TableCell>{getStatusChip(volunteer.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(volunteer)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={volunteer.status === 'Active'} 
                                                onChange={() => handleToggleStatus(volunteer.volunteer_id, volunteer.status)}
                                                sx={{ 
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor },
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* DYNAMIC DRAWER (FORM) */}
            <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: 450, p: 4 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.volunteer_id ? 'Edit Volunteer' : 'New Volunteer'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: PERSONAL INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>Personal Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">First Name</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="first_name" value={formData.first_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Last Name</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="last_name" value={formData.last_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Birth Date</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="date" 
                                name="birth_date" 
                                value={formData.birth_date} 
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Address</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="address" value={formData.address} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* SECTION 2: CONTACT INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Contact Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Email</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Phone</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveVolunteer} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Volunteer</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}


