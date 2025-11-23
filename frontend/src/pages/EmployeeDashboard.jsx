import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Avatar, InputBase, Grid, Button, LinearProgress, Link
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Folder, CheckCircleOutline, AccountCircle, 
    MonetizationOn, VolunteerActivism
} from '@mui/icons-material';
import { useRoleProtection } from '../hooks/useRoleProtection'; // CRITICAL: Import the protection hook

// --- DUMMY DATA (Simulates data from vw_employee_workload_analysis and vw_approval_workflow_status) ---
const projects = [
    { name: 'Clean Water Initiative', status: 'Active', progress: 75, color: '#10B981', icon: '💧' },
    { name: 'Rural School Construction', status: 'Active', progress: 40, color: '#10B981', icon: '🏫' },
    { name: 'Mobile Health Clinic', status: 'On Hold', progress: 92, color: '#F59E0B', icon: '🏥' },
];

const approvals = [
    { type: 'Expense Report', from: 'John Doe', date: 'Oct 26' },
    { type: 'Leave Request', from: 'Jane Smith', date: 'Oct 25' },
];

const budgetChanges = [
    { name: 'Clean Water Initiative', date: 'Oct 25, 2023', amount: 5000, type: 'credit' },
    { name: 'Rural School Construction', date: 'Oct 24, 2023', amount: 1200, type: 'debit' },
    { name: 'Mobile Health Clinic', date: 'Oct 22, 2023', amount: 2500, type: 'credit' },
];

// --- STYLE CONSTANTS ---
const drawerWidth = 80; 
const primaryColor = '#FF3F01';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true, link: '/dashboard/employee' }, 
    { text: 'Projects', icon: <Folder />, link: '#' }, 
    { text: 'Approvals', icon: <CheckCircleOutline />, link: '#' }, 
    { text: 'Profile', icon: <AccountCircle />, link: '#' }, 
    { text: 'Budget', icon: <MonetizationOn />, link: '#' }, 
];


export default function EmployeeDashboard() { // Employee Dashboard Component
    useRoleProtection('EMPLOYEE'); // Apply the role protection hook

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; } // Hook handles full redirect if unauthorized
        
        const storedData = localStorage.getItem('user_data');
        if (storedData) setUserData(JSON.parse(storedData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getUserInitials = () => {
        return userData?.username ? userData.username.substring(0, 2).toUpperCase() : 'EM';
    };

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* 1. SIDEBAR NAVIGATION (Simplified, icon-only menu) */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#FFFFFF', p: 1.5, alignItems: 'center' },
                }}
                variant="permanent"
                anchor="left"
            >
                {/* Logo Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 1 }}>
                    <Box sx={{ bgcolor: primaryColor, borderRadius: 2, p: 1 }}>
                        <VolunteerActivism sx={{ color: '#FFFFFF', fontSize: 30 }} />
                    </Box>
                </Box>
                
                {/* Navigation Links */}
                <List sx={{ width: '100%' }}>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton 
                                sx={{ 
                                    borderRadius: 2, 
                                    flexDirection: 'column', 
                                    py: 1.5,
                                    bgcolor: item.active ? '#FFF0EB' : 'transparent', 
                                    color: item.active ? primaryColor : '#64748B', 
                                    '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } 
                                }}
                                onClick={() => navigate(item.link)}
                                title={item.text} // Tooltip/title for icon
                            >
                                <ListItemIcon sx={{ color: item.active ? primaryColor : '#64748B', minWidth: 0 }}>{item.icon}</ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* 2. MAIN CONTENT AREA */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300, borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                        <IconButton sx={{ p: '10px' }}><Search /></IconButton>
                        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search..." />
                    </Paper>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><Notifications /></IconButton>
                        <IconButton><Settings /></IconButton>
                        <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', cursor: 'pointer' }} onClick={handleLogout}>
                            {getUserInitials()}
                        </Avatar>
                    </Box>
                </Box>

                {/* DASHBOARD HEADER */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Welcome back, {userData?.username || 'Employee'}!</Typography>
                </Box>

                {/* MAIN CONTENT GRID */}
                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                    {/* LEFT COLUMN: Projects and Budget */}
                    <Grid item xs={12} md={8}>
                        {/* Supervised Projects */}
                        <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>My Supervised Projects</Typography>
                            <List disablePadding>
                                {projects.map((project, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 2, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>{project.name}</Typography>
                                            <Typography variant="caption" sx={{ color: project.color }}>
                                                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: project.color, display: 'inline-block', mr: 1 }} />
                                                {project.status}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: 150, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress variant="determinate" value={project.progress} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} color={project.color === '#10B981' ? 'success' : 'warning'} />
                                            <Typography variant="body2" fontWeight={600}>{project.progress}%</Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        {/* Recent Budget Changes */}
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>Recent Budget Changes</Typography>
                            <List disablePadding>
                                {budgetChanges.map((change, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 1.5, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>{change.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{change.date}</Typography>
                                        </Box>
                                        <Typography variant="body1" fontWeight={700} color={change.type === 'credit' ? 'success.main' : 'error.main'}>
                                            {change.type === 'credit' ? `+$${change.amount.toLocaleString()}` : `-$${change.amount.toLocaleString()}`}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Pending Approvals */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>Pending Approvals</Typography>
                            {approvals.map((item, index) => (
                                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body1" fontWeight={600}>{item.type}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.date}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>from {item.from}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button variant="contained" size="small" sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' } }}>Approve</Button>
                                        <Button variant="outlined" size="small" color="inherit">Deny</Button>
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