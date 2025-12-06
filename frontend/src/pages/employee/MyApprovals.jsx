import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  ListItemButton,
} from "@mui/material";

export default function MyApprovals() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState([]);
  const [commentNotes, setCommentNotes] = useState(""); // Estado para el textarea

  // 1. Cargar Aprobaciones Pendientes/Históricas
  useEffect(() => {
      fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
      const token = localStorage.getItem('token');
      try {
          // Usamos el endpoint de auditoría filtrado por 'approvals' para ver la lista
          const response = await axios.get('http://127.0.0.1:8000/api/audit/logs/?type=approvals', {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Mapeamos los datos que vienen de la vista SQL (vw_approval_workflow_status)
          const formatted = response.data.map(item => ({
              id: item.approval_id,
              name: item.project_name || 'Proyecto Sin Nombre',
              submittedBy: item.assigned_to || 'Sin asignar',
              requesterName: item.requester_name || 'Desconocido',
              submittedOn: item.approval_date,
              status: item.approval_status || 'PENDIENTE',
              description: `Project ID: ${item.project_id}. Tiempo pendiente: ${item.days_pending} días.`,
              notes: item.notes || '',
              history: [
                  { label: "Requested", date: item.approval_date }
              ] 
          }));
          setRequests(formatted);
      } catch (e) { 
          console.error('Error fetching approvals:', e);
      }
  };

  // 2. Función para Aprobar/Rechazar
  const handleDecision = async (approvalId, decision) => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id'); // Asegúrate de tener el ID del empleado

      if (!window.confirm(`¿Estás seguro de marcar esto como ${decision}?`)) return;

      try {
          await axios.put('http://127.0.0.1:8000/api/workflow/approvals/', {
              approval_id: approvalId,
              decision: decision, // "APROBADO" o "RECHAZADO"
              employee_id: userId, // Enviamos el ID de quien hace la acción para auditoría
              notes: commentNotes // Incluir las notas del textarea
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          alert("Solicitud procesada con éxito");
          setSelected(null); // Limpiar selección
          setCommentNotes(""); // Limpiar comentarios
          fetchApprovals();  // Recargar lista para ver cambios
      } catch (e) {
          console.error('Error processing approval:', e);
          alert("Error al procesar: " + (e.response?.data?.error || e.message));
      }
  };

  // Filtrado local
  const filtered = requests.filter((r) => {
    const matches = r.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matches && matchesStatus;
  });

  const statusColors = {
    PENDIENTE: { bg: "#FFF3CD", color: "#B58B00" },
    APROBADO: { bg: "#D1F7D1", color: "green" },
    RECHAZADO: { bg: "#F8D7DA", color: "#9F1C24" },
    // Mapeos adicionales por si acaso vienen en inglés o variantes
    PENDING: { bg: "#FFF3CD", color: "#B58B00" },
    APPROVED: { bg: "#D1F7D1", color: "green" },
    REJECTED: { bg: "#F8D7DA", color: "#9F1C24" },
  };

  return (
    <Box sx={{ p: 3, display: "flex", gap: 3 }}>
      {/* LEFT PANEL — LIST */}
      <Paper sx={{ width: "38%", p: 2, height: "80vh", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Approval Requests
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="PENDIENTE">Pending</MenuItem>
              <MenuItem value="APROBADO">Approved</MenuItem>
              <MenuItem value="RECHAZADO">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* List */}
        <List sx={{ overflowY: "auto", flexGrow: 1 }}>
          {filtered.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>No requests to display</Typography>
            </Box>
          ) : (
            filtered.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
                sx={{ 
                  borderBottom: "1px solid #eee",
                }}
              >
                <ListItemButton
                  onClick={() => setSelected(item)}
                  selected={selected?.id === item.id}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: '#f0f7ff',
                      '&:hover': {
                        bgcolor: '#e3f2fd',
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" display="block">
                          Assigned to: {item.submittedBy}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {item.submittedOn}
                        </Typography>
                      </React.Fragment>
                    }
                  />

                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[item.status]?.bg || '#eee',
                      color: statusColors[item.status]?.color || '#333',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* RIGHT PANEL — DETAILS */}
      <Paper sx={{ width: "62%", p: 3, height: "80vh", overflowY: "auto" }}>
        {selected ? (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={800}>
                  {selected.name}
                </Typography>
                <Chip 
                    label={selected.status} 
                    sx={{ 
                        bgcolor: statusColors[selected.status]?.bg, 
                        color: statusColors[selected.status]?.color, 
                        fontWeight: 'bold' 
                    }} 
                />
            </Box>

            <Typography variant="body1" color="text.secondary" mb={2} mt={1}>
              Request ID: {selected.id} | Date: {selected.submittedOn}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* DESCRIPTION */}
            <Typography variant="h6" fontWeight={700} mb={1}>
              Project Details
            </Typography>
            <Typography variant="body1" mb={2}>
              {selected.description}
            </Typography>
            
            {selected.notes && (
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Request Notes:
                </Typography>
                <Typography variant="body2">
                  {selected.notes}
                </Typography>
              </Box>
            )}

            {/* HISTORY */}
            <Typography variant="h6" fontWeight={700} mb={1}>
              History
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {selected.history.map((h, idx) => (
                  <React.Fragment key={idx}>
                    <Box
                      sx={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#1976d2" }}
                    />
                    {idx < selected.history.length - 1 && (
                      <Box sx={{ width: 2, height: 40, backgroundColor: "#ccc" }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>

              <Box>
                {selected.history.map((h, idx) => (
                  <Box key={idx} sx={{ mb: 4 }}>
                    <Typography fontWeight={700}>{h.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {h.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ACTION SECTION - Solo visible si está pendiente */}
            {selected.status === 'PENDIENTE' && (
                <>
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" fontWeight={700} mb={1}>
                      Your Decision
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Add comments (optional)
                    </Typography>

                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      value={commentNotes}
                      onChange={(e) => setCommentNotes(e.target.value)}
                      placeholder="Write the reason for approval or rejection..."
                      sx={{ mb: 3 }}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                        {/* BOTONES CONECTADOS AL BACKEND */}
                        <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => handleDecision(selected.id, "APROBADO")}
                            sx={{ fontWeight: 'bold', px: 4 }}
                        >
                            ✓ Approve
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleDecision(selected.id, "RECHAZADO")}
                            sx={{ fontWeight: 'bold', px: 4 }}
                        >
                            ✕ Reject
                        </Button>
                    </Box>
                </>
            )}

            {/* Información adicional si ya fue procesado */}
            {selected.status !== 'PENDIENTE' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        This request has already been processed and is in status: <strong>{selected.status}</strong>
                    </Typography>
                </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="h6">
              Select a request to view details.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}