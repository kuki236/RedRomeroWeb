import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel,
  TextField, Button, Alert, CircularProgress
} from "@mui/material";

export default function BudgetManagement() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [amountInput, setAmountInput] = useState("");
  const [currency, setCurrency] = useState(1);

  // Variable derivada para saber si REALMENTE existe un presupuesto
  const hasBudget = budgetData && budgetData.budget_id != null;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/finance/budgets/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(response.data);
    } catch (error) {
        console.error("Error loading projects:", error);
    }
  };

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
              setBudgetData(response.data[0]);
              // Si ya tiene presupuesto, pre-llenar el formulario
              if (response.data[0].budget_amount) {
                  setAmountInput(response.data[0].budget_amount);
              }
          } else {
              setBudgetData(null);
              setAmountInput("");
          }
      } catch (error) {
          console.error("Error details:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = async () => {
      if (!selectedProjectId || !amountInput) return alert("Please fill all fields");
      const token = localStorage.getItem('token');

      try {
          if (hasBudget) {
              // UPDATE (PUT)
              await axios.put('http://127.0.0.1:8000/api/finance/budgets/', {
                  budget_id: budgetData.budget_id,
                  project_id: selectedProjectId,
                  amount: parseFloat(amountInput),
                  currency_id: currency
              }, { headers: { Authorization: `Bearer ${token}` } });
              alert("Budget updated successfully!");
          } else {
              // CREATE (POST)
              await axios.post('http://127.0.0.1:8000/api/finance/budgets/', {
                  project_id: selectedProjectId,
                  amount: parseFloat(amountInput),
                  description: "Initial Budget",
                  currency_id: currency
              }, { headers: { Authorization: `Bearer ${token}` } });
              alert("Budget created successfully!");
          }
          fetchBudgetDetails(selectedProjectId); // Recargar datos
      } catch (e) {
          console.error(e);
          alert("Error: " + (e.response?.data?.error || e.message));
      }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Budget Management</Typography>

      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* LEFT SIDE: MONITORING */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProjectId}
                label="Select Project"
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p) => (
                    <MenuItem key={p.project_id} value={p.project_id}>{p.project_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {loading ? <CircularProgress /> : (
            hasBudget ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="gray" fontWeight={600}>Total Budget</Typography>
                        <Typography fontSize="1.8rem" fontWeight={800}>
                            ${budgetData.budget_amount?.toLocaleString()}
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="gray" fontWeight={600}>Received (Donations)</Typography>
                        <Typography fontSize="1.8rem" fontWeight={800} color="warning.main">
                            ${budgetData.total_received?.toLocaleString()}
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="gray" fontWeight={600}>Remaining Gap</Typography>
                        <Typography fontSize="1.8rem" fontWeight={800} color={budgetData.remaining_budget >= 0 ? "success.main" : "error.main"}>
                            ${budgetData.remaining_budget?.toLocaleString()}
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                        <Typography color="gray" fontWeight={600}>Utilization</Typography>
                        <Typography fontSize="1.8rem" fontWeight={800}>
                            {budgetData.budget_utilization_percent}%
                        </Typography>
                    </Paper>
                </Box>
            ) : (
                <Alert severity="info">
                    {selectedProjectId ? "This project has no budget assigned yet." : "Select a project to view details."}
                </Alert>
            )
          )}
        </Box>

        {/* RIGHT SIDE: ACTIONS */}
        <Paper sx={{ width: { xs: '100%', md: 350 }, p: 3, height: 'fit-content' }}>
          <Typography variant="h6" fontWeight={800} mb={1}>
            {hasBudget ? "Adjust Budget" : "Create Budget"}
          </Typography>
          <Typography color="text.secondary" fontSize="0.9rem" mb={3}>
            {hasBudget ? "Update the total amount allocated." : "Set the initial budget target."}
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
              <MenuItem value={1}>USD</MenuItem>
              <MenuItem value={2}>EUR</MenuItem>
              <MenuItem value={3}>PEN</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth size="small" type="number"
            label="Amount"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained" fullWidth
            onClick={handleSubmit}
            disabled={!selectedProjectId}
            sx={{ bgcolor: "#FF6934", fontWeight: 700, py: 1.5 }}
          >
            {hasBudget ? "Update Budget" : "Create Budget"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}