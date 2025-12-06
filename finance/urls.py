from django.urls import path
from .views import (
    DonorManagementView, 
    DonationTransactionView, 
    BudgetManagementView,
    ApprovalWorkflowView,
    ProjectReportsView,
    AuditLogsView,
    FinancialKPIView
)

urlpatterns = [
    # Finanzas
    path('api/finance/donors/', DonorManagementView.as_view(), name='manage_donors'),
    path('api/finance/donations/', DonationTransactionView.as_view(), name='manage_donations'),
    path('api/finance/budgets/', BudgetManagementView.as_view(), name='manage_budgets'),

    # Workflow
    path('api/workflow/approvals/', ApprovalWorkflowView.as_view(), name='manage_approvals'), # POST=Solicitar, PUT=Aprobar
    path('api/workflow/reports/', ProjectReportsView.as_view(), name='manage_reports'),

    # Auditoría y Datos
    path('api/audit/logs/', AuditLogsView.as_view(), name='audit_logs'), # ?type=approvals|projects|finance
    path('api/finance/kpis/', FinancialKPIView.as_view(), name='financial_kpis'),
]