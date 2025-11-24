import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Avatar, InputBase, Button, Chip, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, MenuItem, Switch, Tabs, Tab,
    CircularProgress // <--- IMPORTANTE: Agregado para el spinner
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Business, Folder, People, VolunteerActivism,
    Add, Edit, Close, Badge, SupervisorAccount, Loyalty, Group, Assessment, ReceiptLong, Tune
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

// Roles matching Oracle constraints (uppercase)
const roles = ['ADMIN', 'EMPLOYEE', 'VOLUNTEER', 'REPRESENTATIVE'];

export default function UserManagement() {
    const navigate = useNavigate();
    const [userInitials] = useState('AD');
    
    // --- STATE ---
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Admin, etc.
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // Object for edit/create

    // --- API CALLS ---

    // Fetch users from backend
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

    // Load users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Create or Update User
    const handleSaveUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (currentUser.id) {
                // UPDATE (PUT)
                await axios.put('http://127.0.0.1:8000/api/admin/users/update/', currentUser, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE (POST)
                await axios.post('http://127.0.0.1:8000/api/admin/users/', currentUser, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchUsers(); // Refresh list
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user. See console for details.");
        }
    };

    // Toggle Active Status
    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        // Find user object to send full data for update
        const userToUpdate = users.find(u => u.id === id);
        if (!userToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/users/update/', { 
                 ...userToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    const handleOpenDrawer = (user = null) => {
        // Default role is EMPLOYEE for new users
        setCurrentUser(user ? { ...user } : { name: '', email: '', role: 'EMPLOYEE', status: 'Active' });
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setCurrentUser(null);
    };

    // --- FILTERING LOGIC ---
    const getFilteredUsers = () => {
        let filtered = users;

        // Filter by Role Tab
        if (currentTab !== 0) {
            const roleMap = { 1: 'ADMIN', 2: 'EMPLOYEE', 3: 'VOLUNTEER', 4: 'REPRESENTATIVE' };
            filtered = filtered.filter(u => u.role === roleMap[currentTab]);
        }

        // Filter by Search
        if (searchTerm) {
            filtered = filtered.filter(u => 
                (u.name && u.name.toLowerCase().includes(searchTerm)) || 
                (u.email && u.email.toLowerCase().includes(searchTerm))
            );
        }
        return filtered;
    };

    // Helper for Status Chip
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
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* SIDEBAR NAVIGATION */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { 
                        width: drawerWidth, 
                        boxSizing: 'border-box', 
                        borderRight: 'none', 
                        bgcolor: '#FFFFFF', 
                        p: 2,
                        '&::-webkit-scrollbar': { display: 'none' }
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 2 }}>
                    <VolunteerActivism sx={{ color: primaryColor, fontSize: 30 }} />
                    <Typography variant="h6" fontWeight={800} color="text.primary">RedRomero</Typography>
                </Box>
                
                <List>
                    {navItems.map((item, index) => {
                        if (item.header) {
                            return (
                                <Typography key={index} variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 2, mt: 2, mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                    {item.header}
                                </Typography>
                            );
                        }
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton 
                                    sx={{ 
                                        borderRadius: 2, 
                                        bgcolor: item.active ? '#FFF0EB' : 'transparent', 
                                        color: item.active ? primaryColor : '#64748B', 
                                        '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } 
                                    }}
                                    onClick={() => item.link && navigate(item.link)}
                                >
                                    <ListItemIcon sx={{ color: item.active ? primaryColor : '#64748B', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                    <ListItemText primaryTypographyProps={{ fontWeight: item.active ? 700 : 500, fontSize: '0.9rem' }} primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>

            {/* MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><Notifications /></IconButton>
                        <IconButton><Settings /></IconButton>
                        <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', cursor: 'pointer' }} onClick={handleLogout}>
                            {userInitials}
                        </Avatar>
                    </Box>
                </Box>

                {/* HEADER & ACTIONS */}
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
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', flexGrow: 1 }}>
                    
                    {/* Search & Filters */}
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
                            <Tab label="Project Manager" /> {/* Mapped to Employee/Manager in logic */}
                            <Tab label="Volunteer" />
                            <Tab label="Representative" />
                        </Tabs>
                    </Box>

                    {/* USERS TABLE */}
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
                                                {/* Edit Action */}
                                                <IconButton size="small" onClick={() => handleOpenDrawer(user)}>
                                                    <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                                </IconButton>
                                                {/* Toggle Status Action (Switch) */}
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
            </Box>

            {/* RIGHT DRAWER (CREATE / EDIT USER) */}
            <Drawer
                anchor="right"
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                PaperProps={{ sx: { width: 400, p: 4 } }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight={800} color="#1E293B">
                        {currentUser?.id ? 'Edit User' : 'New User'}
                    </Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>

                <Box component="form" display="flex" flexDirection="column" gap={3}>
                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">User Name</Typography>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small" 
                            value={currentUser?.name || ''} 
                            onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                        />
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">Email</Typography>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            size="small" 
                            value={currentUser?.email || ''}
                            onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                        />
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">Role</Typography>
                        <TextField 
                            select 
                            fullWidth 
                            variant="outlined" 
                            size="small"
                            value={currentUser?.role || 'EMPLOYEE'}
                            onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2} mt={4}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={handleSaveUser}
                            sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#D93602' } }}
                        >
                            Save Changes
                        </Button>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            onClick={handleCloseDrawer}
                            sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700, '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8F9FA' } }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Drawer>

        </Box>
    );
}