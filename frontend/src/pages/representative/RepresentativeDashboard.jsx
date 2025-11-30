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
        <Box sx={{ px: 2, py: 3 }}>
        
            {/* HEADER */}
            <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 5 
            }}>
            <Box>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                Good morning, Rosa! 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                Manos Unidas • Global Representative
                </Typography>
            </Box>

            <Box display="flex" gap={1.5}>
                <Button variant="outlined" sx={{ 
                textTransform: 'none', 
                borderColor: '#E2E8F0',
                px: 2.5,
                fontWeight: 600,
                color: '#475569'
                }}>
                My Profile
                </Button>
                
                <Button variant="outlined" sx={{ 
                textTransform: 'none',
                borderColor: '#E2E8F0',
                px: 2.5,
                fontWeight: 600,
                color: '#475569'
                }}>
                My NGO
                </Button>
            </Box>
            </Box>

            {/* KPI SECTION */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
            {kpiData.map((kpi, i) => (
                <Grid item xs={12} sm={4} key={i}>
                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: '0.25s ease',
                    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }
                }}>
                    <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: kpi.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                    }}>
                    {kpi.icon}
                    </Box>

                    <Box>
                    <Typography variant="h4" fontWeight={800} color="#0F172A">{kpi.value}</Typography>
                    <Typography variant="caption" fontWeight={600} color="#64748B">
                        {kpi.title}
                    </Typography>
                    </Box>
                </Paper>
                </Grid>
            ))}

            {/* Extra KPI funding card */}
            <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                transition: '0.25s ease',
                '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }
                }}>
                <Box sx={{
                    width: 55,
                    height: 55,
                    borderRadius: '50%',
                    bgcolor: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Timeline sx={{ color: '#EF4444' }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight={800}>85%</Typography>
                    <Typography variant="caption" color="text.secondary">
                    Funding Progress
                    </Typography>
                </Box>
                </Paper>
            </Grid>
            </Grid>

            {/* MAIN CONTENT GRID */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
            
            {/* FUNDING PROGRESS CARD */}
            <Grid item xs={12} md={8}>
                <Paper elevation={0} sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                height: '100%',
                textAlign: 'center',
                transition: '0.3s ease',
                '&:hover': { boxShadow: '0px 8px 22px rgba(0,0,0,0.06)' }
                }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                    Funding Progress
                </Typography>

                <FundingProgress value={85} total="$89K" goal="105K" />

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                    <Typography variant="caption" color="text.secondary">
                        Received <br/><b>$89,420</b>
                    </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FCD34D' }} />
                    <Typography variant="caption" color="text.secondary">
                        Pending <br/><b>$15,580</b>
                    </Typography>
                    </Box>
                </Box>
                </Paper>
            </Grid>

            {/* PROJECT STATUS */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                height: '100%',
                transition: '0.25s',
                '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }
                }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                    Project Status
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                    {projectStatus.map((p, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{
                            width: 10, 
                            height: 10, 
                            borderRadius: 1, 
                            bgcolor: p.color 
                        }} />
                        <Typography variant="body2" fontWeight={500}>{p.status}</Typography>
                        </Box>

                        <Typography variant="body2" fontWeight={600}>
                        {p.count} 
                        <span style={{ color: '#9CA3AF' }}> ({p.percent})</span>
                        </Typography>
                    </Box>
                    ))}
                </Box>


                <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Projects:</Typography>
                    <Typography variant="body2" fontWeight={700}>14</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" color="text.secondary">Success Rate:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">100%</Typography>
                </Box>
                </Paper>
            </Grid>
            </Grid>

            {/* ACTION BUTTONS */}
            <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
            <Button 
                variant="contained" 
                startIcon={<Add />} 
                sx={{
                bgcolor: '#FF3F01',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: '#E63700' }
                }}>
                Create New Project
            </Button>

            <Button 
                variant="outlined" 
                startIcon={<Description />} 
                sx={{
                textTransform: 'none',
                borderColor: '#E2E8F0',
                color: '#475569',
                px: 3
                }}>
                Submit Report
            </Button>

            <Button 
                variant="outlined" 
                startIcon={<Visibility />} 
                sx={{
                textTransform: 'none',
                borderColor: '#E2E8F0',
                color: '#475569',
                px: 3
                }}>
                View Donors
            </Button>
            </Box>

            {/* ACTIVE PROJECTS */}
            <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
            My Active Projects
            </Typography>

            <Box display="flex" flexDirection="column" gap={3} mb={4}>
            {activeProjects.map((p) => (
                <Paper key={p.id} elevation={0} sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                transition: '0.25s ease',
                '&:hover': { boxShadow: '0px 6px 18px rgba(0,0,0,0.06)' }
                }}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2} rowGap={2}>
                    <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{p.name}</Typography>
                    <Chip 
                        label={p.status} 
                        size="small"
                        sx={{
                        bgcolor: '#ECFDF5',
                        color: '#10B981',
                        fontWeight: 700,
                        mt: 0.5
                        }}
                    />
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">Raised / Budget</Typography>
                    <Typography variant="body2" fontWeight={700}>
                        {p.raised} / {p.goal} 
                        <span style={{ color: '#10B981' }}> ({p.percent}%)</span>
                    </Typography>
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">Timeline</Typography>
                    <Typography variant="body2" fontWeight={600}>{p.timeline}</Typography>
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">Volunteers</Typography>
                    <Typography variant="body2" fontWeight={600}>{p.volunteers}</Typography>
                    </Box>

                    <Box>
                    <Typography variant="caption" color="text.secondary">Last Report</Typography>
                    <Typography variant="body2" fontWeight={600}>{p.lastReport}</Typography>
                    </Box>
                </Box>

                <LinearProgress 
                    variant="determinate" 
                    value={p.percent}
                    sx={{
                    height: 7,
                    borderRadius: 3,
                    bgcolor: '#F3F4F6',
                    '& .MuiLinearProgress-bar': { bgcolor: '#FF3F01' }
                    }}
                />

                <Box display="flex" justifyContent="flex-end" gap={1.5} mt={2}>
                    <Button size="small" variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#374151' }}>
                    View Details
                    </Button>
                    <Button size="small" variant="outlined" sx={{ borderColor: '#E2E8F0', color: '#374151' }}>
                    Add Report
                    </Button>
                    <Button size="small" variant="contained" sx={{
                    bgcolor: '#FFF0EB',
                    color: '#FF3F01',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFE2D5' }
                    }}>
                    Request Funds
                    </Button>
                </Box>
                </Paper>
            ))}
            </Box>

            <Button 
            endIcon={<ArrowForward />} 
            sx={{ 
                textTransform: 'none',
                color: '#FF3F01',
                fontWeight: 600,
                mx: 'auto',
                display: 'block'
            }}
            >
            View All My Projects (6)
            </Button>

            {/* APPROVAL TRACKER */}
            <Box sx={{ mt: 5 }}>
            <Typography 
                variant="h6" 
                fontWeight={700} 
                display="flex" 
                alignItems="center" 
                gap={1}
            >
                Approval Status Tracker 
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {pendingReviews.map((rev) => (
                <Paper key={rev.id} elevation={0} sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid #F1F5F9',
                    bgcolor: '#FAFAFA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: '0.25s',
                    '&:hover': { boxShadow: '0px 6px 18px rgba(0,0,0,0.05)' }
                }}>
                    <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{rev.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Submitted: {rev.date} | Assigned to: {rev.assigned} | Status: 
                        <b> {rev.status}</b>
                    </Typography>
                    </Box>

                    <Box display="flex" gap={1.5}>
                    <Button size="small" variant="outlined" sx={{
                        borderColor: '#E2E8F0', 
                        color: '#475569'
                    }}>
                        View Details
                    </Button>

                    <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        sx={{
                        bgcolor: '#FEF2F2',
                        borderColor: '#FECACA',
                        color: '#EF4444',
                        '&:hover': { bgcolor: '#FFE8E8' }
                        }}
                    >
                        {rev.status === 'Under Review' ? 'Withdraw Request' : 'Upload Documents'}
                    </Button>
                    </Box>
                </Paper>
                ))}
            </Box>
            </Box>

        </Box>
        );

}