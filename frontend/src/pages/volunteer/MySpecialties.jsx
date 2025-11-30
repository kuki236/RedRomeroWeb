import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import SchoolIcon from "@mui/icons-material/School";

export default function MyAssignedSpecialties() {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    setSpecialties([
      {
        id: 1,
        title: "First Aid & Medical Assistance",
        description: "Certified in providing basic medical care and emergency response.",
        icon: <MedicalServicesIcon sx={{ fontSize: 40 }} />,
      },
      {
        id: 2,
        title: "Logistics & Field Coordination",
        description: "Experience in managing supplies, transport, and operational planning.",
        icon: <ConstructionIcon sx={{ fontSize: 40 }} />,
      },
      {
        id: 3,
        title: "Psychological Support",
        description: "Trained to provide emotional support and crisis intervention.",
        icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      },
      {
        id: 4,
        title: "Community Outreach",
        description: "Skilled in working directly with communities and vulnerable groups.",
        icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
      },
      {
        id: 5,
        title: "Educational Assistance",
        description: "Qualified to support children and adults in structured learning environments.",
        icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      },
    ]);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} mb={1}>
        My Assigned Specialties
      </Typography>

      {/* SUBTITLE */}
      <Typography sx={{ mb: 3, color: "gray" }}>
        This is a read-only list of your skills and qualifications as assigned by an administrator.
        If you believe there is an error, please contact your project representative.
      </Typography>

      {/* SPECIALTIES GRID */}
      <Grid container spacing={2}>
        {specialties.map((sp) => (
          <Grid item xs={12} sm={6} md={4} key={sp.id}>
            <Paper
            sx={{
                p: 2,
                minHeight: 180,          // ← altura fija consistente
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: 1.5,
                alignItems: "flex-start",
                borderRadius: 2,
            }}
            >
            {sp.icon}
            <Typography variant="h6" fontWeight={700}>
                {sp.title}
            </Typography>
            <Typography sx={{ color: "gray" }}>
                {sp.description}
            </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
