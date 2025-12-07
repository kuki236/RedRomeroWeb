import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Collapse, IconButton, Switch, 
    FormControlLabel, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Definimos el color naranja global
const MAIN_ORANGE = "#FF3F01";

export default function DonationsReceived() {
    const [query, setQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("year"); 
    const [currencyUSD, setCurrencyUSD] = useState(true);
    const [rows, setRows] = useState([]); // Datos agrupados por proyecto
    const [openRow, setOpenRow] = useState(null);
    const [loading, setLoading] = useState(true);

    const [kpis, setKpis] = useState({
        totalDonations: 0,
        totalDonors: 0,
        topProject: { name: "N/A", amount: 0 },
    });

    useEffect(() => {
        fetchDonationsData();
    }, []);

    const fetchDonationsData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);
            // 1. Obtener todas las donaciones
            const response = await axios.get('http://127.0.0.1:8000/api/finance/donations/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const rawData = response.data;

            // 2. Procesar Datos: Agrupar por Proyecto
            const projectMap = {};
            let globalTotal = 0;
            const uniqueDonors = new Set();

            rawData.forEach(d => {
                const projName = d.project_name || "Unknown Project";
                const amount = parseFloat(d.amount);
                
                if (!projectMap[projName]) {
                    projectMap[projName] = {
                        id: d.project_id || Math.random(), // Fallback ID
                        name: projName,
                        total: 0,
                        count: 0,
                        recent: []
                    };
                }

                projectMap[projName].total += amount;
                projectMap[projName].count += 1;
                projectMap[projName].recent.push({
                    donor: d.donor_name,
                    date: d.donation_date, // Asumimos formato YYYY-MM-DD
                    amount: `${d.currency || '$'} ${amount.toLocaleString()}`
                });

                globalTotal += amount;
                uniqueDonors.add(d.donor_name); // Usamos nombre como ID único simple
            });

            // Convertir mapa a array
            const groupedRows = Object.values(projectMap);

            // 3. Calcular KPIs
            // Encontrar proyecto top
            let topProj = { name: "N/A", amount: 0 };
            groupedRows.forEach(p => {
                if (p.total > topProj.amount) {
                    topProj = { name: p.name, amount: p.total };
                }
            });

            setRows(groupedRows);
            setKpis({
                totalDonations: globalTotal,
                totalDonors: uniqueDonors.size,
                topProject: topProj
            });

        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = rows.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase())
    );

    const percentageStyle = { fontSize: 14, color: "green", fontWeight: 600 };

    const inputStyle = {
        "& label.Mui-focused": { color: MAIN_ORANGE },
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": { borderColor: MAIN_ORANGE },
        },
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: MAIN_ORANGE }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* ---------- TITLE ---------- */}
            <Typography variant="h4" fontWeight={800} mb={1}>
                Donations Received
            </Typography>

            {/* ---------- KPI CARDS ---------- */}
            <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
                {/* Total Donations */}
                <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
                    <Typography fontWeight={600}>Total Donations (Global)</Typography>
                    <Typography variant="h5" fontWeight={900} mt={1}>
                        ${kpis.totalDonations.toLocaleString()}
                    </Typography>
                    <Typography sx={percentageStyle}>+12% from last cycle</Typography>
                </Paper>

                {/* Number of Donors */}
                <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
                    <Typography fontWeight={600}>Unique Donors</Typography>
                    <Typography variant="h5" fontWeight={900} mt={1}>
                        {kpis.totalDonors}
                    </Typography>
                    <Typography sx={percentageStyle}>+5% from last cycle</Typography>
                </Paper>

                {/* Top Donating Project */}
                <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
                    <Typography fontWeight={600}>Top Project</Typography>
                    <Typography variant="h6" fontWeight={900} mt={1} noWrap>
                        {kpis.topProject.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                        ${kpis.topProject.amount.toLocaleString()} raised
                    </Typography>
                </Paper>
            </Box>

            {/* ---------- TOP BAR (SEARCH + FILTERS) ---------- */}
            <Paper
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                }}
            >
                {/* Search Input */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by project name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={inputStyle}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                        ),
                    }}
                />

                {/* Right-aligned filters */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        select
                        size="small"
                        label="Date Range"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ width: 160, ...inputStyle }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="year">This Year</option>
                    </TextField>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={currencyUSD}
                                onChange={() => setCurrencyUSD(!currencyUSD)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: MAIN_ORANGE },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: MAIN_ORANGE },
                                }}
                            />
                        }
                        label="Show in USD"
                    />
                </Box>
            </Paper>

            {/* ---------- TABLE ---------- */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                            <TableCell><strong>Project Name</strong></TableCell>
                            <TableCell><strong>Total Donations</strong></TableCell>
                            <TableCell><strong>Avg. Donation</strong></TableCell>
                            <TableCell><strong># of Donations</strong></TableCell>
                            <TableCell align="right"><strong>Details</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filtered.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No donations found.</TableCell>
                             </TableRow>
                        ) : (
                            filtered.map((row) => (
                                <React.Fragment key={row.name}>
                                    {/* MAIN ROW */}
                                    <TableRow hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>${row.total.toLocaleString()}</TableCell>
                                        <TableCell>${Math.round(row.total / row.count).toLocaleString()}</TableCell>
                                        <TableCell>{row.count}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => setOpenRow(openRow === row.name ? null : row.name)}
                                                sx={{
                                                    color: openRow === row.name ? MAIN_ORANGE : 'default',
                                                    transition: 'color 0.3s'
                                                }}
                                            >
                                                {openRow === row.name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {/* EXPANDABLE SECTION */}
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ p: 0, backgroundColor: "#FAFAFA", borderBottom: "none" }}>
                                            <Collapse in={openRow === row.name} timeout="auto" unmountOnExit>
                                                <Box sx={{ p: 2, pl: 4 }}>
                                                    <Typography fontWeight={700} sx={{ mb: 1, color: "text.primary" }}>
                                                        Recent Donations
                                                    </Typography>

                                                    {row.recent.length === 0 ? (
                                                        <Typography color="text.secondary" fontSize={14}>
                                                            No recent donations recorded.
                                                        </Typography>
                                                    ) : (
                                                        // Mostramos solo las últimas 5 donaciones
                                                        row.recent.slice(0, 5).map((d, index) => (
                                                            <Paper
                                                                key={index}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5, mb: 1,
                                                                    display: "flex", justifyContent: "space-between",
                                                                    borderRadius: 2, borderColor: "#E0E0E0"
                                                                }}
                                                            >
                                                                <Box>
                                                                    <Typography fontWeight={600}>{d.donor}</Typography>
                                                                    <Typography fontSize={13} color="text.secondary">{new Date(d.date).toLocaleDateString()}</Typography>
                                                                </Box>
                                                                <Typography fontWeight={700} color={MAIN_ORANGE}>{d.amount}</Typography>
                                                            </Paper>
                                                        ))
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}