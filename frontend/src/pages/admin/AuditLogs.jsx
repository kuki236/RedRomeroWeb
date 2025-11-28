import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useRoleProtection } from '../../hooks/useRoleProtection';

export default function AuditLogs() {
    useRoleProtection('ADMIN');

    const [query, setQuery] = useState('');
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // fetch('/api/admin/audit-logs') -> setLogs(data)
        setLogs([
        { id: 1, user: 'admin', action: 'CREATE_PROJECT', target: 'Project A', ts: '2025-06-01 10:12' },
        { id: 2, user: 'sebas', action: 'UPDATE_ONG', target: 'ONG A', ts: '2025-06-02 09:00' },
        ]);
    }, []);

    const filtered = logs.filter(l => l.user.includes(query) || l.action.includes(query) || l.target.includes(query));

    return (
        <Box>
        <Typography variant="h4" fontWeight={800} mb={2}>Audit Logs</Typography>

        <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
            <TextField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por usuario/acción/objeto..." />
            <Button variant="contained">Filtrar</Button>
        </Paper>

        <TableContainer component={Paper}>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Timestamp</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filtered.map(l => (
                <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.user}</TableCell>
                    <TableCell>{l.action}</TableCell>
                    <TableCell>{l.target}</TableCell>
                    <TableCell>{l.ts}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        </Box>
    );
}