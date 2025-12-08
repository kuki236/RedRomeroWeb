import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
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
    InputLabel,
    CircularProgress
} from '@mui/material';
import {
    ArrowForward,
    Search,
    Business,
    LocationOn,
    BookmarkBorder,
    Visibility,
    LocalFireDepartment
} from '@mui/icons-material';

// --- IMPORTAR EL MODAL ---
import ProjectDetailsModal from "../ProjectDetailsModal";

export default function ExploreProjects() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [projectsData, setProjectsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                setLoading(true);
                const response = await axios.get('http://127.0.0.1:8000/api/volunteer/explore-projects/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Transform data to match component format
                const transformed = response.data.map(p => ({
                    id: p.project_id || p.PROJECT_ID,
                    project_id: p.project_id || p.PROJECT_ID,
                    name: p.project_name || p.PROJECT_NAME,
                    title: p.project_name || p.PROJECT_NAME,
                    ngo: p.ngo_name || p.NGO_NAME || 'N/A',
                    ngo_name: p.ngo_name || p.NGO_NAME || 'N/A',
                    location: `${p.city || p.CITY || ''}, ${p.country || p.COUNTRY || ''}`.trim() || 'N/A',
                    date: p.start_date || p.START_DATE || new Date().toISOString().split('T')[0],
                    start_date: p.start_date || p.START_DATE,
                    end_date: p.end_date || p.END_DATE,
                    description: p.description || p.DESCRIPTION || 'No description available.',
                    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=300",
                    tags: {
                        specialty: 'Various',
                        start: p.start_date || p.START_DATE || 'N/A',
                        duration: p.duration_weeks || 'N/A',
                        team: `${p.current_volunteers || p.CURRENT_VOLUNTEERS || 0} Volunteers`
                    },
                    status: p.status_name || p.STATUS_NAME || 'Active',
                    status_name: p.status_name || p.STATUS_NAME || 'Active',
                    match: p.match_percentage || p.MATCH_PERCENTAGE || 95,
                    isNew: true, // Could check if project was created recently
                    raised: '$0',
                    goal: '$0',
                    percent: 0,
                    timeline: `${p.start_date || ''} - ${p.end_date || 'Ongoing'}`,
                    volunteers: `${p.current_volunteers || 0} / N/A`
                }));
                setProjectsData(transformed);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // --- ESTADOS PARA EL MODAL ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applying, setApplying] = useState({});
    const [savedProjects, setSavedProjects] = useState([]);

    // Load saved projects from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('volunteer_saved_projects');
        if (saved) {
            setSavedProjects(JSON.parse(saved));
        }
    }, []);

    // --- HANDLERS ---
    const handleOpenDetails = (project) => {
        const formattedProject = {
            ...project,
            name: project.title || project.name,
            ong: project.ngo_name || project.ngo,
            status: project.status_name || project.status
        };
        setSelectedProject(formattedProject);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProject(null);
    };

    const handleApply = async (project) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        if (!project.project_id && !project.id) {
            alert('Invalid project data.');
            return;
        }

        const projectId = project.project_id || project.id;
        
        if (!window.confirm(`Are you sure you want to apply to "${project.title || project.name}"?`)) {
            return;
        }

        try {
            setApplying({ ...applying, [projectId]: true });
            await axios.post('http://127.0.0.1:8000/api/volunteer/apply-project/', {
                project_id: parseInt(projectId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Application submitted successfully! You will be notified once it is reviewed.');
            // Remove from list or mark as applied
            setProjectsData(prev => prev.filter(p => (p.project_id || p.id) !== projectId));
        } catch (error) {
            console.error("Error applying to project:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to submit application";
            alert(`Error: ${errorMsg}`);
        } finally {
            setApplying({ ...applying, [projectId]: false });
        }
    };

    const handleSaveForLater = (project) => {
        const projectId = project.project_id || project.id;
        const updated = savedProjects.includes(projectId)
            ? savedProjects.filter(id => id !== projectId)
            : [...savedProjects, projectId];
        
        setSavedProjects(updated);
        localStorage.setItem('volunteer_saved_projects', JSON.stringify(updated));
        
        if (updated.includes(projectId)) {
            alert('Project saved for later!');
        } else {
            alert('Project removed from saved list.');
        }
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
    }, [searchTerm, sortBy, projectsData]);

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
            {loading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress sx={{ color: '#FF3F01' }} />
                </Box>
            ) : filteredAndSortedProjects.length === 0 ? (
                <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">No available opportunities at the moment.</Typography>
                </Paper>
            ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                    {filteredAndSortedProjects.map((project) => {
                        const projectId = project.project_id || project.id;
                        const isSaved = savedProjects.includes(projectId);
                        const isApplying = applying[projectId];
                        
                        return (
                        <Paper
                            key={projectId}
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid #E2E8F0',
                                transition: 'all 0.3s ease',
                                '&:hover': { boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderColor: '#CBD5E1' }
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
                                <Box>
                                    {project.isNew && (
                                        <Chip 
                                            label="NEW OPPORTUNITY" 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: '#ECFDF5', 
                                                color: '#10B981', 
                                                fontWeight: 800, 
                                                fontSize: '0.65rem', 
                                                height: 20, 
                                                mb: 1 
                                            }} 
                                        />
                                    )}
                                    <Typography variant="h6" fontWeight={700} color="#1E293B">{project.title || project.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        by <b>{project.ngo_name || project.ngo}</b> in {project.location}
                                    </Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                                        <LocalFireDepartment sx={{ color: '#FF3F01', fontSize: 18 }} />
                                        <Typography variant="subtitle1" fontWeight={800} color="#FF3F01">{project.match || 95}% Match</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">Based on your skills</Typography>
                                </Box>
                            </Box>

                            {/* Details Grid */}
                            <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Specialties</Typography>
                                    <Typography variant="body2" fontWeight={600}>{project.tags?.specialty || 'Various'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Start Date</Typography>
                                    <Typography variant="body2" fontWeight={600}>{project.tags?.start || project.start_date || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Duration</Typography>
                                    <Typography variant="body2" fontWeight={600}>{project.tags?.duration || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Team Size</Typography>
                                    <Typography variant="body2" fontWeight={600}>{project.tags?.team || 'N/A'}</Typography>
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleApply(project)}
                                    disabled={isApplying}
                                    sx={{ 
                                        bgcolor: '#FF3F01', 
                                        fontWeight: 700, 
                                        textTransform: 'none', 
                                        '&:hover': { bgcolor: '#D93602' },
                                        '&:disabled': { bgcolor: '#ccc' }
                                    }}
                                >
                                    {isApplying ? 'Applying...' : 'Apply Now'}
                                </Button>
                                <Button 
                                    startIcon={<BookmarkBorder />} 
                                    onClick={() => handleSaveForLater(project)}
                                    sx={{ 
                                        color: isSaved ? '#FF3F01' : '#64748B', 
                                        textTransform: 'none', 
                                        fontWeight: 600 
                                    }}
                                >
                                    {isSaved ? 'Saved' : 'Save for Later'}
                                </Button>
                                <Button
                                    startIcon={<Visibility />}
                                    onClick={() => handleOpenDetails(project)}
                                    sx={{ 
                                        color: '#64748B', 
                                        textTransform: 'none', 
                                        fontWeight: 600 
                                    }}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Paper>
                    )})}
                </Box>
            )}

            {/* --- MODAL DE DETALLES --- */}
            <ProjectDetailsModal
                open={detailsOpen}
                onClose={handleCloseDetails}
                project={selectedProject}
            />

        </Container>
    );
}