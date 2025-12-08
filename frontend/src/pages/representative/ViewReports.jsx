import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, MenuItem, Select, InputLabel,
    FormControl, Drawer, Divider, Dialog, DialogTitle, DialogContent, IconButton, Grid,
    CircularProgress, Alert
} from "@mui/material";
import {
    Search as SearchIcon,
    Close as CloseIcon,
    CloudDownload,
    Description as DescriptionIcon
} from "@mui/icons-material";

const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function ProjectReports() {
    // State
    const [reports, setReports] = useState([]);
    const [projectsList, setProjectsList] = useState([]); // Para el dropdown de crear
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [query, setQuery] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    
    // Create Report Drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [newReport, setNewReport] = useState({
        title: "",
        project_id: "",
        description: "",
        file_url: ""
    });

    // View Details Modal
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // --- FETCH DATA ---
    const fetchReports = useCallback(async () => {
        const token = localStorage.getItem('token');
        setError(null);
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/workflow/reports/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data);
        } catch (error) {
            console.error("Error loading reports:", error);
            setError("Error loading reports. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            // Usar el endpoint del representante que filtra por su ONG
            const response = await axios.get('http://127.0.0.1:8000/api/representative/my-projects/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjectsList(response.data || []);
        } catch (error) {
            console.error("Error loading projects list:", error);
            setProjectsList([]);
        }
    }, []);

    useEffect(() => {
        fetchReports();
        fetchProjects();
    }, [fetchReports, fetchProjects]);

    // --- HANDLERS ---
    const handleCreateSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!newReport.title || !newReport.project_id) {
            alert("Title and Project are required");
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/workflow/reports/', {
                ...newReport
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert("Report created successfully!");
            setDrawerOpen(false);
            setNewReport({ title: "", project_id: "", description: "", file_url: "" });
            fetchReports(); // Recargar lista
        } catch (error) {
            console.error("Error creating report:", error);
            alert("Failed to create report.");
        }
    };

    const handleOpenView = (report) => {
        setSelectedReport(report);
        setViewOpen(true);
    };

    const handleCloseView = () => {
        setViewOpen(false);
        setSelectedReport(null);
    };

    // --- FILTERING ---
    const filtered = reports.filter((r) => {
        const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase());
        const matchesProject = projectFilter ? r.project === projectFilter : true;
        return matchesQuery && matchesProject;
    });

    const statusColors = {
        Approved: "success",
        Pending: "warning",
        Rejected: "error",
        Enviado: "info"
    };

    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE } },
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* TITLE + BUTTON */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" fontWeight={800}>Project Reports</Typography>
                <Button 
                    variant="contained" 
                    onClick={() => setDrawerOpen(true)} 
                    sx={{ bgcolor: MAIN_ORANGE, fontWeight: 600, "&:hover": { bgcolor: DARK_ORANGE } }}
                >
                    Create New Report
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* FILTER BAR */}
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <TextField
                    size="small" 
                    placeholder="Search by title..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ flexGrow: 1, ...inputStyle }}
                    InputProps={{ startAdornment: (<SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />) }}
                />
                <FormControl size="small" sx={{ width: 180, ...inputStyle }}>
                    <InputLabel>Project</InputLabel>
                    <Select value={projectFilter} label="Project" onChange={(e) => setProjectFilter(e.target.value)}>
                        <MenuItem value="">All Projects</MenuItem>
                        {projectsList.map(p => (
                            <MenuItem key={p.id || p.project_id} value={p.name || p.project}>{p.name || p.project}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {/* TABLE */}
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                            <TableCell><strong>REPORT TITLE</strong></TableCell>
                            <TableCell><strong>PROJECT NAME</strong></TableCell>
                            <TableCell><strong>SUBMISSION DATE</strong></TableCell>
                            <TableCell><strong>STATUS</strong></TableCell>
                            <TableCell><strong>ACTIONS</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{py:3}}><CircularProgress size={30} sx={{color: MAIN_ORANGE}}/></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{py:3}}>No reports found.</TableCell></TableRow>
                        ) : (
                            filtered.map((row) => (
                                <TableRow key={row.id} hover sx={{ height: 64 }}>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell>{row.project}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status} 
                                            color={statusColors[row.status] || "default"} 
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button size="small" sx={{ color: MAIN_ORANGE }} onClick={() => handleOpenView(row)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* VIEW MODAL */}
            <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="sm">
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #f0f0f0">
                    <DialogTitle sx={{ p: 0, fontWeight: 700 }}>{selectedReport?.title}</DialogTitle>
                    <IconButton onClick={handleCloseView}><CloseIcon /></IconButton>
                </Box>
                <DialogContent sx={{ mt: 2, pb: 4 }}>
                    {selectedReport && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Project Name</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedReport.project}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Date</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedReport.date}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                                    <Chip label={selectedReport.status} color={statusColors[selectedReport.status] || "default"} size="small" sx={{ fontWeight: 700 }} />
                                </Grid>
                            </Grid>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>Description</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{selectedReport.description || "No description."}</Typography>
                            </Box>
                            {/* Attachments Section (Visual Only unless backend supports files) */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Attached Documents</Typography>
                                <Paper variant="outlined" sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#F8FAFC", borderColor: "#E2E8F0" }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{ width: 40, height: 40, bgcolor: "white", borderRadius: 1, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <DescriptionIcon sx={{ color: MAIN_ORANGE }} />
                                        </Box>
                                        <Typography variant="body2" fontWeight={600}>Report_File.pdf</Typography>
                                    </Box>
                                    <Button variant="outlined" startIcon={<CloudDownload />} sx={{ borderColor: MAIN_ORANGE, color: MAIN_ORANGE, textTransform: "none", "&:hover": { borderColor: DARK_ORANGE, bgcolor: "rgba(255, 63, 1, 0.05)" } }}>Download</Button>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* CREATE REPORT DRAWER */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 3, borderRadius: "12px 0 0 12px" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h5" fontWeight={800}>Create New Report</Typography>
                    <Button onClick={() => setDrawerOpen(false)} sx={{ color: MAIN_ORANGE }}>Close</Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField 
                        label="Report Title" 
                        fullWidth 
                        placeholder="Enter title" 
                        sx={inputStyle} 
                        value={newReport.title} 
                        onChange={(e) => setNewReport({...newReport, title: e.target.value})} 
                    />
                    
                    <FormControl fullWidth sx={inputStyle}>
                        <InputLabel>Project</InputLabel>
                        <Select 
                            label="Project" 
                            value={newReport.project_id} 
                            onChange={(e) => setNewReport({...newReport, project_id: e.target.value})}
                        >
                            {projectsList.map(p => (
                                <MenuItem key={p.id || p.project_id} value={p.id || p.project_id}>{p.name || p.project}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField 
                        label="Description" 
                        multiline 
                        rows={4} 
                        fullWidth 
                        placeholder="Enter report summary..." 
                        sx={inputStyle} 
                        value={newReport.description} 
                        onChange={(e) => setNewReport({...newReport, description: e.target.value})} 
                    />
                    
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: MAIN_ORANGE, fontWeight: 700, mt: 2, "&:hover": { bgcolor: DARK_ORANGE } }} 
                        onClick={handleCreateSubmit}
                    >
                        Save Report
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}