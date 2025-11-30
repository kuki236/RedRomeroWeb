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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function MyProjects() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [projects, setProjects] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setProjects([
      {
        id: 1,
        name: "Water Well Construction",
        status: "planning",
        start: "2025-01-10",
        end: "2025-06-20",
        progress: 20,
      },
      {
        id: 2,
        name: "Community School Program",
        status: "in progress",
        start: "2024-08-01",
        end: "2025-02-15",
        progress: 65,
      },
      {
        id: 3,
        name: "Food Aid Expansion",
        status: "completed",
        start: "2024-01-12",
        end: "2024-11-30",
        progress: 100,
      },
    ]);
  }, []);

  const statusColors = {
    planning: { bg: "#FFF3CD", color: "#B58400" },
    "in progress": { bg: "#CCE5FF", color: "#004085" },
    completed: { bg: "#D4EDDA", color: "#155724" },
    cancelled: { bg: "#F8D7DA", color: "#721C24" },
  };

  const filtered = projects.filter((p) => {
    const matchName = p.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus = status === "all" || p.status === status;
    return matchName && matchStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Projects
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            Manage all projects from your organization
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setDrawerOpen(true)}>
          Create New Project
        </Button>
      </Box>

      {/* FILTER BAR */}
      <Paper
        sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", mb: 3 }}
      >
        {/* STATUS FILTER BUTTONS */}
        {[
          { key: "all", label: "All" },
          { key: "planning", label: "Planning" },
          { key: "in progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ].map((s) => (
          <Button
            key={s.key}
            variant={status === s.key ? "contained" : "outlined"}
            onClick={() => setStatus(s.key)}
          >
            {s.label}
          </Button>
        ))}

        {/* SEARCH */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
              ),
            }}
          />
        </Box>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
              <TableCell><strong>Project Name</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Progress</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} hover sx={{ height: 70 }}>
                <TableCell>{p.name}</TableCell>

                {/* STATUS CHIP */}
                <TableCell>
                  <Chip
                    label={p.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[p.status]?.bg || "#E0E0E0",
                      color: statusColors[p.status]?.color || "#333",
                      textTransform: "capitalize",
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>{p.start}</TableCell>
                <TableCell>{p.end}</TableCell>

                {/* PROGRESS BAR */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 8,
                        backgroundColor: "#E0E0E0",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${p.progress}%`,
                          height: "100%",
                          backgroundColor: "#FF3F01",
                        }}
                      />
                    </Box>
                    <Typography variant="body2">{p.progress}%</Typography>
                  </Box>
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="right">
                  <Button size="small">Details</Button>
                  <Button size="small">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}