import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";

// Constantes de color (Mismo naranja que el resto de tu app)
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function CreateNewReport() {
    const [project, setProject] = useState("");
    const [date, setDate] = useState("");
    const [file, setFile] = useState(null);

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    // Estilo reutilizable para inputs (Focus Naranja)
    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    return (
        <Box sx={{ p: 3, maxWidth: 900 }}>
            {/* TITLE */}
            <Typography variant="h4" fontWeight={800} mb={1}>
                Create New Report
            </Typography>

            <Typography color="text.secondary" mb={3}>
                Fill in the details below to generate a new report.
            </Typography>

            {/* REPORT DETAILS CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Report Details
                </Typography>

                {/* Report Title */}
                <Typography fontWeight={600} mb={1}>
                    Report Title
                </Typography>
                <TextField
                    fullWidth
                    placeholder="e.g., Q3 Community Outreach Summary"
                    sx={{ mb: 3, ...inputStyle }}
                />

                {/* Associated Project */}
                <Typography fontWeight={600} mb={1}>
                    Associated Project
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
                    <InputLabel>Select a project</InputLabel>
                    <Select
                        value={project}
                        label="Select a project"
                        onChange={(e) => setProject(e.target.value)}
                    >
                        <MenuItem value="Project A">Project A</MenuItem>
                        <MenuItem value="Project B">Project B</MenuItem>
                        <MenuItem value="Project C">Project C</MenuItem>
                    </Select>
                </FormControl>

                {/* Report Date */}
                <Typography fontWeight={600} mb={1}>
                    Report Date
                </Typography>
                <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    sx={{ mb: 3, ...inputStyle }}
                />

                {/* Report Body */}
                <Typography fontWeight={600} mb={1}>
                    Report Body / Content
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Provide a detailed description of the report's content..."
                    sx={inputStyle}
                />
            </Paper>

            {/* FILE UPLOAD CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Attach File
                </Typography>

                <Box
                    component="label"
                    htmlFor="file-input"
                    sx={{
                        display: "block",
                        border: "2px dashed #c5c5c5",
                        borderRadius: 2,
                        p: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        // Efecto Hover Naranja
                        "&:hover": {
                            borderColor: MAIN_ORANGE,
                            backgroundColor: "rgba(255, 63, 1, 0.04)",
                            "& .upload-text": { color: MAIN_ORANGE }
                        }
                    }}
                >
                    <input
                        type="file"
                        style={{ display: "none" }}
                        id="file-input"
                        onChange={handleFile}
                    />

                    {file ? (
                        <Typography fontWeight={600} color={MAIN_ORANGE}>
                            {file.name}
                        </Typography>
                    ) : (
                        <Typography color="text.secondary" className="upload-text" sx={{ transition: "color 0.2s" }}>
                            Drag & drop file here or click to browse
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* BUTTONS */}
            <Box sx={{ display: "flex", gap: 2 }}>
                {/* Cancel: Neutro */}
                <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ flex: 1, borderColor: "#ccc", color: "#666" }}
                >
                    Cancel
                </Button>

                {/* Save Draft: Naranja Outlined */}
                <Button
                    variant="outlined"
                    sx={{
                        flex: 1,
                        borderColor: MAIN_ORANGE,
                        color: MAIN_ORANGE,
                        "&:hover": {
                            borderColor: DARK_ORANGE,
                            backgroundColor: "rgba(255, 63, 1, 0.08)"
                        }
                    }}
                >
                    Save as Draft
                </Button>

                {/* Submit: Naranja Sólido */}
                <Button
                    variant="contained"
                    sx={{
                        flex: 1,
                        backgroundColor: MAIN_ORANGE,
                        fontWeight: 700,
                        ":hover": { backgroundColor: DARK_ORANGE }
                    }}
                >
                    Submit Report
                </Button>
            </Box>
        </Box>
    );
}