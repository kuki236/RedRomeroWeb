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
from .serializers import UserProfileSerializer
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

    def get(self, request, *args, **kwargs):
        # 1. KPIs
        kpis_raw = fetch_pipelined_function('PKG_DASHBOARD_ANALYTICS.get_main_kpis')
        kpi_map = {}

        for kpi in kpis_raw:
            trend_symbol = '+' if kpi['trend'] == 'UP' else ('-' if kpi['trend'] == 'DOWN' else '=')
            
            raw_change = kpi.get('percentage_change')
            if raw_change is None:
                raw_change = 0.0

            formatted_trend = f"{trend_symbol}{abs(raw_change)}% vs prev month"
            
            current_val = kpi.get('current_value')
            if current_val is None:
                current_val = 0

            value_str = str(current_val)
            
            if 'DONATIONS' in kpi.get('metric_name', ''): 
                value_str = f"{Decimal(current_val):,.0f}" 

            kpi_map[kpi.get('metric_name')] = {
                'value': value_str,
                'trend': formatted_trend if kpi.get('trend') != 'STABLE' else f"={abs(raw_change)}% No change",
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
class SystemConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config_type = request.query_params.get('type')
        data = []
        
        try:
            if config_type == 'categories':
                sql = """
                    SELECT c.category_id as id, c.category_name as name, c.description, 
                           p.category_name as parent
                    FROM Project_Category c
                    LEFT JOIN Project_Category p ON c.parent_category_id = p.category_id
                    WHERE c.is_active = 'Y'
                    ORDER BY c.category_name
                """
                data = fetch_raw_query(sql)

            elif config_type == 'specialties':
                data = fetch_raw_query("SELECT specialty_id as id, specialty_name as name, description FROM Specialty")

            elif config_type == 'donorTypes':
                data = fetch_raw_query("SELECT type_id as id, type_name as name, description FROM Donor_Type")

            elif config_type == 'sdgGoals':
                data = fetch_raw_query("SELECT sdg_id as id, goal_name as name, goal_number as number, description FROM SDG_Goal ORDER BY goal_number")

            elif config_type == 'currencies':
                data = fetch_raw_query("SELECT currency_id as id, currency_name as name, currency_code as code, symbol, exchange_rate_to_usd as rate FROM Currency")

            elif config_type == 'statuses':
                data = fetch_raw_query("SELECT project_status_id as id, status_name as name FROM Project_Status")

            return Response(data, status=200)

        except Exception as e:
            logger.error(f"Config GET error: {e}")
            return Response({'error': str(e)}, status=500)

    def post(self, request):
        config_type = request.data.get('type')
        d = request.data 
        
        try:
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)

                if config_type == 'categories':
                    parent_id = None
                    if d.get('parent') and d.get('parent') != 'None':
                        res = fetch_raw_query(f"SELECT category_id FROM Project_Category WHERE category_name = '{d.get('parent')}'")
                        if res:
                            parent_id = res[0]['category_id']
                    
                    cursor.execute(
                        "INSERT INTO Project_Category (category_name, description, parent_category_id) VALUES (%s, %s, %s)",
                        [d.get('name'), d.get('description'), parent_id]
                    )
                    
                elif config_type == 'specialties':
                    native_cursor.callproc('PKG_WORKFORCE.create_specialty', [d.get('name'), d.get('description'), out_id])

                elif config_type == 'donorTypes':
                    native_cursor.callproc('PKG_FINANCE_CORE.create_donor_type', [d.get('name'), d.get('description'), out_id])

                elif config_type == 'sdgGoals':
                    native_cursor.callproc('PKG_PROJECT_MGMT.create_sdg_goal', 
                        [d.get('number'), d.get('name'), d.get('description'), 'icon_url_placeholder', out_id])

                elif config_type == 'currencies':
                    native_cursor.callproc('PKG_FINANCE_CORE.create_currency', 
                        [d.get('name'), d.get('code'), d.get('symbol'), out_id])
                    if d.get('rate'):
                        cursor.execute("UPDATE Currency SET exchange_rate_to_usd = %s WHERE currency_code = %s", [d.get('rate'), d.get('code')])

                elif config_type == 'statuses':
                    native_cursor.callproc('PKG_PROJECT_MGMT.create_project_status', [d.get('name'), out_id])

                native_cursor.close()

            return Response({'message': 'Created successfully'}, status=201)

        except Exception as e:
            logger.error(f"Config POST error: {e}")
            return Response({'error': str(e)}, status=500)

    def delete(self, request):
        config_type = request.query_params.get('type')
        item_id = request.query_params.get('id')
        
        table_map = {
            'categories': ('Project_Category', 'category_id'),
            'specialties': ('Specialty', 'specialty_id'),
            'donorTypes': ('Donor_Type', 'type_id'),
            'sdgGoals': ('SDG_Goal', 'sdg_id'),
            'currencies': ('Currency', 'currency_id'),
            'statuses': ('Project_Status', 'project_status_id'),
        }

        if config_type not in table_map:
            return Response({'error': 'Invalid type'}, status=400)

        table, pk = table_map[config_type]
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"DELETE FROM {table} WHERE {pk} = %s", [item_id])
            return Response({'message': 'Deleted'}, status=200)
        except Exception as e:
            if 'ORA-02292' in str(e):
                return Response({'error': 'Cannot delete: This item is being used by other records.'}, status=400)
            return Response({'error': str(e)}, status=500)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'user_role', 'VOLUNTEER')
        
        try:
            with connection.cursor() as cursor:
                data = {
                    "id": user.user_id,
                    "username": user.username,
                    "role": role,
                    "email": "",
                    "first_name": "",
                    "last_name": "",
                    "phone": "",
                    "address": ""
                }

                if role == 'EMPLOYEE':
                    cursor.execute("""
                        SELECT first_name, last_name, email, phone, address 
                        FROM Employee WHERE employee_id = %s
                    """, [user.employee_id])
                elif role == 'VOLUNTEER':
                    cursor.execute("""
                        SELECT first_name, last_name, email, phone, address 
                        FROM Volunteer WHERE volunteer_id = %s
                    """, [user.volunteer_id])
                elif role == 'REPRESENTATIVE':
                    cursor.execute("""
                        SELECT first_name, last_name, email, phone, address 
                        FROM Representative WHERE representative_id = %s
                    """, [user.representative_id])
                
                row = cursor.fetchone()
                if row:
                    data["first_name"] = row[0]
                    data["last_name"] = row[1]
                    data["email"] = row[2]
                    data["phone"] = row[3]
                    data["address"] = row[4]

                return Response(data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        d = serializer.validated_data
        role = getattr(user, 'user_role', '')

        try:
            with connection.cursor() as cursor:

                if d.get('password'):
                    cursor.execute(
                        "UPDATE System_User SET password = %s WHERE user_id = %s",
                        [d['password'], user.user_id]
                    )

                if role == 'EMPLOYEE' and user.employee_id:
                    cursor.callproc('PKG_WORKFORCE.update_employee', [
                        user.employee_id,
                        d.get('first_name'),
                        d.get('last_name'),
                        d.get('email'),
                        d.get('phone')
                    ])
                    if d.get('address'):
                        cursor.execute(
                            "UPDATE Employee SET address = %s WHERE employee_id = %s",
                            [d['address'], user.employee_id]
                        )

                elif role == 'VOLUNTEER' and user.volunteer_id:
                    cursor.callproc('PKG_WORKFORCE.update_volunteer', [
                        user.volunteer_id,
                        d.get('first_name'),
                        d.get('last_name'),
                        d.get('email'),
                        d.get('phone')
                    ])
                    if d.get('address'):
                        cursor.execute(
                            "UPDATE Volunteer SET address = %s WHERE volunteer_id = %s",
                            [d['address'], user.volunteer_id]
                        )

                elif role == 'REPRESENTATIVE' and user.representative_id:
                    cursor.execute("""
                        UPDATE Representative 
                        SET first_name=%s, last_name=%s, email=%s, phone=%s, address=%s
                        WHERE representative_id=%s
                    """, [
                        d.get('first_name'),
                        d.get('last_name'),
                        d.get('email'),
                        d.get('phone'),
                        d.get('address'),
                        user.representative_id
                    ])

                elif role == 'ADMIN':
                    cursor.callproc('PKG_SYSTEM_SECURITY.update_user', [
                        user.user_id,
                        user.username,
                        role
                    ])

            return Response({"message": "Perfil actualizado exitosamente"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Error de base de datos: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AuditLogView(APIView):

    def get(self, request):
        tab_type = int(request.query_params.get('type', 0))
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search_term = request.query_params.get('search', '').lower()
        
        results = []
        
        date_filter_sql = ""
        params = []
        
        if start_date:
            date_filter_sql += " AND TRUNC(change_date) >= TO_DATE(%s, 'YYYY-MM-DD')"
            params.append(start_date)
        if end_date:
            date_filter_sql += " AND TRUNC(change_date) <= TO_DATE(%s, 'YYYY-MM-DD')"
            params.append(end_date)

        try:
            with connection.cursor() as cursor:
                
                # =========================================================
                # TAB 0: APPROVAL HISTORY
                # =========================================================
                if tab_type == 0:
                    sql = f"""
                        SELECT 
                            h.history_id,
                            TO_CHAR(h.change_date, 'YYYY-MM-DD HH24:MI') as date_str,
                            h.new_status as action,
                            e.first_name || ' ' || e.last_name as user_name,
                            COALESCE(h.comments, 'Changed from ' || h.previous_status || ' to ' || h.new_status) as details,
                            p.name as project_name
                        FROM Approval_History h
                        JOIN Employee e ON h.employee_id = e.employee_id
                        JOIN Approval a ON h.approval_id = a.approval_id
                        JOIN Project p ON a.project_id = p.project_id
                        WHERE 1=1 {date_filter_sql}
                        ORDER BY h.change_date DESC
                    """
                
                # =========================================================
                # TAB 1: BUDGET HISTORY
                # =========================================================
                elif tab_type == 1:
                    sql = f"""
                        SELECT 
                            h.history_id,
                            TO_CHAR(h.change_date, 'YYYY-MM-DD HH24:MI') as date_str,
                            h.action_type as action,
                            e.first_name || ' ' || e.last_name as user_name,
                            h.reason || ' (Prev: ' || NVL(TO_CHAR(h.old_amount), '0') || ' -> New: ' || h.new_amount || ')' as details,
                            p.name as project_name
                        FROM Budget_History h
                        JOIN Employee e ON h.employee_id = e.employee_id
                        JOIN Budget b ON h.budget_id = b.budget_id
                        JOIN Project p ON b.project_id = p.project_id
                        WHERE 1=1 {date_filter_sql}
                        ORDER BY h.change_date DESC
                    """

                # =========================================================
                # TAB 2: PROJECT STATUS HISTORY
                # =========================================================
                elif tab_type == 2:
                    sql = f"""
                        SELECT 
                            h.status_history_id,
                            TO_CHAR(h.change_date, 'YYYY-MM-DD HH24:MI') as date_str,
                            'Status Change' as action,
                            e.first_name || ' ' || e.last_name as user_name,
                            'Changed from ' || NVL(h.previous_status, 'N/A') || ' to ' || h.new_status || '. ' || NVL(h.reason, '') as details,
                            p.name as project_name
                        FROM Project_Status_History h
                        JOIN Employee e ON h.employee_id = e.employee_id
                        JOIN Project p ON h.project_id = p.project_id
                        WHERE 1=1 {date_filter_sql}
                        ORDER BY h.change_date DESC
                    """

                # =========================================================
                # TAB 3: DONATION TRANSACTION LOG
                # =========================================================
                elif tab_type == 3:
                    sql = f"""
                        SELECT 
                            t.transaction_log_id,
                            TO_CHAR(t.change_date, 'YYYY-MM-DD HH24:MI') as date_str,
                            t.action_type as action,
                            COALESCE(e.first_name || ' ' || e.last_name, u.username) as user_name,
                            NVL(t.reason, 'Update amount') || ' (Prev: ' || NVL(TO_CHAR(t.old_amount), '0') || ' -> New: ' || NVL(TO_CHAR(t.new_amount), '-') || ')' as details,
                            p.name as project_name
                        FROM Donation_Transaction_Log t
                        JOIN Donation d ON t.donation_id = d.donation_id
                        JOIN Project p ON d.project_id = p.project_id
                        LEFT JOIN System_User u ON t.changed_by_user_id = u.user_id
                        LEFT JOIN Employee e ON u.employee_id = e.employee_id
                        WHERE 1=1 {date_filter_sql}
                        ORDER BY t.change_date DESC
                    """

                # =========================================================
                # TAB 4: ASSIGNMENT HISTORY
                # =========================================================
                elif tab_type == 4:
                    if start_date: 
                        date_filter_sql = date_filter_sql.replace("change_date", "assignment_date")
                    
                    sql = f"""
                        SELECT 
                            h.assignment_history_id,
                            TO_CHAR(h.assignment_date, 'YYYY-MM-DD HH24:MI') as date_str,
                            h.action as action,
                            COALESCE(e_admin.first_name || ' ' || e_admin.last_name, u.username) as user_name,
                            h.reason || ' Target: ' || h.assignment_type || ' ' || 
                            COALESCE(v.first_name || ' ' || v.last_name, e_target.first_name || ' ' || e_target.last_name) as details,
                            p.name as project_name
                        FROM Project_Assignment_History h
                        JOIN Project p ON h.project_id = p.project_id
                        LEFT JOIN System_User u ON h.assigned_by_user_id = u.user_id
                        LEFT JOIN Employee e_admin ON u.employee_id = e_admin.employee_id
                        -- Joins para saber a QUIÉN asignaron
                        LEFT JOIN Volunteer v ON h.volunteer_id = v.volunteer_id
                        LEFT JOIN Employee e_target ON h.employee_id = e_target.employee_id
                        WHERE 1=1 {date_filter_sql}
                        ORDER BY h.assignment_date DESC
                    """

                cursor.execute(sql, params)
                rows = cursor.fetchall()

                for row in rows:
                    item = {
                        "id": row[0],
                        "date": row[1],
                        "action": row[2],
                        "user": row[3] if row[3] else "System",
                        "details": row[4],
                        "project": row[5]
                    }
                    
                    if search_term:
                        search_string = f"{item['user']} {item['details']} {item['project']}".lower()
                        if search_term in search_string:
                            results.append(item)
                    else:
                        results.append(item)

            return Response(results, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error en AuditLogView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsAnalyticsView(APIView):

    def get(self, request):
        try:
            data = {
                "trends": [],
                "distribution": [],
                "reports": [],
                "project_stats": []
            }

            with connection.cursor() as cursor:
                # 1. TRENDS
                cursor.execute("""
                    SELECT 
                        TO_CHAR(d.donation_date, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH') as mes,
                        c.currency_code,
                        SUM(d.amount) as total
                    FROM Donation d
                    JOIN Currency c ON d.currency_id = c.currency_id
                    WHERE d.donation_date >= ADD_MONTHS(SYSDATE, -6)
                    GROUP BY TO_CHAR(d.donation_date, 'Mon', 'NLS_DATE_LANGUAGE=SPANISH'), 
                             TRUNC(d.donation_date, 'MM'), c.currency_code
                    ORDER BY TRUNC(d.donation_date, 'MM')
                """)
                rows_trends = cursor.fetchall()
                trends_map = {}
                for row in rows_trends:
                    month, currency, amount = row[0], row[1], row[2]
                    if month not in trends_map:
                        trends_map[month] = {"month": month}
                    trends_map[month][currency] = amount
                data["trends"] = list(trends_map.values())

                # 2. DISTRIBUTION
                cursor.execute("""
                    SELECT currency_code, symbol, total_amount_in_currency 
                    FROM vw_currency_exchange_rate_status
                """)
                rows_dist = cursor.fetchall()
                for row in rows_dist:
                    data["distribution"].append({
                        "name": f"{row[0]} ({row[1]})",
                        "value": row[2]
                    })

                # 3. REPORT TABLE (Last 5)
                cursor.execute("""
                    SELECT 
                        report_id, project_name, report_title, 
                        TO_CHAR(report_date, 'YYYY-MM-DD'), 
                        days_since_report, reports_per_project
                    FROM vw_report_generation_activity
                    ORDER BY report_date DESC
                    FETCH NEXT 5 ROWS ONLY 
                """)
                rows_reports = cursor.fetchall()
                for row in rows_reports:
                    data["reports"].append({
                        "report_id": row[0],
                        "project_name": row[1],
                        "report_title": row[2],
                        "report_date": row[3],
                        "days_since_report": row[4],
                        "reports_per_project": row[5]
                    })

                # 4. PROJECT STATISTICS (Top 10 by activity)
                cursor.execute("""
                    SELECT project_name, COUNT(*) as total
                    FROM vw_report_generation_activity 
                    GROUP BY project_name
                    ORDER BY total DESC
                    FETCH NEXT 10 ROWS ONLY
                """)
                
                rows_stats = cursor.fetchall()
                data["project_stats"] = [] 
                for row in rows_stats:
                    data["project_stats"].append({
                        "name": row[0],  
                        "reports": row[1] 
                    })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
