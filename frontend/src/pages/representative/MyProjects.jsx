import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Drawer,
    Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

// Definimos el color naranja globalmente para consistencia
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602"; // Un tono un poco más oscuro para el efecto hover

export default function MyProjects() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [projects, setProjects] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // --- ESTADOS PARA EL MODAL DE DETALLES ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/representative/my-projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Transform data
                const transformed = response.data.map(p => ({
                    id: p.project_id,
                    name: p.name,
                    status: p.status_name?.toLowerCase() || 'planning',
                    start: p.start_date?.split('T')[0] || '',
                    end: p.end_date?.split('T')[0] || '',
                    progress: 0, // Calculate if needed
                    raised: '$0',
                    goal: '$0',
                    volunteers: 'N/A',
                    timeline: `${p.start_date?.split('T')[0] || ''} - ${p.end_date?.split('T')[0] || 'Ongoing'}`
                }));
                setProjects(transformed);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const handleCreateProject = async (projectData) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post('http://127.0.0.1:8000/api/representative/my-projects/', projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh projects list
            window.location.reload();
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project. Check console for details.");
        }
    };

    const statusColors = {
        planning: { bg: "#FFF3CD", color: "#B58400" },
        "in progress": { bg: "#CCE5FF", color: "#004085" },
        completed: { bg: "#D4EDDA", color: "#155724" },
        cancelled: { bg: "#F8D7DA", color: "#721C24" },
    };

    // --- HANDLERS PARA EL MODAL ---
    const handleOpenDetails = (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    const filtered = projects.filter((p) => {
        const matchName = p.name.toLowerCase().includes(query.toLowerCase());
        const matchStatus = status === "all" || p.status === status;
        return matchName && matchStatus;
    });

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Projects
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.7 }}>
                        Manage all projects from your organization
                    </Typography>
                </Box>

                {/* BOTÓN 1: Create New Project (Naranja Sólido) */}
                <Button
                    variant="contained"
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        bgcolor: MAIN_ORANGE,
                        "&:hover": { bgcolor: DARK_ORANGE }
                    }}
                >
                    Create New Project
                </Button>
            </Box>

            {/* FILTER BAR */}
            <Paper
                sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", mb: 3 }}
            >
                {/* STATUS FILTER BUTTONS */}
                {[
                    { key: "all", label: "All" },
                    { key: "planning", label: "Planning" },
                    { key: "in progress", label: "In Progress" },
                    { key: "completed", label: "Completed" },
                    { key: "cancelled", label: "Cancelled" },
                ].map((s) => (
                    <Button
                        key={s.key}
                        variant={status === s.key ? "contained" : "outlined"}
                        onClick={() => setStatus(s.key)}
                        sx={{
                            borderColor: MAIN_ORANGE,
                            color: status === s.key ? "white" : MAIN_ORANGE,
                            bgcolor: status === s.key ? MAIN_ORANGE : "transparent",
                            "&:hover": {
                                bgcolor: status === s.key ? DARK_ORANGE : "rgba(255, 63, 1, 0.1)",
                                borderColor: DARK_ORANGE,
                            }
                        }}
                    >
                        {s.label}
                    </Button>
                ))}

                {/* SEARCH */}
                <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Search projects..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&.Mui-focused fieldset": {
                                    borderColor: MAIN_ORANGE,
                                },
                            },
                        }}
                    />
                </Box>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                            <TableCell><strong>Project Name</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Start Date</strong></TableCell>
                            <TableCell><strong>End Date</strong></TableCell>
                            <TableCell><strong>Progress</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filtered.map((p) => (
                            <TableRow key={p.id} hover sx={{ height: 70 }}>
                                <TableCell>{p.name}</TableCell>

                                <TableCell>
                                    <Chip
                                        label={p.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: statusColors[p.status]?.bg || "#E0E0E0",
                                            color: statusColors[p.status]?.color || "#333",
                                            textTransform: "capitalize",
                                            fontWeight: 600,
                                        }}
                                    />
                                </TableCell>

                                <TableCell>{p.start}</TableCell>
                                <TableCell>{p.end}</TableCell>

                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 120,
                                                height: 8,
                                                backgroundColor: "#E0E0E0",
                                                borderRadius: 5,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${p.progress}%`,
                                                    height: "100%",
                                                    backgroundColor: MAIN_ORANGE,
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2">{p.progress}%</Typography>
                                    </Box>
                                </TableCell>

                                {/* ACTIONS BUTTONS */}
                                <TableCell align="right">
                                    {/* --- BOTÓN VIEW DETAILS CONECTADO --- */}
                                    <Button
                                        size="small"
                                        sx={{ color: MAIN_ORANGE }}
                                        onClick={() => handleOpenDetails(p)}
                                    >
                                        Details
                                    </Button>
                                    <Button size="small" sx={{ color: MAIN_ORANGE }}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* DRAWER (CREATE PROJECT) */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { width: 450, p: 3, borderRadius: "12px 0 0 12px" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h5" fontWeight={800}>
                        Create New Project
                    </Typography>
                    <Button onClick={() => setDrawerOpen(false)} sx={{ color: MAIN_ORANGE }}>
                        Close
                    </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label="Project Name" fullWidth placeholder="Enter project name" />
                    <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                    <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />

                    <TextField label="Status" select fullWidth SelectProps={{ native: true }}>
                        <option value="planning">Planning</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </TextField>

                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Describe the project..."
                    />

                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: MAIN_ORANGE,
                            fontWeight: 700,
                            mt: 2,
                            "&:hover": { bgcolor: DARK_ORANGE },
                        }}
                    >
                        Save Project
                    </Button>
                </Box>
            </Drawer>

            {/* --- COMPONENTE MODAL DE DETALLES --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />

        </Box>
    );
}