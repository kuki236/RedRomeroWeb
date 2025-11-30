import React, { useState } from "react";
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

export default function ProjectReports() {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("");
  const [range, setRange] = useState("");
  const [status, setStatus] = useState("");

  const reports = [
    {
      id: 1,
      title: "Q1 Impact Summary",
      project: "Health Aid Peru",
      date: "2025-02-10",
      status: "Approved",
    },
    {
      id: 2,
      title: "Logistics Ops Overview",
      project: "Food Distribution Chile",
      date: "2025-01-18",
      status: "Pending",
    },
    {
      id: 3,
      title: "Education Progress Report",
      project: "Education for All Mexico",
      date: "2025-03-02",
      status: "Rejected",
    },
  ];

  const statusColors = {
    Approved: "success",
    Pending: "warning",
    Rejected: "error",
  };

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* TITLE + BUTTON */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          Project Reports
        </Typography>
        <Button variant="contained">Create New Report</Button>
      </Box>

      {/* FILTER BAR */}
      <Paper
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        {/* SEARCH */}
        <TextField
          size="small"
          placeholder="Search by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
            ),
          }}
        />

        {/* PROJECT FILTER */}
        <FormControl size="small" sx={{ width: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select value={project} label="Project" onChange={(e) => setProject(e.target.value)}>
            <MenuItem value="">All Projects</MenuItem>
            <MenuItem value="Health Aid Peru">Health Aid Peru</MenuItem>
            <MenuItem value="Food Distribution Chile">Food Distribution Chile</MenuItem>
            <MenuItem value="Education for All Mexico">Education for All Mexico</MenuItem>
          </Select>
        </FormControl>

        {/* DATE RANGE */}
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel>Date Range</InputLabel>
          <Select value={range} label="Date Range" onChange={(e) => setRange(e.target.value)}>
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>

        {/* STATUS FILTER */}
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
              <TableCell><strong>REPORT TITLE</strong></TableCell>
              <TableCell><strong>PROJECT NAME</strong></TableCell>
              <TableCell><strong>SUBMISSION DATE</strong></TableCell>
              <TableCell><strong>STATUS</strong></TableCell>
              <TableCell><strong>ACTIONS</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} hover sx={{ height: 64 }}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={statusColors[row.status]} />
                </TableCell>
                <TableCell>
                  <Button size="small">View</Button>
                  <Button size="small" sx={{ ml: 1 }}>Download</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
