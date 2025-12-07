import React, { useState, useEffect } from "react";
import axios from 'axios';
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
  CircularProgress // Importante importar esto
} from "@mui/material";

export default function DonationsByProject() {
  // --- ESTADOS (Faltaban estos) ---
  const [project, setProject] = useState(""); // Filtro de proyecto
  const [range, setRange] = useState("");     // Filtro de rango de fecha
  const [usd, setUsd] = useState(false);      // Toggle de moneda

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/finance/donations/', {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedData = response.data.map(item => ({
          id: item.donation_id,
          donor: item.donor_name,
          project: item.project_name,
          date: item.donation_date, 
          // Si tu vista devuelve 'currency', úsalo, si no, pon un default
          original: `${item.currency || '$'} ${item.amount}`,
          usd: `$${item.amount}` 
      }));
      
      setRows(formattedData);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={project}
            label="Filter by Project"
            onChange={(e) => setProject(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {/* Aquí podrías mapear dinámicamente los proyectos si quisieras */}
            <MenuItem value="water">Water Wells Initiative</MenuItem>
            <MenuItem value="garden">Community Garden Program</MenuItem>
          </Select>
        </FormControl>

        {/* Date Range */}
        <FormControl sx={{ minWidth: 200 }} size="small">
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
            {loading ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            ) : rows.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No donations found.
                    </TableCell>
                </TableRow>
            ) : (
                rows.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.donor}</TableCell>
                    <TableCell>{r.project}</TableCell>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.original}</TableCell>
                    <TableCell>{r.usd}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}