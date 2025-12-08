from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as OriginalTokenObtainPairView
# Import views
from users.views import (
    AdminDashboardData, UserManagementView, SystemConfigView, UserProfileView, 
    AuditLogView, ReportsAnalyticsView,
    # Workforce & Operations
    NGOListView, NGOUpdateView,
    EmployeeListView, EmployeeUpdateView, 
    VolunteerListView, VolunteerUpdateView, VolunteerSpecialtyView,
    RepresentativeListView, RepresentativeUpdateView,
    ProjectListView, ProjectUpdateView, ProjectCloseView, ProjectReactivateView,
    VolunteerProjectAssignmentView, ProjectCategoryAssignmentView, ProjectSDGAssignmentView,
    VolunteerExpertiseMappingView, EmployeeWorkloadAnalysisView,
    # Volunteer endpoints
    VolunteerMyProjectsView, VolunteerMySpecialtiesView, VolunteerExploreProjectsView,
    # Representative endpoints
    RepresentativeMyProjectsView, RepresentativeMyNGOView,
    # Employee endpoints
    EmployeeProjectManagementView, EmployeeVolunteerAssignmentView,
    # Config endpoints
    ProjectStatusListView
)

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
    #path('api/admin/employees/', EmployeeManagementView.as_view(), name='admin_employees_list'),
    #path('api/admin/employees/update/', EmployeeManagementView.as_view(), name='admin_employees_update'),
    #path('api/admin/employees/<int:pk>/', EmployeeManagementView.as_view(), name='admin_employees_delete'),
    
    path('api/admin/config/', SystemConfigView.as_view(), name='admin_config'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/admin/audit/', AuditLogView.as_view(), name='audit-logs'),
    path('api/admin/reports/', ReportsAnalyticsView.as_view(), name='reports-analytics'),
    
    # --- NGO Management Endpoints ---
    path('api/admin/ngos/', NGOListView.as_view(), name='admin_ngos_list'),
    path('api/admin/ngos/update/', NGOUpdateView.as_view(), name='admin_ngos_update'),
    
    # --- Employee Management Endpoints ---
    path('api/admin/employees/', EmployeeListView.as_view(), name='admin_employees_list'),
    path('api/admin/employees/update/', EmployeeUpdateView.as_view(), name='admin_employees_update'),
    path('api/admin/employees/<int:employee_id>/', EmployeeUpdateView.as_view(), name='admin_employees_delete'),
    
    # --- Volunteer Management Endpoints ---
    path('api/admin/volunteers/', VolunteerListView.as_view(), name='admin_volunteers_list'),
    path('api/admin/volunteers/update/', VolunteerUpdateView.as_view(), name='admin_volunteers_update'),
    path('api/admin/volunteers/<int:volunteer_id>/', VolunteerUpdateView.as_view(), name='admin_volunteers_delete'),
    path('api/admin/volunteers/specialties/', VolunteerSpecialtyView.as_view(), name='admin_volunteers_specialties'),
    
    # --- Representative Management Endpoints ---
    path('api/admin/representatives/', RepresentativeListView.as_view(), name='admin_representatives_list'),
    path('api/admin/representatives/update/', RepresentativeUpdateView.as_view(), name='admin_representatives_update'),
    
    # --- Project Management Endpoints ---
    path('api/admin/projects/', ProjectListView.as_view(), name='admin_projects_list'),
    path('api/admin/projects/update/', ProjectUpdateView.as_view(), name='admin_projects_update'),
    path('api/admin/projects/close/', ProjectCloseView.as_view(), name='admin_projects_close'),
    path('api/admin/projects/reactivate/', ProjectReactivateView.as_view(), name='admin_projects_reactivate'),
    path('api/admin/project-statuses/', ProjectStatusListView.as_view(), name='admin_project_statuses'),
    
    # --- Assignment Endpoints ---
    path('api/admin/assignments/volunteer-project/', VolunteerProjectAssignmentView.as_view(), name='assign_volunteer_project'),
    path('api/admin/assignments/project-category/', ProjectCategoryAssignmentView.as_view(), name='assign_project_category'),
    path('api/admin/assignments/project-sdg/', ProjectSDGAssignmentView.as_view(), name='assign_project_sdg'),
    
    # --- Views Endpoints ---
    path('api/admin/views/volunteer-expertise/', VolunteerExpertiseMappingView.as_view(), name='volunteer_expertise_mapping'),
    path('api/admin/views/employee-workload/', EmployeeWorkloadAnalysisView.as_view(), name='employee_workload_analysis'),
    
    # --- Volunteer Endpoints ---
    path('api/volunteer/my-projects/', VolunteerMyProjectsView.as_view(), name='volunteer_my_projects'),
    path('api/volunteer/my-specialties/', VolunteerMySpecialtiesView.as_view(), name='volunteer_my_specialties'),
    path('api/volunteer/explore-projects/', VolunteerExploreProjectsView.as_view(), name='volunteer_explore_projects'),
    
    # --- Representative Endpoints ---
    path('api/representative/my-projects/', RepresentativeMyProjectsView.as_view(), name='representative_my_projects'),
    path('api/representative/my-ngo/', RepresentativeMyNGOView.as_view(), name='representative_my_ngo'),
    
    # --- Employee Endpoints ---
    path('api/employee/projects/update/', EmployeeProjectManagementView.as_view(), name='employee_projects_update'),
    path('api/employee/volunteers/assignment/', EmployeeVolunteerAssignmentView.as_view(), name='employee_volunteer_assignment'),
    
    # --- FINANCE & WORKFLOW ---
    path('', include('finance.urls')),
]