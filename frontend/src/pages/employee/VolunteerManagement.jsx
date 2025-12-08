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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Drawer,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function VolunteerManagement() {
    const [query, setQuery] = useState("");
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // For assignment drawer
    const [availableVolunteers, setAvailableVolunteers] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState("");
    const [selectedProject, setSelectedProject] = useState("");

    useEffect(() => {
        fetchAssignments();
        fetchAvailableData();
    }, []);

    const fetchAssignments = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/employee/volunteers/assignment/?type=assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(response.data || []);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            // Fetch available volunteers
            const volunteersRes = await axios.get('http://127.0.0.1:8000/api/employee/volunteers/assignment/?type=available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableVolunteers(volunteersRes.data || []);
            
            // Fetch supervised projects
            const projectsRes = await axios.get('http://127.0.0.1:8000/api/employee/projects/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableProjects(projectsRes.data || []);
        } catch (error) {
            console.error("Error fetching available data:", error);
        }
    };

    const handleAssign = async () => {
        const token = localStorage.getItem('token');
        if (!token || !selectedProject || !selectedVolunteer) {
            alert("Please select both project and volunteer");
            return;
        }
        try {
            await axios.post('http://127.0.0.1:8000/api/employee/volunteers/assignment/', {
                project_id: selectedProject,
                volunteer_id: selectedVolunteer
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Volunteer assigned successfully");
            setAssignOpen(false);
            setSelectedVolunteer("");
            setSelectedProject("");
            fetchAssignments();
        } catch (error) {
            console.error("Error assigning volunteer:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to assign volunteer";
            alert(`Error: ${errorMsg}`);
        }
    };

    const handleRemove = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to remove this volunteer from the project?")) {
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            await axios.delete('http://127.0.0.1:8000/api/employee/volunteers/assignment/', {
                headers: { Authorization: `Bearer ${token}` },
                data: { assignment_id: assignmentId }
            });
            alert("Volunteer removed successfully");
            fetchAssignments();
        } catch (error) {
            console.error("Error removing volunteer:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to remove volunteer";
            alert(`Error: ${errorMsg}`);
        }
    };

    const filtered = assignments.filter((a) =>
        a.volunteer_name?.toLowerCase().includes(query.toLowerCase()) ||
        a.project_name?.toLowerCase().includes(query.toLowerCase())
    );

    // Reusable style to make inputs highlight in orange
    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* TITLE */}
            <Typography variant="h4" fontWeight={800} mb={3}>
                Volunteer Management
            </Typography>

            {/* TOP BAR */}
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
                {/* SEARCH */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                        size="small"
                        placeholder="Search volunteer..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={inputStyle} // Aplicamos estilo naranja
                        InputProps={{
                            startAdornment: (
                                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                            ),
                        }}
                    />
                </Box>

                {/* Assign Button (Naranja) */}
                <Button
                    variant="contained"
                    sx={{
                        ml: "auto",
                        bgcolor: MAIN_ORANGE,
                        fontWeight: 700,
                        "&:hover": { bgcolor: DARK_ORANGE }
                    }}
                    onClick={() => setAssignOpen(true)}
                >
                    Assign Volunteer
                </Button>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress sx={{ color: MAIN_ORANGE }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box p={5} textAlign="center">
                        <Typography color="text.secondary">No volunteer assignments found.</Typography>
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                                <TableCell><strong>Volunteer</strong></TableCell>
                                <TableCell><strong>Project</strong></TableCell>
                                <TableCell><strong>Specialty</strong></TableCell>
                                <TableCell><strong>Start Date</strong></TableCell>
                                <TableCell><strong>End Date</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filtered.map((assignment) => (
                                <TableRow key={assignment.assignment_id} hover sx={{ height: 64 }}>
                                    <TableCell>{assignment.volunteer_name || 'N/A'}</TableCell>
                                    <TableCell>{assignment.project_name || 'N/A'}</TableCell>
                                    <TableCell>{assignment.specialties || 'N/A'}</TableCell>
                                    <TableCell>{assignment.start_date || 'N/A'}</TableCell>
                                    <TableCell>{assignment.end_date || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            size="small" 
                                            color="error" 
                                            variant="text"
                                            onClick={() => handleRemove(assignment.assignment_id)}
                                        >
                                            Remove Volunteer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* ASSIGN VOLUNTEER DRAWER */}
            <Drawer anchor="right" open={assignOpen} onClose={() => {
                setAssignOpen(false);
                setSelectedVolunteer("");
                setSelectedProject("");
            }}>
                <Box sx={{ width: 350, p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Assign Volunteer
                    </Typography>

                    {/* PROJECT */}
                    <FormControl fullWidth size="small" sx={{ mb: 2, ...inputStyle }}>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={selectedProject}
                            label="Project"
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            {availableProjects.map((proj) => (
                                <MenuItem key={proj.id} value={proj.id}>
                                    {proj.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* VOLUNTEER */}
                    <FormControl fullWidth size="small" sx={{ mb: 2, ...inputStyle }}>
                        <InputLabel>Volunteer</InputLabel>
                        <Select
                            value={selectedVolunteer}
                            label="Volunteer"
                            onChange={(e) => setSelectedVolunteer(e.target.value)}
                        >
                            {availableVolunteers.map((vol) => (
                                <MenuItem key={vol.volunteer_id} value={vol.volunteer_id}>
                                    {vol.first_name} {vol.last_name} {vol.specialties ? `(${vol.specialties})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Botón Assign (Naranja) */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAssign}
                        disabled={!selectedProject || !selectedVolunteer}
                        sx={{
                            mt: 2,
                            bgcolor: MAIN_ORANGE,
                            fontWeight: 700,
                            "&:hover": { bgcolor: DARK_ORANGE },
                            "&:disabled": { bgcolor: "#ccc" }
                        }}
                    >
                        Assign
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}