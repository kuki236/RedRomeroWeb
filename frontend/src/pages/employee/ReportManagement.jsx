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
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Constantes de color
const MAIN_ORANGE = "#FF3F01";
const DARK_ORANGE = "#D93602";

export default function ReportManagement() {
  const navigate = useNavigate();

  // --- STATE ---
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    date: new Date().toISOString().split('T')[0], // Default today
    description: "",
    file: null
  });

  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // --- 1. FETCH PROJECTS ---
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/projects/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProjectsList(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        showNotification("Failed to load projects list", "error");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    
    // Validación básica
    if (!formData.title || !formData.project_id || !formData.description) {
        showNotification("Please fill in all required fields", "warning");
        return;
    }

    setSubmitting(true);
    try {
        // Nota: El backend actualmente espera 'file_url' como string. 
        // En una implementación real con archivos, aquí subirías el archivo primero a S3/Cloudinary 
        // o usarías FormData. Por ahora enviamos el nombre del archivo como URL simulada.
        const payload = {
            title: formData.title,
            project_id: formData.project_id,
            description: formData.description,
            // Backend ignora la fecha enviada y usa SYSDATE, pero la mantenemos en el form por UX
            file_url: formData.file ? `uploads/${formData.file.name}` : "" 
        };

        await axios.post('http://127.0.0.1:8000/api/workflow/reports/', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showNotification("Report submitted successfully!", "success");
        
        // Reset form or redirect
        setTimeout(() => {
            navigate('/dashboard/employee'); // O redirigir a la lista de reportes
        }, 1500);

    } catch (error) {
        console.error("Error creating report:", error);
        showNotification("Failed to submit report. " + (error.response?.data?.error || ""), "error");
    } finally {
        setSubmitting(false);
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
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
        <Typography fontWeight={600} mb={1}>Report Title</Typography>
        <TextField
          fullWidth
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Q3 Community Outreach Summary"
          sx={{ mb: 3, ...inputStyle }}
        />

        {/* Associated Project */}
        <Typography fontWeight={600} mb={1}>Associated Project</Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3, ...inputStyle }}>
          <InputLabel>Select a project</InputLabel>
          <Select
            name="project_id"
            value={formData.project_id}
            label="Select a project"
            onChange={handleChange}
            disabled={loadingProjects}
          >
            {loadingProjects ? (
                <MenuItem disabled><CircularProgress size={20} /></MenuItem>
            ) : projectsList.length > 0 ? (
                projectsList.map((p) => (
                    // Aseguramos compatibilidad si el endpoint devuelve 'id' o 'project_id'
                    <MenuItem key={p.project_id || p.id} value={p.project_id || p.id}>
                        {p.name || p.project}
                    </MenuItem>
                ))
            ) : (
                <MenuItem disabled>No projects available</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Report Date */}
        <Typography fontWeight={600} mb={1}>Report Date</Typography>
        <TextField
          type="date"
          name="date"
          fullWidth
          size="small"
          value={formData.date}
          onChange={handleChange}
          sx={{ mb: 3, ...inputStyle }}
          helperText="Date will be recorded as today by the system."
        />

        {/* Report Body */}
        <Typography fontWeight={600} mb={1}>Report Body / Content</Typography>
        <TextField
          fullWidth
          multiline
          name="description"
          value={formData.description}
          onChange={handleChange}
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

          {formData.file ? (
            <Typography fontWeight={600} color={MAIN_ORANGE}>
              {formData.file.name}
            </Typography>
          ) : (
            <>
                <CloudUpload sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
                <Typography color="text.secondary" className="upload-text" sx={{ transition: "color 0.2s" }}>
                Drag & drop file here or click to browse
                </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* BUTTONS */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate(-1)}
          sx={{ flex: 1, borderColor: "#ccc", color: "#666" }}
          disabled={submitting}
        >
          Cancel
        </Button>

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
          disabled={submitting}
        >
          Save as Draft
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            flex: 1,
            backgroundColor: MAIN_ORANGE,
            fontWeight: 700,
            ":hover": { backgroundColor: DARK_ORANGE }
          }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Report"}
        </Button>
      </Box>

      {/* NOTIFICATION */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
            {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}