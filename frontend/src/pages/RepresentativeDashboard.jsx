import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Avatar, InputBase, Grid, Button, Link
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Folder, People, Favorite, VolunteerActivism,
    Add, CheckCircleOutline, Description,
    // CRÍTICO: Agregar MonetizationOn aquí
    AttachMoney, Handshake, TrendingUp, MonetizationOn 
} from '@mui/icons-material';
import { useRoleProtection } from '../hooks/useRoleProtection'; // CRITICAL: Import the protection hook

// --- DUMMY DATA (Simulates data for a single NGO) ---
const kpis = [
    { title: 'Active Projects', value: '12', change: '+2 from last month', type: 'info' },
    { title: 'Total Donations (Q2)', value: '$48,230', change: '+5.2% from last quarter', type: 'success' },
    { title: 'Active Volunteers', value: '87', change: '-1.1% from last month', type: 'warning' },
];

const projects = [
    { name: 'Community Garden Initiative', status: 'Active', volunteers: 15, statusColor: '#10B981' },
    { name: 'Youth Mentorship Program', status: 'Completed', volunteers: 22, statusColor: '#FF3F01' },
    { name: 'Local Shelter Support', status: 'Pending', volunteers: 8, statusColor: '#F59E0B' },
];

const pendingActions = [
    { type: 'New Volunteer', detail: 'Jane Doe', action: ['Accept', 'Reject'], icon: <People /> },
    { type: 'Project Report', detail: 'Garden Initiative Q2', action: ['Review'], icon: <Description /> },
    // CORREGIDO: El icono MonetizationOn ya está disponible
    { type: 'Expense Claim', detail: '$150 - Supplies', action: ['Review'], icon: <MonetizationOn /> }, 
];

// --- STYLE CONSTANTS ---
const drawerWidth = 200; 
const primaryColor = '#FF3F01';
const primaryTextColor = '#333333';

// Navigation items matching the image sidebar
const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon sx={{ color: primaryColor }} />, active: true, link: '/dashboard/representative' }, 
    { text: 'Projects', icon: <Folder />, link: '/representative/proyectos' }, 
    { text: 'Volunteers', icon: <People />, link: '/representative/voluntarios' }, 
    { text: 'Donors', icon: <Favorite />, link: '/representative/donaciones' }, 
    { text: 'Settings', icon: <Settings />, link: '/representative/settings' }, 
];

export default function RepresentativeDashboard() { // Representative Dashboard Component
    useRoleProtection('REPRESENTATIVE'); // Apply the role protection hook

    const navigate = useNavigate();
    const [userData, setUserData] = useState({ username: 'Alex', role: 'Representative' }); // Placeholder user data for layout
    const [userInitials, setUserInitials] = useState('AR');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { return; } 
        
        const storedData = localStorage.getItem('user_data');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);
            setUserInitials(parsedData.username ? parsedData.username.substring(0, 2).toUpperCase() : 'RE');
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    
    // --- Render logic for KPI cards ---
    const renderKPIs = kpis.map((kpi, i) => {
        const changeColor = kpi.change.startsWith('+') ? 'green' : 'red';
        return (
            <Paper key={i} elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', border: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>{kpi.title}</Typography>
                <Typography variant="h4" fontWeight={700} color={primaryTextColor}>{kpi.value}</Typography>
                <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600 }}>{kpi.change}</Typography>
            </Paper>
        );
    });

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* 1. SIDEBAR NAVIGATION */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1 },
                }}
                variant="permanent"
                anchor="left"
            >
                {/* Logo and Subtitle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2, px: 1 }}>
                    <VolunteerActivism sx={{ color: primaryColor, fontSize: 20 }} />
                    <Box>
                        <Typography variant="body1" fontWeight={700} color={primaryTextColor}>RedRomero</Typography>
                        <Typography variant="caption" color="text.secondary" lineHeight={1}>NGO Management</Typography>
                    </Box>
                </Box>
                
                {/* Navigation Links */}
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton 
                                sx={{ 
                                    borderRadius: 2, 
                                    py: 1.5,
                                    bgcolor: item.active ? '#FFF0EB' : 'transparent', 
                                    color: item.active ? primaryColor : primaryTextColor, 
                                    '&:hover': { bgcolor: '#FFF0EB' } 
                                }}
                                onClick={() => navigate(item.link)}
                            >
                                <ListItemIcon sx={{ color: item.active ? primaryColor : primaryTextColor, minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <Typography variant="body2" fontWeight={item.active ? 700 : 500}>{item.text}</Typography>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                {/* Help Section */}
                <Box sx={{ mt: 'auto', p: 1, textAlign: 'left' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: primaryColor } }}>Help</Typography>
                </Box>

            </Drawer>

            {/* 2. MAIN CONTENT AREA */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR: Search and User Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 250, borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                        <IconButton sx={{ p: '10px' }}><Search /></IconButton>
                        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search..." />
                    </Paper>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><Notifications /></IconButton>
                        <IconButton><Settings /></IconButton>
                        <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', cursor: 'pointer', '&:hover': { bgcolor: '#D93602' }, width: 35, height: 35, fontSize: '0.8rem' }} onClick={handleLogout}>
                            {userInitials}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" fontWeight={600} color={primaryTextColor}>{userData?.username || 'Alex Romero'}</Typography>
                            <Typography variant="caption" color="text.secondary">Representative</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* DASHBOARD HEADER */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight={800} color={primaryTextColor}>Welcome, {userData?.username || 'Alex'}!</Typography>
                    <Typography variant="body1" color="text.secondary">Here's a summary of your organization's activity.</Typography>
                </Box>

                {/* MAIN CONTENT GRID */}
                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                    {/* LEFT SIDE: KPIs and Project Status */}
                    <Grid item xs={12} md={8}>
                        {/* KPI Row */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {renderKPIs.slice(0, 3).map((kpi, i) => (
                                <Grid item xs={12} sm={4} key={i}>
                                    {kpi}
                                </Grid>
                            ))}
                        </Grid>
                        
                        {/* Project Status Table */}
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h5" fontWeight={700} color={primaryTextColor}>Project Status</Typography>
                                <Button variant="contained" sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' } }}>View All</Button>
                            </Box>
                            <Grid container spacing={2} sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                                <Grid item xs={6}><Typography variant="body2" fontWeight={600} color="text.secondary">Project Name</Typography></Grid>
                                <Grid item xs={2}><Typography variant="body2" fontWeight={600} color="text.secondary">Status</Typography></Grid>
                                <Grid item xs={2}><Typography variant="body2" fontWeight={600} color="text.secondary">Volunteers</Typography></Grid>
                                <Grid item xs={2}><Typography variant="body2" fontWeight={600} color="text.secondary">Actions</Typography></Grid>
                            </Grid>
                            <List disablePadding>
                                {projects.map((project, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 1.5, borderBottom: '1px solid #fafafa', '&:last-child': { borderBottom: 'none' } }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={6}>
                                                <Typography variant="body1" fontWeight={500}>{project.name}</Typography>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography variant="caption" sx={{ 
                                                    color: project.statusColor, 
                                                    bgcolor: project.statusColor + '10', // Light background tint
                                                    px: 1, py: 0.5, borderRadius: 1
                                                }}>{project.status}</Typography>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography variant="body2" color="text.secondary">{project.volunteers}</Typography>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Button size="small" sx={{ color: primaryColor, textTransform: 'none' }}>Details</Button>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                    </Grid>

                    {/* RIGHT SIDE: Pending Approvals & Actions */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: 3, border: `1px solid ${primaryColor}` }}>
                            {/* Pending Approvals (Big Card) */}
                            <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid #eee' }}>
                                <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>Pending Approvals</Typography>
                                <Typography variant="h3" fontWeight={800} color={primaryColor}>4</Typography>
                                <Typography variant="body2" color="text.secondary">Action required</Typography>
                            </Box>
                            
                            {/* Pending Actions List */}
                            <Typography variant="h6" fontWeight={700} mb={3}>Pending Actions</Typography>
                            {pendingActions.map((action, index) => (
                                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #fafafa', '&:last-child': { borderBottom: 'none' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ mr: 1, color: primaryColor }}>{action.icon}</Box>
                                        <Typography variant="body1" fontWeight={600}>{action.type}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, ml: 3 }}>{action.detail}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, ml: 3 }}>
                                        {action.action.map((act, i) => (
                                            <Button 
                                                key={i} 
                                                variant={act === 'Review' || act === 'Accept' ? 'contained' : 'outlined'} 
                                                size="small" 
                                                sx={{ 
                                                    // The colors here are generic, for actual use, map status colors.
                                                    bgcolor: act === 'Accept' ? '#10B981' : (act === 'Reject' ? '#EF4444' : primaryColor), 
                                                    color: act === 'Reject' ? 'white' : 'white',
                                                    '&:hover': { bgcolor: act === 'Accept' ? '#0A996A' : '#D93602' }
                                                }}
                                            >
                                                {act}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>

                {/* FOOTER SECTION */}
                <Box sx={{ py: 3, px: 2, mt: 'auto', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {'Copyright © '}
                        <Link color="inherit" href="#">RedRomero</Link>{' '}
                        {new Date().getFullYear()}
                        {'. All rights reserved.'}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}