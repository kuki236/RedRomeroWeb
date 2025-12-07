import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, MenuItem, Switch, Button, Chip, 
    Drawer, CircularProgress, Grid, InputBase
} from '@mui/material';
import { 
    Search, Add, Edit, Close
} from '@mui/icons-material';

const primaryColor = '#FF3F01';

export default function DonorManagement() {
    
    // --- STATE ---
    const [donors, setDonors] = useState([]); 
    const [donorTypes, setDonorTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        donor_id: null,
        name: '',
        email: '',
        phone: '',
        type_id: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchDonors = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            // CAMBIO 1: Actualizar URL
            const response = await axios.get('http://127.0.0.1:8000/api/finance/donors/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDonors(response.data);
        } catch (error) {
            console.error("Error fetching donors:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDonorTypes = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            // CAMBIO 1: Actualizar URL
            const response = await axios.get(
              "http://127.0.0.1:8000/api/finance/donors/",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setDonors(response.data);
        } catch (error) {
            console.error("Error fetching donor types:", error);
        }
    };

    useEffect(() => {
        fetchDonors();
        fetchDonorTypes();
    }, []);

    const handleSaveDonor = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                type_id: formData.type_id || 1 // Valor por defecto si no se selecciona
            };
            if (formData.donor_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/donors/update/', {
                    donor_id: formData.donor_id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    type_id: formData.type_id,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/finance/donors/', payload, {
                    headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchDonors(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving donor:", error);
            alert("Failed to save donor. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const donorToUpdate = donors.find(d => d.donor_id === id);
        
        if (!donorToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/donors/update/', { 
                 ...donorToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchDonors(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (donor = null) => {
        if (donor) {
            // Edit Mode
            setFormData({
                donor_id: donor.donor_id,
                name: donor.name,
                email: donor.email || '',
                phone: donor.phone || '',
                type_id: donor.type_id,
                status: donor.status
            });
        } else {
            // New Donor Mode
            setFormData({
                donor_id: null,
                name: '',
                email: '',
                phone: '',
                type_id: '',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredDonors = () => {
        let filtered = donors;
        if (searchTerm) {
            filtered = filtered.filter(d => 
                (d.name && d.name.toLowerCase().includes(searchTerm)) || 
                (d.email && d.email.toLowerCase().includes(searchTerm))
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

    // Helper function to get Donor Type name from ID
    const getDonorTypeName = (typeId) => {
        const type = donorTypes.find(t => t.type_id === typeId);
        return type ? type.name : typeId;
    };

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Donor Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage donor information and classifications.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New Donor
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
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Donor Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Donor Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredDonors().map((donor) => (
                                    <TableRow key={donor.donor_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {donor.name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{donor.email || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{donor.phone || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getDonorTypeName(donor.type_id)}</TableCell>
                                        <TableCell>{getStatusChip(donor.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(donor)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={donor.status === 'Active'} 
                                                onChange={() => handleToggleStatus(donor.donor_id, donor.status)}
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
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.donor_id ? 'Edit Donor' : 'New Donor'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: BASIC INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>Basic Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Donor Name</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="name" value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Donor Type</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="type_id" 
                                value={formData.type_id} 
                                onChange={handleChange}
                            >
                                {donorTypes.map((type) => (
                                    <MenuItem key={type.type_id} value={type.type_id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* SECTION 2: CONTACT INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Contact Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Email (Optional)</Typography>
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
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Phone (Optional)</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveDonor} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Donor</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}




