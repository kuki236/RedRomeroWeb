import React, { useEffect, useState } from "react";
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function MyNGO() {
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        // 1. Obtener KPIs financieros de la ONG (Vista vw_ngo_financial_overview)
        const response = await axios.get('http://127.0.0.1:8000/api/finance/kpis/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;

        // 2. Mapear datos del Backend (snake_case) al Frontend
        // Nota: Si el backend no devuelve datos, usamos valores por defecto para evitar pantallas blancas.
        if (data) {
            setNgo({
              name: data.ngo_name || "Mi Organización",
              city: "Lima", // Dato no disponible en este endpoint específico, se puede hardcodear o traer de otro
              country: "Peru",
              memberSince: "2024", 
              icon: <AccountBalanceIcon sx={{ fontSize: 60 }} />,
        
              overview: {
                totalProjects: data.total_projects || 0,
                // La vista actual vw_ngo_financial_overview no trae desglose de estados, 
                // usamos active_budgets como proxy o 0 si no hay dato.
                active: data.active_budgets || 0, 
                completed: (data.total_projects || 0) - (data.active_budgets || 0), // Calculado
                totalRaised: data.total_donations_received 
                    ? `$${parseFloat(data.total_donations_received).toLocaleString()}` 
                    : "$0",
                successRate: "95%", // Mock o cálculo futuro
              },
        
              contact: {
                address: "Oficina Principal",
                phone: "+51 000 000 000",
                email: "contacto@ong.org",
                representative: "Representante Actual",
                repEmail: "rep@ong.org",
              },
        
              // Nota: Para la tabla de proyectos, idealmente se usaría otro endpoint específico.
              // Por ahora mantenemos datos de ejemplo o vacíos para que no rompa.
              activeProjects: [
                {
                  id: 1,
                  name: "Ejemplo: Agua Potable",
                  budget: `$${parseFloat(data.total_budget || 0).toLocaleString()}`,
                  raised: `$${parseFloat(data.total_donations_received || 0).toLocaleString()}`,
                  status: "in progress",
                  progress: 75,
                }
              ],
            });
        } else {
            setError("No se encontraron datos para tu ONG.");
        }

      } catch (err) {
        console.error("Error fetching NGO data:", err);
        setError("Error cargando la información de la ONG.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusColors = {
    planning: { bg: "#FFF4CC", color: "#B08900" },
    "in progress": { bg: "#D6E4FF", color: "#1A4DB3" },
    completed: { bg: "#D1F7D1", color: "#1F7A1F" },
    cancelled: { bg: "#FFD6D6", color: "#B30000" },
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: '#FF3F01' }} />
        </Box>
    );
  }

  if (error) {
      return (
          <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
          </Box>
      );
  }

  if (!ngo) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* TOP NGO CARD */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* ICON */}
          {ngo.icon}

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {ngo.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <LocationOnIcon fontSize="small" sx={{ opacity: 0.7 }} />
              <Typography sx={{ color: "gray" }}>
                {ngo.city}, {ngo.country}
              </Typography>

              <Typography sx={{ mx: 1, opacity: 0.4 }}>|</Typography>

              <Typography sx={{ color: "gray" }}>
                Member since {ngo.memberSince}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

        <Grid 
        container 
        spacing={3} 
        alignItems="stretch"  
        sx={{ width: "100%", m: 0 }}
        >
        {/* LEFT COLUMN — OVERVIEW */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Paper sx={{ p: 3, width: "100%", height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                Overview
            </Typography>

            {/* Aquí es donde fallaba antes: ahora ngo.overview está garantizado */}
            <Typography><strong>Total Projects:</strong> {ngo.overview?.totalProjects}</Typography>
            <Typography><strong>Active:</strong> {ngo.overview?.active}</Typography>
            <Typography><strong>Completed:</strong> {ngo.overview?.completed}</Typography>
            <Typography><strong>Total Raised:</strong> {ngo.overview?.totalRaised}</Typography>
            <Typography><strong>Success Rate:</strong> {ngo.overview?.successRate}</Typography>
            </Paper>
        </Grid>

        {/* RIGHT COLUMN — CONTACT INFO */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Paper sx={{ p: 3, width: "100%", height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                Contact Info
            </Typography>

            <Typography><strong>Address:</strong> {ngo.contact?.address}</Typography>
            <Typography><strong>Phone:</strong> {ngo.contact?.phone}</Typography>
            <Typography><strong>Email:</strong> {ngo.contact?.email}</Typography>

            <Typography sx={{ mt: 2 }}>
                <strong>Representative:</strong> {ngo.contact?.representative}
            </Typography>
            <Typography><strong>Rep Email:</strong> {ngo.contact?.repEmail}</Typography>
            </Paper>
        </Grid>
        </Grid>


      {/* ACTIVE PROJECTS BUDGET TABLE */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Active Projects Budget (Snapshot)
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                <TableCell><strong>PROJECT</strong></TableCell>
                <TableCell><strong>BUDGET</strong></TableCell>
                <TableCell><strong>RAISED</strong></TableCell>
                <TableCell><strong>STATUS</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ngo.activeProjects?.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.budget}</TableCell>
                  <TableCell>{p.raised}</TableCell>

                  <TableCell>
                    <Chip
                      label={`${p.status} (${p.progress}%)`}
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 700,
                        backgroundColor: statusColors[p.status]?.bg,
                        color: statusColors[p.status]?.color,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}