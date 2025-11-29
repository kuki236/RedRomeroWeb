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
  Collapse,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function DonationsReceived() {
  const [query, setQuery] = useState("");

  const [timeFilter, setTimeFilter] = useState(false);
  const [currencyUSD, setCurrencyUSD] = useState(true);

  const [rows, setRows] = useState([]);
  const [openRow, setOpenRow] = useState(null);

  const [kpis, setKpis] = useState({
    totalDonations: 128500,
    totalDonors: 342,
    topProject: { name: "Water Relief Kenya", amount: 54000 },
  });

  useEffect(() => {
    setRows([
      {
        id: 1,
        name: "Water Relief Kenya",
        total: 54000,
        usd: 54000,
        count: 120,
        recent: [
          { donor: "John Doe", date: "2025-01-10", amount: "€300" },
          { donor: "Ana Silva", date: "2025-01-12", amount: "$150" },
        ],
      },
      {
        id: 2,
        name: "Education for All Mexico",
        total: 31000,
        usd: 31000,
        count: 89,
        recent: [
          { donor: "Marcos León", date: "2025-01-15", amount: "$200" },
        ],
      },
      {
        id: 3,
        name: "Food Distribution Chile",
        total: 43500,
        usd: 43500,
        count: 76,
        recent: [],
      },
    ]);
  }, []);

  const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  const percentageStyle = { fontSize: 14, color: "green", fontWeight: 600 };

  return (
    <Box sx={{ p: 3 }}>
      {/* ---------- TITLE ---------- */}
      <Typography variant="h4" fontWeight={800} mb={1}>
        Donations Received
      </Typography>

      {/* ---------- KPI CARDS ---------- */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {/* Total Donations */}
        <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
          <Typography fontWeight={600}>Total Donations (USD)</Typography>
          <Typography variant="h5" fontWeight={900} mt={1}>
            ${kpis.totalDonations.toLocaleString()}
          </Typography>
          <Typography sx={percentageStyle}>+12% from last cycle</Typography>
        </Paper>

        {/* Number of Donors */}
        <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
          <Typography fontWeight={600}>Number of Donors</Typography>
          <Typography variant="h5" fontWeight={900} mt={1}>
            {kpis.totalDonors}
          </Typography>
          <Typography sx={percentageStyle}>+5% from last cycle</Typography>
        </Paper>

        {/* Top Donating Project */}
        <Paper sx={{ p: 2, width: 260, borderRadius: 3 }}>
          <Typography fontWeight={600}>Top Donating Project</Typography>
          <Typography variant="h6" fontWeight={900} mt={1}>
            {kpis.topProject.name}
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>
            ${kpis.topProject.amount.toLocaleString()} raised
          </Typography>
        </Paper>
      </Box>

      {/* ---------- TOP BAR (SEARCH + FILTERS) ---------- */}
      {/* ---------- TOP BAR (SEARCH + FILTERS UPDATED) ---------- */}
        <Paper
        sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
        }}
        >
        {/* Search grows to fill space */}
        <TextField
            fullWidth
            size="small"
            placeholder="Search by project name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
            startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
            ),
            }}
        />

        {/* Right-aligned filters */}
        <Box sx={{ display: "flex", gap: 2 }}>
            {/* Date Range Dropdown */}
            <TextField
            select
            size="small"
            label="Date Range"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ width: 160 }}
            >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="year">This Year</option>
            </TextField>

            {/* USD toggle */}
            <FormControlLabel
            control={
                <Switch
                checked={currencyUSD}
                onChange={() => setCurrencyUSD(!currencyUSD)}
                />
            }
            label="Show in USD"
            />
        </Box>
        </Paper>


      {/* ---------- TABLE ---------- */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
              <TableCell><strong>Project Name</strong></TableCell>
              <TableCell><strong>Total Donations</strong></TableCell>
              <TableCell><strong>USD Equivalent</strong></TableCell>
              <TableCell><strong># of Donations</strong></TableCell>
              <TableCell align="right"><strong>Details</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row) => (
              <>
                {/* MAIN ROW */}
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>${row.total.toLocaleString()}</TableCell>
                  <TableCell>${row.usd.toLocaleString()}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setOpenRow(openRow === row.id ? null : row.id)}>
                      {openRow === row.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* EXPANDABLE SECTION */}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{ p: 0, backgroundColor: "#FAFAFA" }}
                  >
                    <Collapse in={openRow === row.id} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, pl: 4 }}>
                        <Typography fontWeight={700} sx={{ mb: 1 }}>
                          Recent Donations
                        </Typography>

                        {row.recent.length === 0 ? (
                          <Typography color="text.secondary" fontSize={14}>
                            No recent donations recorded.
                          </Typography>
                        ) : (
                          row.recent.map((d, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                display: "flex",
                                justifyContent: "space-between",
                                borderRadius: 2,
                              }}
                            >
                              <Box>
                                <Typography fontWeight={600}>{d.donor}</Typography>
                                <Typography fontSize={13} color="text.secondary">
                                  {d.date}
                                </Typography>
                              </Box>
                              <Typography fontWeight={700}>{d.amount}</Typography>
                            </Paper>
                          ))
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
