import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Grid, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import { 
    AssignmentLate, CheckCircle, MonetizationOn, Assignment, 
    ArrowForward
} from '@mui/icons-material';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useRoleProtection } from '../../hooks/useRoleProtection';
import { useNavigate } from 'react-router-dom';

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const warningColor = '#F59E0B';

export default function EmployeeDashboard() {
    // 1. Security Check
    useRoleProtection('EMPLOYEE');
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [kpiStats, setKpiStats] = useState({
        pending: 0,
        approvedMonth: 0,
        budgetManaged: '$0',
        activeProjects: 0
    });
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [supervisedProjects, setSupervisedProjects] = useState([]);
    const [activityData, setActivityData] = useState([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                setLoading(true);

                // 1. Obtener Aprobaciones (Workflow Logs)
                const approvalsRes = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Obtener Proyectos
                const projectsRes = await axios.get('http://127.0.0.1:8000/api/admin/projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // --- PROCESAMIENTO DE DATOS ---

                const allApprovals = approvalsRes.data;
                const allProjects = projectsRes.data;

                // A. Calcular Pendientes
                const pendingList = allApprovals.filter(a => a.approval_status === 'PENDIENTE');
                
                // B. Calcular Aprobados este mes
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const approvedThisMonth = allApprovals.filter(a => {
                    const d = new Date(a.approval_date);
                    return a.approval_status === 'APROBADO' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                // C. Proyectos Activos
                const activeProjs = allProjects.filter(p => p.status === 'Active');

                // D. Gráfico de Actividad (Agrupar aprobaciones por mes)
                const activityMap = {};
                allApprovals.forEach(a => {
                    const date = new Date(a.approval_date);
                    const key = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"
                    activityMap[key] = (activityMap[key] || 0) + 1;
                });
                
                // Convertir mapa a array para Recharts
                const chartData = Object.keys(activityMap).map(key => ({
                    name: key.toUpperCase(),
                    value: activityMap[key]
                }));

                // --- ACTUALIZAR ESTADO ---
                setKpiStats({
                    pending: pendingList.length,
                    approvedMonth: approvedThisMonth.length,
                    budgetManaged: '$45K', // Este dato requeriría un endpoint específico de finanzas, lo dejamos estático o sumamos presupuestos si los tuvieras
                    activeProjects: activeProjs.length
                });

                // Formatear lista de pendientes para la vista (Top 3)
                setPendingApprovals(pendingList.slice(0, 3).map(item => ({
                    id: item.approval_id,
                    type: item.days_pending > 5 ? `URGENT (${item.days_pending} days)` : `${item.days_pending} days pending`,
                    title: item.project_name,
                    desc: `Status: ${item.approval_status}`,
                    urgent: item.days_pending > 5
                })));

                // Formatear lista de proyectos (Top 3)
                setSupervisedProjects(activeProjs.slice(0, 3).map(p => ({
                    id: p.project_id,
                    name: p.name,
                    ong: `ONG #${p.ong_id}`, // Si tuvieras el nombre de la ONG en el endpoint de proyectos, úsalo aquí
                    progress: 50, // Dato simulado si no viene del backend
                    budget: 'N/A',
                    lastReport: p.start_date
                })));

                setActivityData(chartData.length > 0 ? chartData : [{name: 'NO DATA', value: 0}]);

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- KPI ARRAY ---
    const kpiData = [
        { title: 'Pending Approvals', value: kpiStats.pending, icon: <AssignmentLate sx={{ color: warningColor, fontSize: 30 }} />, bgColor: '#FFFBEB' },
        { title: 'Approved This Mth', value: kpiStats.approvedMonth, icon: <CheckCircle sx={{ color: successColor, fontSize: 30 }} />, bgColor: '#ECFDF5' },
        { title: 'Budget Managed', value: kpiStats.budgetManaged, icon: <MonetizationOn sx={{ color: '#F59E0B', fontSize: 30 }} />, bgColor: '#FFF7ED' },
        { title: 'Projects Active', value: kpiStats.activeProjects, icon: <Assignment sx={{ color: '#3B82F6', fontSize: 30 }} />, bgColor: '#EFF6FF' },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: primaryColor }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="#1E293B">Dashboard Overview</Typography>
                <Typography variant="body2" color="text.secondary">Welcome back, Employee</Typography>
            </Box>

            {/* --- SECTION 1: KPIs --- */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {kpiData.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: kpi.bgColor }}>
                                {kpi.icon}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{kpi.title}</Typography>
                                <Typography variant="h4" fontWeight={800} color="#1E293B">{kpi.value}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* --- SECTION 2: ACTIVITY CHART --- */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={700} color="#1E293B">My Approval Activity</Typography>
                            <Chip label="2025 Trends" size="small" sx={{ bgcolor: primaryColor, color: 'white', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={activityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={3} dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* --- SECTION 3: PENDING APPROVALS LIST --- */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" gutterBottom>Pending Approvals</Typography>
                        <Typography variant="body2" color="error.main" fontWeight={600} mb={3}>Requires Your Action</Typography>
                        
                        <Box display="flex" flexDirection="column" gap={3}>
                            {pendingApprovals.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">No pending approvals.</Typography>
                            ) : (
                                pendingApprovals.map((item) => (
                                    <Box key={item.id} sx={{ borderLeft: `4px solid ${item.urgent ? '#EF4444' : '#F59E0B'}`, pl: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.urgent ? '#EF4444' : '#F59E0B' }} />
                                            <Typography variant="caption" color={item.urgent ? 'error.main' : 'warning.main'} fontWeight={700}>
                                                {item.type}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={700} color="#1E293B">{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>{item.desc}</Typography>
                                        
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={() => navigate('/employee/aprobaciones')}
                                            sx={{ textTransform: 'none', py: 0, fontSize: '0.7rem' }}
                                        >
                                            Process Request
                                        </Button>
                                    </Box>
                                ))
                            )}
                        </Box>

                        <Button 
                            endIcon={<ArrowForward />} 
                            onClick={() => navigate('/employee/aprobaciones')}
                            sx={{ mt: 3, textTransform: 'none', color: primaryColor, fontWeight: 600 }}
                        >
                            View All Approvals
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- SECTION 4: SUPERVISED PROJECTS --- */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700} color="#1E293B">My Supervised Projects</Typography>
                    <Button 
                        endIcon={<ArrowForward />} 
                        onClick={() => navigate('/employee/proyectos')}
                        sx={{ textTransform: 'none', color: primaryColor, fontWeight: 600 }}
                    >
                        View All Projects
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {supervisedProjects.length === 0 ? (
                        <Grid item xs={12}><Typography color="text.secondary">No active projects found.</Typography></Grid>
                    ) : (
                        supervisedProjects.map((project) => (
                            <Grid item xs={12} key={project.id}>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700} color="#1E293B">{project.name}</Typography>
                                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                            <Chip label="Active" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                | {project.ong} | Budget: {project.budget} | Started: {project.lastReport}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                        <Button variant="outlined" size="small" sx={{ borderColor: '#E2E8F0', color: '#64748B' }}>View</Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Paper>
        </Box>
    );
}