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

export default function NGOManagement() {
    
    // --- STATE ---
    const [ngos, setNgos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        ong_id: null,
        name: '',
        registration_number: '',
        country: '',
        city: '',
        address: '',
        contact_email: '',
        phone: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchNGOs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/ngos/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgos(response.data); 
        } catch (error) {
            console.error("Error fetching NGOs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNGOs();
    }, []);

    const handleSaveNGO = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.ong_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/ngos/update/', {
                    ong_id: formData.ong_id,
                    name: formData.name,
                    registration_number: formData.registration_number,
                    country: formData.country,
                    city: formData.city,
                    address: formData.address,
                    contact_email: formData.contact_email,
                    phone: formData.phone,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/ngos/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchNGOs(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving NGO:", error);
            alert("Failed to save NGO. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const ngoToUpdate = ngos.find(n => n.ong_id === id);
        
        if (!ngoToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/ngos/update/', { 
                 ...ngoToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchNGOs(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (ngo = null) => {
        if (ngo) {
            // Edit Mode
            setFormData({
                ong_id: ngo.ong_id,
                name: ngo.name,
                registration_number: ngo.registration_number,
                country: ngo.country,
                city: ngo.city,
                address: ngo.address || '',
                contact_email: ngo.contact_email,
                phone: ngo.phone || '',
                status: ngo.status
            });
        } else {
            // New NGO Mode
            setFormData({
                ong_id: null,
                name: '',
                registration_number: '',
                country: '',
                city: '',
                address: '',
                contact_email: '',
                phone: '',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredNGOs = () => {
        let filtered = ngos;
        if (searchTerm) {
            filtered = filtered.filter(n => 
                (n.name && n.name.toLowerCase().includes(searchTerm)) || 
                (n.country && n.country.toLowerCase().includes(searchTerm)) ||
                (n.city && n.city.toLowerCase().includes(searchTerm)) ||
                (n.registration_number && n.registration_number.toLowerCase().includes(searchTerm))
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
                    <Typography variant="h4" fontWeight={800} color="#1E293B">NGO Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage NGO organizations and their information.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New NGO
                </Button>
            </Box>

            {/* CONTENT CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                
                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
                        placeholder="Search by name, country, city, or registration number..." 
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
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>NGO Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Registration Number</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Country</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>City</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Contact Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredNGOs().map((ngo) => (
                                    <TableRow key={ngo.ong_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {ngo.name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{ngo.registration_number}</TableCell>
                                        <TableCell sx={{ color: '#1E293B' }}>{ngo.country}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{ngo.city}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{ngo.address || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{ngo.contact_email}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{ngo.phone || '-'}</TableCell>
                                        <TableCell>{getStatusChip(ngo.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(ngo)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={ngo.status === 'Active'} 
                                                onChange={() => handleToggleStatus(ngo.ong_id, ngo.status)}
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
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.ong_id ? 'Edit NGO' : 'New NGO'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: BASIC INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>Basic Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">NGO Name</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="name" value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Registration Number</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="registration_number" value={formData.registration_number} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* SECTION 2: LOCATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Location</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Country</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="country" value={formData.country} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">City</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="city" value={formData.city} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Address</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="address" value={formData.address} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* SECTION 3: CONTACT INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Contact Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Contact Email</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Phone</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveNGO} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save NGO</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}


