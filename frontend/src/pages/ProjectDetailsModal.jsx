import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, // Importado para colocar los botones al final
    IconButton,
    Typography,
    Box,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Paper,
    Button,      // Nuevo
    TextField    // Nuevo
} from "@mui/material";
import {
    Close as CloseIcon,
    CalendarToday as CalendarTodayIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    MonetizationOn as MonetizationOnIcon,
    Edit as EditIcon, // Nuevo icono
    Save as SaveIcon  // Nuevo icono
} from "@mui/icons-material";

// Constante de color corporativo
const MAIN_ORANGE = "#FF3F01";

// --- SIMULACIÓN DE AUTH (En tu app real esto viene de un Context o Hook) ---
// Cambia esto a "VOLUNTEER" para probar que el botón desaparece.
const CURRENT_USER_ROLE = "VOLUNTEER";

const ProjectDetailsModal = ({ open, onClose, project }) => {
    // Estados para la edición
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (project) {
            setFormData(project);
            setIsEditing(false);
        }
    }, [project, open]);

    // Si no hay proyecto, retornar null
    if (!project) return null;

    // Lógica de Permisos
    const ALLOWED_ROLES = ["ADMIN", "REPRESENTATIVE", "EMPLOYEE"];
    const canEdit = ALLOWED_ROLES.includes(CURRENT_USER_ROLE);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        console.log("Enviando cambios al backend:", formData);
        // Aquí iría tu lógica de fetch/axios para actualizar
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(project); // Revertir cambios
        setIsEditing(false);
    };

    // Función auxiliar para colores de estado
    const getStatusStyles = (status) => {
        const s = status?.toLowerCase() || "";
        if (s === "active") return { bgcolor: "#D6E8FF", color: "#0B65D9", borderColor: "#0B65D9" };
        if (s.includes("completed") || s.includes("approved")) return { bgcolor: "#D9F7D9", color: "#1B7B1B", borderColor: "#1B7B1B" };
        if (s.includes("hold") || s.includes("pending") || s.includes("planning")) return { bgcolor: "#FFF8D5", color: "#C5A100", borderColor: "#C5A100" };
        if (s.includes("cancel") || s.includes("reject")) return { bgcolor: "#FAD4D4", color: "#B11A1A", borderColor: "#B11A1A" };
        return { bgcolor: "#F1F5F9", color: "#64748B", borderColor: "#CBD5E1" };
    };

    const statusStyle = getStatusStyles(formData.status);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            {/* ---------------- HEADER ---------------- */}
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pb: 1 }}>
                <Box sx={{ width: "100%", pr: 4 }}>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            name="title"
                            label="Project Title"
                            value={formData.title || ""}
                            onChange={handleInputChange}
                            variant="standard"
                            sx={{ mb: 1 }}
                            InputProps={{ style: { fontSize: '1.5rem', fontWeight: 800 } }}
                        />
                    ) : (
                        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {formData.title}
                        </Typography>
                    )}

                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip
                            icon={<BusinessIcon sx={{ "&&": { color: MAIN_ORANGE } }} />}
                            label={formData.ong}
                            size="small"
                            sx={{ bgcolor: "rgba(255, 63, 1, 0.08)", color: "#333", fontWeight: 600, border: "1px solid rgba(255, 63, 1, 0.2)" }}
                        />
                        <Chip
                            label={formData.status || "Pending"}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontWeight: 700,
                                bgcolor: statusStyle.bgcolor,
                                color: statusStyle.color,
                                borderColor: statusStyle.borderColor,
                                textTransform: 'capitalize'
                            }}
                        />
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent dividers sx={{ pb: 2 }}>
                {/* ---------------- KPI GRID REESTRUCTURADO ---------------- */}
                <Grid container spacing={2} sx={{ mb: 4 }}>

                    {/* 1. SUBMITTED BY */}
                    <Grid item xs={12}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2, display: "flex", alignItems: "center", gap: 3,
                                borderRadius: 2, borderColor: "#E2E8F0", bgcolor: "#FAFAFA"
                            }}
                        >
                            <Avatar sx={{ width: 56, height: 56, bgcolor: "rgba(255, 63, 1, 0.1)", color: MAIN_ORANGE }}>
                                <PersonIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1}>
                                    SUBMITTED BY
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="#1E293B">
                                    {formData.submittedBy}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* 2. DATE */}
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 2, borderRadius: 2, borderColor: "#E2E8F0" }}>
                            <Avatar sx={{ bgcolor: "rgba(255, 63, 1, 0.1)", color: MAIN_ORANGE }}>
                                <CalendarTodayIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>DATE</Typography>
                                <Typography variant="body1" fontWeight={600}>{formData.date}</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* 3. BUDGET (Editable) */}
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 2, borderRadius: 2, borderColor: "#E2E8F0" }}>
                            <Avatar sx={{ bgcolor: "rgba(255, 63, 1, 0.1)", color: MAIN_ORANGE }}>
                                <MonetizationOnIcon />
                            </Avatar>
                            <Box width="100%">
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL BUDGET</Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        name="totalBudget"
                                        value={formData.totalBudget || ""}
                                        onChange={handleInputChange}
                                        variant="standard"
                                        size="small"
                                    />
                                ) : (
                                    <Typography variant="body1" fontWeight={600}>{formData.totalBudget}</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* ---------------- DESCRIPTION (Editable) ---------------- */}
                <Box mb={4}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Description
                    </Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            name="description"
                            value={formData.description || ""}
                            onChange={handleInputChange}
                            variant="outlined"
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {formData.description}
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={4}>
                    {/* ---------------- APPROVAL HISTORY ---------------- */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            Approval History
                        </Typography>
                        <Box sx={{ ml: 1, borderLeft: "2px solid #E2E8F0", pl: 3, py: 1 }}>
                            {formData.history?.map((step, index) => (
                                <Box key={index} sx={{ mb: 3, position: "relative" }}>
                                    <Box
                                        sx={{
                                            position: "absolute", left: -31, top: 4, width: 12, height: 12, borderRadius: "50%",
                                            bgcolor: index === formData.history.length - 1 ? MAIN_ORANGE : "#CBD5E1",
                                            border: "2px solid white",
                                            boxShadow: index === formData.history.length - 1 ? `0 0 0 3px rgba(255, 63, 1, 0.2)` : "none"
                                        }}
                                    />
                                    <Typography variant="body2" fontWeight={700} color="#1E293B">{step.status}</Typography>
                                    <Box display="flex" justifyContent="space-between" width="90%">
                                        <Typography variant="caption" color="text.secondary">{step.date}</Typography>
                                        <Typography variant="caption" color="text.secondary" fontStyle="italic">{step.user}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* ---------------- PEOPLE INVOLVED ---------------- */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            People Involved
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {formData.team?.length > 0 ? formData.team.map((person, index) => (
                                <Chip
                                    key={index}
                                    avatar={<Avatar sx={{ bgcolor: "#F1F5F9", color: "#64748B" }}>{person.name.charAt(0)}</Avatar>}
                                    label={
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{person.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" fontSize={10}>{person.role}</Typography>
                                        </Box>
                                    }
                                    variant="outlined"
                                    sx={{ height: "auto", py: 0.5, borderColor: "#E2E8F0", borderRadius: 2 }}
                                />
                            )) : (
                                <Typography variant="caption" color="text.secondary">No team members assigned.</Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* ---------------- BUDGET TABLE ---------------- */}
                <Box mt={4}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Budget Breakdown
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: "#E2E8F0" }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Activity / Item</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Currency</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.budget?.length > 0 ? formData.budget.map((row, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{row.item}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>
                                            <Chip label={row.currency} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#F1F5F9" }} />
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {row.amount}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                                            No budget details available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </DialogContent>

            {/* ---------------- ACTIONS (EDIT / SAVE) ---------------- */}
            {canEdit && (
                <DialogActions sx={{ p: 3, bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0", justifyContent: "flex-end" }}>
                    {isEditing ? (
                        <>
                            <Button
                                onClick={handleCancel}
                                color="inherit"
                                sx={{ color: "#64748B", fontWeight: 600 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                variant="contained"
                                startIcon={<SaveIcon />}
                                sx={{ bgcolor: MAIN_ORANGE, fontWeight: 700, "&:hover": { bgcolor: "#D93602" } }}
                            >
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            startIcon={<EditIcon />}
                            sx={{
                                color: "#64748B", // Color Gris solicitado
                                fontWeight: 700,
                                textTransform: "none",
                                "&:hover": { bgcolor: "#E2E8F0", color: "#1E293B" }
                            }}
                        >
                            Edit Project Details
                        </Button>
                    )}
                </DialogActions>
            )}

        </Dialog>
    );
};

export default ProjectDetailsModal;