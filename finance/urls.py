from django.urls import path
from .views import (
    DonorManagementView, 
    DonationTransactionView, 
    BudgetManagementView,
    ApprovalWorkflowView,
    ProjectReportsView,
    AuditLogsView,
    FinancialKPIView,
    DonorTypesView,
    ReportsAnalyticsView,
    RepresentativeNGOView,
)

urlpatterns = [
    # Finanzas
    path('api/finance/donors/', DonorManagementView.as_view(), name='manage_donors'),
    path('api/finance/donations/', DonationTransactionView.as_view(), name='manage_donations'),
    path('api/finance/budgets/', BudgetManagementView.as_view(), name='manage_budgets'),
    path('api/finance/donor-types/', DonorTypesView.as_view(), name='donor_types'), # NUEVA RUTA PARA TIPOS DE DONANTE

    # Workflow
    path('api/workflow/approvals/', ApprovalWorkflowView.as_view(), name='manage_approvals'), # POST=Solicitar, PUT=Aprobar
    path('api/workflow/reports/', ProjectReportsView.as_view(), name='manage_reports'),

    # Auditoría y Datos
    path('api/audit/logs/', AuditLogsView.as_view(), name='audit_logs'), # ?type=approvals|projects|finance
    path('api/finance/kpis/', FinancialKPIView.as_view(), name='financial_kpis'),

    path('api/finance/reports-analytics/', ReportsAnalyticsView.as_view(), name='finance_reports_analytics'),
    path('api/representative/my-ngo/', RepresentativeNGOView.as_view(), name='rep_my_ngo'),

]