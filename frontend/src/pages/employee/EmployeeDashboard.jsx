import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Grid, Paper, Button, Chip, LinearProgress, IconButton, CircularProgress
} from '@mui/material';
import { 
    AssignmentLate, CheckCircle, MonetizationOn, Assignment, 
    AccessTime, ArrowForward, MoreVert
} from '@mui/icons-material';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useRoleProtection } from '../../hooks/useRoleProtection';
import { useNavigate } from "react-router-dom";

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const warningColor = '#F59E0B';

// --- MOCK DATA (Para gráficas y KPIs estáticos) ---
const initialKpiData = [
    { id: 'pending', title: 'Pending Approvals', value: '...', icon: <AssignmentLate sx={{ color: warningColor, fontSize: 30 }} />, bgColor: '#FFFBEB' },
    { id: 'approved', title: 'Approved This Mth', value: '12', icon: <CheckCircle sx={{ color: successColor, fontSize: 30 }} />, bgColor: '#ECFDF5' },
    { id: 'budget', title: 'Budget Managed', value: '$45K', icon: <MonetizationOn sx={{ color: '#F59E0B', fontSize: 30 }} />, bgColor: '#FFF7ED' },
    { id: 'active', title: 'Projects Active', value: '8', icon: <Assignment sx={{ color: '#3B82F6', fontSize: 30 }} />, bgColor: '#EFF6FF' },
];

const activityData = [
    { name: 'JAN', value: 10 }, { name: 'FEB', value: 25 }, { name: 'MAR', value: 18 },
    { name: 'APR', value: 30 }, { name: 'MAY', value: 20 }, { name: 'JUN', value: 35 },
    { name: 'JUL', value: 45 }, { name: 'AUG', value: 60 }, { name: 'SEP', value: 50 },
    { name: 'OCT', value: 40 },
];

export default function EmployeeDashboard() {
    // 1. Security Check
    useRoleProtection('EMPLOYEE');
    const navigate = useNavigate();

    // --- STATE ---
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [supervisedProjects, setSupervisedProjects] = useState([]); // Estado para proyectos
    const [kpiValues, setKpiValues] = useState(initialKpiData);
    const [loading, setLoading] = useState(true);

    // --- HELPERS ---
    const getProgressValue = (label) => {
        if (!label) return 0;
        if (label.includes('%')) return parseFloat(label);
        // Estimación simple si viene como "X days left"
        if (label.includes('days left')) {
             const daysRemaining = parseFloat(label);
             const maxDays = 365; // Asumimos proyectos anuales para la barra visual
             return Math.max(0, Math.min(100, 100 - (daysRemaining / maxDays) * 100));
        }
        if (label.includes('Due today') || label.includes('Finished')) return 100;
        return 50; // Valor medio por defecto
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            try {
                // 1. Fetch Approvals (Auditoría)
                const approvalsRes = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const pending = approvalsRes.data.filter(item => item.approval_status === 'PENDIENTE');
                const formattedApprovals = pending.map(item => ({
                    id: item.approval_id,
                    title: item.project_name || 'Sin Nombre',
                    type: item.days_pending > 3 ? `URGENT (${item.days_pending} days)` : `${item.days_pending} days pending`,
                    desc: `Submitted: ${item.approval_date} | By: ${item.assigned_to}`,
                    urgent: item.days_pending > 3
                }));
                setPendingApprovals(formattedApprovals);

                // 2. Fetch Projects (Dashboard Data - Active Projects Table)
                const projectsRes = await axios.get('http://127.0.0.1:8000/api/admin/dashboard-data/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const activeProjects = projectsRes.data.active_projects_table || [];
                const formattedProjects = activeProjects.map(p => ({
                    id: p.id,
                    name: p.project,
                    ong: p.ngo,
                    status: p.state,
                    progressLabel: p.progressLabel,
                    progressValue: getProgressValue(p.progressLabel),
                    // Datos no disponibles en este endpoint, usamos placeholders
                    budget: "-", 
                    volunteers: "-",
                    lastReport: "-"
                }));
                setSupervisedProjects(formattedProjects);

                // 3. Update KPIs
                setKpiValues(prev => prev.map(kpi => {
                    if (kpi.id === 'pending') return { ...kpi, value: pending.length.toString() };
                    if (kpi.id === 'active') return { ...kpi, value: activeProjects.length.toString() };
                    return kpi;
                }));

            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HANDLERS ---
    const handleApprove = async (id) => {
        navigate('/employee/aprobaciones');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
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
                {kpiValues.map((kpi, index) => (
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
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" gutterBottom>Pending Approvals</Typography>
                        <Typography variant="body2" color="error.main" fontWeight={600} mb={3}>Requires Your Action</Typography>
                        
                        <Box display="flex" flexDirection="column" gap={3} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 400 }}>
                            {pendingApprovals.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No pending approvals found.
                                </Typography>
                            ) : (
                                pendingApprovals.slice(0, 5).map((item) => (
                                    <Box key={item.id} sx={{ borderLeft: `4px solid ${item.urgent ? '#EF4444' : '#F59E0B'}`, pl: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.urgent ? '#EF4444' : '#F59E0B' }} />
                                            <Typography variant="caption" color={item.urgent ? 'error.main' : 'warning.main'} fontWeight={700}>
                                                {item.type}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={700} color="#1E293B">{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>{item.desc}</Typography>
                                        <Box display="flex" gap={1}>
                                            <Typography 
                                                variant="caption" 
                                                color="success.main" 
                                                sx={{ cursor: 'pointer', fontWeight: 700 }}
                                                onClick={() => handleApprove(item.id)}
                                            >
                                                ✔ Process
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                color="text.primary" 
                                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                                onClick={() => navigate('/employee/aprobaciones')}
                                            >
                                                👁 View Details
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>

                        <Button 
                            endIcon={<ArrowForward />} 
                            sx={{ mt: 3, textTransform: 'none', color: primaryColor, fontWeight: 600 }}
                            onClick={() => navigate('/employee/aprobaciones')}
                        >
                            View All ({pendingApprovals.length} pending)
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- SECTION 4: SUPERVISED PROJECTS (UPDATED) --- */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700} color="#1E293B">My Supervised Projects</Typography>
                    <Button 
                        endIcon={<ArrowForward />} 
                        sx={{ textTransform: 'none', color: primaryColor, fontWeight: 600 }}
                        onClick={() => navigate("/employee/proyectos")}
                    >
                        View All Projects
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {supervisedProjects.length === 0 ? (
                        <Grid item xs={12}><Typography align="center" color="text.secondary">No active projects found.</Typography></Grid>
                    ) : (
                        supervisedProjects.slice(0, 4).map((project) => (
                            <Grid item xs={12} key={project.id}>
                                <Paper elevation={0} sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={700} color="#1E293B">{project.name}</Typography>
                                        <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                                            <Chip label={project.status} size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                | {project.ong} | Budget: {project.budget}
                                            </Typography>
                                        </Box>
                                        {/* Barra de progreso visual */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, width: '60%' }}>
                                            <LinearProgress variant="determinate" value={project.progressValue} sx={{ height: 6, borderRadius: 3, flexGrow: 1, bgcolor: '#F1F5F9' }} color="primary" />
                                            <Typography variant="caption" color="text.secondary">{project.progressLabel}</Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                        <Button variant="outlined" size="small" sx={{ borderColor: '#E2E8F0', color: '#64748B' }}>View</Button>
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            sx={{ bgcolor: '#FFF0EB', color: primaryColor, boxShadow: 'none', '&:hover': { bgcolor: '#FFDEC8' } }}
                                            onClick={() => navigate('/employee/reportes')}
                                        >
                                            Add Report
                                        </Button>
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