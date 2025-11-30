import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, MenuItem, Switch, Button, Chip, 
    Drawer, CircularProgress, Grid, InputBase
} from '@mui/material';
import { 
    Search, Add, Edit, Close
} from '@mui/icons-material';

const primaryColor = '#FF3F01';

export default function ProjectManagement() {
    
    // --- STATE ---
    const [projects, setProjects] = useState([]); 
    const [projectStatuses, setProjectStatuses] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [representatives, setRepresentatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        project_id: null,
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        project_status_id: '',
        ong_id: '',
        representative_id: '',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/projects/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data); 
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectStatuses = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/project-statuses/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjectStatuses(response.data);
        } catch (error) {
            console.error("Error fetching project statuses:", error);
        }
    };

    const fetchNGOs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/ngos/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNgos(response.data);
        } catch (error) {
            console.error("Error fetching NGOs:", error);
        }
    };

    const fetchRepresentatives = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/representatives/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRepresentatives(response.data);
        } catch (error) {
            console.error("Error fetching representatives:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchProjectStatuses();
        fetchNGOs();
        fetchRepresentatives();
    }, []);

    const handleSaveProject = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.project_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/projects/update/', {
                    project_id: formData.project_id,
                    name: formData.name,
                    description: formData.description,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    project_status_id: formData.project_status_id,
                    ong_id: formData.ong_id,
                    representative_id: formData.representative_id,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/projects/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchProjects(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const projectToUpdate = projects.find(p => p.project_id === id);
        
        if (!projectToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/projects/update/', { 
                 ...projectToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchProjects(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (project = null) => {
        if (project) {
            // Edit Mode
            setFormData({
                project_id: project.project_id,
                name: project.name,
                description: project.description || '',
                start_date: project.start_date,
                end_date: project.end_date || '',
                project_status_id: project.project_status_id,
                ong_id: project.ong_id,
                representative_id: project.representative_id,
                status: project.status
            });
        } else {
            // New Project Mode
            setFormData({
                project_id: null,
                name: '',
                description: '',
                start_date: '',
                end_date: '',
                project_status_id: '',
                ong_id: '',
                representative_id: '',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredProjects = () => {
        let filtered = projects;
        if (searchTerm) {
            filtered = filtered.filter(p => 
                (p.name && p.name.toLowerCase().includes(searchTerm)) || 
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }
        return filtered;
    };

    const getStatusChip = (status) => {
        const isActive = status === 'Active';
        return (
            <Chip 
                label={status} 
                size="small" 
                sx={{ 
                    bgcolor: isActive ? '#E8F5E9' : '#FFEBEE', 
                    color: isActive ? '#2E7D32' : '#C62828',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                }} 
            />
        );
    };

    // Helper functions to get names from IDs
    const getProjectStatusName = (statusId) => {
        const status = projectStatuses.find(s => s.project_status_id === statusId);
        return status ? status.name : statusId;
    };

    const getNGOName = (ngoId) => {
        const ngo = ngos.find(n => n.ong_id === ngoId);
        return ngo ? ngo.name : ngoId;
    };

    const getRepresentativeName = (repId) => {
        const rep = representatives.find(r => r.representative_id === repId);
        return rep ? rep.name : repId;
    };

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Project Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage projects, timelines, and assignments.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New Project
                </Button>
            </Box>

            {/* CONTENT CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                
                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
                        placeholder="Search by name or description..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                </Box>
                
                {/* TABLE */}
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Project Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Start Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>End Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Project Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>NGO</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Representative</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredProjects().map((project) => (
                                    <TableRow key={project.project_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {project.name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {project.description || '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#1E293B' }}>{project.start_date}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{project.end_date || '-'}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getProjectStatusName(project.project_status_id)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getNGOName(project.ong_id)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getRepresentativeName(project.representative_id)}</TableCell>
                                        <TableCell>{getStatusChip(project.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(project)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={project.status === 'Active'} 
                                                onChange={() => handleToggleStatus(project.project_id, project.status)}
                                                sx={{ 
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: primaryColor },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: primaryColor },
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* DYNAMIC DRAWER (FORM) */}
            <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer} PaperProps={{ sx: { width: 450, p: 4 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.project_id ? 'Edit Project' : 'New Project'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: BASIC INFORMATION */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>Basic Information</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Project Name</Typography>
                            <TextField fullWidth variant="outlined" size="small" name="name" value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Description</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                    </Grid>

                    {/* SECTION 2: TIMELINE */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Timeline</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Start Date</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="date" 
                                name="start_date" 
                                value={formData.start_date} 
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">End Date</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="date" 
                                name="end_date" 
                                value={formData.end_date} 
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* SECTION 3: ASSIGNMENT */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Assignment</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Project Status</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="project_status_id" 
                                value={formData.project_status_id} 
                                onChange={handleChange}
                            >
                                {projectStatuses.map((status) => (
                                    <MenuItem key={status.project_status_id} value={status.project_status_id}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">NGO</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="ong_id" 
                                value={formData.ong_id} 
                                onChange={handleChange}
                            >
                                {ngos.map((ngo) => (
                                    <MenuItem key={ngo.ong_id} value={ngo.ong_id}>
                                        {ngo.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Representative</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="representative_id" 
                                value={formData.representative_id} 
                                onChange={handleChange}
                            >
                                {representatives.map((rep) => (
                                    <MenuItem key={rep.representative_id} value={rep.representative_id}>
                                        {rep.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveProject} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Project</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}





