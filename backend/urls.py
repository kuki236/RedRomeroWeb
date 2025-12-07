from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as OriginalTokenObtainPairView
# Import views (Ensure UserManagementView is imported)
from users.views import AdminDashboardData, UserManagementView ,SystemConfigView,UserProfileView,AuditLogView,ReportsAnalyticsView, ProjectManagementView, EmployeeManagementView

# Custom Login View configuration
class CustomLoginView(OriginalTokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- Authentication Endpoints ---
    path('api/token/', CustomLoginView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- Admin Dashboard Data ---
    path('api/admin/dashboard-data/', AdminDashboardData.as_view(), name='admin_dashboard_data'),
    
    # --- User Management Endpoints (Listing, Create, Update) ---
    path('api/admin/users/', UserManagementView.as_view(), name='admin_users_list'),
    path('api/admin/users/update/', UserManagementView.as_view(), name='admin_users_update'),


    # --- Employee Management (ESTAS SON LAS QUE TE FALTAN) ---
    path('api/admin/employees/', EmployeeManagementView.as_view(), name='admin_employees_list'),
    path('api/admin/employees/update/', EmployeeManagementView.as_view(), name='admin_employees_update'),
    path('api/admin/employees/<int:pk>/', EmployeeManagementView.as_view(), name='admin_employees_delete'),

    path('api/admin/config/', SystemConfigView.as_view(), name='admin_config'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/admin/audit/', AuditLogView.as_view(), name='audit-logs'),
    path('api/admin/reports/', ReportsAnalyticsView.as_view(), name='reports-analytics'),

    # --- Project Management ---
    path('api/admin/projects/', ProjectManagementView.as_view(), name='admin_projects_list'),
    path('api/admin/projects/update/', ProjectManagementView.as_view(), name='admin_projects_update'),
    path('api/admin/projects/<int:pk>/', ProjectManagementView.as_view(), name='admin_projects_delete'),

    # --- FINANCE & WORKFLOW (ESTA LÍNEA ES LA QUE FALTA O FALLA) ---
    path('', include('finance.urls')),
]