import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel,
  TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Alert
} from "@mui/material";

export default function BudgetManagement() {
  // Estado
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Formulario para Crear/Ajustar
  const [amountInput, setAmountInput] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState(1); // Default ID 1 (USD) o el que tengas en DB

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchProjects();
  }, []);

  // Cargar lista de proyectos para el dropdown
  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    try {
        // Usamos el endpoint GET que acabamos de añadir al backend
        const response = await axios.get('http://127.0.0.1:8000/api/finance/budgets/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
    } catch (error) {
        console.error("Error loading projects:", error);
    }
  };

  // Cargar detalles cuando se selecciona un proyecto
  useEffect(() => {
    if (!selectedProjectId) return;
    fetchBudgetDetails(selectedProjectId);
  }, [selectedProjectId]);

  const fetchBudgetDetails = async (id) => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
          const response = await axios.get(`http://127.0.0.1:8000/api/finance/budgets/?project_id=${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.length > 0) {
              setBudgetData(response.data[0]); // La vista SQL devuelve una lista
          } else {
              setBudgetData(null); // No hay presupuesto aun
          }
      } catch (error) {
          console.error("Error details:", error);
      } finally {
          setLoading(false);
      }
  };

  // --- ACCIONES ---

  const handleCreateBudget = async () => {
      if (!selectedProjectId || !amountInput) return alert("Select project and enter amount");
      
      const token = localStorage.getItem('token');
      try {
          await axios.post('http://127.0.0.1:8000/api/finance/budgets/', {
              project_id: selectedProjectId,
              amount: parseFloat(amountInput),
              description: "Initial Budget Assignment",
              currency_id: currency
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("Budget created successfully!");
          fetchBudgetDetails(selectedProjectId);
          setAmountInput("");
      } catch (e) {
          alert("Error: " + (e.response?.data?.error || e.message));
      }
  };

  const handleUpdateBudget = async () => {
      if (!budgetData || !amountInput) return;
      const token = localStorage.getItem('token');
      
      try {
          await axios.put('http://127.0.0.1:8000/api/finance/budgets/', {
              budget_id: budgetData.budget_id,
              project_id: selectedProjectId,
              amount: parseFloat(amountInput),
              currency_id: currency // Mantiene moneda o permite cambio
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("Budget updated successfully!");
          fetchBudgetDetails(selectedProjectId);
          setAmountInput("");
      } catch (e) {
          alert("Error updating: " + (e.response?.data?.error || e.message));
      }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Budget Management
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* LEFT SIDE: MONITORING */}
        <Box sx={{ flex: 1 }}>
          
          {/* Project Selector */}
          <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Select a Project to Manage</InputLabel>
              <Select
                value={selectedProjectId}
                label="Select a Project to Manage"
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p) => (
                    <MenuItem key={p.project_id} value={p.project_id}>
                        {p.project_name || `Project #${p.project_id}`}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {/* BUDGET CARDS */}
          {loading ? <CircularProgress /> : (
            budgetData ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3, mb: 3 }}>
                    <Paper sx={{ p: 2 }}>
                    <Typography fontWeight={600} color="gray" mb={1}>Budget (Total)</Typography>
                    <Typography fontWeight={800} fontSize="1.8rem">${budgetData.budget_amount?.toLocaleString()}</Typography>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                    <Typography fontWeight={600} color="gray" mb={1}>Currency</Typography>
                    <Typography fontWeight={800} fontSize="1.8rem">{budgetData.currency_code}</Typography>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                    <Typography fontWeight={600} color="gray" mb={1}>Total Spent / Used</Typography>
                    <Typography fontWeight={800} fontSize="1.8rem" color="warning.main">
                        ${budgetData.total_received?.toLocaleString()} 
                        {/* Nota: En tu vista SQL, 'total_received' son donaciones. Si tuvieras gastos, usarías esa columna */}
                    </Typography>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                    <Typography fontWeight={600} color="gray" mb={1}>Remaining / Gap</Typography>
                    <Typography fontWeight={800} fontSize="1.8rem" color={budgetData.remaining_budget >= 0 ? "success.main" : "error.main"}>
                        ${budgetData.remaining_budget?.toLocaleString()}
                    </Typography>
                    </Paper>
                </Box>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {selectedProjectId ? "No budget assigned to this project yet." : "Please select a project."}
                </Alert>
            )
          )}
        </Box>

        {/* RIGHT SIDE: ACTIONS */}
        <Paper sx={{ width: { xs: '100%', md: 350 }, p: 3, borderRadius: 3, height: 'fit-content' }}>
          <Typography variant="h6" fontWeight={800} mb={1}>
            {budgetData ? "Adjust Budget" : "Create New Budget"}
          </Typography>

          <Typography color="gray" fontSize="0.9rem" mb={3}>
            {budgetData 
                ? "Modify the total allocated amount for this project." 
                : "Assign an initial budget to start financial tracking."}
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Currency ID</InputLabel>
            <Select 
                value={currency} 
                label="Currency ID" 
                onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value={1}>USD</MenuItem>
              <MenuItem value={2}>EUR</MenuItem>
              <MenuItem value={3}>PEN</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label={budgetData ? "New Total Amount" : "Initial Amount"}
            placeholder="e.g., 50000"
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={budgetData ? handleUpdateBudget : handleCreateBudget}
            disabled={!selectedProjectId}
            sx={{
              backgroundColor: "#FF6934",
              ":hover": { backgroundColor: "#e85d2f" },
              height: 45,
              fontWeight: 700,
            }}
          >
            {budgetData ? "Update Budget" : "Create Budget"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}