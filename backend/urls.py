# backend/urls.py

from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from users.views import AdminDashboardData
from users.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as OriginalTokenObtainPairView

# Define the custom Login View to use the customized serializer
class CustomLoginView(OriginalTokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),
    
    # 2. JWT Authentication (Uses the custom view to inject user_id/role)
    path('api/token/', CustomLoginView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 3. Dynamic route for the Admin Dashboard data
    path('api/admin/dashboard-data/', AdminDashboardData.as_view(), name='admin_dashboard_data'), 
]