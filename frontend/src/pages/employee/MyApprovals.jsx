import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
} from "@mui/material";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function MyApprovals() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    const requests = [
        {
            id: 1,
            name: "Community Support Initiative",
            submittedBy: "Carlos Rivera",
            submittedOn: "2025-01-12",
            status: "Pending",
            description:
                "This project aims to provide extended community outreach and support for vulnerable groups, including food distribution and educational assistance.",
            history: [
                { label: "Created", date: "2025-01-10" },
                { label: "Submitted", date: "2025-01-12" },
            ],
        },
        {
            id: 2,
            name: "Environmental Awareness Campaign",
            submittedBy: "Laura Martínez",
            submittedOn: "2025-01-18",
            status: "Approved",
            description:
                "A program focused on raising awareness about recycling, waste reduction, and eco‑friendly practices across local schools.",
            history: [
                { label: "Created", date: "2025-01-15" },
                { label: "Submitted", date: "2025-01-18" },
                { label: "Approved", date: "2025-01-20" },
            ],
        },
    ];

    const filtered = requests.filter((r) => {
        const matches = r.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matches && matchesStatus;
    });

    const statusColors = {
        Pending: { bg: "#FFF3CD", color: "#B58B00" },
        Approved: { bg: "#D1F7D1", color: "green" },
        Rejected: { bg: "#F8D7DA", color: "#9F1C24" },
    };

    // Estilo reutilizable para inputs (Focus Naranja)
    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    return (
        <Box sx={{ p: 3, display: "flex", gap: 3 }}>
            {/* PANEL LISTA */}
            <Paper sx={{ width: "38%", p: 2, height: "80vh", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Approval Requests
                </Typography>

                {/* Search and Filter */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by project name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={inputStyle}
                    />

                    <FormControl size="small" sx={{ minWidth: 120, ...inputStyle }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* List */}
                <List sx={{ overflowY: "auto" }}>
                    {filtered.map((item) => (
                        <ListItem
                            key={item.id}
                            button
                            selected={selected?.id === item.id}
                            onClick={() => setSelected(item)}
                            sx={{
                                borderBottom: "1px solid #eee",
                                borderRadius: 1,
                                mb: 0.5,
                                // Estilos para el estado seleccionado y hover en Naranja
                                "&.Mui-selected": {
                                    bgcolor: "rgba(255, 63, 1, 0.08)",
                                    borderLeft: `4px solid ${MAIN_ORANGE}`,
                                    "&:hover": { bgcolor: "rgba(255, 63, 1, 0.12)" }
                                },
                                "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.02)"
                                }
                            }}
                        >
                            <ListItemText
                                primary={<Typography fontWeight={selected?.id === item.id ? 700 : 500}>{item.name}</Typography>}
                                secondary={
                                    <Box>
                                        <Typography variant="body2" fontSize={12}>By: {item.submittedBy}</Typography>
                                        <Typography variant="body2" fontSize={12}>{item.submittedOn}</Typography>
                                    </Box>
                                }
                            />

                            <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                    backgroundColor: statusColors[item.status]?.bg,
                                    color: statusColors[item.status]?.color,
                                    fontWeight: 600,
                                    height: 24
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* PANEL DETALLES */}
            <Paper sx={{ width: "62%", p: 3, height: "80vh", overflowY: "auto", borderRadius: 3 }}>
                {selected ? (
                    <>
                        <Typography variant="h5" fontWeight={800}>
                            {selected.name}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" mb={2}>
                            Submitted by <strong>{selected.submittedBy}</strong> on {selected.submittedOn}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* DESCRIPTION */}
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            Project Description
                        </Typography>
                        <Typography variant="body1" mb={3} color="text.secondary">{selected.description}</Typography>

                        {/* HISTORY */}
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Approval History
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                            {/* Timeline dots (Ahora Naranjas) */}
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 0.5 }}>
                                {selected.history.map((h, idx) => (
                                    <React.Fragment key={idx}>
                                        <Box
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: "50%",
                                                backgroundColor: MAIN_ORANGE, // Color cambiado a naranja
                                                boxShadow: `0 0 0 3px rgba(255, 63, 1, 0.2)` // Glow effect
                                            }}
                                        />
                                        {idx < selected.history.length - 1 && (
                                            <Box sx={{ width: 2, height: 45, backgroundColor: "#E0E0E0" }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Box>

                            {/* Labels */}
                            <Box>
                                {selected.history.map((h, idx) => (
                                    <Box key={idx} sx={{ mb: 3.5 }}>
                                        <Typography fontWeight={700} color="#333">{h.label}</Typography>
                                        <Typography variant="body2" color="text.secondary">{h.date}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* ACTION SECTION */}
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            Your Action
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mb={1}>
                            Add comments (optional)
                        </Typography>

                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            placeholder="Write comments here..."
                            sx={{ mb: 3, ...inputStyle }}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            {/* Botón Edit Naranja */}
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: MAIN_ORANGE,
                                    fontWeight: 600,
                                    px: 4,
                                    "&:hover": { bgcolor: DARK_ORANGE }
                                }}
                            >
                                Edit Request
                            </Button>

                            {/* Botón Delete Rojo (Mantener semántica de error) */}
                            <Button
                                variant="outlined"
                                color="error"
                                sx={{ fontWeight: 600 }}
                            >
                                Delete Request
                            </Button>
                        </Box>
                    </>
                ) : (
                    // Placeholder cuando no hay selección
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                        <Typography variant="h6" color="text.secondary">
                            Select a project from the left to view details.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}