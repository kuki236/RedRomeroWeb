import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Box, Typography, Grid, Paper, Button, Chip, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Select, FormControl, InputLabel, IconButton,
    CircularProgress
} from '@mui/material';
import {
    Add, Description, Folder, MonetizationOn, Assignment,
    Timeline, ArrowForward, Visibility, CloudUpload, Close
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useRoleProtection } from '../../hooks/useRoleProtection';
import FundingProgress from '../../components/common/FundingProgress';

// --- NUEVO IMPORT (Asegúrate de tener este componente, si no, comenta la línea) ---
// import ProjectDetailsModal from "../ProjectDetailsModal"; 

const primaryColor = '#FF3F01';

export default function RepresentativeDashboard() {
    useRoleProtection("REPRESENTATIVE");
    const navigate = useNavigate();

    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [kpiStats, setKpiStats] = useState({
        myProjects: 0,
        totalRaised: 0,
        pendingApproval: 0
    });
    const [projectStatus, setProjectStatus] = useState([]);
    const [activeProjects, setActiveProjects] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    
    // --- MODAL STATES ---
    const [openReportModal, setOpenReportModal] = useState(false);
    const [reportData, setReportData] = useState({ title: "", description: "", progress: "" });
    const [openFundsModal, setOpenFundsModal] = useState(false);
    const [selectedProjectForFunds, setSelectedProjectForFunds] = useState(null);
    const [fundsData, setFundsData] = useState({ amount: "", currency: "USD", file: null });
    // const [detailsOpen, setDetailsOpen] = useState(false);
    // const [selectedProject, setSelectedProject] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                setLoading(true);

                // 1. Obtener Proyectos (Usamos el endpoint de admin por ahora, filtrado en frontend o idealmente un endpoint propio)
                const projectsRes = await axios.get('http://127.0.0.1:8000/api/admin/projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Obtener Aprobaciones (Para ver pendientes)
                const approvalsRes = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 3. Obtener Datos Financieros (Para total raised)
                const financeRes = await axios.get('http://127.0.0.1:8000/api/finance/reports-analytics/?type=budget_status', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // --- PROCESAMIENTO ---
                const allProjects = projectsRes.data;
                const allApprovals = approvalsRes.data;
                const financeData = financeRes.data;

                // KPI: My Projects (Total)
                const myProjectsCount = allProjects.length;

                // KPI: Pending Approval (Solicitudes mías pendientes)
                // Asumimos que el backend filtra por usuario, o filtramos aquí si es necesario
                const myPendingApprovals = allApprovals.filter(a => a.approval_status === 'PENDIENTE'); 
                
                // KPI: Total Raised
                const totalRaisedVal = financeData.reduce((acc, curr) => acc + (curr.total_received || 0), 0);

                setKpiStats({
                    myProjects: myProjectsCount,
                    totalRaised: totalRaisedVal,
                    pendingApproval: myPendingApprovals.length
                });

                // Active Projects List (Mapeo para la vista)
                const activeList = allProjects.filter(p => p.status === 'Active').map(p => {
                    // Buscar datos financieros de este proyecto
                    const fin = financeData.find(f => f.project_name === p.name) || {};
                    const raised = fin.total_received || 0;
                    const goal = fin.budget_amount || 0;
                    const percent = goal > 0 ? Math.round((raised / goal) * 100) : 0;

                    return {
                        id: p.project_id,
                        name: p.name,
                        status: 'Active',
                        raised: `$${raised.toLocaleString()}`,
                        goal: `$${goal.toLocaleString()}`,
                        percent: percent,
                        timeline: `${p.start_date} - ${p.end_date || 'Ongoing'}`,
                        volunteers: 'N/A', // Dato no disponible en este endpoint aun
                        lastReport: 'Pending' // Dato no disponible
                    };
                });
                setActiveProjects(activeList);

                // Project Status Summary
                const statusCounts = allProjects.reduce((acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                }, {});
                
                const statusSummary = Object.keys(statusCounts).map(status => ({
                    status: status,
                    count: statusCounts[status],
                    percent: `${Math.round((statusCounts[status] / allProjects.length) * 100)}%`,
                    color: status === 'Active' ? "#10B981" : "#F59E0B"
                }));
                setProjectStatus(statusSummary);

                // Pending Reviews List
                setPendingReviews(myPendingApprovals.map(a => ({
                    id: a.approval_id,
                    name: a.project_name,
                    date: a.approval_date,
                    assigned: a.assigned_to || 'System',
                    status: a.approval_status
                })));

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- HANDLERS (Simulados por ahora, ya que requieren endpoints específicos de Representative) ---
    const handleOpenReport = () => setOpenReportModal(true);
    const handleCloseReport = () => setOpenReportModal(false);
    const handleReportSubmit = () => { setOpenReportModal(false); }; // Conectar a API real luego

    const handleOpenFunds = (projectName) => {
        setSelectedProjectForFunds(projectName || "General Project");
        setOpenFundsModal(true);
    };
    const handleCloseFunds = () => setOpenFundsModal(false);
    const handleFundsSubmit = () => handleCloseFunds();

    if (loading) return <Box display="flex" justifyContent="center" p={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ px: 3, py: 4, maxWidth: "1600px", margin: "0 auto" }}>

            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Good morning! 👋</Typography>
                    <Typography variant="body1" color="text.secondary" mt={0.5}>Representative Dashboard</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" sx={headerButtonStyle}>My Profile</Button>
                    <Button variant="outlined" sx={headerButtonStyle} onClick={() => navigate("/representative/mi-ong")}>My NGO</Button>
                </Box>
            </Box>

            {/* KPI CARDS */}
            <Grid container spacing={10} mb={5}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={cardStyle}>
                        <Box sx={iconWrapper("#EFF6FF")}>
                            <Folder sx={{ color: "#3B82F6", fontSize: 35 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="#0F172A">{kpiStats.myProjects}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>My Projects</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={cardStyle}>
                        <Box sx={iconWrapper("#ECFDF5")}>
                            <MonetizationOn sx={{ color: "#10B981", fontSize: 35 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="#0F172A">${kpiStats.totalRaised.toLocaleString()}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Raised</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={cardStyle}>
                        <Box sx={iconWrapper("#FFFBEB")}>
                            <Assignment sx={{ color: "#F59E0B", fontSize: 35 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="#0F172A">{kpiStats.pendingApproval}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>Pending Approval</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* MAIN GRID */}
            <Grid container spacing={7} mb={5}>
                {/* Funding Overview */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={bigCardStyle}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={700}>Funding Overview</Typography>
                            <Chip label="Current Fiscal Year" size="small" sx={{ bgcolor: "#F1F5F9", fontWeight: 600 }} />
                        </Box>
                        {/* Funding Progress usa un valor estático del 80% como ejemplo visual, podrías calcularlo globalmente */}
                        <FundingProgress value={80} total={`$${kpiStats.totalRaised.toLocaleString()}`} goal="Goal" />
                    </Paper>
                </Grid>

                {/* Status & Actions */}
                <Grid item xs={12} lg={4} display="flex" flexDirection="column" gap={3}>
                    <Paper sx={{ ...bigCardStyle, flex: 1 }}>
                        <Typography variant="h6" fontWeight={700} mb={3}>Project Status</Typography>
                        <Box display="flex" flexDirection="column" gap={2.5} mb={3}>
                            {projectStatus.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box sx={{ width: 12, height: 12, bgcolor: p.color, borderRadius: "4px" }} />
                                        <Typography variant="body2" fontWeight={500}>{p.status}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={700}>
                                        {p.count} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({p.percent})</span>
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                    
                    <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0" }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2}>Quick Actions</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button variant="contained" startIcon={<Add />} sx={primaryButton} onClick={() => navigate("/representative/proyectos")} fullWidth>
                                Create New Project
                            </Button>
                            <Box display="flex" gap={2}>
                                <Button variant="outlined" startIcon={<Description />} sx={{...secondaryButton, flex: 1}} onClick={handleOpenReport}>Report</Button>
                                <Button variant="outlined" startIcon={<Visibility />} sx={{...secondaryButton, flex: 1}} onClick={() => navigate("/representative/donaciones")}>Donors</Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ACTIVE PROJECTS LIST */}
            <Box mb={6}>
                <Box display="flex" justifyContent="space-between" alignItems="end" mb={3}>
                    <Typography variant="h5" fontWeight={700}>Active Projects</Typography>
                    <Button endIcon={<ArrowForward />} sx={{ color: "#FF3F01", fontWeight: 600, textTransform: "none" }} onClick={() => navigate("/representative/proyectos")}>
                        View All
                    </Button>
                </Box>

                <Box display="flex" flexDirection="column" gap={3}>
                    {activeProjects.length === 0 ? <Typography color="text.secondary">No active projects found.</Typography> : 
                        activeProjects.map((p) => (
                        <Paper key={p.id} sx={projectCard}>
                            <Grid container spacing={9} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <Box mb={1}>
                                        <Typography variant="h6" fontWeight={700}>{p.name}</Typography>
                                        <Box display="flex" gap={1} mt={0.5}>
                                            <Chip label={p.status} size="small" sx={chipStyle} />
                                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>ID: #{p.id}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} md={2}><Info label="Timeline" value={p.timeline} /></Grid>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">Funding</Typography>
                                            <Typography variant="caption" fontWeight={700}>{p.raised} / {p.goal}</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={p.percent} sx={progressStyle} />
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3} pt={2} sx={{ borderTop: "1px solid #F1F5F9" }}>
                                <Button size="small" variant="contained" sx={orangeButton} onClick={() => handleOpenFunds(p.name)}>Request Funds</Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>

            {/* MODALS (Simplified for brevity, keep your full implementation) */}
            <Dialog open={openReportModal} onClose={handleCloseReport} fullWidth maxWidth="sm">
                <DialogTitle>Submit Report</DialogTitle>
                <DialogContent><Typography p={2}>Report Form Here</Typography></DialogContent>
                <DialogActions><Button onClick={handleCloseReport}>Cancel</Button></DialogActions>
            </Dialog>

            <Dialog open={openFundsModal} onClose={handleCloseFunds} fullWidth maxWidth="sm">
                <DialogTitle>Request Funds</DialogTitle>
                <DialogContent><Typography p={2}>Funds Form Here for {selectedProjectForFunds}</Typography></DialogContent>
                <DialogActions><Button onClick={handleCloseFunds}>Cancel</Button></DialogActions>
            </Dialog>

        </Box>
    );
}

// --- SUBCOMPONENTS & STYLES (Mantener los mismos que ya tenías) ---
function Info({ label, value }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
            <Typography variant="body2" fontWeight={600} color="#334155">{value}</Typography>
        </Box>
    );
}

const headerButtonStyle = { textTransform: "none", borderColor: "#E2E8F0", fontWeight: 600, color: "#475569", borderRadius: "8px", px: 2.5 };
const cardStyle = { p: 3, borderRadius: 4, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2.5, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", height: "100%" };
const bigCardStyle = { p: 4, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)", height: "100%", display: "flex", flexDirection: "column" };
const iconWrapper = (bg) => ({ width: 56, height: 56, borderRadius: "16px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" });
const projectCard = { p: 3, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" } };
const chipStyle = { fontWeight: 700, bgcolor: "#ECFDF5", color: "#059669", borderRadius: "6px", height: 24, fontSize: "0.75rem" };
const progressStyle = { height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#FF3F01", borderRadius: 4 } };
const primaryButton = { bgcolor: "#FF3F01", fontWeight: 700, textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#E63700" } };
const secondaryButton = { textTransform: "none", borderColor: "#E2E8F0", borderRadius: "8px", fontWeight: 600, color: "#475569" };
const miniButton = { borderColor: "#E2E8F0", color: "#64748B", textTransform: "none", fontWeight: 500, borderRadius: "6px" };
const orangeButton = { bgcolor: "#FFF7ED", color: "#EA580C", fontWeight: 700, textTransform: "none", borderRadius: "6px", "&:hover": { bgcolor: "#FFEDD5" } };
const reviewCard = { p: 2.5, borderRadius: 3, border: "1px solid #F1F5F9", bgcolor: "#FAFAFA", display: "flex", justifyContent: "space-between", alignItems: "center" };