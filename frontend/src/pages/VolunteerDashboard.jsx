import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, // <-- FIX: ListItemText added here
    Avatar, InputBase, Grid, Link, Chip, Button 
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Folder, CalendarToday, People, Star, HelpOutline, AccessTimeFilled,
    VolunteerActivism
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRoleProtection } from '../hooks/useRoleProtection'; // CRITICAL: Import the protection hook

// --- DUMMY DATA ---
const hoursLog = [ // Simulate Hours/Days contributed data
    { month: 'Jan', hours: 5 }, { month: 'Feb', hours: 12 }, { month: 'Mar', hours: 18 },
    { month: 'Apr', hours: 15 }, { month: 'May', hours: 25 }, { month: 'Jun', hours: 30 },
];

const assignedProjects = [
    { name: 'Community Garden Initiative', status: 'Active', link: '#' },
    { name: 'Annual Fundraising Gala', status: 'Planning Phase', link: '#' },
    { name: 'Local Shelter Support Drive', status: 'Active', link: '#' },
];

const specialties = ['Event Planning', 'First Aid', 'Marketing', 'Public Speaking'];

const upcomingActivities = [
    { date: 'JUL 28', event: 'Gala Planning Committee Meeting', time: '10:00 AM', location: 'Online' },
    { date: 'AUG 03', event: 'Community Garden Day', time: '9:00 AM', location: 'Central Park' },
];

// --- STYLE CONSTANTS ---
const drawerWidth = 80; 
const primaryColor = '#FF3F01';
const primaryTextColor = '#333333';

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true, link: '/dashboard/volunteer' }, 
    { text: 'Projects', icon: <Folder />, link: '#' }, 
    { text: 'Calendar', icon: <CalendarToday />, link: '#' }, 
    { text: 'Profile', icon: <People />, link: '#' }, 
    { text: 'Impact', icon: <Star />, link: '#' }, 
];

export default function VolunteerDashboard() { // Volunteer Dashboard Component
    useRoleProtection('VOLUNTEER'); // Apply the role protection hook

    const navigate = useNavigate();
    const [userData, setUserData] = useState({ username: 'Maria', role: 'Volunteer' }); // Placeholder user data
    const [userInitials, setUserInitials] = useState('MA');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { return; } 
        
        const storedData = localStorage.getItem('user_data');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);
            setUserInitials(parsedData.username ? parsedData.username.substring(0, 2).toUpperCase() : 'VO');
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getUserInitials = () => {
        return userData?.username ? userData.username.substring(0, 2).toUpperCase() : 'VO';
    };

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* 1. SIDEBAR NAVIGATION (Icon-only) */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.5, alignItems: 'center' },
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
                                    color: item.active ? primaryColor : primaryTextColor, 
                                    '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } 
                                }}
                                onClick={() => navigate(item.link)}
                                title={item.text}
                            >
                                <ListItemIcon sx={{ color: item.active ? primaryColor : primaryTextColor, minWidth: 0 }}>{item.icon}</ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Help Icon at Bottom */}
                <Box sx={{ mt: 'auto', mb: 1 }}>
                     <IconButton title="Help" sx={{ color: primaryTextColor, '&:hover': { color: primaryColor } }}>
                        <HelpOutline />
                     </IconButton>
                </Box>
            </Drawer>

            {/* 2. MAIN CONTENT AREA */}
            <Box component="main" sx={{ flexGrow: 1, p: 4, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, gap: 2 }}>
                    <IconButton><Notifications /></IconButton>
                    <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', cursor: 'pointer' }} onClick={handleLogout}>
                        {getUserInitials()}
                    </Avatar>
                </Box>

                {/* DASHBOARD HEADER */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h3" fontWeight={800} color={primaryTextColor}>Welcome, {userData?.username || 'Maria'}!</Typography>
                </Box>

                {/* KPI Cards (Total Hours & Projects Completed) */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>Total Hours Volunteered</Typography>
                            <Typography variant="h3" fontWeight={800} color={primaryColor}>128</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight={600} gutterBottom>Projects Completed</Typography>
                            <Typography variant="h3" fontWeight={800} color={primaryColor}>5</Typography>
                        </Paper>
                    </Grid>
                    {/* Placeholder for remaining space */}
                    <Grid item xs={12} md={6} />
                </Grid>

                {/* MAIN CONTENT GRID */}
                <Grid container spacing={4} sx={{ flexGrow: 1 }}>
                    {/* LEFT COLUMN: Projects & Hours Chart */}
                    <Grid item xs={12} md={8}>
                        {/* My Assigned Projects */}
                        <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>My Assigned Projects</Typography>
                            <List disablePadding>
                                {assignedProjects.map((project, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 2, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>{project.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">Status: <Box component="span" sx={{ color: project.status === 'Active' ? '#10B981' : primaryColor }}>{project.status}</Box></Typography>
                                        </Box>
                                        <Button size="small" sx={{ color: primaryColor, textTransform: 'none' }} onClick={() => navigate(project.link)}>View Details</Button>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        {/* Hours/Days Contributed Chart (vw_volunteer_expertise_mapping) */}
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>Hours Contributed (Last 6 Months)</Typography>
                            <Box sx={{ height: 250, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hoursLog} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="hours" stroke={primaryColor} fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Specialties & Activities */}
                    <Grid item xs={12} md={4}>
                        {/* My Specialties (vw_volunteer_expertise_mapping) */}
                        <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                            <Typography variant="h5" fontWeight={700} mb={2}>My Specialties</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {specialties.map((spec, index) => (
                                    <Chip 
                                        key={index} 
                                        label={spec} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: primaryColor + '10', 
                                            color: primaryColor, 
                                            fontWeight: 600 
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>

                        {/* Upcoming Activities */}
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight={700} mb={3}>Upcoming Activities</Typography>
                            <List disablePadding>
                                {upcomingActivities.map((activity, index) => (
                                    <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                                        <Box sx={{ mr: 2, textAlign: 'center', color: primaryColor }}>
                                            <Typography variant="h5" fontWeight={800} lineHeight={1}>{activity.date.split(' ')[1]}</Typography>
                                            <Typography variant="caption" fontWeight={600} display="block" lineHeight={1}>{activity.date.split(' ')[0]}</Typography>
                                        </Box>
                                        <ListItemText 
                                            primary={<Typography variant="body1" fontWeight={600}>{activity.event}</Typography>} 
                                            secondary={`${activity.time} - ${activity.location}`} 
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button fullWidth variant="text" sx={{ color: primaryColor, mt: 2, textTransform: 'none' }}>View Calendar</Button>
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