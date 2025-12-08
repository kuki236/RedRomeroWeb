import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tabs,
    Tab,
    Button,
    Chip,
    Drawer,
    CircularProgress,
    Grid,
    InputBase,
    Pagination
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Close,
    Delete as DeleteIcon,
    School,
} from '@mui/icons-material';

const primaryColor = '#FF3F01';

export default function VolunteerManagement() {
    
    // --- STATE ---
    const [volunteers, setVolunteers] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;

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

    // Specialties Management State
    const [isSpecialtiesDrawerOpen, setIsSpecialtiesDrawerOpen] = useState(false);
    const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
    const [selectedVolunteerName, setSelectedVolunteerName] = useState('');
    const [availableSpecialties, setAvailableSpecialties] = useState([]);
    const [volunteerSpecialties, setVolunteerSpecialties] = useState([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);

    // --- API CALLS ---

    const fetchVolunteers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/volunteers/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVolunteers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching volunteers:', err);
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
        fetchAvailableSpecialties();
    }, []);

    const handleSaveVolunteer = async () => {
        // Basic validation
        const required = ['first_name', 'last_name', 'birth_date', 'email'];
        for (const field of required) {
            if (!formData[field]) {
                const fieldName = field.replace('_', ' ');
                alert(`Please fill in ${fieldName}.`);
                return;
            }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        try {
            if (formData.volunteer_id) {
                // UPDATE - Send only fields that backend accepts
                const updateData = {
                    volunteer_id: formData.volunteer_id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone || '',
                    address: formData.address || ''
                };
                await axios.put('http://127.0.0.1:8000/api/admin/volunteers/update/', updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // CREATE - Send all required fields
                await axios.post('http://127.0.0.1:8000/api/admin/volunteers/', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            await fetchVolunteers();
            handleCloseDrawer();
        } catch (err) {
            console.error('Error saving volunteer:', err);
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
            } else {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to save volunteer.';
                alert(`Error: ${errorMessage}. Please check console for details.`);
            }
        }
    };

    const handleDeleteVolunteer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this volunteer?')) return;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/volunteers/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchVolunteers(); // Refresh the list
        } catch (err) {
            console.error('Error deleting volunteer:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to delete volunteer.';
            alert(`Error: ${errorMessage}`);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setPage(1); // Reset to first page when tab changes
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (volunteer = null) => {
        if (volunteer) {
            // Edit Mode - Format dates to remove time component
            setFormData({
                volunteer_id: volunteer.volunteer_id,
                first_name: volunteer.first_name || '',
                last_name: volunteer.last_name || '',
                birth_date: formatDateForInput(volunteer.birth_date) || '',
                address: volunteer.address || '',
                email: volunteer.email || '',
                phone: volunteer.phone || '',
                status: volunteer.status || 'Active'
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

    // --- SPECIALTIES MANAGEMENT ---

    const fetchAvailableSpecialties = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/config/?type=specialties', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableSpecialties(response.data);
        } catch (error) {
            console.error("Error fetching available specialties:", error);
        }
    };

    const fetchVolunteerSpecialties = async (volunteerId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoadingSpecialties(true);
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/volunteers/specialties/?volunteer_id=${volunteerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVolunteerSpecialties(response.data);
        } catch (error) {
            console.error("Error fetching volunteer specialties:", error);
        } finally {
            setLoadingSpecialties(false);
        }
    };

    const handleOpenSpecialtiesDrawer = async (volunteer) => {
        setSelectedVolunteerId(volunteer.volunteer_id);
        setSelectedVolunteerName(`${volunteer.first_name} ${volunteer.last_name}`);
        setIsSpecialtiesDrawerOpen(true);
        await fetchVolunteerSpecialties(volunteer.volunteer_id);
    };

    const handleCloseSpecialtiesDrawer = () => {
        setIsSpecialtiesDrawerOpen(false);
        setSelectedVolunteerId(null);
        setSelectedVolunteerName('');
        setVolunteerSpecialties([]);
    };

    const handleAddSpecialty = async (specialtyId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        // Check if specialty is already assigned
        if (volunteerSpecialties.some(s => s.specialty_id === specialtyId)) {
            alert('This specialty is already assigned to this volunteer.');
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/admin/volunteers/specialties/', {
                volunteer_id: selectedVolunteerId,
                specialty_id: specialtyId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh volunteer specialties
            await fetchVolunteerSpecialties(selectedVolunteerId);
        } catch (error) {
            console.error("Error adding specialty:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add specialty.';
            alert(`Error: ${errorMessage}`);
        }
    };

    // Format date to show only date without time
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // If it's in ISO format with time, extract only the date part
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    // --- FILTERING & PAGINATION ---
    const getFilteredVolunteers = () => {
        let filtered = volunteers;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(v =>
                (`${v.first_name} ${v.last_name}`.toLowerCase().includes(searchTerm)) ||
                (v.email && v.email.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply tab filter
        if (currentTab === 1) {
            // Active volunteers
            filtered = filtered.filter(v => v.status === 'Active');
        } else if (currentTab === 2) {
            // Inactive volunteers
            filtered = filtered.filter(v => v.status === 'Inactive' || !v.status || v.status !== 'Active');
        }
        
        return filtered;
    };

    const getPaginatedVolunteers = () => {
        const filtered = getFilteredVolunteers();
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        // Scroll to top of table when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset to page 1 when search term or tab changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, currentTab]);

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
                
                {/* Search & Tabs */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 420, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748B' },
                            '& .Mui-selected': { color: primaryColor },
                            '& .MuiTabs-indicator': { backgroundColor: primaryColor }
                        }}
                    >
                        <Tab label="All" />
                        <Tab label="Active" />
                        <Tab label="Inactive" />
                    </Tabs>
                </Box>
                
                {/* TABLE */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Birth Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Specialties</TableCell>
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
                            ) : getPaginatedVolunteers().length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#94A3B8' }}>
                                        No volunteers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getPaginatedVolunteers().map((volunteer) => (
                                    <TableRow key={volunteer.volunteer_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {volunteer.first_name} {volunteer.last_name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.email}</TableCell>
                                        <TableCell sx={{ color: '#1E293B' }}>{formatDate(volunteer.birth_date)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.phone || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{volunteer.address || '-'}</TableCell>
                                        <TableCell>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenSpecialtiesDrawer(volunteer)}
                                                sx={{ color: primaryColor }}
                                                title="Manage Specialties"
                                            >
                                                <School fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{getStatusChip(volunteer.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(volunteer)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>

                                            <IconButton size="small" onClick={() => handleDeleteVolunteer(volunteer.volunteer_id)}>
                                                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGINATION */}
                {!loading && getFilteredVolunteers().length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 3, borderTop: '1px solid #E2E8F0' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, getFilteredVolunteers().length)} of {getFilteredVolunteers().length} volunteers
                        </Typography>
                        <Pagination
                            count={Math.ceil(getFilteredVolunteers().length / rowsPerPage)}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: '#64748B',
                                    '&.Mui-selected': {
                                        backgroundColor: primaryColor,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#D93602',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#FFF5F0',
                                    },
                                },
                            }}
                        />
                    </Box>
                )}
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

            {/* SPECIALTIES MANAGEMENT DRAWER */}
            <Drawer anchor="right" open={isSpecialtiesDrawerOpen} onClose={handleCloseSpecialtiesDrawer} PaperProps={{ sx: { width: 500, p: 4 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} color="#1E293B">Manage Specialties</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedVolunteerName}</Typography>
                    </Box>
                    <IconButton onClick={handleCloseSpecialtiesDrawer}><Close /></IconButton>
                </Box>

                {loadingSpecialties ? (
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 5 }}>
                        <CircularProgress sx={{ color: primaryColor }} />
                    </Box>
                ) : (
                    <Box>
                        {/* CURRENT SPECIALTIES */}
                        <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 2 }}>Current Specialties</Typography>
                        {volunteerSpecialties.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                No specialties assigned yet.
                            </Typography>
                        ) : (
                            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {volunteerSpecialties.map((specialty) => (
                                    <Chip
                                        key={specialty.assignment_id}
                                        label={specialty.specialty_name}
                                        size="small"
                                        sx={{
                                            bgcolor: '#E8F5E9',
                                            color: '#2E7D32',
                                            fontWeight: 600,
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* AVAILABLE SPECIALTIES TO ADD */}
                        <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 2, mt: 3 }}>Available Specialties</Typography>
                        {availableSpecialties.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No specialties available. Please create specialties in Configuration Settings.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                                {availableSpecialties
                                    .filter(spec => !volunteerSpecialties.some(vs => vs.specialty_id === spec.id))
                                    .map((specialty) => (
                                        <Paper
                                            key={specialty.id}
                                            sx={{
                                                p: 2,
                                                border: '1px solid #E2E8F0',
                                                borderRadius: 2,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': {
                                                    borderColor: primaryColor,
                                                    bgcolor: '#FFF5F0'
                                                }
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} color="#1E293B">
                                                    {specialty.name}
                                                </Typography>
                                                {specialty.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {specialty.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleAddSpecialty(specialty.id)}
                                                sx={{
                                                    bgcolor: primaryColor,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    '&:hover': { bgcolor: '#D93602' }
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Paper>
                                    ))}
                            </Box>
                        )}
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}
