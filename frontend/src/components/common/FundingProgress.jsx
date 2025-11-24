import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function FundingProgress({ value, total, goal }) {
    // Value is percentage (0-100)
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                {/* Background Circle */}
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={4}
                    sx={{ color: '#F3F4F6' }} 
                />
                {/* Foreground Progress */}
                <CircularProgress
                    variant="determinate"
                    value={value}
                    size={120}
                    thickness={4}
                    sx={{ 
                        color: '#FF3F01',
                        position: 'absolute',
                        left: 0,
                        [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' },
                    }}
                />
                {/* Center Text */}
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}
                >
                    <Typography variant="h4" fontWeight={800} color="#1E293B">{value}%</Typography>
                    <Typography variant="caption" color="text.secondary">Funding Progress</Typography>
                </Box>
            </Box>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="#1E293B">{total}</Typography>
                <Typography variant="caption" color="text.secondary">raised of {goal} goal</Typography>
            </Box>
        </Box>
    );
}