import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import SchoolIcon from "@mui/icons-material/School";

// Icon mapping
const iconMap = {
  'Medicine': <MedicalServicesIcon sx={{ fontSize: 40 }} />,
  'Logistics': <ConstructionIcon sx={{ fontSize: 40 }} />,
  'Psychology': <PsychologyIcon sx={{ fontSize: 40 }} />,
  'Community': <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
  'Education': <SchoolIcon sx={{ fontSize: 40 }} />,
  // Spanish fallbacks (in case backend returns Spanish names)
  'Medicina': <MedicalServicesIcon sx={{ fontSize: 40 }} />,
  'Logística': <ConstructionIcon sx={{ fontSize: 40 }} />,
  'Psicología': <PsychologyIcon sx={{ fontSize: 40 }} />,
  'Comunidad': <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
  'Educación': <SchoolIcon sx={{ fontSize: 40 }} />,
};

export default function MyAssignedSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/volunteer/my-specialties/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Transform data
        const transformed = response.data.map(s => ({
          id: s.assignment_id,
          title: s.specialty_name,
          description: s.description || 'No description available.',
          icon: iconMap[s.specialty_name] || <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
        }));
        setSpecialties(transformed);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialties();
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
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress sx={{ color: '#FF3F01' }} />
        </Box>
      ) : (
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
      )}
    </Box>
  );
}
