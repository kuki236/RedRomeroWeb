import React, { useState } from 'react';
import { 
    Box, Typography, Grid, Paper, Button, Chip, LinearProgress, IconButton
} from '@mui/material';
import { 
    Add, Description, Folder, MonetizationOn, Assignment, Timeline, 
    ArrowForward, Visibility, Edit, RequestQuote
} from '@mui/icons-material';
import { useRoleProtection } from '../../hooks/useRoleProtection';
import FundingProgress from '../../components/common/FundingProgress';

// --- MOCK DATA (Based on Image) ---
const kpiData = [
    { title: 'My Projects', value: '6', icon: <Folder sx={{ color: '#3B82F6', fontSize: 30 }} />, bgColor: '#EFF6FF' },
    { title: 'Total Raised', value: '$89K', icon: <MonetizationOn sx={{ color: '#10B981', fontSize: 30 }} />, bgColor: '#ECFDF5' },
    { title: 'Pending Approval', value: '2', icon: <Assignment sx={{ color: '#F59E0B', fontSize: 30 }} />, bgColor: '#FFFBEB' },
];

const projectStatus = [
    { status: 'Active', count: 4, percent: '67%', color: '#10B981' },
    { status: 'Planning', count: 2, percent: '33%', color: '#F59E0B' },
    { status: 'Suspended', count: 0, percent: '0%', color: '#EF4444' },
    { status: 'Completed', count: 8, percent: '-', color: '#6B7280' },
];

const activeProjects = [
    { 
        id: 1, name: 'Educación Digital Rural 2025', status: 'Active', 
        raised: '$12.5K', goal: '$15K', percent: 83, 
        timeline: 'Mar 2025 - Dec 2025', volunteers: '8 / 10', lastReport: 'Nov 15, 2025 (Approved)' 
    },
    { 
        id: 2, name: 'Agua Potable para la Amazonía', status: 'Active', 
        raised: '$28.2K', goal: '$30K', percent: 94, 
        timeline: 'Jun 2025 - Jan 2026', volunteers: '12 / 12', lastReport: 'Nov 10, 2025 (Approved)' 
    },
];

const pendingReviews = [
    { id: 101, name: 'Energía Solar Andina 2025', date: 'Nov 18, 2025 (6 days ago)', assigned: 'Lucia Ramos (Employee)', status: 'Under Review' },
    { id: 102, name: 'Biblioteca Móvil Cusco 2025', date: 'Nov 20, 2025 (4 days ago)', assigned: 'Jorge Paredes (Employee)', status: 'Pending Documents' },
];

export default function RepresentativeDashboard() {
    // 1. Security Check
    useRoleProtection('REPRESENTATIVE');

    return (
        <Box>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#1E293B">Good morning, Rosa! 👋</Typography>
                    <Typography variant="body2" color="text.secondary">Manos Unidas Global Representative</Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B', borderColor: '#E2E8F0' }}>My Profile</Button>
                    <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B', borderColor: '#E2E8F0' }}>My NGO</Button>
                </Box>
            </Box>

            {/* KPIs ROW */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {kpiData.map((kpi, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: kpi.bgColor }}>
                                {kpi.icon}
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} color="#1E293B">{kpi.value}</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{kpi.title}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                <Grid item xs={12} sm={4}>
                     {/* Small funding card */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Box sx={{ p: 1, borderRadius: '50%', bgcolor: '#FEE2E2', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Timeline sx={{ color: '#EF4444' }} />
                         </Box>
                         <Box>
                             <Typography variant="h4" fontWeight={800} color="#1E293B">85%</Typography>
                             <Typography variant="caption" color="text.secondary">Funding Progress</Typography>
                         </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* MAIN DASHBOARD CONTENT */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* LEFT: Funding Progress (Big Chart) */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700} color="#1E293B">Funding Progress</Typography>
                        </Box>
                        
                        {/* Circular Progress Component */}
                        <FundingProgress value={85} total="$89K" goal="105K" />
                        
                        <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                                <Typography variant="caption" color="text.secondary">Received <br/> <b>$89,420</b></Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FCD34D' }} />
                                <Typography variant="caption" color="text.secondary">Pending <br/> <b>$15,580</b></Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* RIGHT: Project Status List */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={3}>Project Status</Typography>
                        
                        <Box display="flex" flexDirection="column" gap={2}>
                            {projectStatus.map((item, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: item.color }} />
                                        <Typography variant="body2" fontWeight={500} color="#374151">{item.status}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600} color="#111827">{item.count} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({item.percent})</span></Typography>
                                </Box>
                            ))}
                        </Box>
                        
                        <Box sx={{ my: 3, height: 1, bgcolor: '#E5E7EB' }} />
                        
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Total Projects:</Typography>
                            <Typography variant="body2" fontWeight={700}>14</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Success Rate:</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">100%</Typography>
                        </Box>

                    </Paper>
                </Grid>
            </Grid>

            {/* ACTIONS ROW */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: '#FF3F01', fontWeight: 700, '&:hover': { bgcolor: '#D93602' } }}>Create New Project</Button>
                <Button variant="outlined" startIcon={<Description />} sx={{ color: '#374151', borderColor: '#E2E8F0', fontWeight: 600 }}>Submit Report</Button>
                <Button variant="outlined" startIcon={<Visibility />} sx={{ color: '#374151', borderColor: '#E2E8F0', fontWeight: 600 }}>View Donors</Button>
            </Box>

            {/* ACTIVE PROJECTS LIST */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h6" fontWeight={700} color="#1E293B" mb={2}>My Active Projects</Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                    {activeProjects.map((proj) => (
                        <Paper key={proj.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700} color="#1E293B">{proj.name}</Typography>
                                    <Chip label={proj.status} size="small" sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 700, height: 20, fontSize: '0.7rem', mt: 0.5 }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Raised / Budget</Typography>
                                    <Typography variant="body2" fontWeight={700}>{proj.raised} / {proj.goal} <span style={{ color: '#10B981' }}>({proj.percent}%)</span></Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Timeline</Typography>
                                    <Typography variant="body2" fontWeight={600}>{proj.timeline}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Volunteers</Typography>
                                    <Typography variant="body2" fontWeight={600}>{proj.volunteers}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">Last Report</Typography>
                                    <Typography variant="body2" fontWeight={600}>{proj.lastReport}</Typography>
                                </Box>
                            </Box>
                            
                            {/* Progress Bar */}
                            <LinearProgress variant="determinate" value={proj.percent} sx={{ height: 6, borderRadius: 3, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: '#FF3F01' } }} />
                            
                            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                                <Button size="small" variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#374151' }}>View Details</Button>
                                <Button size="small" variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#374151' }}>Add Report</Button>
                                <Button size="small" variant="contained" sx={{ bgcolor: '#FFF0EB', color: '#FF3F01', boxShadow: 'none', '&:hover': { bgcolor: '#FFDEC8' } }}>Request Funds</Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
                
                <Button endIcon={<ArrowForward />} sx={{ textTransform: 'none', color: '#FF3F01', fontWeight: 600, display: 'block', mx: 'auto' }}>View All My Projects (6)</Button>
            </Box>

            {/* APPROVAL TRACKER */}
            <Box>
                <Typography variant="h6" fontWeight={700} color="#1E293B" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Approval Status Tracker <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                    {pendingReviews.map((rev) => (
                        <Paper key={rev.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #F3F4F6', bgcolor: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="#1E293B">{rev.name}</Typography>
                                <Typography variant="caption" color="text.secondary">Submitted: {rev.date} | Assigned to: {rev.assigned} | Status: <b>{rev.status}</b></Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#374151' }}>View Details</Button>
                                <Button size="small" variant="outlined" color="error" sx={{ borderColor: '#FECACA', color: '#EF4444', bgcolor: '#FEF2F2' }}>{rev.status === 'Under Review' ? 'Withdraw Request' : 'Upload Documents'}</Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}