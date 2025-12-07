import React, { useState, useEffect } from 'react';
import axios from 'axios'; // IMPORTANTE
import {
    Box, Typography, Paper, Tabs, Tab, Grid, TextField, Button,
    List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
    Chip, Divider, Avatar, CircularProgress, Snackbar, Alert
} from '@mui/material';
import {
    Category, VerifiedUser, VolunteerActivism,
    MonetizationOn, Public, Flag, Add, Edit, Delete, Save, Cancel
} from '@mui/icons-material';

const primaryColor = '#FF3F01';

export default function ConfigurationSettings() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState(0); 
    const [dataList, setDataList] = useState([]); // Data real de BD
    const [categoriesList, setCategoriesList] = useState([]); // Para el dropdown de padres
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Feedback state
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

    const [formData, setFormData] = useState({
        name: '', description: '', parent: '', number: '', code: '', symbol: '', rate: ''
    });

    // --- CONFIG ---
    const tabConfig = [
        { label: 'Categories', key: 'categories', icon: <Category fontSize="small" /> },
        { label: 'Specialties', key: 'specialties', icon: <VerifiedUser fontSize="small" /> },
        { label: 'Donors', key: 'donorTypes', icon: <VolunteerActivism fontSize="small" /> },
        { label: 'SDG Goals', key: 'sdgGoals', icon: <Public fontSize="small" /> },
        { label: 'Currencies', key: 'currencies', icon: <MonetizationOn fontSize="small" /> },
        { label: 'Statuses', key: 'statuses', icon: <Flag fontSize="small" /> },
    ];

    const currentKey = tabConfig[activeTab].key;

    // --- API FETCH ---
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            // 1. Fetch data for current tab
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/config/?type=${currentKey}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDataList(response.data);

            // 2. If we are on categories tab, we fetch it again to populate the 'Parent' dropdown properly if needed elsewhere, 
            // but here we can just use the response.data if it is categories.
            if (currentKey === 'categories') {
                setCategoriesList(response.data);
            } else if (categoriesList.length === 0) {
                // If not on categories but we need the dropdown (unlikely in this design but good practice), fetch it once.
                const catRes = await axios.get(`http://127.0.0.1:8000/api/admin/config/?type=categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategoriesList(catRes.data);
            }

        } catch (error) {
            console.error("Error fetching config:", error);
            showToast("Error loading data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedItem(null);
        resetForm();
    }, [activeTab]);

    // --- HANDLERS ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name || '', 
            description: item.description || '',
            parent: item.parent || 'None', 
            number: item.number || '',
            code: item.code || '', 
            symbol: item.symbol || '', 
            rate: item.rate || ''
        });
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This cannot be undone.")) return;
        
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/admin/config/?type=${currentKey}&id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Item deleted successfully", "success");
            fetchData();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.error || "Error deleting item", "error");
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        const payload = { ...formData, type: currentKey };
        
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/config/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Saved successfully", "success");
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            showToast("Error saving data", "error");
        }
    };

    const resetForm = () => {
        setSelectedItem(null);
        setFormData({ name: '', description: '', parent: '', number: '', code: '', symbol: '', rate: '' });
    };
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const showToast = (msg, severity) => setToast({ open: true, msg, severity });

    // --- RENDERERS ---
    const renderFormFields = () => (
        <>
            <Grid item xs={12}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Name</Typography>
                <TextField fullWidth size="small" name="name" value={formData.name} onChange={handleChange} />
            </Grid>
            
            {activeTab === 0 && ( // Categories
                <Grid item xs={12}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">Parent Category</Typography>
                    <TextField select fullWidth size="small" name="parent" value={formData.parent || 'None'} onChange={handleChange} SelectProps={{ native: true }}>
                        <option value="None">None (Top Level)</option>
                        {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </TextField>
                </Grid>
            )}
            
            {activeTab === 3 && ( // SDG Goals
                <Grid item xs={12}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">Goal Number</Typography>
                    <TextField fullWidth size="small" name="number" type="number" value={formData.number} onChange={handleChange} />
                </Grid>
            )}
            
            {activeTab === 4 && ( // Currencies
                <>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Code</Typography>
                        <TextField fullWidth size="small" name="code" value={formData.code} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Symbol</Typography>
                        <TextField fullWidth size="small" name="symbol" value={formData.symbol} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Rate (to USD)</Typography>
                        <TextField fullWidth size="small" name="rate" type="number" value={formData.rate} onChange={handleChange} />
                    </Grid>
                </>
            )}
            
            <Grid item xs={12}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Description</Typography>
                <TextField fullWidth multiline rows={3} size="small" name="description" value={formData.description} onChange={handleChange} />
            </Grid>
        </>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* ... (Header y Tabs igual que antes) ... */}
            <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', bgcolor: '#FAFAFA' }}>
                    <Typography variant="h5" fontWeight={800} color="#1E293B">Configuration Settings</Typography>
                    <Typography variant="body2" color="text.secondary">Manage system-wide catalogs and variables.</Typography>
                </Box>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ px: 2, minHeight: 56, '& .Mui-selected': { color: primaryColor }, '& .MuiTabs-indicator': { backgroundColor: primaryColor } }}
                >
                    {tabConfig.map((tab, index) => (
                        <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
                    ))}
                </Tabs>
            </Paper>

            <Grid container spacing={3}>
                {/* LIST */}
                <Grid item xs={12} md={7} lg={8}>
                    <Paper sx={{ height: 'calc(100vh - 240px)', borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0' }}>
                            <Typography variant="h6" fontWeight={700} color="text.primary">{tabConfig[activeTab].label} List</Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {loading ? (
                                <Box display="flex" justifyContent="center" p={5}><CircularProgress sx={{ color: primaryColor }}/></Box>
                            ) : (
                                <List>
                                    {dataList.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <ListItem 
                                                button 
                                                // Disable edit on click if you haven't implemented UPDATE in backend yet
                                                onClick={() => handleEdit(item)} 
                                                selected={selectedItem?.id === item.id}
                                                sx={{ '&.Mui-selected': { bgcolor: '#FFF5F2' } }}
                                            >
                                                {/* Avatars */}
                                                {activeTab === 4 && <Avatar sx={{ bgcolor: '#E2E8F0', color: '#1E293B', mr: 2, width: 32, height: 32, fontSize: 13 }}>{item.code}</Avatar>}
                                                {activeTab === 3 && <Avatar sx={{ bgcolor: primaryColor, color: 'white', mr: 2, width: 32, height: 32, fontSize: 14 }}>{item.number}</Avatar>}

                                                <ListItemText 
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography fontWeight={600} color="#1E293B">{item.name}</Typography>
                                                            {item.parent && <Chip label={item.parent} size="small" sx={{ height: 20, fontSize: 10 }} />}
                                                            {item.rate !== undefined && <Chip label={item.rate} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                                                        </Box>
                                                    }
                                                    secondary={item.description}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" size="small" onClick={() => handleDelete(item.id)}>
                                                        <Delete fontSize="small" sx={{ color: '#EF4444' }} />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                    {dataList.length === 0 && (
                                        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No items found.</Typography>
                                    )}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* FORM */}
                <Grid item xs={12} md={5} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', position: 'sticky', top: 20 }}>
                        {/* ... (Header del form igual) ... */}
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                            <Box sx={{ bgcolor: '#FFF0EB', p: 1, borderRadius: 2 }}>
                                {selectedItem ? <Edit sx={{ color: '#3B82F6' }} /> : <Add sx={{ color: primaryColor }} />}
                            </Box>
                            <Typography variant="h6" fontWeight={700}>
                                {selectedItem ? 'Edit Item' : 'Add New'}
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {renderFormFields()}
                        </Grid>

                        <Box display="flex" gap={1} mt={4}>
                            <Button fullWidth variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: primaryColor, fontWeight: 700, '&:hover': { bgcolor: '#D93602' } }}>
                                {selectedItem ? 'Save Changes' : 'Create'}
                            </Button>
                            <Button fullWidth variant="outlined" startIcon={<Cancel />} onClick={resetForm} sx={{ borderColor: '#E2E8F0', color: '#64748B', fontWeight: 700 }}>
                                Cancel
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* TOAST NOTIFICATION */}
            <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
}