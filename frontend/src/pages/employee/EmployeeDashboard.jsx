import React, { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Button, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider
} from '@mui/material';
import {
    AssignmentLate, CheckCircle, MonetizationOn, Assignment,
    ArrowForward, CloudUpload
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useRoleProtection } from '../../hooks/useRoleProtection';
import { useNavigate } from "react-router-dom";

// IMPORTACIÓN DEL MODAL DE DETALLES
import ProjectDetailsModal from "../ProjectDetailsModal";

// --- STYLE CONSTANTS ---
const primaryColor = '#FF3F01';
const successColor = '#10B981';
const warningColor = '#F59E0B';

// --- MOCK DATA ---
const kpiData = [
    { title: 'Pending Approvals', value: '5', icon: <AssignmentLate sx={{ color: warningColor, fontSize: 30 }} />, bgColor: '#FFFBEB' },
    { title: 'Approved This Mth', value: '12', icon: <CheckCircle sx={{ color: successColor, fontSize: 30 }} />, bgColor: '#ECFDF5' },
    { title: 'Budget Managed', value: '$45K', icon: <MonetizationOn sx={{ color: '#F59E0B', fontSize: 30 }} />, bgColor: '#FFF7ED' },
    { title: 'Projects Active', value: '8', icon: <Assignment sx={{ color: '#3B82F6', fontSize: 30 }} />, bgColor: '#EFF6FF' },
];

const activityData = [
    { name: 'JAN', value: 10 }, { name: 'FEB', value: 25 }, { name: 'MAR', value: 18 },
    { name: 'APR', value: 30 }, { name: 'MAY', value: 20 }, { name: 'JUN', value: 35 },
    { name: 'JUL', value: 45 }, { name: 'AUG', value: 60 }, { name: 'SEP', value: 50 },
    { name: 'OCT', value: 40 },
];

const pendingApprovals = [
    {
        id: 1, type: 'URGENT (3 days pending)', title: 'Campaña de Invierno BA 2025',
        desc: 'ONG: Salud Para Todos | Budget: $25,000 USD', urgent: true
    },
    {
        id: 2, type: '2 days pending', title: 'Cumbre Climática Juvenil NY 2025',
        desc: 'ONG: Green Planet Initiative | Budget: $35,000 USD', urgent: false
    },
    {
        id: 3, type: '1 day pending', title: 'Huertos Urbanos Madrid 2025',
        desc: 'ONG: Red de Apoyo Comunitario | Budget: $10,000 USD', urgent: false
    },
];

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
    useRoleProtection('EMPLOYEE');
    const navigate = useNavigate();

    // --- STATE FOR ADD REPORT DIALOG ---
    const [openReport, setOpenReport] = useState(false);
    const [selectedProjectName, setSelectedProjectName] = useState('');

    // --- STATE FOR VIEW DETAILS MODAL ---
    const [openDetails, setOpenDetails] = useState(false);
    const [projectDetails, setProjectDetails] = useState(null);

    // Handler Add Report
    const handleOpenReport = (projectName) => {
        setSelectedProjectName(projectName);
        setOpenReport(true);
    };

    const handleCloseReport = () => {
        setOpenReport(false);
        setSelectedProjectName('');
    };

    // Handler View Details (Enriquece los datos para el modal)
    const handleViewDetails = (project) => {
        const fullData = {
            title: project.name,
            ong: project.ong,
            submittedBy: "Employee User", // Mock data
            date: project.lastReport,
            totalBudget: project.budget,
            status: "Active",
            description: `Comprehensive supervision details for ${project.name}. This project currently has ${project.progress}% completion and engages ${project.volunteers} volunteers active in the field.`,

            // Mock History
            history: [
                { status: "Project Assigned", date: "2024-01-10", user: "Manager" },
                { status: "Budget Approved", date: "2024-01-15", user: "Finance" },
                { status: "Last Report Filed", date: project.lastReport, user: "Employee User" },
            ],
            // Mock Team
            team: [
                { name: "Employee User", role: "Supervisor" },
                { name: "Volunteer Lead", role: "Coordinator" },
                { name: `Volunteer Team (${project.volunteers})`, role: "Field Support" }
            ],
            // Mock Budget Breakdown
            budget: [
                { item: "Initial Logistics", date: "2024-02-01", currency: "USD", amount: "5,000" },
                { item: "Field Operations", date: "2024-03-15", currency: "USD", amount: "8,500" },
                { item: "Community Aid", date: "2024-04-10", currency: "USD", amount: "4,000" },
            ]
        };

        setProjectDetails(fullData);
        setOpenDetails(true);
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

                {/* --- SECTION 3: PENDING APPROVALS LIST --- */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" gutterBottom>Pending Approvals</Typography>
                        <Typography variant="body2" color="error.main" fontWeight={600} mb={3}>Requires Your Action</Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                            {pendingApprovals.map((item) => (
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
                                        <Typography variant="caption" color="success.main" sx={{ cursor: 'pointer', fontWeight: 700 }}>✔ Approve</Typography>
                                        <Typography variant="caption" color="error.main" sx={{ cursor: 'pointer', fontWeight: 700 }}>✖ Reject</Typography>
                                        <Typography variant="caption" color="text.primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>👁 View Details</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* --- NAVIGATION TO APPROVALS --- */}
                        <Button
                            endIcon={<ArrowForward />}
                            sx={{ mt: 3, textTransform: 'none', color: primaryColor, fontWeight: 600 }}
                            onClick={() => navigate("/employee/aprobaciones")}
                        >
                            View All (5 pending)
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- SECTION 4: SUPERVISED PROJECTS --- */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700} color="#1E293B">My Supervised Projects</Typography>

                    {/* --- NAVIGATION TO PROJECTS (CORREGIDO) --- */}
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
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    border: '1px solid #F1F5F9',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                <Box sx={{ flexGrow: 1, minWidth: '250px' }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="#1E293B">{project.name}</Typography>
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
                                        <Chip label="Active" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            | {project.ong} | {project.progress}% Complete
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            | Budget: {project.budget} | {project.volunteers} Volunteers | Last Report: {project.lastReport}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" gap={1}>
                                    {/* BOTÓN VIEW IMPLEMENTADO */}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ borderColor: '#E2E8F0', color: '#64748B' }}
                                        onClick={() => handleViewDetails(project)}
                                    >
                                        View
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpenReport(project.name)}
                                        sx={{ bgcolor: '#FFF0EB', color: primaryColor, boxShadow: 'none', '&:hover': { bgcolor: '#FFDEC8' } }}
                                    >
                                        Add Report
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* --- DIALOG / POPUP PARA AGREGAR REPORTE --- */}
            <Dialog
                open={openReport}
                onClose={handleCloseReport}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle fontWeight={700}>
                    Add New Report
                    {selectedProjectName && <Typography variant="subtitle2" color="text.secondary">For: {selectedProjectName}</Typography>}
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Report Title"
                            fullWidth
                            placeholder="Ex: Monthly Progress Update"
                            variant="outlined"
                        />
                        <TextField
                            label="Description / Impact Summary"
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Describe the activities completed..."
                            variant="outlined"
                        />
                        <Box
                            sx={{
                                border: '2px dashed #CBD5E1',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: '#F8FAFC',
                                cursor: 'pointer',
                                '&:hover': { borderColor: primaryColor, bgcolor: '#FFF0EB' }
                            }}
                        >
                            <CloudUpload sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Click to attach documents or photos</Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseReport} sx={{ color: '#64748B' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCloseReport}
                        sx={{ bgcolor: primaryColor, fontWeight: 700, '&:hover': { bgcolor: '#D93602' } }}
                    >
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- NUEVO: PROJECT DETAILS MODAL --- */}
            <ProjectDetailsModal
                open={openDetails}
                onClose={() => setOpenDetails(false)}
                project={projectDetails}
            />

        </Box>
    );
}