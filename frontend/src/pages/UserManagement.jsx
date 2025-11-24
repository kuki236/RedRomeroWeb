import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Avatar, InputBase, Button, Chip, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, MenuItem, Switch, Tabs, Tab, Grid,CircularProgress
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Business, Folder, People, VolunteerActivism,
    Add, Edit, Close, Badge, SupervisorAccount, Loyalty, Group, Assessment, ReceiptLong, Tune,
    Visibility, VisibilityOff
} from '@mui/icons-material';

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const drawerWidth = 280;

// Sidebar Navigation Items
const navItems = [
    { header: 'General' },
    { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard/admin' },
    { header: 'Gestión Principal' },
    { text: 'Manage ONGs', icon: <Business />, link: '/admin/ongs' },
    { text: 'Manage Projects', icon: <Folder />, link: '/admin/proyectos' },
    { header: 'Fuerza Laboral' },
    { text: 'Employees', icon: <Badge />, link: '/admin/empleados' },
    { text: 'Volunteers', icon: <VolunteerActivism />, link: '/admin/voluntarios' },
    { text: 'Representatives', icon: <SupervisorAccount />, link: '/admin/representantes' },
    { header: 'Finanzas & Usuarios' },
    { text: 'Donors', icon: <Loyalty />, link: '/admin/donantes' },
    { text: 'Users', icon: <Group />, link: '/admin/usuarios', active: true },
    { header: 'Sistema' },
    { text: 'Reports & Analytics', icon: <Assessment />, link: '/admin/reportes' },
    { text: 'Audit Logs', icon: <ReceiptLong />, link: '/admin/auditoria' },
    { text: 'Configuration', icon: <Tune />, link: '/admin/config' },
];

// Match Oracle constraints
const roles = ['ADMIN', 'EMPLOYEE', 'VOLUNTEER', 'REPRESENTATIVE'];

export default function UserManagement() {
    const navigate = useNavigate();
    const [userInitials] = useState('AD');
    
    // --- STATE ---
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0); 
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Dynamic Form State
    const [formData, setFormData] = useState({
        id: null,
        username: '', // System login
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        birth_date: '', // YYYY-MM-DD
        role: 'EMPLOYEE',
        ong_id: '', // Only for Representative
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
            if (error.response?.status === 401) navigate('/');
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
                // UPDATE (PUT) - Updates basic info via package + status
                // Note: For full profile updates, a separate endpoint might be needed in future
                await axios.put('http://127.0.0.1:8000/api/admin/users/update/', {
                    id: formData.id,
                    name: formData.username, // Update system username
                    role: formData.role,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE (POST) - Calls create_full_user
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
    const handleLogout = () => { localStorage.clear(); navigate('/'); };
    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    // Handle input changes in Drawer
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (user = null) => {
        if (user) {
            // Edit Mode: Approximate first/last name split for display since list view gives full name
            const names = user.name ? user.name.split(' ') : ['',''];
            setFormData({
                id: user.id,
                username: user.name, // Using full name as username/display placeholder
                first_name: names[0] || '',
                last_name: names.slice(1).join(' ') || '',
                email: user.email,
                role: user.role,
                status: user.status,
                password: '', // Don't show password
                phone: '', address: '', birth_date: '', ong_id: '' // Data not in list view, would need detail fetch
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
            <Chip label={status} size="small" sx={{ bgcolor: isActive ? '#E8F5E9' : '#FFEBEE', color: isActive ? '#2E7D32' : '#C62828', fontWeight: 700, fontSize: '0.75rem' }} />
        );
    };

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* SIDEBAR */}
            <Drawer sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#FFFFFF', p: 2 } }} variant="permanent" anchor="left">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 2 }}>
                    <VolunteerActivism sx={{ color: primaryColor, fontSize: 30 }} />
                    <Typography variant="h6" fontWeight={800} color="text.primary">RedRomero</Typography>
                </Box>
                <List>
                    {navItems.map((item, index) => {
                        if (item.header) return <Typography key={index} variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 2, mt: 2, mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>{item.header}</Typography>;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton sx={{ borderRadius: 2, bgcolor: item.active ? '#FFF0EB' : 'transparent', color: item.active ? primaryColor : '#64748B', '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } }} onClick={() => item.link && navigate(item.link)}>
                                    <ListItemIcon sx={{ color: item.active ? primaryColor : '#64748B', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: item.active ? 700 : 500, fontSize: '0.9rem' }} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>

            {/* MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><Notifications /></IconButton><IconButton><Settings /></IconButton><Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold' }}>{userInitials}</Avatar>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box><Typography variant="h4" fontWeight={800} color="#1E293B">User Management</Typography></Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDrawer()} sx={{ bgcolor: primaryColor, fontWeight: 700 }}>Create New User</Button>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', flexGrow: 1 }}>
                    <Box sx={{ mb: 3 }}>
                        <InputBase sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} placeholder="Search..." value={searchTerm} onChange={handleSearch} startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} />
                        <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" sx={{ borderBottom: 1, borderColor: 'divider', '& .Mui-selected': { color: primaryColor }, '& .MuiTabs-indicator': { backgroundColor: primaryColor } }}>
                            <Tab label="All Roles" /><Tab label="Admin" /><Tab label="Project Manager" /><Tab label="Volunteer" /><Tab label="Representative" />
                        </Tabs>
                    </Box>
                    
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
                                    <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} sx={{ color: primaryColor }} /></TableCell></TableRow>
                                ) : (
                                    getFilteredUsers().map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{user.name}</TableCell>
                                            <TableCell sx={{ color: '#64748B' }}>{user.email}</TableCell>
                                            <TableCell sx={{ color: '#1E293B' }}>{user.role}</TableCell>
                                            <TableCell>{getStatusChip(user.status)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDrawer(user)}><Edit fontSize="small" sx={{ color: '#64748B' }} /></IconButton>
                                                <Switch size="small" checked={user.status === 'Active'} onChange={() => handleToggleStatus(user.id, user.status)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor } }} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* DYNAMIC DRAWER */}
            <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: 450, p: 4 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.id ? 'Edit User' : 'New User'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* -- SECTION 1: SYSTEM ACCESS -- */}
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

                    {/* -- SECTION 2: PERSONAL PROFILE -- */}
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

                    {/* -- CONDITIONAL FIELDS: REPRESENTATIVE -- */}
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