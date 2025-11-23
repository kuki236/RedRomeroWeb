import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios'; 
import { 
    Box, CssBaseline, Drawer, List, Typography, IconButton, 
    Paper, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Avatar, InputBase, Button, Grid, Link, Chip, LinearProgress
} from '@mui/material';
import { 
    Search, Notifications, Settings, 
    Dashboard as DashboardIcon, Business, Folder, People, VolunteerActivism, Description,
    Add, MonetizationOn, PeopleAlt, Visibility, Edit, FileDownload, ArrowBackIos, ArrowForwardIos
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { useRoleProtection } from '../hooks/useRoleProtection';

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const pieColors = ['#10B981', '#FF3F01', '#F59E0B']; 

// --- INITIAL STATE / LOADING STRUCTURE ---
const initialKpiData = [
    { title: 'PROYECTOS ACTIVOS', value: '...', trend: 'Cargando...', icon: <Folder sx={{ color: primaryColor }} />, trendColor: successColor },
    { title: 'DONACIONES ESTE MES', value: '...', trend: 'Cargando...', icon: <MonetizationOn sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'VOLUNTARIOS ACTIVOS', value: '...', trend: 'Cargando...', icon: <PeopleAlt sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'ONGS REGISTRADAS', value: '...', trend: 'Cargando...', icon: <Business sx={{ color: primaryColor }} />, trendColor: 'text.secondary' },
];

// --- STATIC ELEMENTS ---
const drawerWidth = 260;
const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true, link: '/dashboard/admin' }, 
    { text: 'NGOs', icon: <Business />, link: '#' }, 
    { text: 'Projects', icon: <Folder />, link: '#' }, 
    { text: 'People', icon: <People />, link: '#' }, 
    { text: 'Donations', icon: <VolunteerActivism />, link: '#' }, 
    { text: 'Reports', icon: <Description />, link: '#' }
];


export default function AdminDashboard() {
    useRoleProtection('ADMIN'); 

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState('');
    
    // --- DYNAMIC DATA STATES ---
    const [kpiData, setKpiData] = useState(initialKpiData);
    const [projectData, setProjectData] = useState([]);
    const [chartData, setChartData] = useState({ trends: [], pie: [] });
    const [loading, setLoading] = useState(true);

    // Helper to get color based on project state (used in table)
    const getStateStyles = (state) => {
        // NOTE: States come capitalized from the Django view now: ACTIVO, REVISIÓN, PENDIENTE
        switch (state) {
            case 'ACTIVO': return { color: successColor, bgcolor: '#E8F5E9' };
            case 'REVISIÓN': 
            case 'PENDIENTE': return { color: '#F59E0B', bgcolor: '#FFFBEB' };
            case 'COMPLETADO': return { color: '#3B82F6', bgcolor: '#DBEAFE' };
            default: return { color: '#333333', bgcolor: '#FFFFFF' };
        }
    };

    // Helper to calculate progress percentage for the bar
    const getProgressValue = (label) => {
        if (label.includes('%')) return parseFloat(label);
        if (label.includes('días restantes')) {
             const daysRemaining = parseFloat(label);
             const maxDays = 500; // Define a max to calculate a relative percentage
             return Math.max(0, 100 - (daysRemaining / maxDays) * 100);
        }
        return 0;
    };

    // --- FUNCTION: FETCH DATA FROM DJANGO BACKEND ---
    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard-data/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data;
            
            // 1. Update KPI Data
            setKpiData([
                { 
                    title: 'PROYECTOS ACTIVOS', 
                    value: data.active_projects.value, 
                    trend: data.active_projects.trend, 
                    icon: <Folder sx={{ color: primaryColor }} />, 
                    trendColor: data.active_projects.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'DONACIONES ESTE MES', 
                    value: `$${data.monthly_donations.value}`, 
                    trend: data.monthly_donations.trend, 
                    icon: <MonetizationOn sx={{ color: successColor }} />, 
                    trendColor: data.monthly_donations.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'VOLUNTARIOS ACTIVOS', 
                    value: data.active_volunteers.value, 
                    trend: data.active_volunteers.trend, 
                    icon: <PeopleAlt sx={{ color: successColor }} />, 
                    trendColor: data.active_volunteers.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'ONGS REGISTRADAS', 
                    value: data.registered_ngos.value, 
                    trend: data.registered_ngos.trend, 
                    icon: <Business sx={{ color: primaryColor }} />, 
                    trendColor: 'text.secondary' 
                },
            ]);

            // 2. Update Table Data
            setProjectData(data.active_projects_table);

            // 3. Update Chart Data
            setChartData({
                trends: data.donation_trends.map(row => ({
                    name: row.name, // e.g., 'Jan', 'Feb'
                    value: row.value // e.g., 20, 45 (Donation amount)
                })),
                pie: data.project_status_pie.map((item, index) => ({
                    name: item.name,
                    value: item.value,
                    color: pieColors[index % pieColors.length]
                }))
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.clear();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };


    // --- AUTH CHECK & INITIAL LOAD ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedData = localStorage.getItem('user_data');

        if (!token) {
             navigate('/'); 
             return;
        }
        
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                setUserData(parsedData);
                setUserRole(parsedData.role);
            } catch (e) {
                localStorage.clear();
            }
        }
        
        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getUserInitials = () => {
        return userData?.username ? userData.username.substring(0, 2).toUpperCase() : 'AD';
    };


    // --- RENDERING ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h5" color={primaryColor}>Cargando datos del dashboard desde Oracle...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#F8F9FA' }}>
            <CssBaseline />

            {/* 1. SIDEBAR NAVIGATION (AS IS) */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#FFFFFF', p: 2 },
                }}
                variant="permanent"
                anchor="left"
            >
                {/* Logo Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 2 }}>
                    <VolunteerActivism sx={{ color: primaryColor, fontSize: 30 }} />
                    <Typography variant="h6" fontWeight={800} color="text.primary">RedRomero</Typography>
                </Box>
                
                {/* Navigation Links */}
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton 
                                sx={{ borderRadius: 2, bgcolor: item.active ? '#FFF0EB' : 'transparent', color: item.active ? primaryColor : '#64748B', '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } }}
                                onClick={() => navigate(item.link)}
                            >
                                <ListItemIcon sx={{ color: item.active ? primaryColor : '#64748B', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primaryTypographyProps={{ fontWeight: item.active ? 700 : 500 }} primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* 2. MAIN CONTENT AREA */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR (AS IS) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                        <IconButton sx={{ p: '10px' }}><Search /></IconButton>
                        <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search NGOs, projects, people..." />
                    </Paper>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><Notifications /></IconButton>
                        <IconButton><Settings /></IconButton>
                        <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', cursor: 'pointer', '&:hover': { bgcolor: '#D93602' } }} onClick={handleLogout}>
                            {getUserInitials()}
                        </Avatar>
                    </Box>
                </Box>

                {/* DASHBOARD HEADER (AS IS) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="#1E293B">NGO Management Platform</Typography>
                        <Typography variant="body2" color="text.secondary">Admin Global</Typography>
                    </Box>
                </Box>

                {/* --- START DYNAMIC CONTENT AREA --- */}

                {/* KPI CARDS (4 Cards) */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {kpiData.map((kpi, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                    {kpi.icon}
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">{kpi.title}</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={800} color="#1E293B" mb={0.5}>{kpi.value}</Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ color: kpi.trendColor }}>{kpi.trend}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* CHARTS SECTION (2 Charts) */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Donation Trends (Area Chart) */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>📈 Tendencia de Donaciones 2025</Typography>
                            <Box sx={{ height: 300, width: '100%', minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.trends}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke={primaryColor} fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Project Status (Pie Chart) */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                            <Typography variant="h6" fontWeight={700} mb={2}>📊 Estado de Proyectos</Typography>
                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData.pie} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name" label={(entry) => entry.name}>
                                            {chartData.pie.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* PROJECTS TABLE */}
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700} color="#1E293B">Proyectos Activos ({projectData.length})</Typography>
                        <Box display="flex" gap={1}>
                            <Button variant="outlined" startIcon={<FileDownload />} sx={{ textTransform: 'none', color: primaryColor, borderColor: primaryColor }}>Exportar CSV</Button>
                            <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' }, textTransform: 'none' }}>Nuevo</Button>
                        </Box>
                    </Box>

                    {/* Filters & Search */}
                    <Box display="flex" gap={2} mb={3} alignItems="center">
                        <InputBase 
                            sx={{ p: '5px 10px', flex: 1, border: '1px solid #E2E8F0', borderRadius: 1 }} 
                            placeholder="Buscar proyecto..." 
                            startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                        />
                        <select className="MuiInputBase-input" style={{ padding: 8, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                            <option>Todos</option>
                            <option>Activo</option>
                            <option>Revisión</option>
                        </select>
                        <select className="MuiInputBase-input" style={{ padding: 8, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                            <option>País</option>
                            <option>Perú</option>
                            <option>México</option>
                        </select>
                        <select className="MuiInputBase-input" style={{ padding: 8, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                            <option>Estado</option>
                            <option>Activo</option>
                            <option>Pendiente</option>
                        </select>
                    </Box>

                    {/* Table Structure */}
                    <Grid container spacing={1} sx={{ mb: 1, borderBottom: '2px solid #E2E8F0', fontWeight: 700 }}>
                        <Grid item xs={0.5}><Typography variant="body2">#</Typography></Grid>
                        <Grid item xs={3}><Typography variant="body2">Proyecto</Typography></Grid>
                        <Grid item xs={2.5}><Typography variant="body2">ONG</Typography></Grid>
                        <Grid item xs={2}><Typography variant="body2">Estado</Typography></Grid>
                        <Grid item xs={2}><Typography variant="body2">Progreso</Typography></Grid>
                        <Grid item xs={2}>
                            <Typography variant="body2">Acciones</Typography>
                        </Grid>
                    </Grid>

                    <List disablePadding>
                        {projectData.map((project, index) => {
                            // Ensure project.state is uppercase
                            const statusStyle = getStateStyles(project.state.toUpperCase()); 
                            const progressValue = getProgressValue(project.progressLabel);
                            
                            return (
                                <ListItem key={project.id} disablePadding sx={{ py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={0.5}><Typography variant="body2">{project.id}</Typography></Grid>
                                        <Grid item xs={3}><Typography variant="body2" fontWeight={600}>{project.project}</Typography></Grid>
                                        <Grid item xs={2.5}><Typography variant="body2" color="text.secondary">{project.ngo}</Typography></Grid>
                                        <Grid item xs={2}>
                                            <Chip label={project.state} size="small" sx={{ 
                                                bgcolor: statusStyle.bgcolor, 
                                                color: statusStyle.color, 
                                                fontWeight: 700,
                                                fontSize: '0.7rem'
                                            }} />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="caption" color="text.secondary">{project.progressLabel}</Typography>
                                            {/* Progress bar based on calculated value */}
                                            <LinearProgress variant="determinate" value={progressValue} sx={{ height: 5, borderRadius: 2 }} color="success" />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton size="small" title="Ver"><Visibility fontSize="small" /></IconButton>
                                            <IconButton size="small" title="Editar"><Edit fontSize="small" /></IconButton>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                            );
                        })}
                    </List>

                    {/* Pagination */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                        <Typography variant="body2" color="text.secondary">Mostrando 1-10 de {projectData.length} (total)</Typography>
                        <Box display="flex" gap={1}>
                            <IconButton disabled><ArrowBackIos fontSize="small" /></IconButton>
                            {[1, 2, 3, 4, 5].map(p => (
                                <Button 
                                    key={p} 
                                    size="small" 
                                    variant={p === 1 ? 'contained' : 'outlined'}
                                    sx={{ 
                                        minWidth: 35, 
                                        p: 0, 
                                        bgcolor: p === 1 ? primaryColor : 'transparent',
                                        borderColor: p === 1 ? primaryColor : 'text.secondary',
                                        color: p === 1 ? 'white' : primaryColor
                                    }}
                                >{p}</Button>
                            ))}
                            <IconButton><ArrowForwardIos fontSize="small" /></IconButton>
                        </Box>
                    </Box>
                </Paper>

                {/* --- END DYNAMIC CONTENT AREA --- */}

                {/* FOOTER SECTION (AS IS) */}
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