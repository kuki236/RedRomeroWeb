import React, { useEffect, useState } from "react";
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
    Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";

export default function MyNGO() {
    const [ngo, setNgo] = useState(null);

    useEffect(() => {
        // MOCK DATA
        setNgo({
            name: "Global Relief Initiative",
            city: "Lima",
            country: "Peru",
            memberSince: "2020-04-15",
            icon: <AccountBalanceIcon sx={{ fontSize: 60, color: "#FF3F01" }} />,

            overview: {
                totalProjects: 42,
                active: 12,
                completed: 28,
                totalRaised: "$540,000",
                successRate: "87%",
            },

            contact: {
                address: "Av. Los Héroes 123, Lima, Peru",
                phone: "+51 987 654 321",
                email: "contact@globalrelief.org",
                representative: "María González",
                repEmail: "mgonzalez@globalrelief.org",
            },

            activeProjects: [
                {
                    id: 1,
                    name: "Clean Water Wells",
                    budget: "$80,000",
                    raised: "$65,000",
                    status: "in progress",
                    progress: 82,
                },
                {
                    id: 2,
                    name: "Child Nutrition Program",
                    budget: "$120,000",
                    raised: "$120,000",
                    status: "completed",
                    progress: 100,
                },
                {
                    id: 3,
                    name: "Medical Supply Delivery",
                    budget: "$45,000",
                    raised: "$28,000",
                    status: "planning",
                    progress: 40,
                },
            ],
        });
    }, []);

    const statusColors = {
        planning: { bg: "#FFF4CC", color: "#B08900" },
        "in progress": { bg: "#D6E4FF", color: "#1A4DB3" },
        completed: { bg: "#D1F7D1", color: "#1F7A1F" },
        cancelled: { bg: "#FFD6D6", color: "#B30000" },
    };

    if (!ngo) return null;

    return (
        <Box sx={{ p: 3 }}>
            {/* TOP NGO CARD */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    borderRadius: 4,
                }}
            >
                {/* ICON */}
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "#FFF5F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {ngo.icon}
                </Box>

                {/* INFO */}
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        {ngo.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1.5 }}>
                        <LocationOnIcon sx={{ opacity: 0.6 }} />
                        <Typography sx={{ color: "gray" }}>
                            {ngo.city}, {ngo.country}
                        </Typography>

                        <Typography sx={{ opacity: 0.4 }}>|</Typography>

                        <Typography sx={{ color: "gray" }}>
                            Member since {ngo.memberSince}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* OVERVIEW + CONTACT INFO */}
            <Grid container spacing={3}>
                {/* OVERVIEW CARD */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            height: "100%",
                            borderRadius: 4,
                        }}
                    >
                        <Typography variant="h6" fontWeight={800} mb={2}>
                            Overview
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            <Typography>
                                <strong>Total Projects:</strong> {ngo.overview.totalProjects}
                            </Typography>
                            <Typography>
                                <strong>Active:</strong> {ngo.overview.active}
                            </Typography>
                            <Typography>
                                <strong>Completed:</strong> {ngo.overview.completed}
                            </Typography>
                            <Typography>
                                <strong>Total Raised:</strong> {ngo.overview.totalRaised}
                            </Typography>
                            <Typography>
                                <strong>Success Rate:</strong> {ngo.overview.successRate}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* CONTACT INFO */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
                            height: "100%",
                            borderRadius: 4,
                        }}
                    >
                        <Typography variant="h6" fontWeight={800} mb={2}>
                            Contact Info
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            <Typography>
                                <strong>Address:</strong> {ngo.contact.address}
                            </Typography>

                            <Typography>
                                <strong>Phone:</strong> {ngo.contact.phone}
                            </Typography>

                            <Typography>
                                <strong>Email:</strong> {ngo.contact.email}
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Typography>
                                <strong>Representative:</strong> {ngo.contact.representative}
                            </Typography>

                            <Typography>
                                <strong>Rep Email:</strong> {ngo.contact.repEmail}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* ACTIVE PROJECTS TABLE */}
            <Paper
                sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 4,
                }}
            >
                <Typography variant="h6" fontWeight={800} mb={2}>
                    Active Projects Budget
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                                <TableCell>
                                    <strong>PROJECT</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>BUDGET</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>RAISED</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>STATUS</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {ngo.activeProjects.map((p) => (
                                <TableRow key={p.id} hover sx={{ height: 68 }}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.budget}</TableCell>
                                    <TableCell>{p.raised}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={`${p.status} (${p.progress}%)`}
                                            sx={{
                                                backgroundColor: statusColors[p.status]?.bg,
                                                color: statusColors[p.status]?.color,
                                                fontWeight: 700,
                                                textTransform: "capitalize",
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
