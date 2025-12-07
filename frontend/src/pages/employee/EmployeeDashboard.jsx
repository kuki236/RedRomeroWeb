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

// --- MOCK DATA (Para las gráficas y otras secciones que aún no tienen endpoint específico) ---
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

// Datos Mock para proyectos supervisados (Se mantienen estáticos por ahora)
const supervisedProjects = [
    { 
        id: 1, name: 'Apoyo a Refugiados Madrid 2025', ong: 'Red Apoyo Comunitario', 
        progress: 65, budget: '$25,000', volunteers: 3, lastReport: '2 days ago' 
    },
    { 
        id: 2, name: 'Centro de Reciclaje NY 2025', ong: 'Green Planet Initiative', 
        progress: 48, budget: '$35,000', volunteers: 2, lastReport: '5 days ago' 
    },
    { 
        id: 3, name: 'Taller Liderazgo Femenino BA 2025', ong: 'Salud Para Todos', 
        progress: 72, budget: '$15,000', volunteers: 1, lastReport: '1 day ago' 
    },
];

export default function EmployeeDashboard() {
    // 1. Security Check
    useRoleProtection('EMPLOYEE');
    const navigate = useNavigate();

    // --- STATE ---
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [kpiValues, setKpiValues] = useState(initialKpiData);
    const [loadingApprovals, setLoadingApprovals] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchApprovals = async () => {
            const token = localStorage.getItem('token');
            try {
                // Usamos el endpoint de auditoría que ya devuelve la vista vw_approval_workflow_status
                const response = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 1. Filtrar solo las pendientes
                const pending = response.data.filter(item => item.approval_status === 'PENDIENTE');

                // 2. Mapear a la estructura visual
                const formatted = pending.map(item => {
                    const isUrgent = item.days_pending > 3;
                    return {
                        id: item.approval_id,
                        title: item.project_name || 'Sin Nombre',
                        // Formato: "URGENT (5 days pending)" o "2 days pending"
                        type: isUrgent 
                            ? `URGENT (${item.days_pending} days pending)` 
                            : `${item.days_pending} days pending`,
                        desc: `Submitted: ${item.approval_date} | Assigned to: ${item.assigned_to}`,
                        urgent: isUrgent
                    };
                });

                setPendingApprovals(formatted);

                // 3. Actualizar el KPI de pendientes con el dato real
                setKpiValues(prev => prev.map(kpi => 
                    kpi.id === 'pending' 
                        ? { ...kpi, value: pending.length.toString() } 
                        : kpi
                ));

            } catch (error) {
                console.error("Error fetching approvals:", error);
            } finally {
                setLoadingApprovals(false);
            }
        };

        fetchApprovals();
    }, []);

    // --- HANDLERS ---
    const handleApprove = async (id) => {
        // Redirigir a la pantalla de gestión detallada para aprobar
        navigate('/employee/aprobaciones');
    };

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
                            <Chip label="Approvals Processed" size="small" sx={{ bgcolor: primaryColor, color: 'white', fontWeight: 600 }} />
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

                {/* --- SECTION 3: PENDING APPROVALS LIST (CONECTADO A BD) --- */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" gutterBottom>Pending Approvals</Typography>
                        <Typography variant="body2" color="error.main" fontWeight={600} mb={3}>Requires Your Action</Typography>
                        
                        <Box display="flex" flexDirection="column" gap={3} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 400 }}>
                            {loadingApprovals ? (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress size={30} sx={{ color: primaryColor }} />
                                </Box>
                            ) : pendingApprovals.length === 0 ? (
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

            {/* --- SECTION 4: SUPERVISED PROJECTS --- */}
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
                    {supervisedProjects.map((project) => (
                        <Grid item xs={12} key={project.id}>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700} color="#1E293B">{project.name}</Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                        <Chip label="Active" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            | {project.ong} | {project.progress}% Complete, Budget: {project.budget} | {project.volunteers} Volunteers | Last Report: {project.lastReport}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Button variant="outlined" size="small" sx={{ borderColor: '#E2E8F0', color: '#64748B' }}>View</Button>
                                    <Button variant="outlined" size="small" sx={{ borderColor: '#E2E8F0', color: '#64748B' }}>Edit</Button>
                                    <Button variant="contained" size="small" sx={{ bgcolor: '#FFF0EB', color: primaryColor, boxShadow: 'none', '&:hover': { bgcolor: '#FFDEC8' } }}>Add Report</Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
}