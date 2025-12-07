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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function VolunteerManagement() {
    const [query, setQuery] = useState("");
    const [assignOpen, setAssignOpen] = useState(false);
    const [volunteers, setVolunteers] = useState([]);

    const [specialty, setSpecialty] = useState("");
    const [project, setProject] = useState("");

    useEffect(() => {
        const fetchVolunteers = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const specialtyId = specialty || null;
                const url = specialtyId 
                    ? `http://127.0.0.1:8000/api/employee/volunteers/assignment/?specialty_id=${specialtyId}`
                    : 'http://127.0.0.1:8000/api/employee/volunteers/assignment/';
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Transform data - this would need to join with project assignments
                const transformed = response.data.map(v => ({
                    id: v.volunteer_id,
                    name: `${v.first_name} ${v.last_name}`,
                    specialty: v.specialties || v.specialty_name || 'N/A',
                    project: 'N/A', // Would need separate query
                    start: 'N/A',
                    end: '—',
                }));
                setVolunteers(transformed);
            } catch (error) {
                console.error("Error fetching volunteers:", error);
            }
        };
        fetchVolunteers();
    }, [specialty]);

    const handleAssign = async () => {
        const token = localStorage.getItem('token');
        if (!token || !project || !specialty) {
            alert("Please select both project and specialty");
            return;
        }
        try {
            // First get volunteer ID from specialty selection
            // This is simplified - you'd need to select a specific volunteer
            await axios.post('http://127.0.0.1:8000/api/employee/volunteers/assignment/', {
                project_id: project,
                volunteer_id: 1 // This should come from selection
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Volunteer assigned successfully");
            setAssignOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error assigning volunteer:", error);
            alert("Failed to assign volunteer. Check console for details.");
        }
    };

    const filtered = volunteers.filter((v) =>
        v.name.toLowerCase().includes(query.toLowerCase())
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
                        {filtered.map((row) => (
                            <TableRow key={row.id} hover sx={{ height: 64 }}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.project}</TableCell>
                                <TableCell>{row.specialty}</TableCell>
                                <TableCell>{row.start}</TableCell>
                                <TableCell>{row.end}</TableCell>
                                <TableCell align="right">
                                    {/* Remove Button se mantiene rojo por seguridad, pero outlineado para limpieza */}
                                    <Button size="small" color="error" variant="text">
                                        Remove Volunteer
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ASSIGN VOLUNTEER DRAWER */}
            <Drawer anchor="right" open={assignOpen} onClose={() => setAssignOpen(false)}>
                <Box sx={{ width: 350, p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Assign Volunteer
                    </Typography>

                    {/* SPECIALTY */}
                    <FormControl fullWidth size="small" sx={{ mb: 2, ...inputStyle }}>
                        <InputLabel>Specialty</InputLabel>
                        <Select
                            value={specialty}
                            label="Specialty"
                            onChange={(e) => setSpecialty(e.target.value)}
                        >
                            <MenuItem value="Medicine">Medicine</MenuItem>
                            <MenuItem value="Logistics">Logistics</MenuItem>
                            <MenuItem value="Psychology">Psychology</MenuItem>
                        </Select>
                    </FormControl>

                    {/* PROJECT */}
                    <FormControl fullWidth size="small" sx={{ mb: 2, ...inputStyle }}>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={project}
                            label="Project"
                            onChange={(e) => setProject(e.target.value)}
                        >
                            <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
                            <MenuItem value="Food Distribution Chile">Food Distribution Chile</MenuItem>
                            <MenuItem value="Education for All Mexico">Education for All Mexico</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Botón Assign (Naranja) */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAssign}
                        sx={{
                            mt: 2,
                            bgcolor: MAIN_ORANGE,
                            fontWeight: 700,
                            "&:hover": { bgcolor: DARK_ORANGE }
                        }}
                    >
                        Assign
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}