import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";

export default function MyApprovals() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const requests = [
    {
      id: 1,
      name: "Community Support Initiative",
      submittedBy: "Carlos Rivera",
      submittedOn: "2025-01-12",
      status: "Pending",
      description:
        "This project aims to provide extended community outreach and support for vulnerable groups, including food distribution and educational assistance.",
      history: [
        { label: "Created", date: "2025-01-10" },
        { label: "Submitted", date: "2025-01-12" },
      ],
    },
    {
      id: 2,
      name: "Environmental Awareness Campaign",
      submittedBy: "Laura Martínez",
      submittedOn: "2025-01-18",
      status: "Approved",
      description:
        "A program focused on raising awareness about recycling, waste reduction, and eco‑friendly practices across local schools.",
      history: [
        { label: "Created", date: "2025-01-15" },
        { label: "Submitted", date: "2025-01-18" },
        { label: "Approved", date: "2025-01-20" },
      ],
    },
  ];

  const filtered = requests.filter((r) => {
    const matches = r.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matches && matchesStatus;
  });

  const statusColors = {
    Pending: { bg: "#FFF3CD", color: "#B58B00" },
    Approved: { bg: "#D1F7D1", color: "green" },
    Rejected: { bg: "#F8D7DA", color: "#9F1C24" },
  };

  return (
    <Box sx={{ p: 3, display: "flex", gap: 3 }}>
      {/* RIGHT PANEL — LIST */}
      <Paper sx={{ width: "38%", p: 2, height: "80vh", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Approval Requests
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by project name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* List */}
        <List sx={{ overflowY: "auto" }}>
          {filtered.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => setSelected(item)}
              sx={{ borderBottom: "1px solid #eee" }}
            >
              <ListItemText
                primary={item.name}
                secondary={
                  <Box>
                    <Typography variant="body2">Submitted by: {item.submittedBy}</Typography>
                    <Typography variant="body2">Submitted on: {item.submittedOn}</Typography>
                  </Box>
                }
              />

              <Chip
                label={item.status}
                size="small"
                sx={{
                  backgroundColor: statusColors[item.status]?.bg,
                  color: statusColors[item.status]?.color,
                  fontWeight: 600,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* LEFT PANEL — DETAILS */}
      <Paper sx={{ width: "62%", p: 3, height: "80vh", overflowY: "auto" }}>
        {selected ? (
          <>
            <Typography variant="h5" fontWeight={800}>
              {selected.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={2}>
              Submitted by {selected.submittedBy} on {selected.submittedOn}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* DESCRIPTION */}
            <Typography variant="h6" fontWeight={700} mb={1}>
              Project Description
            </Typography>
            <Typography variant="body1" mb={3}>{selected.description}</Typography>

            {/* HISTORY */}
            <Typography variant="h6" fontWeight={700} mb={1}>
              Approval History
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              {/* Timeline dots */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {selected.history.map((h, idx) => (
                  <React.Fragment key={idx}>
                    <Box
                      sx={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#1976d2" }}
                    />
                    {idx < selected.history.length - 1 && (
                      <Box sx={{ width: 2, height: 40, backgroundColor: "#ccc" }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>

              {/* Labels */}
              <Box>
                {selected.history.map((h, idx) => (
                  <Box key={idx} sx={{ mb: 4 }}>
                    <Typography fontWeight={700}>{h.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{h.date}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ACTION SECTION */}
            <Typography variant="h6" fontWeight={700} mb={1}>
              Your Action
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Add comments (optional)
            </Typography>

            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Write comments here..."
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" color="primary">Edit</Button>
              <Button variant="outlined" color="error">Delete</Button>
            </Box>
          </>
        ) : (
          <Typography variant="h6" color="text.secondary">
            Select a project from the right panel to view details.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
