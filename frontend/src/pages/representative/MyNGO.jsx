import React, { useEffect, useState } from "react";
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, Chip, Table, TableHead, TableRow, 
    TableCell, TableBody, TableContainer, Divider, CircularProgress, Alert
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function MyNGO() {
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNGOData = async () => {
            const token = localStorage.getItem('token');
            try {
                setLoading(true);
                const response = await axios.get('http://127.0.0.1:8000/api/representative/my-ngo/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const data = response.data;

                // --- MAPEO DE DATOS ---
                // Transformamos la respuesta del backend al formato que usa la UI
                const processedNGO = {
                    ...data,
                    // Mapeamos los proyectos activos para que la tabla los lea fácil
                    activeProjects: data.activeProjects.map(p => ({
                        id: p.project_id,
                        name: p.project_name,
                        // Formateamos dinero: "USD 50,000"
                        budget: `${p.currency_code || '$'} ${p.budget_amount?.toLocaleString() || '0'}`,
                        raised: `${p.currency_code || '$'} ${p.total_received?.toLocaleString() || '0'}`,
                        status: p.status_name, // ej: 'ACTIVO'
                        progress: p.budget_utilization_percent || 0
                    }))
                };

                setNgo(processedNGO);
            } catch (err) {
                console.error("Error fetching NGO data:", err);
                setError("Failed to load NGO information.");
            } finally {
                setLoading(false);
            }
        };

        fetchNGOData();
    }, []);

    // Colores basados en los valores exactos de tu Base de Datos (Oracle)
    const statusColors = {
        'PLANIFICACION': { bg: "#FFF4CC", color: "#B08900" },
        'ACTIVO': { bg: "#D6E4FF", color: "#1A4DB3" },
        'COMPLETADO': { bg: "#D1F7D1", color: "#1F7A1F" },
        'CANCELADO': { bg: "#FFD6D6", color: "#B30000" },
        // Fallbacks por si acaso
        'PENDIENTE': { bg: "#FFF4CC", color: "#B08900" },
    };

    if (loading) return <Box display="flex" justifyContent="center" p={10}><CircularProgress sx={{ color: '#FF3F01' }} /></Box>;
    if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
    if (!ngo) return <Typography p={3}>No data available.</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            {/* TOP NGO CARD */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AccountBalanceIcon sx={{ fontSize: 40, color: "#FF3F01" }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight={900} color="#1E293B">{ngo.name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1.5, flexWrap: "wrap" }}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOnIcon sx={{ opacity: 0.6, fontSize: 18 }} />
                            <Typography sx={{ color: "gray" }}>{ngo.city}, {ngo.country}</Typography>
                        </Box>
                        <Typography sx={{ opacity: 0.4 }}>|</Typography>
                        <Typography sx={{ color: "gray" }}>Member since {ngo.memberSince !== "N/A" ? ngo.memberSince : "2024"}</Typography>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* OVERVIEW */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: "100%", borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight={800} mb={2} color="#1E293B">Overview</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Total Projects</Typography>
                                <Typography fontWeight={700}>{ngo.overview?.totalProjects}</Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Active Budgets</Typography>
                                <Typography fontWeight={700}>{ngo.overview?.active}</Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Total Raised</Typography>
                                <Typography fontWeight={700} color="success.main">
                                    ${ngo.overview?.totalRaised?.toLocaleString()}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Success Rate</Typography>
                                <Typography fontWeight={700}>{ngo.overview?.successRate}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* CONTACT INFO */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: "100%", borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight={800} mb={2} color="#1E293B">Contact Info</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            <Typography><strong>Address:</strong> {ngo.contact?.address}</Typography>
                            <Typography><strong>Phone:</strong> {ngo.contact?.phone}</Typography>
                            <Typography><strong>Email:</strong> {ngo.contact?.email}</Typography>
                            
                            <Box sx={{ mt: 2, p: 2, bgcolor: "#F8FAFC", borderRadius: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" mb={0.5}>Representative</Typography>
                                <Typography fontWeight={600}>{ngo.contact?.representative}</Typography>
                                <Typography variant="body2" color="text.secondary">{ngo.contact?.repEmail}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* --- ACTIVE PROJECTS BUDGET (CORREGIDO) --- */}
            <Paper sx={{ mt: 3, p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={2} color="#1E293B">
                    Active Projects Budget (Snapshot)
                </Typography>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                                <TableCell><strong>PROJECT</strong></TableCell>
                                <TableCell><strong>BUDGET</strong></TableCell>
                                <TableCell><strong>RAISED</strong></TableCell>
                                <TableCell><strong>STATUS / UTILIZATION</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ngo.activeProjects && ngo.activeProjects.length > 0 ? (
                                ngo.activeProjects.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                        <TableCell>{p.budget}</TableCell>
                                        <TableCell>{p.raised}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${p.status} (${p.progress}%)`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: statusColors[p.status]?.bg || '#E0E0E0',
                                                    color: statusColors[p.status]?.color || '#333',
                                                    fontWeight: 700, 
                                                    textTransform: "capitalize",
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        No active projects found for this NGO.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}