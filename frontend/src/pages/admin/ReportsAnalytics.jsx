import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Paper, Button, Grid, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress
} from '@mui/material';
import { 
    PictureAsPdf, TableView, Assessment, 
    CalendarToday, FilterList
} from '@mui/icons-material';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

const primaryColor = '#FF3F01';
const colors = ['#FF3F01', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function ReportsAnalytics() {
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        trends: [],
        distribution: [],
        reports: [],
        project_stats: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/reports/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error loading reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleExportPDF = () => alert("Generating PDF from backend...");
    const handleExportExcel = () => alert("Downloading Excel...");

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                <CircularProgress sx={{ color: primaryColor }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Reports & Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">Business Intelligence Dashboard</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<TableView />} 
                        onClick={handleExportExcel}
                        sx={{ color: '#1E293B', borderColor: '#E2E8F0', textTransform: 'none', fontWeight: 600 }}
                    >
                        Export Excel
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<PictureAsPdf />} 
                        onClick={handleExportPDF}
                        sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: '#D93602' }, textTransform: 'none', fontWeight: 700 }}
                    >
                        Export PDF
                    </Button>
                </Box>
            </Box>

            {/* SECTION 1: FINANCIAL TRENDS */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight={700} color="#1E293B">Donation Trend (6 Months)</Typography>
                            <IconButton size="small"><FilterList /></IconButton>
                        </Box>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={data.trends}>
                                <defs>
                                    <linearGradient id="colorUSD" x1="0" y1="0" x2="0" y2={1}>
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPEN" x1="0" y1="0" x2="0" y2={1}>
                                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" height={36}/>
                                
                                <Area type="monotone" dataKey="USD" stroke="#10B981" fillOpacity={1} fill="url(#colorUSD)" strokeWidth={2} />
                                <Area type="monotone" dataKey="PEN" stroke={primaryColor} fillOpacity={1} fill="url(#colorPEN)" strokeWidth={2} />
                                <Area type="monotone" dataKey="EUR" stroke="#3B82F6" fillOpacity={1} fill="#3B82F6" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: 400 }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={2}>Currency Distribution</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={data.distribution}
                                    cy="45%" 
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={80} 
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* SECTION 2: REPORT ACTIVITY */}
            <Grid container spacing={3}>
                
                {/* 2.1 Bar Chart */}
               <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: '100%' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <Assessment sx={{ color: primaryColor }} />
                            <Typography variant="h6" fontWeight={700} color="#1E293B">
                                Top 10 Projects (Reports)
                            </Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={350}> {/* Aumenté un poco la altura */}
                            <BarChart 
                                data={data.project_stats} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }} // Márgenes para evitar cortes
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                
                                {/* CORRECCIÓN VISUAL AQUÍ: width={150} y fontSize reducido ligeramente */}
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={160} 
                                    tick={{fill: '#475569', fontSize: 11, width: 150}} 
                                    interval={0} // Fuerza a mostrar todas las etiquetas
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                
                                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: 8 }} />
                                <Bar 
                                    dataKey="reports" 
                                    fill={primaryColor} 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={20} 
                                    name="Reports" 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* 2.2 Table */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 0, borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={700} color="#1E293B">Latest Generated Reports</Typography>
                        </Box>
                        
                        <TableContainer sx={{ maxHeight: 350 }}>
                            <Table stickyHeader>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.75rem' }}>PROJECT</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.75rem' }}>TITLE</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.75rem' }}>DATE</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.75rem' }} align="right">AGE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.reports.map((row) => (
                                        <TableRow key={row.report_id} hover>
                                            <TableCell sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem' }}>{row.project_name}</TableCell>
                                            <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>{row.report_title}</TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1} color="#64748B" fontSize="0.85rem">
                                                    <CalendarToday fontSize="inherit" />
                                                    {row.report_date}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                    label={`${row.days_since_report} days`} 
                                                    size="small" 
                                                    sx={{ 
                                                        bgcolor: row.days_since_report < 7 ? '#ECFDF5' : '#F1F5F9', 
                                                        color: row.days_since_report < 7 ? '#10B981' : '#64748B',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem'
                                                    }} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.reports.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#94A3B8' }}>
                                                No recent reports
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
