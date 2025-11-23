from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom User model for the NGO System.
    Extends Django's AbstractUser to include role-based access control.
    """

    # Role definitions
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        EMPLOYEE = 'EMPLOYEE', 'Employee'
        REPRESENTATIVE = 'REPRESENTATIVE', 'NGO Representative'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'

    # Role field
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VOLUNTEER,
        help_text="Role assigned to the user within the system."
    )

    # Extra fields required by the business logic
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    class Meta:
        # This maps the model to your specific Oracle table
        db_table = 'SYSTEM_USER'
        verbose_name = 'System User'
        verbose_name_plural = 'System Users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"