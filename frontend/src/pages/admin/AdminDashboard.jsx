import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
    Box, Paper, Typography, Button, Grid, Chip, LinearProgress,
    CircularProgress, IconButton, InputBase, List, ListItem,Link
} from '@mui/material';
import { 
    Folder, Description, Add, MonetizationOn, PeopleAlt, Business,
    Visibility, Edit, FileDownload, ArrowBackIos, ArrowForwardIos, Search
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { useRoleProtection } from '../../hooks/useRoleProtection';

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const pieColors = ['#10B981', '#FF3F01', '#F59E0B', '#3B82F6']; 

// --- INITIAL STATE ---
const initialKpiData = [
    { title: 'ACTIVE PROJECTS', value: '...', trend: '...', icon: <Folder sx={{ color: primaryColor }} />, trendColor: successColor },
    { title: 'DONATIONS THIS MONTH', value: '...', trend: '...', icon: <MonetizationOn sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'ACTIVE VOLUNTEERS', value: '...', trend: '...', icon: <PeopleAlt sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'REGISTERED NGOS', value: '...', trend: '...', icon: <Business sx={{ color: primaryColor }} />, trendColor: 'text.secondary' },
];

export default function AdminDashboard() {
    // 1. Security Check
    useRoleProtection('ADMIN'); 

    const navigate = useNavigate();
    
    // 2. State Management
    const [kpiData, setKpiData] = useState(initialKpiData);
    const [projectData, setProjectData] = useState([]);
    const [chartData, setChartData] = useState({ trends: [], pie: [] });
    const [loading, setLoading] = useState(true);

    // --- HELPERS ---
    const getStateStyles = (state) => {
        switch (state) {
            case 'ACTIVO': return { color: successColor, bgcolor: '#E8F5E9' };
            case 'REVISIÓN': 
            case 'PENDIENTE': return { color: '#F59E0B', bgcolor: '#FFFBEB' };
            case 'COMPLETADO': return { color: '#3B82F6', bgcolor: '#DBEAFE' };
            default: return { color: '#333333', bgcolor: '#FFFFFF' };
        }
    };

    const getProgressValue = (label) => {
        if (label.includes('%')) return parseFloat(label);
        if (label.includes('días restantes')) {
             const daysRemaining = parseFloat(label);
             const maxDays = 500; 
             return Math.max(0, 100 - (daysRemaining / maxDays) * 100);
        }
        return 0;
    };

    // --- DATA FETCHING ---
    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard-data/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            
            // Update KPIs
            setKpiData([
                { 
                    title: 'ACTIVE PROJECTS', 
                    value: data.active_projects.value, 
                    trend: data.active_projects.trend, 
                    icon: <Folder sx={{ color: primaryColor }} />, 
                    trendColor: data.active_projects.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'DONATIONS THIS MONTH', 
                    value: `$${data.monthly_donations.value}`, 
                    trend: data.monthly_donations.trend, 
                    icon: <MonetizationOn sx={{ color: successColor }} />, 
                    trendColor: data.monthly_donations.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'ACTIVE VOLUNTEERS', 
                    value: data.active_volunteers.value, 
                    trend: data.active_volunteers.trend, 
                    icon: <PeopleAlt sx={{ color: successColor }} />, 
                    trendColor: data.active_volunteers.trend.startsWith('+') ? successColor : 'text.secondary' 
                },
                { 
                    title: 'REGISTERED NGOS', 
                    value: data.registered_ngos.value, 
                    trend: data.registered_ngos.trend, 
                    icon: <Business sx={{ color: primaryColor }} />, 
                    trendColor: 'text.secondary' 
                },
            ]);

            // Update Table
            setProjectData(data.active_projects_table);

            // Update Charts
            setChartData({
                trends: data.donation_trends.map(row => ({
                    name: row.name, 
                    value: row.value 
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // --- LOADING VIEW ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} sx={{ color: primaryColor }} />
            </Box>
        );
    }

    // --- MAIN VIEW ---
    return (
        <Box>
            {/* HEADER & ACTIONS */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Dashboard Overview</Typography>
                    <Typography variant="body2" color="text.secondary">Welcome back, Admin</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, py: 1, '&:hover': { bgcolor: '#D93602' } }}>Create Report</Button>
            </Box>

            {/* KPI CARDS */}
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

            {/* CHARTS SECTION */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Donation Trends */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>📈 Tendencia de Donaciones 2025</Typography>
                        <Box sx={{ height: 300, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.trends}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2={1}>
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

                {/* Project Status Pie */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>📊 Estado de Proyectos</Typography>
                        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={chartData.pie} 
                                        innerRadius={60} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        label={(entry) => entry.name}
                                    >
                                        {chartData.pie.map((entry, index) => ( 
                                            <Cell key={`cell-${index}`} fill={entry.color} /> 
                                        ))}
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
                    <Typography variant="h5" fontWeight={700} color="#1E293B">Active Projects ({projectData.length})</Typography>
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" startIcon={<FileDownload />} sx={{ textTransform: 'none', color: primaryColor, borderColor: primaryColor }}>Export CSV</Button>
                        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' }, textTransform: 'none' }}>New</Button>
                    </Box>
                </Box>

                <Box display="flex" gap={2} mb={3} alignItems="center">
                    <InputBase 
                        sx={{ p: '5px 10px', flex: 1, border: '1px solid #E2E8F0', borderRadius: 1 }} 
                        placeholder="Buscar proyecto..." 
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                    <Button size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: '#E2E8F0' }}>Filtros</Button>
                </Box>

                <Grid container spacing={1} sx={{ mb: 1, borderBottom: '2px solid #E2E8F0', fontWeight: 700 }}>
                    <Grid item xs={0.5}><Typography variant="body2">#</Typography></Grid>
                    <Grid item xs={3}><Typography variant="body2">Proyecto</Typography></Grid>
                    <Grid item xs={2.5}><Typography variant="body2">ONG</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">Estado</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">Progreso</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">Acciones</Typography></Grid>
                </Grid>

                <List disablePadding>
                    {projectData.map((project, index) => {
                        const statusStyle = getStateStyles(project.state.toUpperCase()); 
                        const progressValue = getProgressValue(project.progressLabel);
                        return (
                            <ListItem key={project.id} disablePadding sx={{ py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={0.5}><Typography variant="body2">{project.id}</Typography></Grid>
                                    <Grid item xs={3}><Typography variant="body2" fontWeight={600}>{project.project}</Typography></Grid>
                                    <Grid item xs={2.5}><Typography variant="body2" color="text.secondary">{project.ngo}</Typography></Grid>
                                    <Grid item xs={2}>
                                        <Chip label={project.state} size="small" sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 700, fontSize: '0.7rem' }} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant="caption" color="text.secondary">{project.progressLabel}</Typography>
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

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                    <Typography variant="body2" color="text.secondary">Mostrando 1-10 de {projectData.length} (total)</Typography>
                    <Box display="flex" gap={1}>
                        <IconButton disabled><ArrowBackIos fontSize="small" /></IconButton>
                        <Button size="small" variant='contained' sx={{ minWidth: 35, p: 0, bgcolor: primaryColor }}>1</Button>
                        <IconButton><ArrowForwardIos fontSize="small" /></IconButton>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ py: 3, px: 2, mt: 'auto', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {'Copyright © '} <Link color="inherit" href="#">RedRomero</Link> {new Date().getFullYear()} {'. All rights reserved.'}
                </Typography>
            </Box>
        </Box>
    );
}