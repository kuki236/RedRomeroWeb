from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as OriginalTokenObtainPairView
# Import views (Ensure UserManagementView is imported)
from users.views import AdminDashboardData, UserManagementView 

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
]