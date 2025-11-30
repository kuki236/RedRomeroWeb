import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Switch,
    Tabs,
    Tab,
    Button,
    Chip,
    Drawer,
    CircularProgress,
    Grid,
    InputBase
    } from '@mui/material';
    import {
    Search,
    Add,
    Edit,
    Close,
    Delete as DeleteIcon,
    } from '@mui/icons-material';

    const primaryColor = '#FF3F01';

    export default function Employee() {
    // --- STATE ---
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0); // reserved for future use

    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        employee_id: null,
        first_name: '',
        last_name: '',
        birth_date: '',
        address: '',
        email: '',
        phone: '',
        hire_date: ''
    });

    // --- API CALLS ---
    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        try {
        setLoading(true);
        // Replace endpoint with yours
        const res = await axios.get('http://127.0.0.1:8000/api/admin/employees/', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
        console.error('Error fetching employees:', err);
        // fallback to mock if desired
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSaveEmployee = async () => {
        // basic validation
        const required = ['first_name', 'last_name', 'birth_date', 'email', 'hire_date'];
        for (const field of required) {
        if (!formData[field]) {
            alert(`Please fill ${field.replace('_', ' ')}.`);
            return;
        }
        }

        const token = localStorage.getItem('token');
        try {
        if (formData.employee_id) {
            // UPDATE
            await axios.put('http://127.0.0.1:8000/api/admin/employees/update/', formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        } else {
            // CREATE
            await axios.post('http://127.0.0.1:8000/api/admin/employees/', formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        }
        await fetchEmployees();
        handleCloseDrawer();
        } catch (err) {
        console.error('Error saving employee:', err);
        alert('Failed to save employee. Check console for details.');
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!confirm('Delete employee?')) return;
        const token = localStorage.getItem('token');
        try {
        await axios.delete(`http://127.0.0.1:8000/api/admin/employees/${id}/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setEmployees(prev => prev.filter(e => e.employee_id !== id));
        } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee.');
        }
    };

    // --- HANDLERS ---
    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => setCurrentTab(newValue);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (employee = null) => {
        if (employee) {
        // Edit Mode
        setFormData({
            employee_id: employee.employee_id,
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            birth_date: employee.birth_date || '',
            address: employee.address || '',
            email: employee.email || '',
            phone: employee.phone || '',
            hire_date: employee.hire_date || ''
        });
        } else {
        // New Employee Mode
        setFormData({
            employee_id: null,
            first_name: '',
            last_name: '',
            birth_date: '',
            address: '',
            email: '',
            phone: '',
            hire_date: ''
        });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---
    const getFilteredEmployees = () => {
        let filtered = employees;
        if (searchTerm) {
        filtered = filtered.filter(e =>
            (`${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm)) ||
            (e.email && e.email.toLowerCase().includes(searchTerm))
        );
        }
        return filtered;
    };

    const getStatusChip = (hireDate) => {
        // example: show a chip if recently hired (within a year) else default
        if (!hireDate) return null;
        try {
        const hired = new Date(hireDate);
        const now = new Date();
        const diffYears = (now - hired) / (1000 * 60 * 60 * 24 * 365);
        const isRecent = diffYears <= 1;
        return (
            <Chip
            label={isRecent ? 'Recent' : 'Staff'}
            size="small"
            sx={{
                bgcolor: isRecent ? '#E8F5E9' : '#F3F4F6',
                color: isRecent ? '#2E7D32' : '#374151',
                fontWeight: 700,
                fontSize: '0.75rem'
            }}
            />
        );
        } catch {
        return null;
        }
    };

    return (
        <Box>
        {/* PAGE HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
            <Typography variant="h4" fontWeight={800} color="#1E293B">Employee Management</Typography>
            <Typography variant="body2" color="text.secondary">Manage employee records and contracts.</Typography>
            </Box>
            <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDrawer()}
            sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
            >
            Create New Employee
            </Button>
        </Box>

        {/* CONTENT CARD */}
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>

            {/* Search & Tabs */}
            <Box sx={{ mb: 3 }}>
            <InputBase
                sx={{ p: '8px 12px', width: '100%', maxWidth: 420, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }}
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                startAdornment={<Search sx={{ mr: 1, color: 'text.secondary' }} />}
            />
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                textColor="inherit"
                sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748B' },
                '& .Mui-selected': { color: primaryColor },
                '& .MuiTabs-indicator': { backgroundColor: primaryColor }
                }}
            >
                <Tab label="All" />
                <Tab label="Recently Hired" />
                <Tab label="Long-term" />
            </Tabs>
            </Box>

            {/* TABLE */}
            <TableContainer>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Birth Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Hire Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748B' }} align="right">Actions</TableCell>
                </TableRow>
                </TableHead>

                <TableBody>
                {loading ? (
                    <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <CircularProgress sx={{ color: primaryColor }} />
                    </TableCell>
                    </TableRow>
                ) : (
                    getFilteredEmployees().map((emp) => (
                    <TableRow key={emp.employee_id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {emp.first_name} {emp.last_name}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B' }}>{emp.email}</TableCell>
                        <TableCell sx={{ color: '#1E293B' }}>{emp.birth_date}</TableCell>
                        <TableCell sx={{ color: '#64748B' }}>{emp.phone}</TableCell>
                        <TableCell sx={{ color: '#1E293B' }}>{emp.hire_date}</TableCell>
                        <TableCell>{getStatusChip(emp.hire_date)}</TableCell>
                        <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDrawer(emp)}>
                            <Edit fontSize="small" sx={{ color: '#64748B' }} />
                        </IconButton>

                        <IconButton size="small" onClick={() => handleDeleteEmployee(emp.employee_id)}>
                            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                        </IconButton>
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
            <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.employee_id ? 'Edit Employee' : 'New Employee'}</Typography>
            <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
            </Box>

            <Box component="form" display="flex" flexDirection="column" gap={2.5}>

            <Typography variant="subtitle2" color="primary" fontWeight={700}>Personal Info</Typography>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">First Name</Typography>
                <TextField fullWidth variant="outlined" size="small" name="first_name" value={formData.first_name} onChange={handleChange} />
                </Grid>
                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Last Name</Typography>
                <TextField fullWidth variant="outlined" size="small" name="last_name" value={formData.last_name} onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Birth Date</Typography>
                <TextField fullWidth variant="outlined" size="small" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>

                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Hire Date</Typography>
                <TextField fullWidth variant="outlined" size="small" type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                </Grid>

                <Grid item xs={12}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Email</Typography>
                <TextField fullWidth variant="outlined" size="small" name="email" value={formData.email} onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Phone</Typography>
                <TextField fullWidth variant="outlined" size="small" name="phone" value={formData.phone} onChange={handleChange} />
                </Grid>

                <Grid item xs={6}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Address</Typography>
                <TextField fullWidth variant="outlined" size="small" name="address" value={formData.address} onChange={handleChange} />
                </Grid>
            </Grid>

            <Box display="flex" flexDirection="column" gap={2} mt={3}>
                <Button variant="contained" fullWidth onClick={handleSaveEmployee} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Employee</Button>
                <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
            </Box>
            </Box>
        </Drawer>
        </Box>
    );
}

