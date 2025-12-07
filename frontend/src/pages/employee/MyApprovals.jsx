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
    ListItemButton, // Importante para la selección
    CircularProgress,
    Alert
} from "@mui/material";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function MyApprovals() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState(null);
    
    // Estados para datos
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. FETCH DATA ---
    const fetchApprovals = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            // Usamos la vista de auditoría que ya trae la info necesaria
            const response = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Mapeamos los datos de la BD a la estructura del frontend
            const formattedData = response.data.map(item => ({
                id: item.approval_id,
                name: item.project_name || "Proyecto Sin Nombre",
                submittedBy: item.assigned_to || "Sistema",
                submittedOn: item.approval_date,
                status: item.approval_status, // PENDIENTE, APROBADO, RECHAZADO
                // La vista actual no trae descripción completa, construimos una informativa
                description: `Project ID: ${item.project_id}. Esta solicitud ha estado pendiente por ${item.days_pending} días. Requiere revisión del presupuesto y alcance.`,
                // Historial simulado basado en la fecha de creación (la vista no trae historial anidado)
                history: [
                    { label: "Submitted", date: item.approval_date },
                    item.approval_status !== 'PENDIENTE' ? { label: "Processed", date: "Recently" } : null
                ].filter(Boolean)
            }));

            setRequests(formattedData);
            setError(null);
        } catch (err) {
            console.error("Error fetching approvals:", err);
            setError("No se pudieron cargar las aprobaciones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    // --- 2. HANDLE ACTIONS (APPROVE/REJECT) ---
    const handleDecision = async (decision) => {
        if (!selected) return;
        
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id'); // ID del empleado logueado

        if (!confirm(`¿Estás seguro de marcar esta solicitud como ${decision}?`)) return;

        setProcessing(true);
        try {
            await axios.put('http://127.0.0.1:8000/api/workflow/approvals/', {
                approval_id: selected.id,
                decision: decision, // 'APROBADO' o 'RECHAZADO'
                employee_id: userId 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Éxito
            alert(`Solicitud ${decision.toLowerCase()} correctamente.`);
            setSelected(null);
            fetchApprovals(); // Recargar lista
        } catch (err) {
            console.error("Error processing approval:", err);
            alert("Error al procesar la solicitud: " + (err.response?.data?.error || err.message));
        } finally {
            setProcessing(false);
        }
    };

    // --- FILTRADO ---
    const filtered = requests.filter((r) => {
        const matches = r.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matches && matchesStatus;
    });

    const statusColors = {
        PENDIENTE: { bg: "#FFF3CD", color: "#B58B00" },
        APROBADO: { bg: "#D1F7D1", color: "green" },
        RECHAZADO: { bg: "#F8D7DA", color: "#9F1C24" },
        // Fallbacks en inglés por si acaso
        Pending: { bg: "#FFF3CD", color: "#B58B00" },
        Approved: { bg: "#D1F7D1", color: "green" },
        Rejected: { bg: "#F8D7DA", color: "#9F1C24" },
    };

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
                            <MenuItem value="PENDIENTE">Pending</MenuItem>
                            <MenuItem value="APROBADO">Approved</MenuItem>
                            <MenuItem value="RECHAZADO">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* List */}
                <List sx={{ overflowY: "auto", flexGrow: 1 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress size={30} sx={{ color: MAIN_ORANGE }} />
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Typography variant="body2" align="center" color="text.secondary" mt={4}>
                            No requests found.
                        </Typography>
                    ) : (
                        filtered.map((item) => (
                            <ListItem
                                key={item.id}
                                disablePadding
                                sx={{ mb: 0.5 }}
                            >
                                <ListItemButton
                                    selected={selected?.id === item.id}
                                    onClick={() => setSelected(item)}
                                    sx={{
                                        borderRadius: 1,
                                        borderBottom: "1px solid #eee",
                                        "&.Mui-selected": {
                                            bgcolor: "rgba(255, 63, 1, 0.08)",
                                            borderLeft: `4px solid ${MAIN_ORANGE}`,
                                            "&:hover": { bgcolor: "rgba(255, 63, 1, 0.12)" }
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
                                            backgroundColor: statusColors[item.status]?.bg || '#eee',
                                            color: statusColors[item.status]?.color || '#333',
                                            fontWeight: 600,
                                            height: 24,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>

            {/* PANEL DETALLES */}
            <Paper sx={{ width: "62%", p: 3, height: "80vh", overflowY: "auto", borderRadius: 3 }}>
                {selected ? (
                    <>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" fontWeight={800}>
                                {selected.name}
                            </Typography>
                            <Chip 
                                label={selected.status} 
                                sx={{ 
                                    bgcolor: statusColors[selected.status]?.bg, 
                                    color: statusColors[selected.status]?.color, 
                                    fontWeight: 'bold' 
                                }} 
                            />
                        </Box>

                        <Typography variant="body1" color="text.secondary" mb={2}>
                            Submitted by <strong>{selected.submittedBy}</strong> on {selected.submittedOn}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* DESCRIPTION */}
                        <Typography variant="h6" fontWeight={700} mb={1}>
                            Project Description
                        </Typography>
                        <Typography variant="body1" mb={3} color="text.secondary">
                            {selected.description}
                        </Typography>

                        {/* HISTORY */}
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Approval History
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 0.5 }}>
                                {selected.history.map((h, idx) => (
                                    <React.Fragment key={idx}>
                                        <Box
                                            sx={{
                                                width: 14, height: 14, borderRadius: "50%",
                                                backgroundColor: MAIN_ORANGE,
                                                boxShadow: `0 0 0 3px rgba(255, 63, 1, 0.2)`
                                            }}
                                        />
                                        {idx < selected.history.length - 1 && (
                                            <Box sx={{ width: 2, height: 45, backgroundColor: "#E0E0E0" }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </Box>

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

                        {/* ACTION SECTION (Solo visible si está pendiente) */}
                        {selected.status === 'PENDIENTE' ? (
                            <>
                                <Typography variant="h6" fontWeight={700} mb={1}>
                                    Your Action
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Please review the project details before making a decision.
                                </Typography>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        disabled={processing}
                                        onClick={() => handleDecision("APROBADO")}
                                        sx={{
                                            bgcolor: "#10B981", // Verde
                                            fontWeight: 600,
                                            px: 4,
                                            "&:hover": { bgcolor: "#059669" }
                                        }}
                                    >
                                        ✓ Approve
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        disabled={processing}
                                        onClick={() => handleDecision("RECHAZADO")}
                                        sx={{ fontWeight: 600, px: 4 }}
                                    >
                                        ✕ Reject
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ p: 2, bgcolor: "#F3F4F6", borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    This request has already been processed.
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                        <Typography variant="h6" color="text.secondary">
                            Select a request from the left to view details.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}