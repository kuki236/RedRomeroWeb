import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Drawer, Divider, LinearProgress,
    MenuItem, Select, FormControl, InputLabel, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function MyProjects() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS DEL DRAWER (CREAR) ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: "", description: "", start_date: "", end_date: "",
        status_id: 1, // Default 'ACTIVO' o el que corresponda en tu BD
        ong_id: 1 // Debería venir del usuario logueado, pero por ahora hardcode o dinámico
    });

    // --- ESTADOS PARA EL MODAL DE DETALLES ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            // Usamos el endpoint del representante que filtra por su ONG
            const response = await axios.get('http://127.0.0.1:8000/api/representative/my-projects/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Mapeamos los datos del backend al formato que espera la tabla
            const mappedProjects = response.data.map(p => {
                // Formatear fechas si vienen en formato ISO
                const formatDate = (dateStr) => {
                    if (!dateStr) return 'Ongoing';
                    if (dateStr.includes('T')) {
                        return dateStr.split('T')[0];
                    }
                    return dateStr;
                };

                return {
                    id: p.project_id,
                    project_id: p.project_id, // Para el modal
                    name: p.name,
                    title: p.name, // Para el modal
                    status: p.status_name || p.status || 'Unknown',
                    status_name: p.status_name || p.status || 'Unknown',
                    start: formatDate(p.start_date),
                    start_date: p.start_date, // Para el modal
                    end: formatDate(p.end_date) || 'Ongoing',
                    end_date: p.end_date, // Para el modal
                    progress: 0,
                    // Datos para el modal
                    description: p.description || 'No description available',
                    ong: p.ngo_name || 'N/A',
                    ngo_name: p.ngo_name || 'N/A',
                    representative: 'Current User',
                    // Placeholder para datos financieros
                    raised: "See Reports", 
                    goal: "See Budget"
                };
            });

            setProjects(mappedProjects);
        } catch (error) {
            console.error("Error loading projects:", error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleCreateProject = async () => {
        const token = localStorage.getItem('token');
        if (!newProject.name || !newProject.start_date) {
            alert("Please fill in at least the project name and start date.");
            return;
        }
        
        try {
            // Usamos el endpoint del representante que automáticamente asigna la ONG del usuario
            const payload = {
                name: newProject.name,
                description: newProject.description || '',
                start_date: newProject.start_date,
                end_date: newProject.end_date || null,
                project_status_id: newProject.status_id || 1 // Default a PLANIFICACION
            };

            await axios.post('http://127.0.0.1:8000/api/representative/my-projects/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Project created successfully!");
            setDrawerOpen(false);
            fetchProjects(); // Recargar lista
            
            // Reset form
            setNewProject({ name: "", description: "", start_date: "", end_date: "", status_id: 1, ong_id: 1 });

        } catch (error) {
            console.error("Error creating project:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to create project";
            alert(`Error: ${errorMsg}`);
        }
    };

    const handleOpenDetails = (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    // --- FILTERING ---
    const filtered = projects.filter((p) => {
        const matchName = p.name.toLowerCase().includes(query.toLowerCase());
        // Ajustar filtro de estado para que coincida con los nombres de la BD (ACTIVO, PLANIFICACION, etc)
        let matchStatus = true;
        if (statusFilter !== "all") {
            const projectStatus = (p.status || '').toUpperCase();
            const filterStatus = statusFilter.toUpperCase();
            matchStatus = projectStatus === filterStatus || 
                         (filterStatus === "PLANNING" && projectStatus === "PLANIFICACION") ||
                         (filterStatus === "ACTIVE" && projectStatus === "ACTIVO") ||
                         (filterStatus === "COMPLETED" && projectStatus === "COMPLETADO");
        }
        return matchName && matchStatus;
    });

    const statusColors = {
        'PLANIFICACION': { bg: "#FFF3CD", color: "#B58400" },
        'ACTIVO': { bg: "#CCE5FF", color: "#004085" },
        'COMPLETADO': { bg: "#D4EDDA", color: "#155724" },
        'CANCELADO': { bg: "#F8D7DA", color: "#721C24" },
        // Fallbacks para inglés si la BD los devuelve así
        'PLANNING': { bg: "#FFF3CD", color: "#B58400" },
        'ACTIVE': { bg: "#CCE5FF", color: "#004085" },
        'COMPLETED': { bg: "#D4EDDA", color: "#155724" }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={10}><CircularProgress sx={{color: MAIN_ORANGE}}/></Box>;

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Projects</Typography>
                    <Typography variant="body1" sx={{ opacity: 0.7 }}>Manage all projects from your organization</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    onClick={() => setDrawerOpen(true)}
                    sx={{ bgcolor: MAIN_ORANGE, "&:hover": { bgcolor: DARK_ORANGE } }}
                >
                    Create New Project
                </Button>
            </Box>

            {/* FILTER BAR */}
            <Paper sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
                {/* STATUS FILTER BUTTONS (Adaptados a valores comunes) */}
                {[
                    { key: "all", label: "All" },
                    { key: "PLANIFICACION", label: "Planning" },
                    { key: "ACTIVO", label: "Active" },
                    { key: "COMPLETADO", label: "Completed" }
                ].map((s) => (
                    <Button
                        key={s.key}
                        variant={statusFilter === s.key ? "contained" : "outlined"}
                        onClick={() => setStatusFilter(s.key)}
                        sx={{
                            borderColor: MAIN_ORANGE,
                            color: statusFilter === s.key ? "white" : MAIN_ORANGE,
                            bgcolor: statusFilter === s.key ? MAIN_ORANGE : "transparent",
                            "&:hover": {
                                bgcolor: statusFilter === s.key ? DARK_ORANGE : "rgba(255, 63, 1, 0.1)",
                                borderColor: DARK_ORANGE,
                            }
                        }}
                    >
                        {s.label}
                    </Button>
                ))}

                <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
                    <TextField
                        size="small" placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)}
                        InputProps={{ startAdornment: (<SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />) }}
                        sx={{ "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE } } }}
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
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No projects found.</TableCell></TableRow>
                        ) : (
                            filtered.map((p) => (
                                <TableRow key={p.id} hover sx={{ height: 70 }}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={p.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusColors[p.status.toUpperCase()]?.bg || "#E0E0E0",
                                                color: statusColors[p.status.toUpperCase()]?.color || "#333",
                                                fontWeight: 600, textTransform: "capitalize"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{p.start}</TableCell>
                                    <TableCell>{p.end}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" sx={{ color: MAIN_ORANGE }} onClick={() => handleOpenDetails(p)}>Details</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* DRAWER: CREATE PROJECT */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 3, borderRadius: "12px 0 0 12px" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h5" fontWeight={800}>Create New Project</Typography>
                    <Button onClick={() => setDrawerOpen(false)} sx={{ color: MAIN_ORANGE }}>Close</Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField 
                        label="Project Name" fullWidth placeholder="Enter project name" 
                        value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
                    />
                    <TextField 
                        label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} 
                        value={newProject.start_date} onChange={(e) => setNewProject({...newProject, start_date: e.target.value})} 
                    />
                    <TextField 
                        label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} 
                        value={newProject.end_date} onChange={(e) => setNewProject({...newProject, end_date: e.target.value})} 
                    />
                    
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select 
                            value={newProject.status_id} label="Status" 
                            onChange={(e) => setNewProject({...newProject, status_id: e.target.value})}
                        >
                            {/* IDs basados en tu script SQL (1=Pendiente, 2=Activo, etc.) Ajustar según tu BD */}
                            <MenuItem value={1}>Pending/Planning</MenuItem>
                            <MenuItem value={2}>Active</MenuItem>
                            <MenuItem value={3}>Completed</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField 
                        label="Description" multiline rows={4} fullWidth placeholder="Describe the project..." 
                        value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                    />

                    <Button 
                        variant="contained" 
                        onClick={handleCreateProject}
                        sx={{ bgcolor: MAIN_ORANGE, fontWeight: 700, mt: 2, "&:hover": { bgcolor: DARK_ORANGE } }}
                    >
                        Save Project
                    </Button>
                </Box>
            </Drawer>

            {/* DETAILS MODAL */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />
        </Box>
    );
}