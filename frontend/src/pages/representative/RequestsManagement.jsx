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

export default function RequestProjectApproval() {
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [notes, setNotes] = useState("");

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
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
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
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
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
          sx={{ mb: 3 }}
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
          }}
        >
          Drag & Drop files here or click to browse
        </Box>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Submit for Approval</Button>
        </Box>
      </Paper>
    </Box>
  );
}
