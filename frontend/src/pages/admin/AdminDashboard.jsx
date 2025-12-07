import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
    Box, Paper, Typography, Button, Grid, Chip, LinearProgress,
    CircularProgress, IconButton, InputBase, Link,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
    Folder, Description, Add, MonetizationOn, PeopleAlt, Business,
    Visibility, Edit, FileDownload, ArrowBackIos, ArrowForwardIos, Search
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useRoleProtection } from '../../hooks/useRoleProtection';

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const pieColors = ['#10B981', '#FF3F01', '#F59E0B', '#3B82F6', '#8884d8']; 

const initialKpiData = [
    { title: 'ACTIVE PROJECTS', value: '...', trend: '...', icon: <Folder sx={{ color: primaryColor }} />, trendColor: successColor },
    { title: 'DONATIONS THIS MONTH', value: '...', trend: '...', icon: <MonetizationOn sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'ACTIVE VOLUNTEERS', value: '...', trend: '...', icon: <PeopleAlt sx={{ color: successColor }} />, trendColor: successColor },
    { title: 'REGISTERED NGOs', value: '...', trend: '...', icon: <Business sx={{ color: primaryColor }} />, trendColor: 'text.secondary' },
];

export default function AdminDashboard() {
    useRoleProtection('ADMIN'); 
    const navigate = useNavigate();
    
    const [kpiData, setKpiData] = useState(initialKpiData);
    const [projectData, setProjectData] = useState([]);
    const [chartData, setChartData] = useState({ trends: [], pie: [], totalProjects: 0 });
    const [loading, setLoading] = useState(true);

    // --- HELPERS ---
    const getStateStyles = (state) => {
        const safeState = state ? state.toUpperCase() : '';
        switch (safeState) {
            case 'ACTIVO': return { color: successColor, bgcolor: '#E8F5E9' };
            case 'REVISIÓN': 
            case 'PENDIENTE': return { color: '#F59E0B', bgcolor: '#FFFBEB' };
            case 'COMPLETADO': return { color: '#3B82F6', bgcolor: '#DBEAFE' };
            default: return { color: '#333333', bgcolor: '#FFFFFF' };
        }
    };

    const getProgressValue = (label) => {
        if (!label) return 0;
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
                    title: 'REGISTERED NGOs', 
                    value: data.registered_ngos.value, 
                    trend: data.registered_ngos.trend, 
                    icon: <Business sx={{ color: primaryColor }} />, 
                    trendColor: 'text.secondary' 
                },
            ]);

            setProjectData(data.active_projects_table || []);

            // --- Cálculos para el estado de proyectos ---
            const pieRaw = Array.isArray(data.project_status_pie) ? data.project_status_pie : [];
            const totalPie = pieRaw.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

            const processedPie = pieRaw.map((item, index) => {
                const val = parseFloat(item.value) || 0;
                const percent = totalPie > 0 ? ((val / totalPie) * 100).toFixed(0) : 0;
                return {
                    name: item.name, 
                    percentLabel: `${percent}%`,
                    value: val,
                    color: pieColors[index % pieColors.length]
                };
            });

            setChartData({
                trends: Array.isArray(data.donation_trends) ? data.donation_trends.map(row => ({
                    name: row.name, 
                    value: row.value 
                })) : [],
                pie: processedPie,
                totalProjects: totalPie
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} sx={{ color: primaryColor }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Dashboard Overview</Typography>
                    <Typography variant="body2" color="text.secondary">Welcome back, Admin</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: primaryColor, borderRadius: 2, fontWeight: 700, px: 3, py: 1, '&:hover': { bgcolor: '#D93602' } }}>
                    Create Report
                </Button>
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
                
                {/* 1. Donation Trends */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>📈 Tendencia de Donaciones 2025</Typography>
                        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
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

                {/* 2. Projects by Status (LIMPIO - SIN CIRCULO) */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>Estado de Proyectos</Typography>
                        
                        {/* Contenido Central: Total */}
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                             <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                                Total
                             </Typography>
                             <Typography variant="h1" fontWeight={800} color="#1E293B" sx={{ fontSize: '4.5rem' }}>
                                {chartData.totalProjects}
                             </Typography>
                        </Box>

                        {/* Leyenda Personalizada al Pie */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mt: 2 }}>
                            {chartData.pie.length > 0 ? (
                                chartData.pie.map((item, index) => (
                                    <Box key={index} display="flex" flexDirection="column" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                                            <Typography variant="body2" fontWeight={700} color="#1E293B">
                                                {item.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                             {item.percentLabel}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">No hay datos</Typography>
                            )}
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

                <Box display="flex" gap={2} mb={3} alignItems="center">
                    <InputBase 
                        sx={{ p: '5px 10px', flex: 1, border: '1px solid #E2E8F0', borderRadius: 1 }} 
                        placeholder="Buscar proyecto..." 
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                    <Button size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: '#E2E8F0' }}>Filtros</Button>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ borderBottom: '2px solid #E2E8F0' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Proyecto</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>ONG</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Progreso</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectData.length > 0 ? (
                                projectData.map((project, index) => {
                                    const statusStyle = getStateStyles(project.state); 
                                    const progressValue = getProgressValue(project.progressLabel);
                                    return (
                                        <TableRow key={project.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row">{project.id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{project.project}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">{project.ngo}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={project.state} size="small" sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 700, fontSize: '0.7rem' }} />
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">{project.progressLabel}</Typography>
                                                    <LinearProgress variant="determinate" value={progressValue} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} color="success" />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex">
                                                    <IconButton size="small"><Visibility fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No hay proyectos para mostrar.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ py: 3, px: 2, mt: 'auto', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {'Copyright © '} <Link color="inherit" href="#">RedRomero</Link> {new Date().getFullYear()} {'. All rights reserved.'}
                </Typography>
            </Box>
        </Box>
    );
}