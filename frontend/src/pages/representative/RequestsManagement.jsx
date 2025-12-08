import React, { useState, useEffect } from "react";
import axios from "axios";
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
    CircularProgress
} from "@mui/material";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function RequestProjectApproval() {
    // --- STATE ---
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    
    // Form Data
    const [formData, setFormData] = useState({
        project_id: "",
        employee_id: "", // Assignee
        notes: ""
    });

    // --- FETCH DATA (Proyectos y Empleados) ---
    useEffect(() => {
        const fetchResources = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                setLoadingData(true);
                
                // 1. Cargar Proyectos de la ONG del representante
                const projReq = axios.get('http://127.0.0.1:8000/api/representative/my-projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Cargar Empleados (Para asignar la aprobación)
                const empReq = axios.get('http://127.0.0.1:8000/api/admin/employees/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const [projRes, empRes] = await Promise.all([projReq, empReq]);

                // El endpoint del representante devuelve proyectos con project_id y name
                setProjects(projRes.data || []);
                setEmployees(empRes.data || []);
            } catch (error) {
                console.error("Error loading resources:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchResources();
    }, []);

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        
        if (!formData.project_id || !formData.employee_id) {
            alert("Please select a project and an assignee.");
            return;
        }

        try {
            // Llamada al endpoint definido en ApprovalWorkflowView
            await axios.post('http://127.0.0.1:8000/api/workflow/approvals/', {
                project_id: formData.project_id,
                employee_id: formData.employee_id,
                status_id: 1, // 1 = PENDIENTE (Asumiendo ID 1 en tu tabla Approval_Status)
                // Nota: Tu SP actual 'create_approval' no recibe 'notes', 
                // pero se envía por si actualizas el backend en el futuro.
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Approval request submitted successfully!");
            // Reset form
            setFormData({ project_id: "", employee_id: "", notes: "" });

        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to submit request: " + (error.response?.data?.error || error.message));
        }
    };

    // Estilo reutilizable
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
                Request Project Approval
            </Typography>

            {/* FORM CONTAINER */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    New Approval Request
                </Typography>

                {loadingData ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress sx={{ color: MAIN_ORANGE }} />
                    </Box>
                ) : (
                    <>
                        {/* SELECT PROJECT */}
                        <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
                            <InputLabel>Select Project</InputLabel>
                            <Select
                                name="project_id"
                                value={formData.project_id}
                                label="Select Project"
                                onChange={handleChange}
                            >
                                {projects.map((p) => (
                                    <MenuItem key={p.project_id} value={p.project_id}>
                                        {p.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* ASSIGN APPROVAL */}
                        <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
                            <InputLabel>Assign Approval To</InputLabel>
                            <Select
                                name="employee_id"
                                value={formData.employee_id}
                                label="Assign Approval To"
                                onChange={handleChange}
                            >
                                {employees.map((e) => (
                                    <MenuItem key={e.employee_id} value={e.employee_id}>
                                        {e.first_name} {e.last_name} ({e.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* NOTES */}
                        <Typography fontWeight={600} mb={1}>
                            Justification / Notes
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            placeholder="Add justification or additional notes here..."
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            sx={{ mb: 3, ...inputStyle }}
                        />

                        {/* ATTACH DOCUMENTS (Visual Only - Backend support pending in SP) */}
                        <Typography fontWeight={600} mb={1}>
                            Attach Documents (Optional)
                        </Typography>
                        <Box
                            sx={{
                                border: "2px dashed #ccc",
                                borderRadius: 2,
                                p: 4,
                                textAlign: "center",
                                color: "#777",
                                mb: 3,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                    borderColor: MAIN_ORANGE,
                                    color: MAIN_ORANGE,
                                    bgcolor: "rgba(255, 63, 1, 0.04)"
                                }
                            }}
                        >
                            Drag & Drop files here or click to browse
                        </Box>

                        {/* ACTION BUTTONS */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setFormData({ project_id: "", employee_id: "", notes: "" })}
                                sx={{
                                    borderColor: MAIN_ORANGE,
                                    color: MAIN_ORANGE,
                                    fontWeight: 600,
                                    "&:hover": {
                                        borderColor: DARK_ORANGE,
                                        bgcolor: "rgba(255, 63, 1, 0.1)"
                                    }
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    bgcolor: MAIN_ORANGE,
                                    fontWeight: 600,
                                    "&:hover": {
                                        bgcolor: DARK_ORANGE
                                    }
                                }}
                            >
                                Submit for Approval
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
}