import React, { useEffect, useState } from "react";
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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRoleProtection } from "../../hooks/useRoleProtection";


import ProjectDetailsModal from "../ProjectDetailsModal";

const MAIN_ORANGE = "#FF3F01";

export default function MyProjects() {
    useRoleProtection("EMPLOYEE");

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("name");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA EL MODAL ---
    const [openModal, setOpenModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const response = await axios.get('http://127.0.0.1:8000/api/employee/projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRows(response.data || []);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProjects();
    }, []);

    // Sort and filter
    const filtered = rows
        .filter((r) => {
            const matchesName = r.name.toLowerCase().includes(query.toLowerCase());
            const matchesStatus = statusFilter === "all" || r.status === statusFilter;
            return matchesName && matchesStatus;
        })
        .sort((a, b) => {
            if (sort === "name") {
                return a.name.localeCompare(b.name);
            } else if (sort === "updated") {
                // Simple comparison for "X days ago" format
                return 0; // Keep original order for now
            } else if (sort === "end") {
                return new Date(a.end) - new Date(b.end);
            }
            return 0;
        });

    const statusColors = {
        active: { bg: "#D6E8FF", color: "#0B65D9" },
        activo: { bg: "#D6E8FF", color: "#0B65D9" },
        completed: { bg: "#D9F7D9", color: "#1B7B1B" },
        completado: { bg: "#D9F7D9", color: "#1B7B1B" },
        "on hold": { bg: "#FFF8D5", color: "#C5A100" },
        "en revisión": { bg: "#FFF8D5", color: "#C5A100" },
        "pendiente": { bg: "#FFF8D5", color: "#C5A100" },
        cancelled: { bg: "#FAD4D4", color: "#B11A1A" },
        cancelado: { bg: "#FAD4D4", color: "#B11A1A" },
    };

    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    // --- MANEJADOR PARA ABRIR EL MODAL ---
    const handleViewDetails = (row) => {
        // Construir el objeto completo que espera el ProjectDetailsModal
        const fullProjectData = {
            title: row.name,
            ong: row.ong || "Organization N/A",
            submittedBy: row.lead || "N/A",
            date: row.updated || "N/A",
            totalBudget: `${row.total || "0"} ${row.currency || "USD"}`,
            status: row.status,
            description: row.description || `This is a detailed view for the project "${row.name}". This project aims to support the local community through targeted initiatives managed by ${row.lead}. It is currently marked as ${row.status}.`,

            // Datos básicos para el modal
            history: [
                { status: "Project Initiated", date: row.end || "N/A", user: row.lead || "N/A" },
                { status: `Current Status: ${row.status}`, date: row.updated || "N/A", user: "System" },
            ],
            team: [
                { name: row.lead || "N/A", role: "Team Lead" },
            ],
            budget: [
                { item: "Total Budget", date: row.end || "N/A", currency: row.currency || "USD", amount: row.total || "0" },
            ]
        };

        setSelectedProject(fullProjectData);
        setOpenModal(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* ---------- TITLE ---------- */}
            <Typography variant="h4" fontWeight={800} mb={3}>
                Project Management
            </Typography>

            {/* ---------- TOP BAR ---------- */}
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
                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search projects..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                            ),
                        }}
                        fullWidth
                    />
                </Box>

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 150, ...inputStyle }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="on hold">On Hold</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>

                {/* Sort */}
                <FormControl size="small" sx={{ minWidth: 150, ...inputStyle }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                        value={sort}
                        label="Sort by"
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <MenuItem value="name">Project Name</MenuItem>
                        <MenuItem value="updated">Last Updated</MenuItem>
                        <MenuItem value="end">End Date</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {/* ---------- TABLE ---------- */}
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress sx={{ color: MAIN_ORANGE }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box p={5} textAlign="center">
                        <Typography color="text.secondary">No projects found.</Typography>
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                                <TableCell><strong>Project Name</strong></TableCell>
                                <TableCell><strong>Team Lead</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>End Date</strong></TableCell>
                                <TableCell><strong>Last Updated</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filtered.map((row) => (
                                <TableRow key={row.id} hover sx={{ height: 64 }}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.lead}</TableCell>

                                    {/* STATUS CHIP */}
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusColors[row.status]?.bg || "#eee",
                                                color: statusColors[row.status]?.color || "#333",
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell>{row.end}</TableCell>
                                    <TableCell>{row.updated}</TableCell>

                                    {/* ACTIONS */}
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            sx={{ color: MAIN_ORANGE }}
                                            onClick={() => handleViewDetails(row)}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* ---------- MODAL COMPONENT INTEGRATION ---------- */}
            <ProjectDetailsModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                project={selectedProject}
            />
        </Box>
    );
}