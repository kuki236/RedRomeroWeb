import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
} from "@mui/material";

export default function BudgetManagement() {
  const [project, setProject] = useState("Community Health Initiative");

  const history = [
    {
      date: "2023-10-26",
      previous: "$150,000.00",
      new: "$155,000.00",
      adjustedBy: "Jane Foster",
      reason: "Additional funding secured from donor X.",
    },
    {
      date: "2023-08-15",
      previous: "$155,000.00",
      new: "$145,000.00",
      adjustedBy: "Alex Doe",
      reason: "Reallocation of funds to a higher priority program.",
    },
    {
      date: "2023-03-01",
      previous: "$150,000.00",
      new: "$150,000.00",
      adjustedBy: "System",
      reason: "Initial budget set.",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        Budget Management
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* LEFT SIDE */}
        <Box sx={{ flex: 1 }}>
          {/* Project Selector + Button */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel>Select a Project</InputLabel>
              <Select
                value={project}
                label="Select a Project"
                onChange={(e) => setProject(e.target.value)}
              >
                <MenuItem value="Community Health Initiative">
                  Community Health Initiative
                </MenuItem>
                <MenuItem value="Youth Mentorship">Youth Mentorship</MenuItem>
                <MenuItem value="Clean Water Project">Clean Water Project</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#FF6934",
                ":hover": { backgroundColor: "#e85d2f" },
                ml: "auto",
              }}
            >
              Adjust Budget
            </Button>
          </Paper>

          {/* BUDGET CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 3,
              mb: 3,
            }}
          >
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={600} color="gray" mb={1}>
                Initial Budget
              </Typography>
              <Typography fontWeight={800} fontSize="2rem">
                $150,000
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={600} color="gray" mb={1}>
                Current Budget
              </Typography>
              <Typography fontWeight={800} fontSize="2rem">
                $145,000
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={600} color="gray" mb={1}>
                Total Spent
              </Typography>
              <Typography fontWeight={800} fontSize="2rem">
                $62,750
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={600} color="gray" mb={1}>
                Remaining
              </Typography>
              <Typography
                fontWeight={800}
                fontSize="2rem"
                color="green"
              >
                $82,250
              </Typography>
            </Paper>
          </Box>

          {/* HISTORY TABLE */}
          <Typography variant="h6" fontWeight={800} mb={2}>
            Budget Adjustment History
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F4F7FB" }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Previous Amount</strong></TableCell>
                  <TableCell><strong>New Amount</strong></TableCell>
                  <TableCell><strong>Adjusted By</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {history.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.previous}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {row.new}
                    </TableCell>
                    <TableCell>{row.adjustedBy}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* RIGHT SIDE – CREATE NEW BUDGET */}
        <Paper sx={{ width: 330, p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={1}>
            Create New Budget
          </Typography>

          <Typography color="gray" fontSize="0.9rem" mb={3}>
            Assign an initial budget to a project that doesn't have one yet.
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Select Project</InputLabel>
            <Select label="Select Project">
              <MenuItem value="Project A">Project A</MenuItem>
              <MenuItem value="Project B">Project B</MenuItem>
              <MenuItem value="Project C">Project C</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Currency</InputLabel>
            <Select label="Currency" defaultValue="USD">
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="MXN">MXN</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Initial Amount"
            placeholder="e.g., 50000"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#FF6934",
              ":hover": { backgroundColor: "#e85d2f" },
              height: 45,
              fontWeight: 700,
            }}
          >
            Create Budget
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
