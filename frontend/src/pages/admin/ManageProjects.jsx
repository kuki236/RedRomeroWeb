import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, MenuItem, Button, Chip, 
    Drawer, CircularProgress, Grid, InputBase, Pagination
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
    const [categories, setCategories] = useState([]);
    const [sdgGoals, setSdgGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    
    // Pagination State
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;
    
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
        status: 'Active',
        selectedCategories: [],
        selectedSDGs: []
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
            // Backend returns {id, name}, but we need {project_status_id, name} for consistency
            const formattedStatuses = response.data.map(status => {
                const id = status.id || status.project_status_id;
                return {
                    project_status_id: id,
                    id: id, // Keep both for compatibility
                    name: status.name
                };
            });
            setProjectStatuses(formattedStatuses);
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
            // Ensure ong_id is properly handled (it comes as number from backend)
            const formattedReps = response.data.map(rep => ({
                ...rep,
                ong_id: rep.ong_id // Keep as number for proper comparison
            }));
            setRepresentatives(formattedReps);
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
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        // Validation
        if (!formData.name || !formData.start_date || !formData.project_status_id || !formData.ong_id || !formData.representative_id) {
            alert('Please fill in all required fields: Project Name, Start Date, Project Status, NGO, and Representative.');
            return;
        }

        try {
            if (formData.project_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/projects/update/', {
                    project_id: formData.project_id,
                    name: formData.name,
                    description: formData.description || '',
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    project_status_id: parseInt(formData.project_status_id),
                    ong_id: parseInt(formData.ong_id),
                    representative_id: parseInt(formData.representative_id),
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE - Ensure all required fields are properly formatted
                const projectData = {
                    name: formData.name,
                    description: formData.description || '',
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    project_status_id: parseInt(formData.project_status_id),
                    ong_id: parseInt(formData.ong_id),
                    representative_id: parseInt(formData.representative_id),
                    status: formData.status || 'Active'
                };
                const createResponse = await axios.post('http://127.0.0.1:8000/api/admin/projects/', projectData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
                
                const newProjectId = createResponse.data.project_id;
                
                // Assign categories
                if (formData.selectedCategories && formData.selectedCategories.length > 0) {
                    for (const categoryId of formData.selectedCategories) {
                        try {
                            await axios.post('http://127.0.0.1:8000/api/admin/assignments/project-category/', {
                                project_id: newProjectId,
                                category_id: categoryId,
                                is_primary: formData.selectedCategories.indexOf(categoryId) === 0 ? 'Y' : 'N'
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        } catch (error) {
                            console.error(`Error assigning category ${categoryId}:`, error);
                        }
                    }
                }
                
                // Assign SDG Goals
                if (formData.selectedSDGs && formData.selectedSDGs.length > 0) {
                    for (const sdgId of formData.selectedSDGs) {
                        try {
                            await axios.post('http://127.0.0.1:8000/api/admin/assignments/project-sdg/', {
                                project_id: newProjectId,
                                sdg_id: sdgId,
                                contribution_level: 'MEDIO'
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        } catch (error) {
                            console.error(`Error assigning SDG ${sdgId}:`, error);
                        }
                    }
                }
            }
            fetchProjects(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving project:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save project.';
            alert(`Error: ${errorMessage}. Please check console for details.`);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        // If NGO changes, reset representative selection
        if (name === 'ong_id') {
            setFormData({ ...formData, [name]: value, representative_id: '' });
        } else {
            // Store the value - Material-UI select always returns string
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleOpenDrawer = (project = null) => {
        if (project) {
            // Edit Mode - Format dates and ensure IDs are strings for select fields
            setFormData({
                project_id: project.project_id,
                name: project.name,
                description: project.description || '',
                start_date: formatDate(project.start_date),
                end_date: formatDate(project.end_date) || '',
                project_status_id: project.project_status_id ? String(project.project_status_id) : '',
                ong_id: project.ong_id ? String(project.ong_id) : '',
                representative_id: project.representative_id ? String(project.representative_id) : '',
                status: project.status || 'Active'
            });
        } else {
            // New Project Mode - Reset all fields
            setFormData({
                project_id: null,
                name: '',
                description: '',
                start_date: '',
                end_date: '',
                project_status_id: '',
                ong_id: '',
                representative_id: '',
                status: 'Active',
                selectedCategories: [],
                selectedSDGs: []
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING & PAGINATION ---

    const getFilteredProjects = () => {
        let filtered = projects;
        if (searchTerm) {
            filtered = filtered.filter(p => 
                (p.name && p.name.toLowerCase().includes(searchTerm)) || 
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }
        if (selectedCategoryFilter) {
            filtered = filtered.filter(p => 
                p.category_id?.toString() === selectedCategoryFilter ||
                p.category_name?.toLowerCase().includes(selectedCategoryFilter.toLowerCase())
            );
        }
        return filtered;
    };

    const getPaginatedProjects = () => {
        const filtered = getFilteredProjects();
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        // Scroll to top of table when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset to page 1 when search term changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

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
        if (!repId) return '-';
        const rep = representatives.find(r => r.representative_id === repId);
        return rep ? `${rep.first_name} ${rep.last_name}` : repId;
    };

    // Format date to show only date without time
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // If it's in ISO format with time, extract only the date part
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
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
                
                {/* Search and Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2 }} 
                        placeholder="Search by name or description..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />} 
                    />
                    <TextField
                        select
                        size="small"
                        sx={{ minWidth: 200, border: '1px solid #E2E8F0', borderRadius: 2 }}
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        placeholder="Filter by category"
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
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
                            ) : getPaginatedProjects().length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#94A3B8' }}>
                                        No projects found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getPaginatedProjects().map((project) => (
                                    <TableRow key={project.project_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {project.name}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {project.description || '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#1E293B' }}>{formatDate(project.start_date)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{formatDate(project.end_date)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getProjectStatusName(project.project_status_id)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getNGOName(project.ong_id)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getRepresentativeName(project.representative_id)}</TableCell>
                                        <TableCell>{getStatusChip(project.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(project)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGINATION */}
                {!loading && getFilteredProjects().length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 3, borderTop: '1px solid #E2E8F0' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, getFilteredProjects().length)} of {getFilteredProjects().length} projects
                        </Typography>
                        <Pagination
                            count={Math.ceil(getFilteredProjects().length / rowsPerPage)}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: '#64748B',
                                    '&.Mui-selected': {
                                        backgroundColor: primaryColor,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#D93602',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#FFF5F0',
                                    },
                                },
                            }}
                        />
                    </Box>
                )}
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
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Project Status *</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="project_status_id" 
                                value={formData.project_status_id ? String(formData.project_status_id) : ''} 
                                onChange={handleChange}
                                required
                                error={!formData.project_status_id}
                                helperText={!formData.project_status_id ? 'Required field' : ''}
                            >
                                {projectStatuses.length > 0 ? (
                                    projectStatuses.map((status) => {
                                        // Backend returns 'id', but we map it to 'project_status_id' in fetchProjectStatuses
                                        const statusId = String(status.project_status_id || status.id);
                                        return (
                                            <MenuItem key={statusId} value={statusId}>
                                                {status.name}
                                            </MenuItem>
                                        );
                                    })
                                ) : (
                                    <MenuItem disabled>Loading statuses...</MenuItem>
                                )}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">NGO *</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="ong_id" 
                                value={formData.ong_id ? String(formData.ong_id) : ''} 
                                onChange={handleChange}
                                required
                                error={!formData.ong_id}
                                helperText={!formData.ong_id ? 'Required field' : ''}
                            >
                                {ngos.length > 0 ? (
                                    ngos.map((ngo) => (
                                        <MenuItem key={ngo.ong_id} value={String(ngo.ong_id)}>
                                            {ngo.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>Loading NGOs...</MenuItem>
                                )}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Representative *</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="representative_id" 
                                value={formData.representative_id ? String(formData.representative_id) : ''} 
                                onChange={handleChange}
                                disabled={!formData.ong_id}
                                required
                                error={!formData.representative_id}
                                helperText={!formData.ong_id ? 'Please select an NGO first' : !formData.representative_id ? 'Required field' : ''}
                            >
                                {formData.ong_id ? (
                                    (() => {
                                        // Convert both to strings for comparison
                                        const selectedOngId = String(formData.ong_id);
                                        const filteredReps = representatives.filter(rep => 
                                            String(rep.ong_id) === selectedOngId
                                        );
                                        return filteredReps.length > 0 ? (
                                            filteredReps.map((rep) => (
                                                <MenuItem key={rep.representative_id} value={String(rep.representative_id)}>
                                                    {rep.first_name} {rep.last_name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No representatives found for this NGO</MenuItem>
                                        );
                                    })()
                                ) : (
                                    <MenuItem disabled>Select an NGO first</MenuItem>
                                )}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* SECTION 4: CATEGORIES & SDG GOALS */}
                    {!formData.project_id && (
                        <>
                            <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Categories & SDG Goals</Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">Categories</Typography>
                                    <TextField
                                        select
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected) => {
                                                if (selected.length === 0) return 'Select categories';
                                                return selected.map(id => {
                                                    const cat = categories.find(c => c.id === parseInt(id));
                                                    return cat ? cat.name : id;
                                                }).join(', ');
                                            }
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        value={formData.selectedCategories || []}
                                        onChange={(e) => setFormData({ ...formData, selectedCategories: e.target.value })}
                                    >
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">SDG Goals</Typography>
                                    <TextField
                                        select
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected) => {
                                                if (selected.length === 0) return 'Select SDG goals';
                                                return selected.map(id => {
                                                    const sdg = sdgGoals.find(s => s.id === parseInt(id));
                                                    return sdg ? `SDG ${sdg.number}: ${sdg.name}` : id;
                                                }).join(', ');
                                            }
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        value={formData.selectedSDGs || []}
                                        onChange={(e) => setFormData({ ...formData, selectedSDGs: e.target.value })}
                                    >
                                        {sdgGoals.map((sdg) => (
                                            <MenuItem key={sdg.id} value={sdg.id}>
                                                SDG {sdg.number}: {sdg.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveProject} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Project</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}





