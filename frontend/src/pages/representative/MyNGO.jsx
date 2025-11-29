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
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

export default function MyNGO() {
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    setNgo({
      name: "Global Relief Initiative",
      city: "Lima",
      country: "Peru",
      memberSince: "2020-04-15",
      icon: <AccountBalanceIcon sx={{ fontSize: 60 }} />,

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

            <Typography><strong>Total Projects:</strong> {ngo.overview.totalProjects}</Typography>
            <Typography><strong>Active:</strong> {ngo.overview.active}</Typography>
            <Typography><strong>Completed:</strong> {ngo.overview.completed}</Typography>
            <Typography><strong>Total Raised:</strong> {ngo.overview.totalRaised}</Typography>
            <Typography><strong>Success Rate:</strong> {ngo.overview.successRate}</Typography>
            </Paper>
        </Grid>

        {/* RIGHT COLUMN — CONTACT INFO */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Paper sx={{ p: 3, width: "100%", height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
                Contact Info
            </Typography>

            <Typography><strong>Address:</strong> {ngo.contact.address}</Typography>
            <Typography><strong>Phone:</strong> {ngo.contact.phone}</Typography>
            <Typography><strong>Email:</strong> {ngo.contact.email}</Typography>

            <Typography sx={{ mt: 2 }}>
                <strong>Representative:</strong> {ngo.contact.representative}
            </Typography>
            <Typography><strong>Rep Email:</strong> {ngo.contact.repEmail}</Typography>
            </Paper>
        </Grid>
        </Grid>


      {/* ACTIVE PROJECTS BUDGET TABLE */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Active Projects Budget
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
              {ngo.activeProjects.map((p) => (
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
                        backgroundColor: statusColors[p.status].bg,
                        color: statusColors[p.status].color,
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
