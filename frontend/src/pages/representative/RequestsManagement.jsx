import React, { useState } from "react";
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
} from "@mui/material";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function RequestProjectApproval() {
    const [project, setProject] = useState("");
    const [assignee, setAssignee] = useState("");
    const [notes, setNotes] = useState("");

    // Estilo reutilizable para que los inputs se pongan naranjas al hacer focus
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

                {/* SELECT PROJECT */}
                <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={project}
                        label="Select Project"
                        onChange={(e) => setProject(e.target.value)}
                    >
                        <MenuItem value="Community Water Well">Community Water Well</MenuItem>
                        <MenuItem value="Shelter Renovation">Shelter Renovation</MenuItem>
                        <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
                    </Select>
                </FormControl>

                {/* ASSIGN APPROVAL */}
                <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
                    <InputLabel>Assign Approval To</InputLabel>
                    <Select
                        value={assignee}
                        label="Assign Approval To"
                        onChange={(e) => setAssignee(e.target.value)}
                    >
                        <MenuItem value="Maria Lopez">Maria Lopez</MenuItem>
                        <MenuItem value="John Carter">John Carter</MenuItem>
                        <MenuItem value="Anne Ruiz">Anne Ruiz</MenuItem>
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 3, ...inputStyle }}
                />

                {/* ATTACH DOCUMENTS */}
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
                    {/* Botón CANCEL (Outlined Naranja) */}
                    <Button
                        variant="outlined"
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

                    {/* Botón SUBMIT (Contained Naranja) */}
                    <Button
                        variant="contained"
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
            </Paper>
        </Box>
    );
}