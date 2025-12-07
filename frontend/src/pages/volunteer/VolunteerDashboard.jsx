import React, { useState } from 'react';
import {
    Box, Typography, Grid, Paper, Button, Chip
} from '@mui/material';
import {
    Folder, AccessTime, TaskAlt, Star, CheckCircle,
    BookmarkBorder, Visibility, ArrowForward, LocalFireDepartment
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom'; // IMPORTANTE: Para la navegación
import { useRoleProtection } from '../../hooks/useRoleProtection';

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

// --- MOCK DATA ---
const kpiData = [
    { title: 'Active Projects', value: '2', icon: <Folder sx={{ color: '#F59E0B', fontSize: 30 }} />, bgColor: '#FFFBEB' },
    { title: 'Hours This Mth', value: '156', icon: <AccessTime sx={{ color: '#6B7280', fontSize: 30 }} />, bgColor: '#F3F4F6' },
    { title: 'Projects Complete', value: '3', icon: <TaskAlt sx={{ color: '#EF4444', fontSize: 30 }} />, bgColor: '#FEF2F2' },
    { title: 'Rating Average', value: '4.8', icon: <Star sx={{ color: '#FCD34D', fontSize: 30 }} />, bgColor: '#FFFBEB' },
];

const specialties = [
    { name: 'Medicina General', desc: 'Primary & emergency care' },
    { name: 'Ingeniería Civil', desc: 'Infrastructure projects' },
    { name: 'Gestión de Proyectos', desc: 'Coordination & admin' },
];

const contributionData = [
    { month: 'JAN', hours: 18 },
    { month: 'APR', hours: 40 },
    { month: 'JUL', hours: 28 },
    { month: 'OCT', hours: 62 },
];

const opportunities = [
    {
        id: 1,
        title: 'Medical Brigades in Rural Communities',
        org: 'Salud sin Fronteras',
        location: 'Antioquia, Colombia',
        match: 95,
        tags: { specialty: 'Medicina General', start: 'Oct 15, 2024', duration: '2 Weeks', team: '12 Volunteers' },
        isNew: true
    },
    {
        id: 2,
        title: 'Infrastructure Improvement for Local School',
        org: 'Constructores del Futuro',
        location: 'Cusco, Perú',
        match: 88,
        tags: { specialty: 'Ingeniería Civil', start: 'Nov 01, 2024', duration: '4 Weeks', team: '8 Volunteers' },
        isNew: false
    }
];

export default function VolunteerDashboard() {
    // 1. Security Check
    useRoleProtection('VOLUNTEER');
    const navigate = useNavigate();

    // 2. States for Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // 3. Handlers
    const handleOpenDetails = (opp) => {
        // Adaptamos los datos de "opportunity" al formato que espera el Modal genérico
        // ya que el dashboard de voluntarios tiene campos ligeramente distintos (tags).
        const formattedProject = {
            ...opp,
            name: opp.title, // El modal usa 'name', aquí tenemos 'title'
            status: "Recruiting",
            volunteers: opp.tags.team,
            timeline: `${opp.tags.start} (${opp.tags.duration})`,
            // Datos simulados de fondos para que el modal no se vea vacío
            raised: "$15,000",
            goal: "$20,000",
            percent: 75
        };
        setSelectedProject(formattedProject);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    return (
        <Box>
            {/* HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="#1E293B">Hello, Elena! 👋</Typography>
                <Typography variant="body2" color="text.secondary">Ready to make an impact today?</Typography>
            </Box>

            {/* SECTION 1: KPIs */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {kpiData.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: kpi.bgColor }}>
                                {kpi.icon}
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="#1E293B">{kpi.value}</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{kpi.title}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* SECTION 2: SPECIALTIES & CHART */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Specialties List */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={3}>My Specialties</Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                            {specialties.map((spec, idx) => (
                                <Box key={idx} display="flex" gap={2}>
                                    <CheckCircle sx={{ color: '#65A30D', fontSize: 28 }} />
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} color="#1E293B">{spec.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{spec.desc}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Contribution Chart */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={1}>Contribution This Year</Typography>

                        <Box sx={{ height: 250, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={contributionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#FF3F01"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#FFFFFF', stroke: '#FF3F01', strokeWidth: 3 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* SECTION 3: AVAILABLE OPPORTUNITIES */}
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700} color="#1E293B">Available Opportunities</Typography>

                    {/* --- BOTÓN BROWSE ALL CONECTADO --- */}
                    <Button
                        endIcon={<ArrowForward />}
                        sx={{ textTransform: 'none', color: '#FF3F01', fontWeight: 600 }}
                        onClick={() => navigate('/volunteer/explorar-proyectos')}
                    >
                        Browse All
                    </Button>
                </Box>

                <Box display="flex" flexDirection="column" gap={3}>
                    {opportunities.map((opp) => (
                        <Paper key={opp.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
                                <Box>
                                    {opp.isNew && (
                                        <Chip label="NEW OPPORTUNITY" size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 800, fontSize: '0.65rem', height: 20, mb: 1 }} />
                                    )}
                                    <Typography variant="h6" fontWeight={700} color="#1E293B">{opp.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        by <b>{opp.org}</b> in {opp.location}
                                    </Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                                        <LocalFireDepartment sx={{ color: '#FF3F01', fontSize: 18 }} />
                                        <Typography variant="subtitle1" fontWeight={800} color="#FF3F01">{opp.match}% Match</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">Based on your skills</Typography>
                                </Box>
                            </Box>

                            {/* Details Grid */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Specialties</Typography>
                                    <Typography variant="body2" fontWeight={600}>{opp.tags.specialty}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Start Date</Typography>
                                    <Typography variant="body2" fontWeight={600}>{opp.tags.start}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Duration</Typography>
                                    <Typography variant="body2" fontWeight={600}>{opp.tags.duration}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Team Size</Typography>
                                    <Typography variant="body2" fontWeight={600}>{opp.tags.team}</Typography>
                                </Grid>
                            </Grid>

                            <Box display="flex" gap={2}>
                                <Button variant="contained" sx={{ bgcolor: '#FF3F01', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#D93602' } }}>
                                    Apply Now
                                </Button>
                                <Button startIcon={<BookmarkBorder />} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>Save for Later</Button>

                                {/* --- BOTÓN VIEW DETAILS CONECTADO AL MODAL --- */}
                                <Button
                                    startIcon={<Visibility />}
                                    sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}
                                    onClick={() => handleOpenDetails(opp)}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>

            {/* --- MODAL AL FINAL --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />
        </Box>
    );
}