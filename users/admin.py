from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import SystemUser

admin.site.register(SystemUser)
class CustomUserAdmin(UserAdmin):
    """
    Configuración para ver a tus usuarios en el panel.
    Añadimos las columnas 'role' y 'phone_number' que creaste.
    """
    model = SystemUser
    
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    
    list_filter = ('role', 'is_staff', 'is_active')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Información Extra del Proyecto', {'fields': ('role', 'phone_number')}),
    )