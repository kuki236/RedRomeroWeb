from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

# ==============================================================================
# 1. Custom Serializer for JWT Tokens
#    Includes custom fields (user_id, role) in the token response.
# ==============================================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom Serializer to return full user data along with the tokens.
    Adjusted for the SystemUser model referencing Oracle fields (user_id, user_role).
    """
    def validate(self, attrs):
        # Calls default JWT validation (checks username/password and generates access/refresh tokens)
        data = super().validate(attrs)

        # Inject custom user data into the response
        data['user_id'] = self.user.user_id 
        data['username'] = self.user.username
        data['role'] = self.user.user_role # user_role is the field name in the Oracle DB/Django Model
        
        return data

# ==============================================================================
# 2. Data Serializer for Dashboard Content
#    Used by AdminDashboardData View to format Oracle Ref Cursor data.
# ==============================================================================
class ActiveProjectSerializer(serializers.Serializer):
    """
    Serializer used to map raw data from PKG_DASHBOARD_ANALYTICS.get_projects_paginated 
    to the format expected by the frontend table.
    """
    # Fields mapped directly from the Oracle result set (uppercase column names)
    id = serializers.IntegerField(source='PROJECT_ID')
    project = serializers.CharField(source='NAME')
    ngo = serializers.CharField(source='NGO_NAME')
    state = serializers.CharField(source='STATUS_NAME')
    
    # This field is calculated in the Django View (not directly from the cursor column)
    progressLabel = serializers.CharField()
    
    # Additional fields (not strictly needed for display, but useful for detail views)
    start_date = serializers.DateField(source='START_DATE')
    end_date = serializers.DateField(source='END_DATE')
    
    class Meta:
        fields = ('id', 'project', 'ngo', 'state', 'progressLabel', 'start_date', 'end_date')