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
const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'ADJUST'];

export default function BudgetHistoryManagement() {
    
    // --- STATE ---
    const [budgetHistory, setBudgetHistory] = useState([]); 
    const [budgets, setBudgets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Drawer & Form State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        history_id: null,
        budget_id: '',
        employee_id: '',
        old_amount: '',
        new_amount: '',
        reason: '',
        change_date: '',
        action_type: 'UPDATE',
        status: 'Active'
    });

    // --- API CALLS ---

    const fetchBudgetHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:8000/api/admin/budget-history/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgetHistory(response.data); 
        } catch (error) {
            console.error("Error fetching budget history:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBudgets = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/budgets/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    };

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/employees/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchBudgetHistory();
        fetchBudgets();
        fetchEmployees();
    }, []);

    const handleSaveBudgetHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (formData.history_id) {
                // UPDATE
                await axios.put('http://127.0.0.1:8000/api/admin/budget-history/update/', {
                    history_id: formData.history_id,
                    budget_id: formData.budget_id,
                    employee_id: formData.employee_id,
                    old_amount: formData.old_amount || null,
                    new_amount: formData.new_amount,
                    reason: formData.reason,
                    change_date: formData.change_date,
                    action_type: formData.action_type,
                    status: formData.status
                }, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            } else {
                // CREATE
                await axios.post('http://127.0.0.1:8000/api/admin/budget-history/', formData, {
                   headers: { Authorization: `Bearer ${token}` } 
                });
            }
            fetchBudgetHistory(); 
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving budget history:", error);
            alert("Failed to save budget history. Check console for details.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const historyToUpdate = budgetHistory.find(h => h.history_id === id);
        
        if (!historyToUpdate) return;

        try {
             await axios.put('http://127.0.0.1:8000/api/admin/budget-history/update/', { 
                 ...historyToUpdate, 
                 status: newStatus 
             }, {
                headers: { Authorization: `Bearer ${token}` } 
             });
             fetchBudgetHistory(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // --- HANDLERS ---

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenDrawer = (history = null) => {
        if (history) {
            // Edit Mode
            setFormData({
                history_id: history.history_id,
                budget_id: history.budget_id,
                employee_id: history.employee_id,
                old_amount: history.old_amount || '',
                new_amount: history.new_amount,
                reason: history.reason || '',
                change_date: history.change_date,
                action_type: history.action_type,
                status: history.status
            });
        } else {
            // New Budget History Mode
            setFormData({
                history_id: null,
                budget_id: '',
                employee_id: '',
                old_amount: '',
                new_amount: '',
                reason: '',
                change_date: new Date().toISOString().slice(0, 16),
                action_type: 'UPDATE',
                status: 'Active'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => setIsDrawerOpen(false);

    // --- FILTERING ---

    const getFilteredBudgetHistory = () => {
        let filtered = budgetHistory;
        if (searchTerm) {
            filtered = filtered.filter(h => 
                (h.action_type && h.action_type.toLowerCase().includes(searchTerm)) || 
                (h.reason && h.reason.toLowerCase().includes(searchTerm))
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

    const getActionChip = (actionType) => {
        const colorMap = {
            'CREATE': { bg: '#E3F2FD', color: '#1565C0' },
            'UPDATE': { bg: '#FFF3E0', color: '#E65100' },
            'DELETE': { bg: '#FFEBEE', color: '#C62828' },
            'ADJUST': { bg: '#F3E5F5', color: '#6A1B9A' }
        };
        const colors = colorMap[actionType] || { bg: '#F5F5F5', color: '#616161' };
        return (
            <Chip 
                label={actionType} 
                size="small" 
                sx={{ 
                    bgcolor: colors.bg, 
                    color: colors.color,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                }} 
            />
        );
    };

    // Helper functions to get names from IDs
    const getBudgetName = (budgetId) => {
        const budget = budgets.find(b => b.budget_id === budgetId);
        return budget ? budget.name : budgetId;
    };

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(e => e.employee_id === employeeId);
        return employee ? employee.name : employeeId;
    };

    const formatCurrency = (amount) => {
        return amount ? `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '-';
        const date = new Date(dateTime);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <Box>
            {/* PAGE HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Budget History Management</Typography>
                    <Typography variant="body2" color="text.secondary">Track budget changes, modifications, and audit trail.</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenDrawer()}
                    sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#D93602' } }}
                >
                    Create New Entry
                </Button>
            </Box>

            {/* CONTENT CARD */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                
                {/* Search */}
                <Box sx={{ mb: 3 }}>
                    <InputBase 
                        sx={{ p: '8px 12px', width: '100%', maxWidth: 400, border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }} 
                        placeholder="Search by action type or reason..." 
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
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Budget</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Old Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>New Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Change Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Action Type</TableCell>
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
                                getFilteredBudgetHistory().map((history) => (
                                    <TableRow key={history.history_id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {getBudgetName(history.budget_id)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{getEmployeeName(history.employee_id)}</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{formatCurrency(history.old_amount)}</TableCell>
                                        <TableCell sx={{ color: '#1E293B', fontWeight: 600 }}>{formatCurrency(history.new_amount)}</TableCell>
                                        <TableCell sx={{ color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {history.reason || '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>{formatDateTime(history.change_date)}</TableCell>
                                        <TableCell>{getActionChip(history.action_type)}</TableCell>
                                        <TableCell>{getStatusChip(history.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleOpenDrawer(history)}>
                                                <Edit fontSize="small" sx={{ color: '#64748B' }} />
                                            </IconButton>
                                            <Switch 
                                                size="small" 
                                                checked={history.status === 'Active'} 
                                                onChange={() => handleToggleStatus(history.history_id, history.status)}
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
                    <Typography variant="h5" fontWeight={800} color="#1E293B">{formData.history_id ? 'Edit Budget History' : 'New Budget History'}</Typography>
                    <IconButton onClick={handleCloseDrawer}><Close /></IconButton>
                </Box>
                
                <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                    
                    {/* SECTION 1: REFERENCES */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>References</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Budget</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="budget_id" 
                                value={formData.budget_id} 
                                onChange={handleChange}
                            >
                                {budgets.map((budget) => (
                                    <MenuItem key={budget.budget_id} value={budget.budget_id}>
                                        {budget.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Employee</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="employee_id" 
                                value={formData.employee_id} 
                                onChange={handleChange}
                            >
                                {employees.map((employee) => (
                                    <MenuItem key={employee.employee_id} value={employee.employee_id}>
                                        {employee.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* SECTION 2: AMOUNTS */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Amounts</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Old Amount (Optional)</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="number" 
                                name="old_amount" 
                                value={formData.old_amount} 
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">New Amount</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="number" 
                                name="new_amount" 
                                value={formData.new_amount} 
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                    </Grid>

                    {/* SECTION 3: CHANGE DETAILS */}
                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Change Details</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Action Type</Typography>
                            <TextField 
                                select 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="action_type" 
                                value={formData.action_type} 
                                onChange={handleChange}
                            >
                                {actionTypes.map((action) => (
                                    <MenuItem key={action} value={action}>
                                        {action}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Change Date & Time</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                type="datetime-local" 
                                name="change_date" 
                                value={formData.change_date} 
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Reason (Optional)</Typography>
                            <TextField 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                name="reason" 
                                value={formData.reason} 
                                onChange={handleChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" gap={2} mt={3}>
                        <Button variant="contained" fullWidth onClick={handleSaveBudgetHistory} sx={{ bgcolor: primaryColor, py: 1.5, fontWeight: 700 }}>Save Budget History</Button>
                        <Button variant="outlined" fullWidth onClick={handleCloseDrawer} sx={{ color: '#64748B', borderColor: '#E2E8F0', py: 1.5, fontWeight: 700 }}>Cancel</Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}