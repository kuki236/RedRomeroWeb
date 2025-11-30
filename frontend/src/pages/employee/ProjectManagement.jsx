import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRoleProtection } from "../../hooks/useRoleProtection";

export default function MyProjects() {
  useRoleProtection("EMPLOYEE");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows([
      {
        id: 1,
        name: "Community Outreach Program",
        lead: "Ana Torres",
        status: "active",
        end: "2025-04-12",
        updated: "2 days ago",
      },
      {
        id: 2,
        name: "Healthcare Access Initiative",
        lead: "Luis Gómez",
        status: "completed",
        end: "2024-12-01",
        updated: "1 week ago",
      },
      {
        id: 3,
        name: "Youth Education Project",
        lead: "Clara Ruiz",
        status: "on hold",
        end: "2025-08-19",
        updated: "3 days ago",
      },
      {
        id: 4,
        name: "Food Distribution Program",
        lead: "Marco Díaz",
        status: "cancelled",
        end: "2023-05-10",
        updated: "1 month ago",
      },
    ]);
  }, []);

  const filtered = rows.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const statusColors = {
    active: { bg: "#D6E8FF", color: "#0B65D9" },
    completed: { bg: "#D9F7D9", color: "#1B7B1B" },
    onhold: { bg: "#FFF8D5", color: "#C5A100" },
    cancelled: { bg: "#FAD4D4", color: "#B11A1A" },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ---------- TITLE ---------- */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Project Management
      </Typography>

      {/* ---------- TOP BAR ---------- */}
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
        {/* Search */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
            fullWidth
          />
        </Box>

        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="on hold">On Hold</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sort}
            label="Sort by"
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="name">Project Name</MenuItem>
            <MenuItem value="updated">Last Updated</MenuItem>
            <MenuItem value="end">End Date</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* ---------- TABLE ---------- */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
              <TableCell><strong>Project Name</strong></TableCell>
              <TableCell><strong>Team Lead</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Last Updated</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} hover sx={{ height: 64 }}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.lead}</TableCell>

                {/* STATUS CHIP */}
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[row.status]?.bg,
                      color: statusColors[row.status]?.color,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  />
                </TableCell>

                <TableCell>{row.end}</TableCell>
                <TableCell>{row.updated}</TableCell>

                {/* ACTIONS */}
                <TableCell align="right">
                  <Button size="small">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
