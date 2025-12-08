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
    InputBase,
    Pagination
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
    const [currentTab, setCurrentTab] = useState(0);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;

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
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get('http://127.0.0.1:8000/api/admin/employees/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching employees:', err);
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleSaveEmployee = async () => {
        // Basic validation
        const required = ['first_name', 'last_name', 'birth_date', 'email', 'hire_date'];
        for (const field of required) {
            if (!formData[field]) {
                const fieldName = field.replace('_', ' ');
                alert(`Please fill in ${fieldName}.`);
                return;
            }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }

        try {
            if (formData.employee_id) {
                // UPDATE - Send only fields that backend accepts
                const updateData = {
                    employee_id: formData.employee_id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone || '',
                    address: formData.address || ''
                };
                await axios.put('http://127.0.0.1:8000/api/admin/employees/update/', updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // CREATE - Send all required fields
                await axios.post('http://127.0.0.1:8000/api/admin/employees/', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            await fetchEmployees();
            handleCloseDrawer();
        } catch (err) {
            console.error('Error saving employee:', err);
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                // Optionally redirect to login
                // window.location.href = '/login';
            } else {
                const errorMessage = err.response?.data?.error || err.message || 'Failed to save employee.';
                alert(`Error: ${errorMessage}. Please check console for details.`);
            }
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required. Please log in again.');
            return;
        }
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/employees/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchEmployees(); // Refresh the list
        } catch (err) {
            console.error('Error deleting employee:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to delete employee.';
            alert(`Error: ${errorMessage}`);
        }
    };

    // --- HANDLERS ---
    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setPage(1); // Reset to first page when tab changes
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (employee = null) => {
        if (employee) {
        // Edit Mode - Format dates to remove time component
        setFormData({
            employee_id: employee.employee_id,
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            birth_date: formatDateForInput(employee.birth_date) || '',
            address: employee.address || '',
            email: employee.email || '',
            phone: employee.phone || '',
            hire_date: formatDateForInput(employee.hire_date) || ''
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

    // Format date to show only date without time
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // If it's in ISO format with time, extract only the date part
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    // --- FILTERING & PAGINATION ---
    const getFilteredEmployees = () => {
        let filtered = employees;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(e =>
                (`${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm)) ||
                (e.email && e.email.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply tab filter
        if (currentTab === 1) {
            // Recently Hired (within 1 year)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            filtered = filtered.filter(e => {
                if (!e.hire_date) return false;
                try {
                    const hireDate = new Date(e.hire_date);
                    return hireDate >= oneYearAgo;
                } catch {
                    return false;
                }
            });
        } else if (currentTab === 2) {
            // Long-term (more than 1 year)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            filtered = filtered.filter(e => {
                if (!e.hire_date) return false;
                try {
                    const hireDate = new Date(e.hire_date);
                    return hireDate < oneYearAgo;
                } catch {
                    return false;
                }
            });
        }
        
        return filtered;
    };

    const getPaginatedEmployees = () => {
        const filtered = getFilteredEmployees();
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        // Scroll to top of table when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset to page 1 when search term or tab changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, currentTab]);

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
                ) : getPaginatedEmployees().length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#94A3B8' }}>
                            No employees found
                        </TableCell>
                    </TableRow>
                ) : (
                    getPaginatedEmployees().map((emp) => (
                    <TableRow key={emp.employee_id} hover>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {emp.first_name} {emp.last_name}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B' }}>{emp.email}</TableCell>
                        <TableCell sx={{ color: '#1E293B' }}>{formatDate(emp.birth_date)}</TableCell>
                        <TableCell sx={{ color: '#64748B' }}>{emp.phone || '-'}</TableCell>
                        <TableCell sx={{ color: '#1E293B' }}>{formatDate(emp.hire_date)}</TableCell>
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

            {/* PAGINATION */}
            {!loading && getFilteredEmployees().length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 3, borderTop: '1px solid #E2E8F0' }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, getFilteredEmployees().length)} of {getFilteredEmployees().length} employees
                    </Typography>
                    <Pagination
                        count={Math.ceil(getFilteredEmployees().length / rowsPerPage)}
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

