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

export default function RepresentativeManagement() {
    
    // --- STATE ---
    const [representatives, setRepresentatives] = useState([]); 
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        representative_id: null,
        first_name: '',
        last_name: '',
        birth_date: '',
        address: '',
        email: '',
        phone: '',
        ong_id: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchRepresentatives = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/representatives/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRepresentatives(response.data); 
        } catch (error) {
            console.error("Error fetching representatives:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNGOs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/ngos/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgos(response.data);
        } catch (error) {
            console.error("Error fetching NGOs:", error);
        }
    };

    useEffect(() => {
        fetchRepresentatives();
        fetchNGOs();
    }, []);

    const handleSaveRepresentative = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.representative_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/representatives/update/', {
                    representative_id: formData.representative_id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    birth_date: formData.birth_date,
                    address: formData.address,
                    email: formData.email,
                    phone: formData.phone,
                    ong_id: formData.ong_id,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/representatives/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchRepresentatives(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving representative:", error);
            alert("Failed to save representative. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const representativeToUpdate = representatives.find(r => r.representative_id === id);
        
        if (!representativeToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/representatives/update/', { 
                 ...representativeToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchRepresentatives(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (representative = null) => {
        if (representative) {
            // Edit Mode
            setFormData({
                representative_id: representative.representative_id,
                first_name: representative.first_name,
                last_name: representative.last_name,
                birth_date: representative.birth_date,
                address: representative.address || '',
                email: representative.email,
                phone: representative.phone || '',
                ong_id: representative.ong_id,
                status: representative.status
            });
        } else {
            // New Representative Mode
            setFormData({
                representative_id: null,
                first_name: '',
                last_name: '',
                birth_date: '',
                address: '',
                email: '',
                phone: '',
                ong_id: '',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredRepresentatives = () => {
        let filtered = representatives;
        if (searchTerm) {
            filtered = filtered.filter(r => 
                (r.first_name && r.first_name.toLowerCase().includes(searchTerm)) || 
                (r.last_name && r.last_name.toLowerCase().includes(searchTerm)) ||
                (r.email && r.email.toLowerCase().includes(searchTerm))
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

    // Helper function to get NGO name from ID
    const getNGOName = (ngoId) => {
        const ngo = ngos.find(n => n.ong_id === ngoId);
        return ngo ? ngo.name : ngoId;
    };

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Representative Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage NGO representatives and their information.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New Representative
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
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>NGO</TableCell>
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
                                getFilteredRepresentatives().map((representative) => (
                                    <TableRow key={representative.representative_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {representative.first_name}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {representative.last_name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{representative.birth_date}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{representative.address || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{representative.email}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{representative.phone || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getNGOName(representative.ong_id)}</TableCell>
                                        <TableCell>{getStatusChip(representative.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(representative)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={representative.status === 'Active'} 
                                                onChange={() => handleToggleStatus(representative.representative_id, representative.status)}
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
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.representative_id ? 'Edit Representative' : 'New Representative'}</Typography>
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

                    {/* SECTION 3: ORGANIZATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Organization</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">NGO</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="ong_id" 
                                value={formData.ong_id} 
                                onChange={handleChange}
                            >
                                {ngos.map((ngo) => (
                                    <MenuItem key={ngo.ong_id} value={ngo.ong_id}>
                                        {ngo.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveRepresentative} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Representative</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}

