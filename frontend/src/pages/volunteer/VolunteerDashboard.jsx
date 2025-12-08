import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Grid, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import {
    Folder, AccessTime, TaskAlt, Star, CheckCircle,
    BookmarkBorder, Visibility, ArrowForward, LocalFireDepartment
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useRoleProtection } from '../../hooks/useRoleProtection';

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

export default function VolunteerDashboard() {
    // 1. Security Check
    useRoleProtection('VOLUNTEER');
    const navigate = useNavigate();

    // 2. States
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        volunteerName: 'Volunteer',
        kpis: {
            activeProjects: 0,
            hoursThisMonth: 0,
            projectsComplete: 0,
            ratingAverage: 4.8
        },
        specialties: [],
        contributionData: [],
        opportunities: []
    });

    // 3. States for Modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applying, setApplying] = useState({});
    const [savedProjects, setSavedProjects] = useState([]);

    // 4. Load saved projects from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('volunteer_saved_projects');
        if (saved) {
            setSavedProjects(JSON.parse(saved));
        }
    }, []);

    // 5. Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get('http://127.0.0.1:8000/api/volunteer/dashboard-data/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error loading dashboard:", error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 5. Prepare KPI Data
    const kpiData = [
        { 
            title: 'Active Projects', 
            value: dashboardData.kpis.activeProjects.toString(), 
            icon: <Folder sx={{ color: '#F59E0B', fontSize: 30 }} />, 
            bgColor: '#FFFBEB' 
        },
        { 
            title: 'Hours This Mth', 
            value: dashboardData.kpis.hoursThisMonth.toString(), 
            icon: <AccessTime sx={{ color: '#6B7280', fontSize: 30 }} />, 
            bgColor: '#F3F4F6' 
        },
        { 
            title: 'Projects Complete', 
            value: dashboardData.kpis.projectsComplete.toString(), 
            icon: <TaskAlt sx={{ color: '#EF4444', fontSize: 30 }} />, 
            bgColor: '#FEF2F2' 
        },
        { 
            title: 'Rating Average', 
            value: dashboardData.kpis.ratingAverage.toString(), 
            icon: <Star sx={{ color: '#FCD34D', fontSize: 30 }} />, 
            bgColor: '#FFFBEB' 
        },
    ];

    // 6. Handlers
    const handleOpenDetails = (opp) => {
        const formattedProject = {
            ...opp,
            id: opp.id || opp.project_id,
            project_id: opp.id || opp.project_id,
            name: opp.title || opp.name,
            title: opp.title || opp.name,
            status: opp.status_name || "ACTIVO",
            status_name: opp.status_name || "ACTIVO",
            volunteers: opp.tags?.team || 'N/A',
            timeline: `${opp.tags?.start || opp.start_date || 'N/A'} (${opp.tags?.duration || 'N/A'})`,
            start_date: opp.tags?.start || opp.start_date,
            ong: opp.org || opp.ngo_name,
            ngo_name: opp.org || opp.ngo_name,
            description: `Project by ${opp.org || opp.ngo_name} in ${opp.location}`,
            raised: "$0",
            goal: "N/A",
            percent: 0
        };
        setSelectedProject(formattedProject);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    const handleApply = async (opp) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        const projectId = opp.id || opp.project_id;
        if (!projectId) {
            alert('Invalid project data.');
            return;
        }

        if (!window.confirm(`Are you sure you want to apply to "${opp.title || opp.name}"?`)) {
            return;
        }

        try {
            setApplying({ ...applying, [projectId]: true });
            await axios.post('http://127.0.0.1:8000/api/volunteer/apply-project/', {
                project_id: parseInt(projectId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Application submitted successfully! You will be notified once it is reviewed.');
            // Remove from dashboard opportunities
            setDashboardData(prev => ({
                ...prev,
                opportunities: prev.opportunities.filter(p => (p.id || p.project_id) !== projectId)
            }));
        } catch (error) {
            console.error("Error applying to project:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to submit application";
            alert(`Error: ${errorMsg}`);
        } finally {
            setApplying({ ...applying, [projectId]: false });
        }
    };

    const handleSaveForLater = (opp) => {
        const projectId = opp.id || opp.project_id;
        const updated = savedProjects.includes(projectId)
            ? savedProjects.filter(id => id !== projectId)
            : [...savedProjects, projectId];
        
        setSavedProjects(updated);
        localStorage.setItem('volunteer_saved_projects', JSON.stringify(updated));
        
        if (updated.includes(projectId)) {
            alert('Project saved for later!');
        } else {
            alert('Project removed from saved list.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: '#FF3F01' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* HEADER */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="#1E293B">
                    Hello, {dashboardData.volunteerName}! 👋
                </Typography>
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
                            {dashboardData.specialties.length > 0 ? (
                                dashboardData.specialties.map((spec, idx) => (
                                    <Box key={idx} display="flex" gap={2}>
                                        <CheckCircle sx={{ color: '#65A30D', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} color="#1E293B">{spec.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{spec.desc}</Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="caption" color="text.secondary">No specialties assigned yet.</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Contribution Chart */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={1}>Contribution This Year</Typography>

                        <Box sx={{ height: 250, width: '100%' }}>
                            {dashboardData.contributionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData.contributionData}>
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
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography variant="body2" color="text.secondary">No contribution data available yet.</Typography>
                                </Box>
                            )}
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
                    {dashboardData.opportunities.length > 0 ? (
                        dashboardData.opportunities.map((opp) => (
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
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleApply(opp)}
                                    disabled={applying[opp.id || opp.project_id]}
                                    sx={{ 
                                        bgcolor: '#FF3F01', 
                                        fontWeight: 700, 
                                        textTransform: 'none', 
                                        '&:hover': { bgcolor: '#D93602' },
                                        '&:disabled': { bgcolor: '#ccc' }
                                    }}
                                >
                                    {applying[opp.id || opp.project_id] ? 'Applying...' : 'Apply Now'}
                                </Button>
                                <Button 
                                    startIcon={<BookmarkBorder />} 
                                    onClick={() => handleSaveForLater(opp)}
                                    sx={{ 
                                        color: savedProjects.includes(opp.id || opp.project_id) ? '#FF3F01' : '#64748B', 
                                        textTransform: 'none', 
                                        fontWeight: 600 
                                    }}
                                >
                                    {savedProjects.includes(opp.id || opp.project_id) ? 'Saved' : 'Save for Later'}
                                </Button>
                                <Button
                                    startIcon={<Visibility />}
                                    onClick={() => handleOpenDetails(opp)}
                                    sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Paper>
                        ))
                    ) : (
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">No available opportunities at the moment.</Typography>
                        </Paper>
                    )}
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