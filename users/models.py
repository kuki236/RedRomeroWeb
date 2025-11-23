from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class SystemUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The user must have a username')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_role', 'ADMIN')
        return self.create_user(username, password, **extra_fields)

class SystemUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model mapped to the legacy Oracle table 'System_User'.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        EMPLOYEE = 'EMPLOYEE', 'Employee'
        REPRESENTATIVE = 'REPRESENTATIVE', 'NGO Representative'
        VOLUNTEER = 'VOLUNTEER', 'Volunteer'

    # --- Primary Key & Auth Fields ---
    user_id = models.AutoField(primary_key=True) 
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    
    # Required for AbstractBaseUser
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # --- Business Fields ---
    country_of_issue = models.CharField(max_length=50, blank=True, null=True)
    
    user_role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VOLUNTEER
    )

    # Foreign Keys are defined as Integers to match the legacy schema 
    # and avoid circular import issues at this stage.
    employee_id = models.IntegerField(null=True, blank=True)
    volunteer_id = models.IntegerField(null=True, blank=True)
    representative_id = models.IntegerField(null=True, blank=True)

    objects = SystemUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['user_role']

    class Meta:
        db_table = 'System_User'
        managed = False  # Critical: Prevents Django from attempting to migrate/modify the legacy table.
        verbose_name = 'System User'
        verbose_name_plural = 'System Users'

    def __str__(self):
        return f"{self.username} ({self.user_role})"