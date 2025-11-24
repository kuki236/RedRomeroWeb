import React from 'react';
import { 
    Box, Drawer, List, Typography, ListItem, ListItemButton, ListItemIcon, ListItemText 
} from '@mui/material';
import { VolunteerActivism } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { roleNavigation } from '../../config/navConfig.jsx'; 

const drawerWidth = 280;
const primaryColor = '#FF3F01';

export default function Sidebar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Get navigation items based on role (default to empty array)
    const navItems = roleNavigation[role] || [];

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { 
                    width: drawerWidth, 
                    boxSizing: 'border-box', 
                    borderRight: 'none', 
                    bgcolor: '#FFFFFF', 
                    p: 2,
                    '&::-webkit-scrollbar': { display: 'none' }
                },
            }}
            variant="permanent"
            anchor="left"
        >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, px: 2 }}>
                <VolunteerActivism sx={{ color: primaryColor, fontSize: 30 }} />
                <Typography variant="h6" fontWeight={800} color="text.primary">RedRomero</Typography>
            </Box>
            
            {/* Menu Items */}
            <List>
                {navItems.map((item, index) => {
                    // Section Header
                    if (item.header) {
                        return (
                            <Typography 
                                key={index} 
                                variant="caption" 
                                fontWeight={700} 
                                color="text.secondary" 
                                sx={{ px: 2, mt: 2, mb: 1, display: 'block', textTransform: 'uppercase', fontSize: '0.7rem' }}
                            >
                                {item.header}
                            </Typography>
                        );
                    }
                    
                    // Link Item
                    const isActive = location.pathname === item.link;

                    return (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton 
                                sx={{ 
                                    borderRadius: 2, 
                                    bgcolor: isActive ? '#FFF0EB' : 'transparent', 
                                    color: isActive ? primaryColor : '#64748B', 
                                    '&:hover': { bgcolor: '#FFF0EB', color: primaryColor } 
                                }}
                                onClick={() => navigate(item.link)}
                            >
                                <ListItemIcon sx={{ color: isActive ? primaryColor : '#64748B', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
}