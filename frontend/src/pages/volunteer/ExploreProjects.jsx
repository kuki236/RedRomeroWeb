import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    TextField,
    InputAdornment,
    Container,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    ArrowForward,
    Search,
    Business,
    LocationOn
} from '@mui/icons-material';

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

// --- MOCK DATA ---
const projectsData = [
    {
        id: 1,
        name: "Clean Water for Cusco Highlands",
        ngo: "AquaVida Peru",
        location: "Cusco, Peru",
        date: "2025-01-10", // Fecha para ordenar
        description: "Installing water filtration systems in 5 remote communities to provide safe drinking water.",
        image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=300",
        tags: ["Infrastructure", "Water"],
        status: "Recruiting",
        raised: "$8,500",
        goal: "$12,000",
        percent: 70,
        timeline: "Mar 2025 - Jun 2025",
        volunteers: "5 / 15"
    },
    {
        id: 2,
        name: "Digital Literacy for Rural Schools",
        ngo: "Tech for All",
        location: "Oaxaca, Mexico",
        date: "2025-02-15",
        description: "Setting up computer labs and teaching basic coding and internet skills to primary school children.",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=300&h=300",
        tags: ["Education", "Technology"],
        status: "Active",
        raised: "$15,000",
        goal: "$15,000",
        percent: 100,
        timeline: "Jan 2025 - Dec 2025",
        volunteers: "10 / 10"
    },
    {
        id: 3,
        name: "Reforestation of the Amazon Border",
        ngo: "Green Earth Alliance",
        location: "Leticia, Colombia",
        date: "2024-12-05",
        description: "Join us in planting 5,000 native trees to restore degraded land and protect local biodiversity.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300&h=300",
        tags: ["Environment"],
        status: "Planning",
        raised: "$2,000",
        goal: "$25,000",
        percent: 8,
        timeline: "Aug 2025 - Nov 2025",
        volunteers: "0 / 50"
    },
    {
        id: 4,
        name: "Mobile Health Clinic 2025",
        ngo: "Medicos Sin Fronteras Local",
        location: "La Paz, Bolivia",
        date: "2025-03-01",
        description: "A travelling medical unit providing basic checkups and vaccinations to underserved villages.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300&h=300",
        tags: ["Health", "Medical"],
        status: "Recruiting",
        raised: "$45,000",
        goal: "$60,000",
        percent: 75,
        timeline: "Feb 2025 - May 2025",
        volunteers: "12 / 20"
    }
];

export default function ExploreProjects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date"); // 'date', 'name', 'location'

    // --- ESTADOS PARA EL MODAL ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // --- HANDLERS ---
    const handleOpenDetails = (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    // --- FILTRADO Y ORDENAMIENTO ---
    const filteredAndSortedProjects = useMemo(() => {
        // 1. Filtrar
        let result = projectsData.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.ngo.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Ordenar
        result.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'location') {
                return a.location.localeCompare(b.location);
            } else {
                // Default: Date (Newest first)
                return new Date(b.date) - new Date(a.date);
            }
        });

        return result;
    }, [searchTerm, sortBy]);

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>

            {/* --- HEADER --- */}
            <Box mb={5}>
                <Typography variant="h3" fontWeight={800} color="#1E293B" mb={1}>
                    Explore Projects
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    Find a project that suits you and start making an impact.
                </Typography>
            </Box>

            {/* --- SEARCH & FILTER BAR --- */}
            <Paper
                elevation={0}
                sx={{
                    p: 2, mb: 5, borderRadius: 3,
                    border: '1px solid #E2E8F0', display: 'flex', gap: 2, flexWrap: 'wrap',
                    alignItems: 'center'
                }}
            >
                <TextField
                    placeholder="Search by project name or NGO..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#94A3B8' }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                    sx={{ flexGrow: 1, minWidth: '250px' }}
                />

                {/* --- SORT SELECTOR --- */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort by"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="date">Date Added (Newest)</MenuItem>
                        <MenuItem value="name">Name (A-Z)</MenuItem>
                        <MenuItem value="location">Location (A-Z)</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {/* --- PROJECTS LIST --- */}
            <Box display="flex" flexDirection="column" gap={3}>
                {filteredAndSortedProjects.map((project) => (
                    <Paper
                        key={project.id}
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: '1px solid #E2E8F0',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderColor: '#CBD5E1' },
                            // Layout Horizontal forzado con Flexbox
                            display: 'flex',
                            flexDirection: 'row', // Siempre en fila
                            alignItems: 'stretch',
                            height: { xs: 'auto', md: 180 } // Altura fija en desktop para uniformidad
                        }}
                    >
                        {/* 1. IMAGEN (Izquierda) */}
                        <Box sx={{
                            width: { xs: 120, sm: 200, md: 250 }, // Ancho variable pero siempre presente
                            minWidth: { xs: 120, sm: 200, md: 250 },
                            position: 'relative'
                        }}>
                            <Box
                                component="img"
                                src={project.image}
                                alt={project.name}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>

                        {/* 2. CONTENIDO (Centro) */}
                        <Box sx={{
                            p: { xs: 2, md: 3 },
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                    color="#1E293B"
                                    sx={{
                                        fontSize: { xs: '1rem', md: '1.25rem' }, // Texto responsive
                                        lineHeight: 1.2,
                                        mb: 0.5
                                    }}
                                >
                                    {project.name}
                                </Typography>

                                <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={1} color="text.secondary">
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Business fontSize="small" sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" fontWeight={600} fontSize="0.75rem">{project.ngo}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <LocationOn fontSize="small" sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" fontSize="0.75rem">{project.location}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Typography
                                variant="body2"
                                color="#475569"
                                sx={{
                                    mb: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2, // Limitar a 2 líneas para mantener el diseño limpio
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.5
                                }}
                            >
                                {project.description}
                            </Typography>

                            <Box display="flex" gap={1} flexWrap="wrap">
                                {project.tags.map((tag, i) => (
                                    <Chip
                                        key={i}
                                        label={tag}
                                        size="small"
                                        sx={{
                                            bgcolor: '#F1F5F9', color: '#475569',
                                            fontWeight: 600, borderRadius: 1, height: 20, fontSize: '0.7rem'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* 3. BOTÓN (Derecha) */}
                        <Box sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderLeft: '1px solid #F1F5F9',
                            bgcolor: '#FAFAFA',
                            minWidth: { xs: 'auto', md: 160 } // Ancho fijo en desktop
                        }}>
                            <Button
                                variant="contained" // Botón sólido
                                endIcon={<ArrowForward />}
                                onClick={() => handleOpenDetails(project)}
                                sx={{
                                    bgcolor: '#FF3F01', // Naranja
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                    minWidth: { xs: '40px', md: 'auto' }, // En móvil, el botón puede ser pequeño
                                    px: { xs: 1, md: 3 },
                                    '&:hover': { bgcolor: '#D93602', boxShadow: 'none' },
                                    // En pantallas muy pequeñas, ocultamos texto y dejamos icono
                                    '& .MuiButton-startIcon': { mr: { xs: 0, md: 1 } }
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                                    View Project
                                </Box>
                                {/* En móvil solo mostramos la flecha si el espacio es reducido, pero el componente Button lo maneja */}
                            </Button>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* --- MODAL DE DETALLES --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />

        </Container>
    );
}