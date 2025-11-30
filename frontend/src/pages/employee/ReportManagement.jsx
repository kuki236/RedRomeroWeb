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

export default function CreateNewReport() {
  const [project, setProject] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} mb={1}>
        Create New Report
      </Typography>

      <Typography color="gray" mb={3}>
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
          sx={{ mb: 3 }}
        />

        {/* Associated Project */}
        <Typography fontWeight={600} mb={1}>
          Associated Project
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
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
          sx={{ mb: 3 }}
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
        />
      </Paper>

      {/* FILE UPLOAD CARD */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Attach File
        </Typography>

        <Box
          sx={{
            border: "2px dashed #c5c5c5",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <input
            type="file"
            style={{ display: "none" }}
            id="file-input"
            onChange={handleFile}
          />

          <label htmlFor="file-input" style={{ cursor: "pointer" }}>
            {file ? (
              <Typography>{file.name}</Typography>
            ) : (
              <Typography color="gray">Drag & drop file here or click to browse</Typography>
            )}
          </label>
        </Box>
      </Paper>

      {/* BUTTONS */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" color="inherit" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="outlined" sx={{ flex: 1 }}>
          Save as Draft
        </Button>
        <Button
          variant="contained"
          sx={{ flex: 1, backgroundColor: "#FF6934", ":hover": { backgroundColor: "#e85d2f" } }}
        >
          Submit Report
        </Button>
      </Box>
    </Box>
  );
}
