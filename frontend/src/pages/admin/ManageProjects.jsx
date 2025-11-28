import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useRoleProtection } from '../../hooks/useRoleProtection';

export default function ManageProjects() {
    useRoleProtection('ADMIN');

    const [rows, setRows] = useState([]);

    useEffect(() => {
        // fetch('/api/admin/projects') -> setRows(data)
        setRows([
        { id: 1, title: 'Proyecto A', status: 'En curso', start_date: '2025-01-01' },
        { id: 2, title: 'Proyecto B', status: 'Planificado', start_date: '2025-03-01' },
        ]);
    }, []);

    return (
        <Box>
        <Typography variant="h4" fontWeight={800} mb={2}>Manage Projects</Typography>

        <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained">Nuevo Proyecto</Button>
        </Paper>

        <TableContainer component={Paper}>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Acciones</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(r => (
                <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.start_date}</TableCell>
                    <TableCell>
                    <Button size="small">Ver</Button>
                    <Button size="small">Editar</Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    );
}
