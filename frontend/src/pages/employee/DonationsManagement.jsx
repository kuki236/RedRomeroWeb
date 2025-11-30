import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Switch,
} from "@mui/material";

export default function DonationsByProject() {
  const [project, setProject] = useState("");
  const [range, setRange] = useState("");
  const [usd, setUsd] = useState(true);

  const rows = [
    {
      donor: "John Smith",
      project: "Water Wells Initiative",
      date: "2024-10-12",
      original: "$500",
      usd: "$500",
    },
    {
      donor: "Ana Torres",
      project: "Community Garden Program",
      date: "2024-09-30",
      original: "€300",
      usd: "$318",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Donations by Project
      </Typography>

      {/* Filters */}
      <Paper
        sx={{
          p: 3,
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          alignItems: "center",
          mb: 4,
        }}
      >
        {/* Project Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={project}
            label="Filter by Project"
            onChange={(e) => setProject(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="water">Water Wells Initiative</MenuItem>
            <MenuItem value="garden">Community Garden Program</MenuItem>
          </Select>
        </FormControl>

        {/* Date Range */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={range}
            label="Date Range"
            onChange={(e) => setRange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
            <MenuItem value="365">Last Year</MenuItem>
          </Select>
        </FormControl>

        {/* Toggle USD */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={600}>Show in USD</Typography>
          <Switch checked={usd} onChange={() => setUsd(!usd)} />
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F9FAFB" }}>
              <TableCell sx={{ fontWeight: 700 }}>DONOR NAME</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>PROJECT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DATE</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ORIGINAL AMOUNT</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>AMOUNT IN USD</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.donor}</TableCell>
                <TableCell>{r.project}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.original}</TableCell>
                <TableCell>{r.usd}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
