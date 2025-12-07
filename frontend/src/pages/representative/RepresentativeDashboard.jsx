import {
    Box, Typography, Grid, Paper, Button, Chip, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Select, FormControl, InputLabel, IconButton
} from '@mui/material';

import {
    Add, Description, Folder, MonetizationOn, Assignment,
    Timeline, ArrowForward, Visibility, CloudUpload, Close
} from '@mui/icons-material';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoleProtection } from '../../hooks/useRoleProtection';
import FundingProgress from '../../components/common/FundingProgress';

// --- NUEVO IMPORT ---
import ProjectDetailsModal from "../ProjectDetailsModal";

/* ---------------------- KPI DATA ---------------------- */

const kpiData = [
    { title: "My Projects", value: "6", icon: Folder, color: "#3B82F6", bg: "#EFF6FF" },
    { title: "Total Raised", value: "$89K", icon: MonetizationOn, color: "#10B981", bg: "#ECFDF5" },
    { title: "Pending Approval", value: "2", icon: Assignment, color: "#F59E0B", bg: "#FFFBEB" },
];

/* ---------------------- PROJECT STATUS ---------------------- */

const projectStatus = [
    { status: "Active", count: 4, percent: "67%", color: "#10B981" },
    { status: "Planning", count: 2, percent: "33%", color: "#F59E0B" },
    { status: "Suspended", count: 0, percent: "0%", color: "#EF4444" },
    { status: "Completed", count: 8, percent: "-", color: "#6B7280" },
];

/* ---------------------- ACTIVE PROJECTS ---------------------- */

const activeProjects = [
    {
        id: 1, name: "Educación Digital Rural 2025", status: "Active",
        raised: "$12.5K", goal: "$15K", percent: 83,
        timeline: "Mar 2025 - Dec 2025", volunteers: "8 / 10",
        lastReport: "Nov 15, 2025 (Approved)"
    },
    {
        id: 2, name: "Agua Potable para la Amazonía", status: "Active",
        raised: "$28.2K", goal: "$30K", percent: 94,
        timeline: "Jun 2025 - Jan 2026", volunteers: "12 / 12",
        lastReport: "Nov 10, 2025 (Approved)"
    },
];

/* ---------------------- REVIEW REQUESTS ---------------------- */

const pendingReviews = [
    {
        id: 101, name: "Energía Solar Andina 2025",
        date: "Nov 18, 2025 (6 days ago)",
        assigned: "Lucia Ramos (Employee)",
        status: "Under Review"
    },
    {
        id: 102, name: "Biblioteca Móvil Cusco 2025",
        date: "Nov 20, 2025 (4 days ago)",
        assigned: "Jorge Paredes (Employee)",
        status: "Pending Documents"
    },
];

export default function RepresentativeDashboard() {

    useRoleProtection("REPRESENTATIVE");
    const navigate = useNavigate();

    /* ---------------------- STATES ---------------------- */

    // Report Modal State
    const [openReportModal, setOpenReportModal] = useState(false);
    const [reportData, setReportData] = useState({ title: "", description: "", progress: "" });

    // Funds Modal State
    const [openFundsModal, setOpenFundsModal] = useState(false);
    const [selectedProjectForFunds, setSelectedProjectForFunds] = useState(null);
    const [fundsData, setFundsData] = useState({ amount: "", currency: "USD", file: null });

    // Details Modal State (NUEVO)
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    /* ---------------------- HANDLERS ---------------------- */

    // Report Handlers
    const handleOpenReport = () => setOpenReportModal(true);
    const handleCloseReport = () => setOpenReportModal(false);
    const handleReportSubmit = () => {
        console.log("Saving report:", reportData);
        setOpenReportModal(false);
    };

    // Funds Handlers
    const handleOpenFunds = (projectName) => {
        setSelectedProjectForFunds(projectName || "General Project");
        setOpenFundsModal(true);
    };

    const handleCloseFunds = () => {
        setOpenFundsModal(false);
        setFundsData({ amount: "", currency: "USD", file: null });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFundsData({ ...fundsData, file: e.target.files[0] });
        }
    };

    const handleFundsSubmit = () => {
        console.log("Requesting Funds:", fundsData, "For:", selectedProjectForFunds);
        handleCloseFunds();
    };

    // Details Handlers (NUEVO)
    const handleOpenDetails = (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    return (
        <Box sx={{ px: 3, py: 4, maxWidth: "1600px", margin: "0 auto" }}>

            {/* ---------------------- HEADER ---------------------- */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">
                        Good morning, Rosa! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={0.5}>
                        Manos Unidas • Global Representative
                    </Typography>
                </Box>

                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        sx={headerButtonStyle}
                        onClick={() => navigate("/representative/profile")}
                    >
                        My Profile
                    </Button>
                    <Button
                        variant="outlined"
                        sx={headerButtonStyle}
                        onClick={() => navigate("/representative/mi-ong")}
                    >
                        My NGO
                    </Button>
                </Box>
            </Box>

            {/* ---------------------- KPI CARDS ---------------------- */}
            <Grid container spacing={10} mb={5}>
                {kpiData.map((kpi, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={cardStyle}>
                            <Box sx={iconWrapper(kpi.bg)}>
                                <kpi.icon sx={{ color: kpi.color, fontSize: 35 }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="#0F172A">{kpi.value}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {kpi.title}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ---------------------- MAIN GRID & ACTIONS ---------------------- */}
            <Grid container spacing={7} mb={5}>
                {/* Left Column: Charts */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={bigCardStyle}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={700}>
                                Funding Overview
                            </Typography>
                            <Chip label="Current Fiscal Year" size="small" sx={{ bgcolor: "#F1F5F9", fontWeight: 600 }} />
                        </Box>

                        <FundingProgress value={80} total="$89K" goal="105K" />

                        <Box sx={{ display: "flex", justifyContent: "center", mt: 9, gap: 5, flexWrap: "wrap" }}>
                            <Legend color="#3B82F6" label="Received" amount="$89,420" />
                            <Legend color="#FCD34D" label="Pending" amount="$15,580" />
                            <Legend color="#E2E8F0" label="Gap" amount="$16,000" />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Status & Quick Actions */}
                <Grid item xs={12} lg={4} display="flex" flexDirection="column" gap={3}>
                    {/* Status Card */}
                    <Paper sx={{ ...bigCardStyle, flex: 1 }}>
                        <Typography variant="h6" fontWeight={700} mb={3}>
                            Project Status
                        </Typography>
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
                        <DividerRow label="Success Rate" value="100%" color="success.main" />
                    </Paper>

                    {/* Quick Actions Card */}
                    <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0" }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2}>Quick Actions</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                sx={primaryButton}
                                onClick={() => navigate("/representative/proyectos")}
                                fullWidth
                            >
                                Create New Project
                            </Button>
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Description />}
                                    sx={{...secondaryButton, flex: 1}}
                                    onClick={handleOpenReport}
                                >
                                    Report
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    sx={{...secondaryButton, flex: 1}}
                                    onClick={() => navigate("/representative/donaciones")}
                                >
                                    Donors
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ---------------------- ACTIVE PROJECTS ---------------------- */}
            <Box mb={6}>
                <Box display="flex" justifyContent="space-between" alignItems="end" mb={3}>
                    <Typography variant="h5" fontWeight={700}>
                        Active Projects
                    </Typography>
                    <Button
                        endIcon={<ArrowForward />}
                        sx={{ color: "#FF3F01", fontWeight: 600, textTransform: "none" }}
                        onClick={() => navigate("/representative/proyectos")}
                    >
                        View All
                    </Button>
                </Box>

                <Box display="flex" flexDirection="column" gap={3}>
                    {activeProjects.map((p) => (
                        <Paper key={p.id} sx={projectCard}>
                            <Grid container spacing={9} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <Box mb={1}>
                                        <Typography variant="h6" fontWeight={700}>{p.name}</Typography>
                                        <Box display="flex" gap={1} mt={0.5}>
                                            <Chip label={p.status} size="small" sx={chipStyle} />
                                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                                ID: #{p.id}2025
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={6} md={1}>
                                    <Info label="Timeline" value={p.timeline} />
                                </Grid>

                                <Grid item xs={6} md={1}>
                                    <Info label="Volunteers" value={p.volunteers} />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                Funding
                                            </Typography>

                                            <Typography variant="caption" fontWeight={700} sx={{ textAlign: 'right' }}>
                                                {p.raised} / {p.goal}
                                            </Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={p.percent} sx={progressStyle} />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3} pt={2} sx={{ borderTop: "1px solid #F1F5F9" }}>
                                {/* --- BOTÓN VIEW DETAILS IMPLEMENTADO --- */}
                                <Button
                                    size="small"
                                    variant="outlined"
                                    sx={miniButton}
                                    onClick={() => handleOpenDetails(p)}
                                >
                                    View Details
                                </Button>

                                <Button size="small" variant="outlined" sx={miniButton} onClick={handleOpenReport}>
                                    Add Report
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={orangeButton}
                                    onClick={() => handleOpenFunds(p.name)}
                                >
                                    Request Funds
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>

            {/* ---------------------- APPROVAL TRACKER ---------------------- */}
            <Box>
                <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1} mb={2}>
                    Approval Status Tracker
                    <Box sx={{ width: 8, height: 8, bgcolor: "#F59E0B", borderRadius: "50%" }} />
                </Typography>

                <Grid container spacing={2}>
                    {pendingReviews.map((rev) => (
                        <Grid item xs={12} md={6} key={rev.id}>
                            <Paper sx={reviewCard}>
                                <Box>
                                    <Typography fontWeight={700} fontSize="0.95rem">{rev.name}</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                                        {rev.date}
                                    </Typography>
                                    <Chip
                                        label={rev.status}
                                        size="small"
                                        sx={{
                                            mt: 1, height: 24, fontSize: "0.75rem", fontWeight: 600,
                                            bgcolor: rev.status === "Under Review" ? "#FFF7ED" : "#FEF2F2",
                                            color: rev.status === "Under Review" ? "#EA580C" : "#EF4444"
                                        }}
                                    />
                                </Box>
                                {/* --- BOTÓN DETAILS IMPLEMENTADO --- */}
                                <Button
                                    size="small"
                                    variant="outlined"
                                    sx={miniButton}
                                    onClick={() => handleOpenDetails(rev)}
                                >
                                    Details
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* ================= MODALS ================= */}

            {/* --- REPORT MODAL --- */}
            <Dialog open={openReportModal} onClose={handleCloseReport} fullWidth maxWidth="sm">
                <DialogTitle fontWeight={700}>Submit Project Report</DialogTitle>
                <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField
                        label="Report Title"
                        fullWidth size="small"
                        value={reportData.title}
                        onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        multiline minRows={3} fullWidth size="small"
                        value={reportData.description}
                        onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                    />
                    <TextField
                        label="Progress (%)"
                        type="number" fullWidth size="small"
                        value={reportData.progress}
                        onChange={(e) => setReportData({ ...reportData, progress: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={handleCloseReport} sx={{color: "text.secondary"}}>Cancel</Button>
                    <Button variant="contained" sx={primaryButton} onClick={handleReportSubmit}>
                        Submit Report
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- FUNDS REQUEST MODAL --- */}
            <Dialog open={openFundsModal} onClose={handleCloseFunds} fullWidth maxWidth="sm">
                <Box display="flex" justifyContent="space-between" alignItems="center" pr={2}>
                    <DialogTitle fontWeight={800}>Request Funds</DialogTitle>
                    <IconButton onClick={handleCloseFunds} size="small"><Close /></IconButton>
                </Box>

                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Requesting funds for: <b>{selectedProjectForFunds}</b>
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <TextField
                                label="Amount"
                                type="number"
                                fullWidth
                                placeholder="e.g. 5000"
                                value={fundsData.amount}
                                onChange={(e) => setFundsData({ ...fundsData, amount: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    value={fundsData.currency}
                                    label="Currency"
                                    onChange={(e) => setFundsData({ ...fundsData, currency: e.target.value })}
                                >
                                    <MenuItem value="USD">USD ($)</MenuItem>
                                    <MenuItem value="PEN">PEN (S/)</MenuItem>
                                    <MenuItem value="EUR">EUR (€)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" mb={2} mt={1}>
                                Supporting Documents
                            </Typography>

                            <Paper
                                variant="outlined"
                                component="label"
                                sx={{
                                    p: 4,
                                    borderStyle: "dashed",
                                    borderWidth: 2,
                                    borderColor: fundsData.file ? "primary.main" : "text.disabled",
                                    bgcolor: fundsData.file ? "action.hover" : "#F8FAFC",
                                    borderRadius: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        bgcolor: "#F1F5F9",
                                        borderColor: "primary.main",
                                    }
                                }}
                            >
                                <input type="file" hidden onChange={handleFileChange} />

                                <CloudUpload
                                    sx={{
                                        fontSize: 48,
                                        color: fundsData.file ? "primary.main" : "#94A3B8",
                                        mb: 1.5
                                    }}
                                />

                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {fundsData.file ? (
                                        <span style={{ color: 'black' }}>{fundsData.file.name}</span>
                                    ) : (
                                        "Click to attach Invoice or Budget Plan"
                                    )}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={handleCloseFunds} sx={{color: "text.secondary"}}>Cancel</Button>
                    <Button
                        variant="contained"
                        sx={primaryButton}
                        onClick={handleFundsSubmit}
                        disabled={!fundsData.amount}
                    >
                        Send Request
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- PROJECT DETAILS MODAL (NUEVO) --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />

        </Box>
    );
}

/* ---------------------- SUBCOMPONENTS ---------------------- */

function Info({ label, value }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
            <Typography variant="body2" fontWeight={600} color="#334155">{value}</Typography>
        </Box>
    );
}

function Legend({ color, label, amount }) {
    return (
        <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
            <Box>
                <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                    {amount}
                </Typography>
            </Box>
        </Box>
    );
}

function DividerRow({ label, value, color }) {
    return (
        <Box display="flex" justifyContent="space-between" sx={{ borderTop: "1px solid #F1F5F9", pt: 2 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={700} color={color || "text.primary"}>{value}</Typography>
        </Box>
    );
}

/* ---------------------- STYLE OBJECTS ---------------------- */

const headerButtonStyle = {
    textTransform: "none",
    borderColor: "#E2E8F0",
    fontWeight: 600,
    color: "#475569",
    borderRadius: "8px",
    px: 2.5,
    "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" }
};

const cardStyle = {
    p: 3,
    borderRadius: 4,
    border: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    gap: 2.5,
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    height: "100%",
};

const bigCardStyle = {
    p: 4,
    borderRadius: 4,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
    height: "100%",
    display: "flex",
    flexDirection: "column"
};

const iconWrapper = (bg) => ({
    width: 56,
    height: 56,
    borderRadius: "16px",
    bgcolor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

const projectCard = {
    p: 3,
    borderRadius: 4,
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.2s",
    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" },
};

const chipStyle = {
    fontWeight: 700,
    bgcolor: "#ECFDF5",
    color: "#059669",
    borderRadius: "6px",
    height: 24,
    fontSize: "0.75rem"
};

const progressStyle = {
    height: 8,
    borderRadius: 4,
    bgcolor: "#F1F5F9",
    "& .MuiLinearProgress-bar": { bgcolor: "#FF3F01", borderRadius: 4 }
};

const primaryButton = {
    bgcolor: "#FF3F01",
    fontWeight: 700,
    textTransform: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(255, 63, 1, 0.2)",
    "&:hover": { bgcolor: "#E63700", boxShadow: "0 6px 16px rgba(255, 63, 1, 0.3)" }
};

const secondaryButton = {
    textTransform: "none",
    borderColor: "#E2E8F0",
    borderRadius: "8px",
    fontWeight: 600,
    color: "#475569",
    "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" }
};

const miniButton = {
    borderColor: "#E2E8F0",
    color: "#64748B",
    textTransform: "none",
    fontWeight: 500,
    borderRadius: "6px",
    "&:hover": { borderColor: "#CBD5E1", color: "#334155" }
};

const orangeButton = {
    bgcolor: "#FFF7ED", // Orange 50
    color: "#EA580C", // Orange 600
    fontWeight: 700,
    textTransform: "none",
    boxShadow: "none",
    borderRadius: "6px",
    "&:hover": { bgcolor: "#FFEDD5", boxShadow: "none" }
};

const reviewCard = {
    p: 2.5,
    borderRadius: 3,
    border: "1px solid #F1F5F9",
    bgcolor: "#FAFAFA",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};