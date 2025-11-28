import React, { useEffect, useState } from "react";
    import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    } from "@mui/material";
    import { useRoleProtection } from "../../hooks/useRoleProtection";

    export default function Employee() {
    useRoleProtection("ADMIN");

    const [query, setQuery] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
    // fetch('/api/admin/employees') -> setRows(data)
    setRows([
    { id: 1, name: "Juan Perez", role: "Empleado", status: "Activo" },
    { id: 2, name: "María López", role: "Empleado", status: "Suspendido" },
    ]);
    }, []);

    const filtered = rows.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
    );

    return ( <Box> <Typography variant="h4" fontWeight={800} mb={2}>
    Manage Employees </Typography>

    ```
    <Paper
        sx={{
        p: 2,
        mb: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        }}
    >
        <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar empleado..."
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained">Nuevo Empleado</Button>
    </Paper>

    <TableContainer component={Paper}>
        <Table>
        <TableHead>
            <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
            </TableRow>
        </TableHead>

        <TableBody>
            {filtered.map((row) => (
            <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                <Button size="small">Editar</Button>
                <Button size="small" color="error">
                    Eliminar
                </Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </TableContainer>
    </Box>
    );
}
