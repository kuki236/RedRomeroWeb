import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, MenuItem, Switch, Tabs, Tab, Button, Chip, 
    Drawer, CircularProgress, Grid, InputBase
} from '@mui/material';
import { 
    Search, Add, Edit, Close, Visibility, VisibilityOff
} from '@mui/icons-material';

const primaryColor = '#FF3F01';
// Roles matching Oracle constraints
const roles = ['ADMIN', 'EMPLOYEE', 'VOLUNTEER', 'REPRESENTATIVE'];

export default function UserManagement() {
    
    // --- STATE ---
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0); 
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        birth_date: '',
        role: 'EMPLOYEE',
        ong_id: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/users/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data); 
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/users/update/', {
                    id: formData.id,
                    name: formData.username,
                    role: formData.role,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/users/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchUsers(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const userToUpdate = users.find(u => u.id === id);
        
        if (!userToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/users/update/', { 
                 ...userToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchUsers(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => setCurrentTab(newValue);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (user = null) => {
        if (user) {
            // Edit Mode
            const names = user.name ? user.name.split(' ') : ['',''];
            setFormData({
                id: user.id,
                username: user.name,
                first_name: names[0] || '',
                last_name: names.slice(1).join(' ') || '',
                email: user.email,
                role: user.role,
                status: user.status,
                password: '', 
                phone: '', address: '', birth_date: '', ong_id: '' 
            });
        } else {
            // New User Mode
            setFormData({
                id: null,
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                birth_date: '',
                role: 'EMPLOYEE',
                ong_id: '',
                status: 'Active'
            });
        }
        setShowPassword(false);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredUsers = () => {
        let filtered = users;
        if (currentTab !== 0) {
            const roleMap = { 1: 'ADMIN', 2: 'EMPLOYEE', 3: 'VOLUNTEER', 4: 'REPRESENTATIVE' };
            filtered = filtered.filter(u => u.role === roleMap[currentTab]);
        }
        if (searchTerm) {
            filtered = filtered.filter(u => 
                (u.name && u.name.toLowerCase().includes(searchTerm)) || 
                (u.email && u.email.toLowerCase().includes(searchTerm))
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
                    <Typography variant="h4" fontWeight={800} color="#1E293B">User Management</Typography>
                    <Typography variant="body2" color="text.secondary">Administer user accounts, roles, and permissions.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New User
                </Button>
            </Box>

            {/* CONTENT CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                
                {/* Search & Tabs */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
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
                        <Tab label="All Roles" />
                        <Tab label="Admin" />
                        <Tab label="Project Manager" /> {/* Mapped to Employee */}
                        <Tab label="Volunteer" />
                        <Tab label="Representative" />
                    </Tabs>
                </Box>
                
                {/* TABLE */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>User Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredUsers().map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {user.name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{user.email}</TableCell>
                                        <TableCell sx={{ color: '#1E293B' }}>{user.role}</TableCell>
                                        <TableCell>{getStatusChip(user.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(user)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={user.status === 'Active'} 
                                                onChange={() => handleToggleStatus(user.id, user.status)}
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
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.id ? 'Edit User' : 'New User'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: SYSTEM ACCESS */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>System Access</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Role</Typography>
                            <TextField select fullWidth variant="outlined" size="small" name="role" value={formData.role} onChange={handleChange}>
                                {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Username (Login)</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="username" value={formData.username} onChange={handleChange} />
                        </Grid>
                        
                        {/* Password only for new users */}
                        {!formData.id && (
                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Password</Typography>
                                <TextField 
                                    fullWidth variant="outlined" size="small" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                                    InputProps={{ endAdornment: (<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>) }}
                                />
                            </Grid>
                        )}
                    </Grid>

                    {/* SECTION 2: PERSONAL PROFILE */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Personal Profile</Typography>
                    
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
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Email</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="email" value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Phone</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Birth Date</Typography>
                            <TextField fullWidth variant="outlined" size="small" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Address</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="address" value={formData.address} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* CONDITIONAL FIELDS */}
                    {formData.role === 'REPRESENTATIVE' && (
                        <Box sx={{ bgcolor: '#FFF0EB', p: 2, borderRadius: 2, mt: 1 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1}>Representative Details</Typography>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">ONG ID</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="ong_id" value={formData.ong_id} onChange={handleChange} placeholder="Enter NGO ID" sx={{ bgcolor: 'white' }} />
                        </Box>
                    )}

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveUser} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save & Create Profile</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}