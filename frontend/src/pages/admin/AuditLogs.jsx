import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, TextField, MenuItem, Button, Chip, 
    Tabs, Tab, Pagination, InputAdornment, Grid, CircularProgress
} from '@mui/material';
import { 
    Search, FileDownload, CalendarToday, FilterList 
} from '@mui/icons-material';

const primaryColor = '#FF3F01';
const successBg = '#ECFDF5';
const successTxt = '#10B981';
const errorBg = '#FEF2F2';
const errorTxt = '#EF4444';
const neutralBg = '#F3F4F6';
const neutralTxt = '#6B7280';

export default function AuditLogs() {
    const [activeTab, setActiveTab] = useState(0);
    const [auditData, setAuditData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [actionFilter, setActionFilter] = useState('All');

    useEffect(() => {
        fetchAuditLogs();
    }, [activeTab, dateRange.start, dateRange.end]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            let url = `http://127.0.0.1:8000/api/admin/audit/?type=${activeTab}`;
            if (dateRange.start) url += `&start_date=${dateRange.start}`;
            if (dateRange.end) url += `&end_date=${dateRange.end}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setAuditData(response.data);
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSearchTerm('');
        setActionFilter('All');
    };

    const getActionStyle = (action) => {
        if (!action) return { bg: neutralBg, color: neutralTxt };
        const lowerAction = action.toLowerCase();
        
        if (lowerAction.includes('approv') || lowerAction.includes('receiv') || 
            lowerAction.includes('active') || lowerAction.includes('assign') || 
            lowerAction.includes('create')) 
            return { bg: successBg, color: successTxt };
        
        if (lowerAction.includes('reject') || lowerAction.includes('refund') || 
            lowerAction.includes('remov') || lowerAction.includes('delet') || 
            lowerAction.includes('cancel')) 
            return { bg: errorBg, color: errorTxt };
            
        return { bg: neutralBg, color: neutralTxt };
    };

    const getCurrentData = () => {
        return auditData.filter(item => {
            const matchesAction = actionFilter === 'All' || 
                                  (item.action && item.action.toLowerCase().includes(actionFilter.toLowerCase()));
            
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' || 
                                  (item.details && item.details.toLowerCase().includes(searchLower)) ||
                                  (item.user && item.user.toLowerCase().includes(searchLower)) ||
                                  (item.project && item.project.toLowerCase().includes(searchLower));

            return matchesAction && matchesSearch;
        });
    };

    return (
        <Box sx={{ p: 0 }}> 
            <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: '#1E293B' }}>
                Reports & Audit Log
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="audit logs tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                    TabIndicatorProps={{ style: { backgroundColor: primaryColor, height: 3 } }}
                    sx={{ 
                        '& .MuiTab-root': { 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            fontSize: '0.95rem',
                            color: '#64748B',
                            '&.Mui-selected': { color: primaryColor, fontWeight: 700 }
                        }
                    }}
                >
                    <Tab label="Approval History" />
                    <Tab label="Budget History" />
                    <Tab label="Project Status History" />
                    <Tab label="Donation Logs" />
                    <Tab label="Assignment History" />
                </Tabs>
            </Box>

            <Paper elevation={0} sx={{ p: 0, mb: 3, bgcolor: 'transparent' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', p: '6px 12px', borderRadius: 2, border: '1px solid #E2E8F0', gap: 1 }}>
                            <CalendarToday fontSize="small" sx={{ color: '#94A3B8' }} />
                            <input 
                                type="date"
                                style={{ border: 'none', outline: 'none', color: '#64748B', fontFamily: 'inherit', width: '100%' }}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                            <Typography sx={{ color: '#94A3B8' }}>-</Typography>
                            <input 
                                type="date"
                                style={{ border: 'none', outline: 'none', color: '#64748B', fontFamily: 'inherit', width: '100%' }}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            placeholder="Search by user, project, details..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8' }} /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><FilterList sx={{ color: '#94A3B8' }} /></InputAdornment>,
                            }}
                        >
                            <MenuItem value="All">All Actions</MenuItem>
                            <MenuItem value="Approv">Approved</MenuItem>
                            <MenuItem value="Reject">Rejected</MenuItem>
                            <MenuItem value="Update">Updated</MenuItem>
                            <MenuItem value="Create">Created</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            startIcon={<FileDownload />}
                            sx={{ 
                                bgcolor: primaryColor, 
                                fontWeight: 700, 
                                textTransform: 'none',
                                borderRadius: 2,
                                height: 40,
                                boxShadow: 'none',
                                whiteSpace: 'nowrap',
                                '&:hover': { bgcolor: '#D93602', boxShadow: 'none' }
                            }}
                        >
                            Export CSV
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <TableContainer sx={{ minHeight: 300 }}>
                    <Table stickyHeader aria-label="audit table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>DATE</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>ACTION</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>USER</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>DETAILS</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' }}>ASSOCIATED PROJECT</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <CircularProgress sx={{ color: primaryColor }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getCurrentData().map((row) => {
                                    const style = getActionStyle(row.action);
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                            <TableCell sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                {row.date}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.action} 
                                                    size="small" 
                                                    sx={{ 
                                                        bgcolor: style.bg, 
                                                        color: style.color, 
                                                        fontWeight: 700,
                                                        borderRadius: 1.5,
                                                        height: 24,
                                                        fontSize: '0.75rem'
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>
                                                {row.user}
                                            </TableCell>
                                            <TableCell sx={{ color: '#475569', fontSize: '0.9rem', maxWidth: 400 }}>
                                                {row.details}
                                            </TableCell>
                                            <TableCell sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                                                {row.project}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                            
                            {!loading && getCurrentData().length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                                        <Typography>No records found matching your filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0' }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {getCurrentData().length} results
                    </Typography>
                    <Pagination count={Math.ceil(getCurrentData().length / 10)} variant="outlined" shape="rounded" size="small" />
                </Box>
            </Paper>
        </Box>
    );
}
