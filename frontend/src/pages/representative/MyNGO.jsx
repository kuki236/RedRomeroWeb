import React, { useEffect, useState } from "react";
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, Chip, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Divider, CircularProgress
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function MyNGO() {
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNGOData = async () => {
            const token = localStorage.getItem('token');
            try {
                // Endpoint nuevo que creamos
                const response = await axios.get('http://127.0.0.1:8000/api/representative/my-ngo/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNgo(response.data);
            } catch (error) {
                console.error("Error fetching NGO data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNGOData();
    }, []);

    const statusColors = {
        'PLANIFICACION': { bg: "#FFF4CC", color: "#B08900" },
        'ACTIVO': { bg: "#D6E4FF", color: "#1A4DB3" },
        'COMPLETADO': { bg: "#D1F7D1", color: "#1F7A1F" },
        'CANCELADO': { bg: "#FFD6D6", color: "#B30000" },
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;
    if (!ngo) return <Typography p={3}>No NGO data found for this representative.</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            {/* TOP NGO CARD */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: "flex", gap: 3, alignItems: "center" }}>
                <Box sx={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AccountBalanceIcon sx={{ fontSize: 40, color: "#FF3F01" }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight={900}>{ngo.name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1.5 }}>
                        <LocationOnIcon sx={{ opacity: 0.6 }} />
                        <Typography sx={{ color: "gray" }}>{ngo.city}, {ngo.country}</Typography>
                        <Typography sx={{ opacity: 0.4 }}>|</Typography>
                        <Typography sx={{ color: "gray" }}>Member since {ngo.memberSince}</Typography>
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* OVERVIEW */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: "100%", borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight={800} mb={2}>Overview</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            <Typography><strong>Total Projects:</strong> {ngo.overview.totalProjects}</Typography>
                            <Typography><strong>Active Budgets:</strong> {ngo.overview.active}</Typography>
                            <Typography><strong>Total Raised:</strong> ${ngo.overview.totalRaised?.toLocaleString()}</Typography>
                            <Typography><strong>Success Rate:</strong> {ngo.overview.successRate}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* CONTACT INFO */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: "100%", borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight={800} mb={2}>Contact Info</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            <Typography><strong>Address:</strong> {ngo.contact.address}</Typography>
                            <Typography><strong>Phone:</strong> {ngo.contact.phone}</Typography>
                            <Typography><strong>Email:</strong> {ngo.contact.email}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography><strong>Representative:</strong> {ngo.contact.representative}</Typography>
                            <Typography><strong>Rep Email:</strong> {ngo.contact.repEmail}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* PROJECTS TABLE */}
            <Paper sx={{ mt: 3, p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={2}>Active Projects Budget</Typography>
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
                            {ngo.activeProjects.map((p) => (
                                <TableRow key={p.project_id} hover>
                                    <TableCell>{p.project_name}</TableCell>
                                    <TableCell>{p.currency_code} {p.budget_amount?.toLocaleString()}</TableCell>
                                    <TableCell>{p.total_received?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${p.status_name} (${p.budget_utilization_percent}%)`}
                                            sx={{
                                                backgroundColor: statusColors[p.status_name]?.bg,
                                                color: statusColors[p.status_name]?.color,
                                                fontWeight: 700, textTransform: "capitalize"
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {ngo.activeProjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No active projects found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}