from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

# ==============================================================================
# 1. Custom Serializer for JWT Tokens
#    Includes custom fields (user_id, role) in the token response.
# ==============================================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom Serializer for the SystemUser model, adjusting fields for Oracle PK.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.user_id 
        data['username'] = self.user.username
        data['role'] = self.user.user_role
        print(data)
        return data

# ==============================================================================
# 2. Data Serializer for Dashboard Content
#    Maps Oracle Ref Cursor data structure to the frontend's expected format.
# ==============================================================================
class ActiveProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='PROJECT_ID')
    project = serializers.CharField(source='NAME')
    ngo = serializers.CharField(source='NGO_NAME')
    state = serializers.CharField(source='STATUS_NAME')
    progressLabel = serializers.CharField()
    start_date = serializers.DateField(source='START_DATE')
    end_date = serializers.DateField(source='END_DATE')
    
    class Meta:
        fields = ('id', 'project', 'ngo', 'state', 'progressLabel', 'start_date', 'end_date')

# ==============================================================================
# 3. User Management Serializer (NUEVO)
#    Used for listing and creating users via PKG_SYSTEM_SECURITY.
# ==============================================================================
class UserManagementSerializer(serializers.Serializer):
    # Read-only fields for display
    id = serializers.IntegerField(source='USER_ID', read_only=True)
    name = serializers.CharField(source='USER_FULL_NAME', required=False)
    username = serializers.CharField(required=True) 
    email = serializers.EmailField(required=False)
    role = serializers.CharField(source='USER_ROLE')
    status = serializers.CharField(source='STATUS_LABEL', read_only=True) 
    
    # Write-only fields for creation/updates
    is_active = serializers.IntegerField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False) 
    country = serializers.CharField(write_only=True, required=False, default='Peru')
    
    # Optional Linking IDs
    employee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    volunteer_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    representative_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)