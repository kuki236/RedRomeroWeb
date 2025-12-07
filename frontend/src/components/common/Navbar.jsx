import React, { useState } from 'react';
import { 
    Box, Paper, IconButton, InputBase, Avatar, Menu, MenuItem, 
    ListItemIcon, Divider, Typography 
} from '@mui/material';
import { 
    Search, Notifications, Settings, Person, Logout, AccountBox 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const primaryColor = '#FF3F01';

export default function Navbar({ userInitials, role }) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Handle Menu Open/Close
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // Navigation Handlers
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleProfileNav = (path) => {
        // Construct path based on role (e.g., /admin/perfil, /employee/perfil)
        const rolePrefix = role.toLowerCase(); 
        navigate(`/${rolePrefix}/${path}`);
        handleClose();
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            {/* Search Bar */}
            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, borderRadius: 2, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                <IconButton sx={{ p: '10px' }}><Search /></IconButton>
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search..." />
            </Paper>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton><Notifications /></IconButton>
                <IconButton onClick={() => navigate('/admin/config')}><Settings /></IconButton>
                
                {/* Avatar with Dropdown */}
                <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                    <Avatar sx={{ bgcolor: primaryColor, fontWeight: 'bold', width: 40, height: 40 }}>
                        {userInitials}
                    </Avatar>
                </IconButton>

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                            mt: 1.5,
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>My Account</Typography>
                        <Typography variant="caption" color="text.secondary">{role}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => handleProfileNav('perfil')}>
                        <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                        Full Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon><Logout fontSize="small" sx={{ color: primaryColor }} /></ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}