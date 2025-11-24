import logging
from decimal import Decimal
from datetime import date, datetime 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from rest_framework import status
import oracledb 
from django.contrib.auth.hashers import make_password
logger = logging.getLogger(__name__)

# --- HELPER FUNCTIONS ---

def dictfetchall(cursor):
    """Return all rows from a cursor as a dict with lowercase keys."""
    columns = [col[0].lower() for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def fetch_pipelined_function(function_name):
    """Executes an Oracle PIPELINED function."""
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT * FROM TABLE({function_name}())")
            return dictfetchall(cursor)
        except Exception as e:
            logger.error(f"Error executing pipelined function {function_name}: {e}")
            return []

def fetch_procedure_cursor(procedure_call, params=None, out_args_count=0):
    """
    Executes a stored procedure and handles the Ref Cursor.
    Adapted to handle native variables if needed, but defaults to simple cursor calls.
    """
    with connection.cursor() as cursor:
        try:
            # Native connection access (kept for future flexibility)
            native_conn = connection.connection
            
            out_vars = []
            for _ in range(out_args_count):
                out_vars.append(native_conn.var(oracledb.NUMBER))
            
            # Ref Cursor
            ref_cursor = native_conn.cursor()
            
            args = []
            if params: args.extend(params)
            args.extend(out_vars)
            args.append(ref_cursor) 
            
            cursor.callproc(procedure_call, args)
            
            data = dictfetchall(ref_cursor)
            ref_cursor.close()
            
            if out_args_count > 0:
                return data, out_vars[0].getvalue()
                
            return data, None

        except Exception as e:
            logger.error(f"Error executing procedure {procedure_call}: {e}")
            return [], None 

def fetch_raw_query(query, params=None):
    """Executes a raw SQL query."""
    with connection.cursor() as cursor:
        cursor.execute(query, params if params else [])
        return dictfetchall(cursor)

# --- DASHBOARD VIEW ---

class AdminDashboardData(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. KPIs
        kpis_raw = fetch_pipelined_function('PKG_DASHBOARD_ANALYTICS.get_main_kpis')
        kpi_map = {}

        for kpi in kpis_raw:
            trend_symbol = '+' if kpi['trend'] == 'UP' else ('-' if kpi['trend'] == 'DOWN' else '=')
            formatted_trend = f"{trend_symbol}{abs(kpi['percentage_change'])}% vs prev month"
            value_str = str(kpi['current_value'])
            
            if 'DONATIONS' in kpi['metric_name']: 
                value_str = f"{Decimal(kpi['current_value']):,.0f}" 

            kpi_map[kpi['metric_name']] = {
                'value': value_str,
                'trend': formatted_trend if kpi['trend'] != 'STABLE' else f"={abs(kpi['percentage_change'])}% No change",
            }
        
        # 2. Projects Table
        projects_raw, _ = fetch_procedure_cursor(
            'PKG_DASHBOARD_ANALYTICS.get_projects_paginated', 
            [1, 10, 'ACTIVO', None],
            out_args_count=0 
        )

        projects_table_data = []
        for project in projects_raw:
            end_date = project.get('end_date') 
            progress_label = "Date N/A"
            
            if end_date:
                if isinstance(end_date, datetime): end_date = end_date.date()
                if isinstance(end_date, date):
                    days_left = (end_date - date.today()).days
                    if days_left > 0: progress_label = f"{days_left} days left"
                    elif days_left == 0: progress_label = "Due today"
                    else: progress_label = "Finished"
            
            projects_table_data.append({
                'id': project['project_id'], 
                'project': project['name'],  
                'ngo': project['ngo_name'],  
                'state': project['status_name'],
                'progressLabel': progress_label,
            })

        total_count = len(projects_table_data) 

        # 3. Charts
        donation_trends_raw, _ = fetch_procedure_cursor('PKG_DASHBOARD_ANALYTICS.get_donation_trends', [date.today().year], out_args_count=0) 
        donation_trends = [
            {'name': row['mes_nombre'][:3], 'value': row['monto_total']}
            for row in donation_trends_raw
        ]
        
        project_status_pie_raw, _ = fetch_procedure_cursor('PKG_DASHBOARD_ANALYTICS.get_project_status_distribution', out_args_count=0)
        project_status_pie = [
            {'name': row['status_name'], 'value': row['cantidad']}
            for row in project_status_pie_raw
        ]

        response_data = {
            "active_projects": kpi_map.get('ACTIVE_PROJECTS', {'value': '0', 'trend': 'N/A'}),
            "monthly_donations": kpi_map.get('MONTHLY_DONATIONS', {'value': '0', 'trend': 'N/A'}),
            "active_volunteers": kpi_map.get('ACTIVE_VOLUNTEERS', {'value': '0', 'trend': 'N/A'}),
            "registered_ngos": kpi_map.get('TOTAL_NGOS', {'value': '0', 'trend': 'N/A'}),
            "donation_trends": donation_trends,
            "project_status_pie": project_status_pie,
            "active_projects_table": projects_table_data,
            "total_project_count": total_count
        }

        return Response(response_data, status=status.HTTP_200_OK)

# --- USER MANAGEMENT VIEW ---

class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List users."""
        sql = "SELECT * FROM vw_system_user_activity ORDER BY user_id DESC"
        users_data = fetch_raw_query(sql)
        
        formatted_users = []
        for user in users_data:
            formatted_users.append({
                'id': user['user_id'],
                'name': user['user_full_name'],
                'email': user.get('email', 'N/A'),      
                'role': user['user_role'], 
                'status': user.get('status_label', 'Unknown') 
            })
        return Response(formatted_users, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a full user profile using PKG_SYSTEM_SECURITY."""
        data = request.data
        
        try:
            # 1. Extract Data
            role = data.get('role', 'VOLUNTEER').upper()
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            email = data.get('email', '')
            
            # PASSWORD HASHING (CRITICAL FOR LOGIN)
            raw_password = data.get('password', 'RedRomero123!')
            hashed_password = make_password(raw_password) # Hashear antes de enviar a Oracle
            
            phone = data.get('phone', '') or None
            address = data.get('address', '') or None
            
            # Date Validation
            raw_birth_date = data.get('birth_date')
            birth_date = None
            if raw_birth_date:
                try:
                    birth_date = datetime.strptime(raw_birth_date, '%Y-%m-%d').date()
                except ValueError:
                    return Response({'error': 'Invalid birth_date format'}, status=status.HTTP_400_BAD_REQUEST)
            
            username = data.get('username')
            if not username:
                 base_name = email.split('@')[0] if email else first_name.lower()
                 username = base_name.strip()
            
            country = 'Peru'
            
            raw_ong_id = data.get('ong_id')
            ong_id = int(raw_ong_id) if raw_ong_id else None
            
            if role == 'REPRESENTATIVE' and not ong_id:
                return Response({'error': 'Representative role requires a valid ONG ID'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Prepare Parameters (Send hashed_password instead of raw)
            in_params = [
                username, hashed_password, role, country,
                first_name, last_name, email, phone, address, birth_date, ong_id
            ]
            
            logger.info(f"Creating user with: {in_params}")

            # 3. Execute Procedure WITHOUT OUT params
            with connection.cursor() as cursor:
                cursor.callproc('PKG_SYSTEM_SECURITY.create_full_user', in_params)
            
            return Response({'message': 'User profile created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating full user: {e}")
            error_message = str(e)
            if 'ORA-' in error_message:
                error_message = error_message.split('\n')[0]
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """Update user."""
        user_id = request.data.get('id')
        new_role = request.data.get('role', '').upper()
        new_username = request.data.get('name', '').split(' ')[0] 
        new_status = request.data.get('status')

        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_SYSTEM_SECURITY.update_user', [user_id, new_username, new_role])
                is_active_val = 1 if new_status == 'Active' else 0
                cursor.execute("UPDATE System_User SET is_active = %s WHERE user_id = %s", [is_active_val, user_id])
            
            return Response({'message': 'User updated'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)