import React, { useState } from "react";
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
    Drawer,
    Divider,
    Dialog,           // Nuevo
    DialogTitle,      // Nuevo
    DialogContent,    // Nuevo
    IconButton,       // Nuevo
    Grid              // Nuevo
} from "@mui/material";
import {
    Search as SearchIcon,
    Close as CloseIcon,           // Nuevo
    CloudDownload,                // Nuevo
    Description as DescriptionIcon // Nuevo
} from "@mui/icons-material";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function ProjectReports() {
    const [query, setQuery] = useState("");
    const [project, setProject] = useState("");
    const [range, setRange] = useState("");
    const [status, setStatus] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    // --- ESTADOS PARA EL MODAL DE VIEW ---
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const reports = [
        {
            id: 1,
            title: "Q1 Impact Summary",
            project: "Health Aid Peru",
            date: "2025-02-10",
            status: "Approved",
            description: "Detailed summary of the medical campaigns conducted in the rural areas of Cusco. Includes patient statistics and medicine inventory usage."
        },
        {
            id: 2,
            title: "Logistics Ops Overview",
            project: "Food Distribution Chile",
            date: "2025-01-18",
            status: "Pending",
            description: "Overview of the supply chain bottlenecks encountered during the summer distribution. Pending approval for budget adjustments."
        },
        {
            id: 3,
            title: "Education Progress Report",
            project: "Education for All Mexico",
            date: "2025-03-02",
            status: "Rejected",
            description: "Report was rejected due to missing attendance sheets for the month of February. Please revise and resubmit with the correct appendices."
        },
    ];

    const statusColors = {
        Approved: "success",
        Pending: "warning",
        Rejected: "error",
    };

    const filtered = reports.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );

    // Estilo para inputs (Focus Naranja)
    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    // --- HANDLERS ---
    const handleOpenView = (report) => {
        setSelectedReport(report);
        setViewOpen(true);
    };

    const handleCloseView = () => {
        setViewOpen(false);
        setSelectedReport(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* TITLE + BUTTON */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4" fontWeight={800}>
                    Project Reports
                </Typography>

                {/* Botón Principal Naranja */}
                <Button
                    variant="contained"
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        bgcolor: MAIN_ORANGE,
                        fontWeight: 600,
                        "&:hover": { bgcolor: DARK_ORANGE }
                    }}
                >
                    Create New Report
                </Button>
            </Box>

            {/* FILTER BAR */}
            <Paper
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                }}
            >
                {/* SEARCH */}
                <TextField
                    size="small"
                    placeholder="Search by title..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ flexGrow: 1, ...inputStyle }}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                        ),
                    }}
                />

                {/* PROJECT FILTER */}
                <FormControl size="small" sx={{ width: 180, ...inputStyle }}>
                    <InputLabel>Project</InputLabel>
                    <Select
                        value={project}
                        label="Project"
                        onChange={(e) => setProject(e.target.value)}
                    >
                        <MenuItem value="">All Projects</MenuItem>
                        <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
                        <MenuItem value="Food Distribution Chile">Food Distribution Chile</MenuItem>
                        <MenuItem value="Education for All Mexico">Education for All Mexico</MenuItem>
                    </Select>
                </FormControl>

                {/* DATE RANGE */}
                <FormControl size="small" sx={{ width: 160, ...inputStyle }}>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                        value={range}
                        label="Date Range"
                        onChange={(e) => setRange(e.target.value)}
                    >
                        <MenuItem value="7">Last 7 days</MenuItem>
                        <MenuItem value="30">Last 30 days</MenuItem>
                        <MenuItem value="90">Last 90 days</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                    </Select>
                </FormControl>

                {/* STATUS FILTER */}
                <FormControl size="small" sx={{ width: 160, ...inputStyle }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
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
                        {filtered.map((row) => (
                            <TableRow key={row.id} hover sx={{ height: 64 }}>
                                <TableCell>{row.title}</TableCell>
                                <TableCell>{row.project}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>
                                    <Chip label={row.status} color={statusColors[row.status]} />
                                </TableCell>
                                <TableCell>
                                    {/* Botones de acción naranjas */}
                                    <Button
                                        size="small"
                                        sx={{ color: MAIN_ORANGE }}
                                        onClick={() => handleOpenView(row)}
                                    >
                                        View
                                    </Button>
                                    <Button size="small" sx={{ ml: 1, color: MAIN_ORANGE }}>
                                        Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ========================================================= */}
            {/* VIEW MODAL (POPUP) */}
            {/* ========================================================= */}
            <Dialog
                open={viewOpen}
                onClose={handleCloseView}
                fullWidth
                maxWidth="sm"
            >
                {/* 1. Header con botón de cerrar a la derecha */}
                <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #f0f0f0">
                    <DialogTitle sx={{ p: 0, fontWeight: 700 }}>
                        {selectedReport?.title}
                    </DialogTitle>
                    <IconButton onClick={handleCloseView}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <DialogContent sx={{ mt: 2, pb: 4 }}>
                    {selectedReport && (
                        <Box display="flex" flexDirection="column" gap={3}>

                            {/* Grid de Metadatos */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Project Name</Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReport.project}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary">Submission Date</Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedReport.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Status</Typography>
                                    <Chip
                                        label={selectedReport.status}
                                        color={statusColors[selectedReport.status]}
                                        size="small"
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider />

                            {/* Descripción del Reporte */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    Report Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {selectedReport.description || "No description provided for this report."}
                                </Typography>
                            </Box>

                            {/* Sección de Descarga */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                                    Attached Documents
                                </Typography>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        bgcolor: "#F8FAFC",
                                        borderColor: "#E2E8F0"
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{
                                            width: 40, height: 40, bgcolor: "white",
                                            borderRadius: 1, border: "1px solid #E2E8F0",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <DescriptionIcon sx={{ color: MAIN_ORANGE }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                Full_Report_2025.pdf
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                2.4 MB
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        startIcon={<CloudDownload />}
                                        sx={{
                                            borderColor: MAIN_ORANGE,
                                            color: MAIN_ORANGE,
                                            textTransform: "none",
                                            "&:hover": { borderColor: DARK_ORANGE, bgcolor: "rgba(255, 63, 1, 0.05)" }
                                        }}
                                    >
                                        Download
                                    </Button>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* DRAWER: CREATE REPORT (Sin Cambios) */}
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
                        Create New Report
                    </Typography>
                    <Button onClick={() => setDrawerOpen(false)} sx={{ color: MAIN_ORANGE }}>
                        Close
                    </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Report Title"
                        fullWidth
                        placeholder="Enter title"
                        sx={inputStyle}
                    />

                    <FormControl fullWidth sx={inputStyle}>
                        <InputLabel>Project</InputLabel>
                        <Select label="Project" defaultValue="">
                            <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
                            <MenuItem value="Food Distribution Chile">Food Distribution Chile</MenuItem>
                            <MenuItem value="Education for All Mexico">Education for All Mexico</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Submission Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={inputStyle}
                    />

                    <FormControl fullWidth sx={inputStyle}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" defaultValue="Pending">
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Enter report summary..."
                        sx={inputStyle}
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
                        Save Report
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
}