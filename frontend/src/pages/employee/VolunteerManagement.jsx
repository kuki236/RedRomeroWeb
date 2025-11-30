import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function VolunteerManagement() {
  const [query, setQuery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [volunteers, setVolunteers] = useState([]);

  const [specialty, setSpecialty] = useState("");
  const [project, setProject] = useState("");

  useEffect(() => {
    setVolunteers([
      {
        id: 1,
        name: "Carlos Mendoza",
        specialty: "Medicina",
        project: "Health Aid Peru",
        start: "2024-09-01",
        end: "2024-12-15",
      },
      {
        id: 2,
        name: "Laura Torres",
        specialty: "Logística",
        project: "Food Distribution Chile",
        start: "2025-01-10",
        end: "—",
      },
    ]);
  }, []);

  const filtered = volunteers.filter((v) =>
    v.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Volunteer Management
      </Typography>

      {/* TOP BAR */}
      <Paper
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        {/* SEARCH */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search volunteer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
              ),
            }}
          />
        </Box>

        {/* Assign Button */}
        <Button
          variant="contained"
          sx={{ ml: "auto" }}
          onClick={() => setAssignOpen(true)}
        >
          Assign Volunteer
        </Button>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
              <TableCell><strong>Voluntario</strong></TableCell>
              <TableCell><strong>Proyecto</strong></TableCell>
              <TableCell><strong>Especialidad</strong></TableCell>
              <TableCell><strong>Fecha Inicio</strong></TableCell>
              <TableCell><strong>Fecha Fin</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} hover sx={{ height: 64 }}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell>{row.specialty}</TableCell>
                <TableCell>{row.start}</TableCell>
                <TableCell>{row.end}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="error">
                    Remove Volunteer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ASSIGN VOLUNTEER DRAWER */}
      <Drawer anchor="right" open={assignOpen} onClose={() => setAssignOpen(false)}>
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Assign Volunteer
          </Typography>

          {/* SPECIALTY */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Specialty</InputLabel>
            <Select value={specialty} label="Specialty" onChange={(e) => setSpecialty(e.target.value)}>
              <MenuItem value="Medicina">Medicina</MenuItem>
              <MenuItem value="Logística">Logística</MenuItem>
              <MenuItem value="Psicología">Psicología</MenuItem>
            </Select>
          </FormControl>

          {/* PROJECT */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Project</InputLabel>
            <Select value={project} label="Project" onChange={(e) => setProject(e.target.value)}>
              <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
              <MenuItem value="Food Distribution Chile">Food Distribution Chile</MenuItem>
              <MenuItem value="Education for All Mexico">Education for All Mexico</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" fullWidth sx={{ mt: 2 }}>
            Assign
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
