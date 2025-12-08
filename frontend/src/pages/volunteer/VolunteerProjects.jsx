import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Chip,
    Stack,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// --- IMPORTAR EL MODAL NUEVO ---
import ProjectDetailsModal from "../ProjectDetailsModal";

// --- COLOR NARANJA GLOBAL ---
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function MyAssignedProjects() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projects, setProjects] = useState([]);

    // --- ESTADOS PARA EL MODAL ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/volunteer/my-projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Transform data to match component format
                const transformed = response.data.map(p => ({
                    id: p.assignment_id || p.project_id,
                    name: p.project_name,
                    description: p.project_name, // Use project name as description if needed
                    fullDescription: p.project_name,
                    start: p.assignment_date ? p.assignment_date.split('T')[0] : '',
                    end: p.end_date ? p.end_date.split('T')[0] : '',
                    status: p.project_status?.toLowerCase() || 'in progress',
                    progress: 50, // Calculate based on dates if needed
                    ngo: { name: p.ngo_name || 'N/A' },
                    location: 'N/A',
                    raised: '$0',
                    goal: '$0',
                    percent: 0,
                    timeline: `${p.assignment_date?.split('T')[0] || ''} - ${p.end_date?.split('T')[0] || 'Ongoing'}`,
                    volunteers: 'N/A'
                }));
                setProjects(transformed);
            } catch (error) {
                console.error("Error fetching volunteer projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const statusColors = {
        planning: { bg: "#FFF4CC", color: "#B08900" },
        "in progress": { bg: "#FFECE6", color: "#C2410C" }, // Naranja suave para in progress
        completed: { bg: "#D1F7D1", color: "#1F7A1F" },
        cancelled: { bg: "#FFD6D6", color: "#B30000" },
    };

    const filtered = projects.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesName && matchesStatus;
    });

    // --- HANDLERS DEL MODAL ---
    const handleOpenDetails = (p) => {
        // Si necesitas adaptar datos, hazlo aquí
        const formattedProject = {
            ...p,
            // Aseguramos que el NGO name esté accesible como string si el modal lo requiere así
            ngo: typeof p.ngo === 'object' ? p.ngo.name : p.ngo
        };
        setSelectedProject(formattedProject);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* TITLE */}
            <Typography variant="h4" fontWeight={800} mb={3}>
                My Assigned Projects
            </Typography>

            {/* FILTER BAR */}
            <Paper
                sx={{
                    p: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                    mb: 3,
                }}
            >
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search projects..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ flex: 1, minWidth: 250 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: MAIN_ORANGE }} />
                            </InputAdornment>
                        ),
                        sx: {
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: MAIN_ORANGE,
                            }
                        }
                    }}
                />

                {/* Status buttons */}
                <Stack direction="row" spacing={1}>
                    {[
                        { label: "All", value: "all" },
                        { label: "Planning", value: "planning" },
                        { label: "In Progress", value: "in progress" },
                        { label: "Completed", value: "completed" },
                        { label: "Cancelled", value: "cancelled" },
                    ].map((btn) => (
                        <Button
                            key={btn.value}
                            variant={statusFilter === btn.value ? "contained" : "outlined"}
                            onClick={() => setStatusFilter(btn.value)}
                            size="small"
                            sx={{
                                borderColor: statusFilter === btn.value ? "transparent" : MAIN_ORANGE,
                                color: statusFilter === btn.value ? "white" : MAIN_ORANGE,
                                bgcolor: statusFilter === btn.value ? MAIN_ORANGE : "transparent",
                                "&:hover": {
                                    bgcolor: statusFilter === btn.value ? DARK_ORANGE : "rgba(255, 63, 1, 0.04)",
                                    borderColor: DARK_ORANGE
                                }
                            }}
                        >
                            {btn.label}
                        </Button>
                    ))}
                </Stack>
            </Paper>

            {/* PROJECT CARDS */}
            <Stack spacing={2}>
                {filtered.map((p) => (
                    <Paper
                        key={p.id}
                        sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                            }
                        }}
                    >
                        <Box sx={{ maxWidth: "75%" }}>
                            <Typography variant="h6" fontWeight={700}>
                                {p.name}
                            </Typography>

                            <Typography sx={{ color: "text.secondary", mb: 1, fontSize: "0.95rem" }}>
                                {p.description}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    color: "text.secondary",
                                    mb: 2
                                }}
                            >
                                <CalendarMonthIcon fontSize="small" sx={{ fontSize: 18 }} />
                                <Typography variant="body2" fontWeight={500}>
                                    {p.start} — {p.end}
                                </Typography>
                            </Box>

                            <Button
                                variant="text"
                                onClick={() => handleOpenDetails(p)}
                                sx={{
                                    color: MAIN_ORANGE,
                                    fontWeight: 700,
                                    textTransform: "none",
                                    p: 0,
                                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                                }}
                            >
                                View Details
                            </Button>
                        </Box>

                        {/* STATUS TAG */}
                        <Chip
                            label={p.status}
                            sx={{
                                textTransform: "capitalize",
                                fontWeight: 700,
                                backgroundColor: statusColors[p.status]?.bg || "#E0E0E0",
                                color: statusColors[p.status]?.color || "#333",
                            }}
                        />
                    </Paper>
                ))}
            </Stack>

            {/* --- NUEVO MODAL --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />

        </Box>
    );
}