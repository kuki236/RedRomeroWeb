import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Stack,
  Modal,
  Divider,
  Avatar,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function MyAssignedProjects() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setProjects([
      {
        id: 1,
        name: "Water Well Construction",
        description: "Building sustainable water wells in rural communities.",
        fullDescription:
          "This project aims to construct durable water wells to provide long-term clean water access to underserved populations.",
        start: "2025-02-01",
        end: "2025-06-30",
        status: "in progress",
        progress: 45,
        ngo: {
          name: "Global Water Foundation",
          description: "Dedicated to providing clean and safe drinking water worldwide.",
        },
        volunteers: [
          { id: 1, name: "Alex", img: "" },
          { id: 2, name: "Maria", img: "" },
          { id: 3, name: "John", img: "" },
          { id: 4, name: "Sara", img: "" },
          { id: 5, name: "Luis", img: "" },
          { id: 6, name: "Emma", img: "" },
        ],
        managers: [
          { name: "Carlos Martínez", role: "Project Coordinator" },
          { name: "Ana López", role: "Field Supervisor" },
        ],
      },
    ]);
  }, []);

  const statusColors = {
    planning: { bg: "#FFF4CC", color: "#B08900" },
    "in progress": { bg: "#D6E4FF", color: "#1A4DB3" },
    completed: { bg: "#D1F7D1", color: "#1F7A1F" },
    cancelled: { bg: "#FFD6D6", color: "#B30000" },
  };

  const filtered = projects.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const openDetails = (p) => {
    setSelected(p);
    setOpen(true);
  };

  const closeDetails = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} mb={3}>
        My Assigned Projects
      </Typography>

      {/* FILTER BAR */}
      <Paper
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
            ),
          }}
        />

        {/* Status buttons */}
        <Stack direction="row" spacing={1}>
          {[
            { label: "All", value: "all" },
            { label: "Planning", value: "planning" },
            { label: "In Progress", value: "in progress" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ].map((btn) => (
            <Button
              key={btn.value}
              variant={statusFilter === btn.value ? "contained" : "outlined"}
              onClick={() => setStatusFilter(btn.value)}
              size="small"
            >
              {btn.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* PROJECT CARDS */}
      <Stack spacing={2}>
        {filtered.map((p) => (
          <Paper
            key={p.id}
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ maxWidth: "75%" }}>
              <Typography variant="h6" fontWeight={700}>
                {p.name}
              </Typography>

              <Typography sx={{ color: "gray", mb: 1 }}>
                {p.description}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "gray",
                }}
              >
                <CalendarMonthIcon fontSize="small" />
                <Typography fontSize={14}>
                  {p.start} — {p.end}
                </Typography>
              </Box>

              <Button variant="text" sx={{ mt: 1 }} onClick={() => openDetails(p)}>
                View Details
              </Button>
            </Box>

            {/* STATUS TAG */}
            <Chip
              label={p.status}
              sx={{
                textTransform: "capitalize",
                fontWeight: 700,
                backgroundColor: statusColors[p.status]?.bg,
                color: statusColors[p.status]?.color,
              }}
            />
          </Paper>
        ))}
      </Stack>

      {/* PROJECT DETAILS POPUP */}
    <Modal open={open} onClose={closeDetails}>
    <Box
        sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "70%",              // MÁS DELGADO
        height: "85%",            // MÁS ALTO
        overflowY: "auto",
        bgcolor: "white",
        p: 4,
        borderRadius: 2,
        boxShadow: 6,
        }}
    >
        {selected && (
        <>
            {/* BACK BUTTON ARRIBA A LA IZQUIERDA */}
            <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={closeDetails}
            sx={{ mb: 2 }}
            >
            Back to Projects
            </Button>

            {/* TITLE */}
            <Typography variant="h4" fontWeight={800} mb={1}>
            {selected.name}
            </Typography>

            <Typography sx={{ color: "gray", mb: 3 }}>
            A detailed overview of the project's goals, timeline, and team.
            </Typography>

            <Stack direction="row" spacing={3}>
            {/* LEFT SIDE SECTIONS */}
            <Stack spacing={3} flex={1}>
                {/* OVERVIEW */}
                <Paper sx={{ p: 3, position: "relative" }}>
                {/* STATUS TAG */}
                <Chip
                    label={selected.status}
                    sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    backgroundColor: statusColors[selected.status]?.bg,
                    color: statusColors[selected.status]?.color,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    }}
                />

                <Typography variant="h6" fontWeight={700} mb={1}>
                    Project Overview
                </Typography>

                <Typography>{selected.fullDescription}</Typography>
                </Paper>

                {/* TIMELINE */}
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Timeline
                </Typography>

                <LinearProgress
                    variant="determinate"
                    value={selected.progress}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />

                <Box
                    sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "gray",
                    mt: 1,
                    }}
                >
                    <Typography>Start: {selected.start}</Typography>
                    <Typography>End: {selected.end}</Typography>
                </Box>
                </Paper>

                {/* NGO */}
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Associates NGO
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <AccountCircleIcon sx={{ fontSize: 50 }} />
                    <Box>
                    <Typography fontWeight={700}>
                        {selected.ngo.name}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                        {selected.ngo.description}
                    </Typography>
                    </Box>
                </Box>

                <Button variant="outlined" sx={{ mt: 2 }}>
                    View NGO Profile
                </Button>
                </Paper>
            </Stack>

            {/* RIGHT SIDE PANEL */}
            <Stack spacing={3} sx={{ width: "32%", minWidth: 260 }}>
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Your Fellow Volunteers
                </Typography>

                <Stack direction="row" spacing={1}>
                    {selected.volunteers.slice(0, 4).map((v) => (
                    <Avatar key={v.id} />
                    ))}

                    {selected.volunteers.length > 4 && (
                    <Avatar>
                        +{selected.volunteers.length - 4}
                    </Avatar>
                    )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" fontWeight={700} mb={1}>
                    Project Managers
                </Typography>

                {selected.managers.map((m, i) => (
                    <Box
                    key={i}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                    }}
                    >
                    <Avatar />
                    <Box>
                        <Typography fontWeight={700}>{m.name}</Typography>
                        <Typography sx={{ color: "gray", fontSize: 14 }}>
                        {m.role}
                        </Typography>
                    </Box>
                    </Box>
                ))}
                </Paper>
            </Stack>
            </Stack>
        </>
        )}
    </Box>
    </Modal>

    </Box>
  );
}
