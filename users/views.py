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
                data = fetch_raw_query("""SELECT sdg_id as "id", goal_name as "name", goal_number as "number", description as "description" FROM SDG_Goal ORDER BY goal_number""")

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

            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Database error: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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

# ==============================================================================
# WORKFORCE & OPERATIONS VIEWS
# ==============================================================================

# --- NGO MANAGEMENT ---

class NGOListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all NGOs."""
        try:
            sql = "SELECT ong_id, name, registration_number, country, city, address, contact_email, phone, 'Active' as status FROM NGO ORDER BY name"
            ngos = fetch_raw_query(sql)
            return Response(ngos, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching NGOs: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new NGO using PKG_WORKFORCE.create_ngo."""
        data = request.data
        try:
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.create_ngo', [
                    data.get('name'),
                    data.get('registration_number'),
                    data.get('country'),
                    data.get('contact_email'),
                    out_id
                ])
                
                # Update city and address if provided
                if data.get('city') or data.get('address') or data.get('phone'):
                    cursor.execute(
                        "UPDATE NGO SET city = %s, address = %s, phone = %s WHERE ong_id = %s",
                        [data.get('city', ''), data.get('address', ''), data.get('phone', ''), out_id.getvalue()]
                    )
                
                native_cursor.close()
                return Response({"message": "NGO created successfully", "ong_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating NGO: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NGOUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update NGO."""
        data = request.data
        ong_id = data.get('ong_id')
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """UPDATE NGO SET name = %s, registration_number = %s, country = %s, 
                       city = %s, address = %s, contact_email = %s, phone = %s 
                       WHERE ong_id = %s""",
                    [
                        data.get('name'),
                        data.get('registration_number'),
                        data.get('country'),
                        data.get('city', ''),
                        data.get('address', ''),
                        data.get('contact_email'),
                        data.get('phone', ''),
                        ong_id
                    ]
                )
            return Response({"message": "NGO updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating NGO: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """Soft delete NGO using PKG_WORKFORCE.delete_ngo."""
        ong_id = request.query_params.get('ong_id')
        if not ong_id:
            return Response({"error": "ong_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_WORKFORCE.delete_ngo', [int(ong_id)])
            return Response({"message": "NGO deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting NGO: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- EMPLOYEE MANAGEMENT ---

class EmployeeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all employees."""
        try:
            sql = """SELECT employee_id, first_name, last_name, birth_date, address, 
                     email, phone, hire_date FROM Employee ORDER BY hire_date DESC"""
            employees = fetch_raw_query(sql)
            return Response(employees, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching employees: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new employee using PKG_WORKFORCE.create_employee."""
        data = request.data
        try:
            from datetime import datetime
            birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date() if data.get('birth_date') else None
            hire_date = datetime.strptime(data.get('hire_date'), '%Y-%m-%d').date() if data.get('hire_date') else None
            
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.create_employee', [
                    data.get('first_name'),
                    data.get('last_name'),
                    birth_date,
                    data.get('address', ''),
                    data.get('email'),
                    data.get('phone', ''),
                    hire_date,
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Employee created successfully", "employee_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating employee: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update employee using PKG_WORKFORCE.update_employee."""
        data = request.data
        employee_id = data.get('employee_id')
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_WORKFORCE.update_employee', [
                    employee_id,
                    data.get('first_name'),
                    data.get('last_name'),
                    data.get('email'),
                    data.get('phone', '')
                ])
                # Update address if provided
                if data.get('address'):
                    cursor.execute("UPDATE Employee SET address = %s WHERE employee_id = %s", [data.get('address'), employee_id])
            return Response({"message": "Employee updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating employee: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, employee_id):
        """Delete employee using PKG_WORKFORCE.delete_employee."""
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_WORKFORCE.delete_employee', [employee_id])
            return Response({"message": "Employee deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting employee: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- VOLUNTEER MANAGEMENT ---

class VolunteerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all volunteers."""
        try:
            sql = """SELECT volunteer_id, first_name, last_name, birth_date, address, 
                     email, phone, 'Active' as status FROM Volunteer ORDER BY last_name, first_name"""
            volunteers = fetch_raw_query(sql)
            return Response(volunteers, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteers: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new volunteer using PKG_WORKFORCE.create_volunteer."""
        data = request.data
        try:
            from datetime import datetime
            birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date() if data.get('birth_date') else None
            
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.create_volunteer', [
                    data.get('first_name'),
                    data.get('last_name'),
                    birth_date,
                    data.get('address', ''),
                    data.get('email'),
                    data.get('phone', ''),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Volunteer created successfully", "volunteer_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating volunteer: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update volunteer using PKG_WORKFORCE.update_volunteer."""
        data = request.data
        volunteer_id = data.get('volunteer_id')
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_WORKFORCE.update_volunteer', [
                    volunteer_id,
                    data.get('first_name'),
                    data.get('last_name'),
                    data.get('email'),
                    data.get('phone', '')
                ])
                # Update address if provided
                if data.get('address'):
                    cursor.execute("UPDATE Volunteer SET address = %s WHERE volunteer_id = %s", [data.get('address'), volunteer_id])
                # Update status if provided
                if data.get('status'):
                    cursor.execute("UPDATE Volunteer SET status = %s WHERE volunteer_id = %s", [data.get('status'), volunteer_id])
            return Response({"message": "Volunteer updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating volunteer: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, volunteer_id=None):
        """Delete volunteer using PKG_WORKFORCE.delete_volunteer."""
        # Get volunteer_id from URL parameter or request body
        volunteer_id = volunteer_id or request.query_params.get('volunteer_id') or request.data.get('volunteer_id')
        if not volunteer_id:
            return Response({"error": "volunteer_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_WORKFORCE.delete_volunteer', [int(volunteer_id)])
            return Response({"message": "Volunteer deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting volunteer: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerSpecialtyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Assign specialty to volunteer using PKG_WORKFORCE.add_volunteer_specialty."""
        data = request.data
        try:
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.add_volunteer_specialty', [
                    data.get('volunteer_id'),
                    data.get('specialty_id'),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Specialty assigned successfully", "assignment_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error assigning specialty: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Get volunteer specialties."""
        volunteer_id = request.query_params.get('volunteer_id')
        if not volunteer_id:
            return Response({"error": "volunteer_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            sql = """SELECT vs.assignment_id, vs.specialty_id, s.specialty_name, s.description, vs.assignment_date
                     FROM Volunteer_Specialty vs
                     JOIN Specialty s ON vs.specialty_id = s.specialty_id
                     WHERE vs.volunteer_id = %s
                     ORDER BY vs.assignment_date DESC"""
            specialties = fetch_raw_query(sql, [volunteer_id])
            return Response(specialties, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteer specialties: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- REPRESENTATIVE MANAGEMENT ---

class RepresentativeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all representatives."""
        try:
            sql = """SELECT r.representative_id, r.first_name, r.last_name, r.birth_date, 
                     r.address, r.email, r.phone, r.ong_id, n.name as ngo_name, 'Active' as status
                     FROM Representative r
                     JOIN NGO n ON r.ong_id = n.ong_id
                     ORDER BY r.last_name, r.first_name"""
            representatives = fetch_raw_query(sql)
            return Response(representatives, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching representatives: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new representative using PKG_WORKFORCE.create_representative."""
        data = request.data
        try:
            from datetime import datetime
            birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date() if data.get('birth_date') else None
            
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.create_representative', [
                    data.get('first_name'),
                    data.get('last_name'),
                    birth_date,
                    data.get('address', ''),
                    data.get('email'),
                    data.get('phone', ''),
                    data.get('ong_id'),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Representative created successfully", "representative_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating representative: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RepresentativeUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update representative."""
        data = request.data
        representative_id = data.get('representative_id')
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """UPDATE Representative SET first_name = %s, last_name = %s, 
                       address = %s, email = %s, phone = %s, ong_id = %s
                       WHERE representative_id = %s""",
                    [
                        data.get('first_name'),
                        data.get('last_name'),
                        data.get('address', ''),
                        data.get('email'),
                        data.get('phone', ''),
                        data.get('ong_id'),
                        representative_id
                    ]
                )
            return Response({"message": "Representative updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating representative: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- PROJECT MANAGEMENT ---

class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all projects."""
        try:
            sql = """SELECT p.project_id, p.name, p.description, p.start_date, p.end_date,
                     p.project_status_id, ps.status_name, p.ong_id, n.name as ngo_name,
                     p.representative_id, r.first_name || ' ' || r.last_name as representative_name,
                     pc.category_id, pc.category_name,
                     'Active' as status
                     FROM Project p
                     JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                     JOIN NGO n ON p.ong_id = n.ong_id
                     JOIN Representative r ON p.representative_id = r.representative_id
                     LEFT JOIN (
                         SELECT pca.project_id, pca.category_id, c.category_name,
                                ROW_NUMBER() OVER (PARTITION BY pca.project_id ORDER BY pca.is_primary DESC, pca.assignment_date) as rn
                         FROM Project_Category_Assignment pca
                         JOIN Project_Category c ON pca.category_id = c.category_id
                     ) pc ON p.project_id = pc.project_id AND pc.rn = 1
                     ORDER BY p.start_date DESC"""
            projects = fetch_raw_query(sql)
            return Response(projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching projects: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new project using PKG_PROJECT_MGMT.create_project."""
        data = request.data
        try:
            from datetime import datetime
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date() if data.get('start_date') else None
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
            
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_PROJECT_MGMT.create_project', [
                    data.get('name'),
                    data.get('description', ''),
                    start_date,
                    end_date,
                    data.get('project_status_id'),
                    data.get('ong_id'),
                    data.get('representative_id'),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Project created successfully", "project_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update project using PKG_PROJECT_MGMT.update_project_details."""
        data = request.data
        project_id = data.get('project_id')
        if not project_id:
            return Response({"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from datetime import datetime
            start_date = None
            end_date = None
            
            # Parse dates if provided
            if data.get('start_date'):
                try:
                    start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
                except ValueError:
                    logger.warning(f"Invalid start_date format: {data.get('start_date')}")
            
            if data.get('end_date'):
                try:
                    end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
                except ValueError:
                    logger.warning(f"Invalid end_date format: {data.get('end_date')}")
            
            with connection.cursor() as cursor:
                cursor.callproc('PKG_PROJECT_MGMT.update_project_details', [
                    project_id,
                    data.get('name'),
                    data.get('description', ''),
                    start_date,
                    end_date,
                    data.get('project_status_id'),
                    data.get('ong_id'),
                    data.get('representative_id')
                ])
            return Response({"message": "Project updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating project: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Close project using PKG_PROJECT_MGMT.close_project."""
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_PROJECT_MGMT.close_project', [project_id])
            return Response({"message": "Project closed successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error closing project: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectReactivateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Reactivate project using PKG_PROJECT_MGMT.reactivate_project."""
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with connection.cursor() as cursor:
                cursor.callproc('PKG_PROJECT_MGMT.reactivate_project', [project_id])
            return Response({"message": "Project reactivated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error reactivating project: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- ASSIGNMENTS ---

class VolunteerProjectAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Assign volunteer to project using PKG_WORKFORCE.assign_volunteer_to_project."""
        data = request.data
        try:
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.assign_volunteer_to_project', [
                    data.get('project_id'),
                    data.get('volunteer_id'),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Volunteer assigned successfully", "assignment_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error assigning volunteer: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectCategoryAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Assign category to project."""
        data = request.data
        user = request.user
        try:
            with connection.cursor() as cursor:
                # Check if assignment already exists
                check_sql = "SELECT COUNT(*) as cnt FROM Project_Category_Assignment WHERE project_id = %s AND category_id = %s"
                cursor.execute(check_sql, [data.get('project_id'), data.get('category_id')])
                result = cursor.fetchone()
                if result and result[0] > 0:
                    return Response({"error": "Category already assigned to this project"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Insert category assignment
                insert_sql = """
                    INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_sql, [
                    data.get('project_id'),
                    data.get('category_id'),
                    data.get('is_primary', 'N'),
                    user.user_id
                ])
                return Response({"message": "Category assigned successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error assigning category: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectSDGAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Assign SDG to project using PKG_PROJECT_MGMT.assign_sdg."""
        data = request.data
        user = request.user
        try:
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_PROJECT_MGMT.assign_sdg', [
                    data.get('project_id'),
                    data.get('sdg_id'),
                    data.get('contribution_level', 'MEDIO'),
                    user.user_id,
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "SDG assigned successfully", "project_sdg_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error assigning SDG: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- VIEWS EXPOSURE ---

class VolunteerExpertiseMappingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get volunteer expertise mapping from vw_volunteer_expertise_mapping."""
        try:
            sql = "SELECT * FROM vw_volunteer_expertise_mapping ORDER BY volunteer_name"
            data = fetch_raw_query(sql)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteer expertise: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeWorkloadAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get employee workload analysis from vw_employee_workload_analysis."""
        try:
            sql = "SELECT * FROM vw_employee_workload_analysis ORDER BY employee_name"
            data = fetch_raw_query(sql)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching employee workload: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- VOLUNTEER ENDPOINTS ---

class VolunteerDashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard data for the logged-in volunteer."""
        user = request.user
        if user.user_role != 'VOLUNTEER' or not user.volunteer_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            volunteer_id = user.volunteer_id
            
            # Helper function to safely get integer values
            def safe_get_int(d, key, default=0):
                if not d:
                    return default
                val = d.get(key.lower()) or d.get(key.upper()) or d.get(key) or default
                return int(val) if val else default
            
            def safe_get_str(d, key, default='N/A'):
                if not d:
                    return default
                return d.get(key.lower()) or d.get(key.upper()) or d.get(key) or default
            
            # 1. Active Projects Count
            sql_active = """
                SELECT COUNT(*) as count
                FROM Volunteer_Project vp
                JOIN Project p ON vp.project_id = p.project_id
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                WHERE vp.volunteer_id = %s 
                AND vp.status = 'A'
                AND ps.status_name = 'ACTIVO'
            """
            active_projects_data = fetch_raw_query(sql_active, [volunteer_id])
            active_projects = safe_get_int(active_projects_data[0], 'count', 0) if active_projects_data else 0
            
            # 2. Hours This Month (using days_assigned as proxy, can be improved)
            sql_hours = """
                SELECT NVL(SUM(
                    CASE 
                        WHEN vp.end_date IS NOT NULL THEN TRUNC(vp.end_date) - TRUNC(vp.assignment_date)
                        ELSE TRUNC(SYSDATE) - TRUNC(vp.assignment_date)
                    END
                ), 0) as hours
                FROM Volunteer_Project vp
                WHERE vp.volunteer_id = %s
                AND vp.status = 'A'
                AND EXTRACT(MONTH FROM vp.assignment_date) = EXTRACT(MONTH FROM SYSDATE)
                AND EXTRACT(YEAR FROM vp.assignment_date) = EXTRACT(YEAR FROM SYSDATE)
            """
            hours_data = fetch_raw_query(sql_hours, [volunteer_id])
            hours_this_month = safe_get_int(hours_data[0], 'hours', 0) if hours_data else 0
            
            # 3. Projects Completed
            sql_completed = """
                SELECT COUNT(*) as count
                FROM Volunteer_Project vp
                JOIN Project p ON vp.project_id = p.project_id
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                WHERE vp.volunteer_id = %s
                AND ps.status_name = 'COMPLETADO'
            """
            completed_data = fetch_raw_query(sql_completed, [volunteer_id])
            projects_completed = safe_get_int(completed_data[0], 'count', 0) if completed_data else 0
            
            # 4. Rating Average (placeholder - would need a rating system)
            rating_average = 4.8  # Default value, can be calculated from feedback table if exists
            
            # 5. Specialties
            sql_specialties = """
                SELECT s.specialty_name, s.description
                FROM Volunteer_Specialty vs
                JOIN Specialty s ON vs.specialty_id = s.specialty_id
                WHERE vs.volunteer_id = %s
                ORDER BY vs.assignment_date DESC
            """
            specialties_data = fetch_raw_query(sql_specialties, [volunteer_id])
            specialties = [{
                'name': s.get('specialty_name') or s.get('SPECIALTY_NAME'),
                'desc': s.get('description') or s.get('DESCRIPTION') or 'No description'
            } for s in specialties_data]
            
            # 6. Contribution Data (hours by month for current year)
            sql_contribution = """
                SELECT 
                    TO_CHAR(vp.assignment_date, 'MON') as month,
                    TO_CHAR(vp.assignment_date, 'MM') as month_num,
                    COUNT(*) as project_count,
                    SUM(
                        CASE 
                            WHEN vp.end_date IS NOT NULL THEN TRUNC(vp.end_date) - TRUNC(vp.assignment_date)
                            ELSE TRUNC(SYSDATE) - TRUNC(vp.assignment_date)
                        END
                    ) as hours
                FROM Volunteer_Project vp
                WHERE vp.volunteer_id = %s
                AND EXTRACT(YEAR FROM vp.assignment_date) = EXTRACT(YEAR FROM SYSDATE)
                GROUP BY TO_CHAR(vp.assignment_date, 'MON'), TO_CHAR(vp.assignment_date, 'MM')
                ORDER BY TO_NUMBER(TO_CHAR(vp.assignment_date, 'MM'))
            """
            contribution_data = fetch_raw_query(sql_contribution, [volunteer_id])
            
            # Map to frontend format (JAN, APR, JUL, OCT)
            month_map = {
                'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
                'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
            }
            contribution_chart = []
            for row in contribution_data:
                month_name = (row.get('month') or row.get('MONTH') or '').upper()[:3]
                hours = safe_get_int(row, 'hours', 0)
                if month_name in ['JAN', 'APR', 'JUL', 'OCT']:
                    contribution_chart.append({
                        'month': month_name,
                        'hours': hours
                    })
            
            # Fill missing months with 0
            required_months = ['JAN', 'APR', 'JUL', 'OCT']
            existing_months = [c['month'] for c in contribution_chart]
            for month in required_months:
                if month not in existing_months:
                    contribution_chart.append({'month': month, 'hours': 0})
            contribution_chart.sort(key=lambda x: month_map.get(x['month'], 0))
            
            # 7. Available Opportunities (projects not yet assigned to this volunteer)
            sql_opportunities = """
                SELECT 
                    p.project_id,
                    p.name as project_name,
                    n.name as ngo_name,
                    n.city || ', ' || n.country as location,
                    TO_CHAR(TRUNC(p.start_date), 'Mon DD, YYYY') as start_date,
                    ROUND((p.end_date - p.start_date)) as duration_days,
                    ps.status_name as project_status,
                    (SELECT COUNT(*) FROM Volunteer_Project vp2 WHERE vp2.project_id = p.project_id AND vp2.status = 'A') as team_size
                FROM Project p
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                JOIN NGO n ON p.ong_id = n.ong_id
                WHERE ps.status_name = 'ACTIVO'
                AND p.project_id NOT IN (
                    SELECT project_id FROM Volunteer_Project 
                    WHERE volunteer_id = %s AND status = 'A'
                )
                AND p.project_id NOT IN (
                    SELECT project_id FROM Volunteer_Application
                    WHERE volunteer_id = %s AND status IN ('PENDING', 'PENDIENTE')
                )
                AND ROWNUM <= 5
                ORDER BY p.start_date DESC
            """
            opportunities_data = fetch_raw_query(sql_opportunities, [volunteer_id, volunteer_id])
            opportunities = []
            for opp in opportunities_data:
                duration_days = safe_get_int(opp, 'duration_days', 0)
                duration_weeks = f"{round(duration_days / 7)} Weeks" if duration_days > 0 else "Ongoing"
                team_size = safe_get_int(opp, 'team_size', 0)
                
                opportunities.append({
                    'id': safe_get_int(opp, 'project_id', 0),
                    'project_id': safe_get_int(opp, 'project_id', 0),
                    'title': safe_get_str(opp, 'project_name', 'Unknown Project'),
                    'name': safe_get_str(opp, 'project_name', 'Unknown Project'),
                    'org': safe_get_str(opp, 'ngo_name', 'Unknown NGO'),
                    'ngo_name': safe_get_str(opp, 'ngo_name', 'Unknown NGO'),
                    'location': safe_get_str(opp, 'location', 'Unknown Location'),
                    'match': 95,  # Placeholder - could calculate based on specialties
                    'tags': {
                        'specialty': 'Various',  # Could be improved
                        'start': safe_get_str(opp, 'start_date', 'N/A'),
                        'duration': duration_weeks,
                        'team': f"{team_size} Volunteers"
                    },
                    'isNew': True,  # Could check if project was created recently
                    'status_name': safe_get_str(opp, 'project_status', 'ACTIVO'),
                    'start_date': safe_get_str(opp, 'start_date', 'N/A')
                })
            
            # Get volunteer name for greeting
            sql_volunteer_name = """
                SELECT first_name FROM Volunteer WHERE volunteer_id = %s
            """
            volunteer_name_data = fetch_raw_query(sql_volunteer_name, [volunteer_id])
            volunteer_name = volunteer_name_data[0].get('first_name') or volunteer_name_data[0].get('FIRST_NAME') if volunteer_name_data else 'Volunteer'
            
            return Response({
                'volunteerName': volunteer_name,
                'kpis': {
                    'activeProjects': active_projects,
                    'hoursThisMonth': hours_this_month,
                    'projectsComplete': projects_completed,
                    'ratingAverage': rating_average
                },
                'specialties': specialties,
                'contributionData': contribution_chart,
                'opportunities': opportunities
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching volunteer dashboard data: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerMyProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects assigned to the logged-in volunteer."""
        user = request.user
        if user.user_role != 'VOLUNTEER' or not user.volunteer_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            sql = """SELECT * FROM vw_volunteer_project_assignments 
                     WHERE volunteer_id = %s 
                     ORDER BY assignment_date DESC"""
            projects = fetch_raw_query(sql, [user.volunteer_id])
            return Response(projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteer projects: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerMySpecialtiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get specialties of the logged-in volunteer."""
        user = request.user
        if user.user_role != 'VOLUNTEER' or not user.volunteer_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            sql = """SELECT vs.assignment_id, vs.specialty_id, s.specialty_name, s.description, vs.assignment_date
                     FROM Volunteer_Specialty vs
                     JOIN Specialty s ON vs.specialty_id = s.specialty_id
                     WHERE vs.volunteer_id = %s
                     ORDER BY vs.assignment_date DESC"""
            specialties = fetch_raw_query(sql, [user.volunteer_id])
            return Response(specialties, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteer specialties: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerExploreProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get available projects for volunteers to apply (excluding projects already assigned or with pending applications)."""
        user = request.user
        if user.user_role != 'VOLUNTEER' or not user.volunteer_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            volunteer_id = user.volunteer_id
            
            # Get projects that are active and not assigned to this volunteer
            sql = """
                SELECT 
                    p.project_id,
                    p.name as project_name,
                    p.description,
                    TO_CHAR(TRUNC(p.start_date), 'Mon DD, YYYY') as start_date,
                    TO_CHAR(TRUNC(p.end_date), 'Mon DD, YYYY') as end_date,
                    ROUND((p.end_date - p.start_date)) as duration_days,
                    n.name as ngo_name,
                    n.city,
                    n.country,
                    ps.status_name,
                    (SELECT COUNT(*) FROM Volunteer_Project vp2 WHERE vp2.project_id = p.project_id AND vp2.status = 'A') as current_volunteers
                FROM Project p
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                JOIN NGO n ON p.ong_id = n.ong_id
                WHERE ps.status_name = 'ACTIVO'
                AND p.project_id NOT IN (
                    SELECT project_id FROM Volunteer_Project 
                    WHERE volunteer_id = %s AND status = 'A'
                )
                AND p.project_id NOT IN (
                    SELECT project_id FROM Volunteer_Application
                    WHERE volunteer_id = %s AND status IN ('PENDING', 'PENDIENTE')
                )
                ORDER BY p.start_date DESC
            """
            projects = fetch_raw_query(sql, [volunteer_id, volunteer_id])
            
            # Get volunteer specialties for match calculation
            sql_specialties = """
                SELECT s.specialty_id
                FROM Volunteer_Specialty vs
                JOIN Specialty s ON vs.specialty_id = s.specialty_id
                WHERE vs.volunteer_id = %s
            """
            volunteer_specialties = fetch_raw_query(sql_specialties, [volunteer_id])
            volunteer_specialty_ids = [s.get('specialty_id') or s.get('SPECIALTY_ID') for s in volunteer_specialties]
            
            # Enhance projects with match percentage and other data
            enhanced_projects = []
            for proj in projects:
                # Calculate match based on project requirements (simplified - could be improved)
                match_percentage = 95  # Placeholder, could calculate based on project categories/specialties
                
                duration_days = int(proj.get('duration_days', 0) or 0)
                duration_weeks = f"{round(duration_days / 7)} Weeks" if duration_days > 0 else "Ongoing"
                team_size = int(proj.get('current_volunteers', 0) or 0)
                
                enhanced_projects.append({
                    'project_id': proj.get('project_id') or proj.get('PROJECT_ID'),
                    'project_name': proj.get('project_name') or proj.get('PROJECT_NAME'),
                    'description': proj.get('description') or proj.get('DESCRIPTION') or 'No description available',
                    'start_date': proj.get('start_date') or proj.get('START_DATE'),
                    'end_date': proj.get('end_date') or proj.get('END_DATE'),
                    'ngo_name': proj.get('ngo_name') or proj.get('NGO_NAME'),
                    'city': proj.get('city') or proj.get('CITY'),
                    'country': proj.get('country') or proj.get('COUNTRY'),
                    'status_name': proj.get('status_name') or proj.get('STATUS_NAME'),
                    'current_volunteers': team_size,
                    'duration_weeks': duration_weeks,
                    'match_percentage': match_percentage
                })
            
            return Response(enhanced_projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching available projects: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerProjectDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """Get detailed project information for volunteers."""
        user = request.user
        if user.user_role != 'VOLUNTEER':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get project basic info with location
            sql_project = """
                SELECT 
                    p.project_id,
                    p.name as project_name,
                    p.description,
                    TO_CHAR(TRUNC(p.start_date), 'Mon DD, YYYY') as start_date,
                    TO_CHAR(TRUNC(p.end_date), 'Mon DD, YYYY') as end_date,
                    ROUND((p.end_date - p.start_date)) as duration_days,
                    n.name as ngo_name,
                    n.city || ', ' || n.country as location,
                    n.city,
                    n.country,
                    ps.status_name,
                    (SELECT COUNT(*) FROM Volunteer_Project vp2 WHERE vp2.project_id = p.project_id AND vp2.status = 'A') as current_volunteers
                FROM Project p
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                JOIN NGO n ON p.ong_id = n.ong_id
                WHERE p.project_id = %s
            """
            project_data = fetch_raw_query(sql_project, [project_id])
            if not project_data:
                return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
            
            project = project_data[0]
            
            # Get specialties/categories associated with project
            sql_specialties = """
                SELECT DISTINCT s.specialty_name
                FROM Project_Category_Assignment pca
                JOIN Project_Category pc ON pca.category_id = pc.category_id
                LEFT JOIN Specialty s ON UPPER(s.specialty_name) = UPPER(pc.category_name)
                WHERE pca.project_id = %s
                UNION
                SELECT DISTINCT s.specialty_name
                FROM Volunteer_Project vp
                JOIN Volunteer_Specialty vs ON vp.volunteer_id = vs.volunteer_id
                JOIN Specialty s ON vs.specialty_id = s.specialty_id
                WHERE vp.project_id = %s AND vp.status = 'A'
            """
            specialties_data = fetch_raw_query(sql_specialties, [project_id, project_id])
            specialties = [s.get('specialty_name') or s.get('SPECIALTY_NAME') for s in specialties_data if s.get('specialty_name') or s.get('SPECIALTY_NAME')]
            
            # Get team members (volunteers assigned to project)
            sql_team = """
                SELECT 
                    v.first_name || ' ' || v.last_name as volunteer_name,
                    v.email
                FROM Volunteer_Project vp
                JOIN Volunteer v ON vp.volunteer_id = v.volunteer_id
                WHERE vp.project_id = %s AND vp.status = 'A'
                ORDER BY vp.assignment_date DESC
            """
            team_data = fetch_raw_query(sql_team, [project_id])
            team_members = [{
                'name': t.get('volunteer_name') or t.get('VOLUNTEER_NAME'),
                'role': 'Volunteer'
            } for t in team_data]
            
            def safe_get_str(d, key, default='N/A'):
                if not d:
                    return default
                return d.get(key.lower()) or d.get(key.upper()) or d.get(key) or default
            
            duration_days = int(safe_get_str(project, 'duration_days', 0) or 0)
            duration_weeks = f"{round(duration_days / 7)} Weeks" if duration_days > 0 else "Ongoing"
            
            return Response({
                'project_id': int(safe_get_str(project, 'project_id', 0) or 0),
                'project_name': safe_get_str(project, 'project_name', 'Unknown Project'),
                'description': safe_get_str(project, 'description', 'No description available'),
                'start_date': safe_get_str(project, 'start_date', 'N/A'),
                'end_date': safe_get_str(project, 'end_date', 'N/A'),
                'location': safe_get_str(project, 'location', 'N/A'),
                'city': safe_get_str(project, 'city', 'N/A'),
                'country': safe_get_str(project, 'country', 'N/A'),
                'ngo_name': safe_get_str(project, 'ngo_name', 'N/A'),
                'status_name': safe_get_str(project, 'status_name', 'ACTIVO'),
                'duration_weeks': duration_weeks,
                'current_volunteers': int(safe_get_str(project, 'current_volunteers', 0) or 0),
                'specialties': specialties if specialties else ['Various'],
                'team_members': team_members
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching project details: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerApplyProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Apply to a project (volunteer self-registration)."""
        user = request.user
        if user.user_role != 'VOLUNTEER' or not user.volunteer_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({"error": "project_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            volunteer_id = int(user.volunteer_id)
            project_id_int = int(project_id)
            
            # Validate user corresponds to volunteer
            sql_check_user = """
                SELECT volunteer_id FROM System_User 
                WHERE user_id = %s AND user_role = 'VOLUNTEER'
            """
            user_check = fetch_raw_query(sql_check_user, [user.user_id])
            if not user_check or user_check[0].get('volunteer_id') != volunteer_id:
                return Response({"error": "Unauthorized user"}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if volunteer is already assigned
            sql_check_assigned = """
                SELECT COUNT(*) as count
                FROM Volunteer_Project
                WHERE volunteer_id = %s AND project_id = %s AND status = 'A'
            """
            assigned_check = fetch_raw_query(sql_check_assigned, [volunteer_id, project_id_int])
            if assigned_check and int(assigned_check[0].get('count', 0) or 0) > 0:
                return Response({"error": "You are already assigned to this project"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if there's already a pending application (try both Spanish and English)
            sql_check_pending = """
                SELECT COUNT(*) as count
                FROM Volunteer_Application
                WHERE volunteer_id = %s AND project_id = %s 
                AND status IN ('PENDING', 'PENDIENTE')
            """
            pending_check = fetch_raw_query(sql_check_pending, [volunteer_id, project_id_int])
            if pending_check and int(pending_check[0].get('count', 0) or 0) > 0:
                return Response({"error": "You already have a pending application for this project"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Insert application directly - try Spanish first, fallback to English
            # First, check what status values are accepted by querying the constraint
            sql_insert = """
                INSERT INTO Volunteer_Application (
                    volunteer_id,
                    project_id,
                    application_date,
                    status
                ) VALUES (
                    %s,
                    %s,
                    SYSTIMESTAMP,
                    'PENDIENTE'
                )
            """
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute(sql_insert, [volunteer_id, project_id_int])
                    # Get the application_id
                    sql_get_id = """
                        SELECT application_id 
                        FROM Volunteer_Application 
                        WHERE volunteer_id = %s AND project_id = %s 
                        AND status = 'PENDIENTE'
                        ORDER BY application_date DESC
                        FETCH FIRST 1 ROW ONLY
                    """
                    app_data = fetch_raw_query(sql_get_id, [volunteer_id, project_id_int])
                    application_id = app_data[0].get('application_id') if app_data else None
                    
                    connection.commit()
                    
                    return Response({
                        "message": "Application submitted successfully",
                        "application_id": application_id
                    }, status=status.HTTP_201_CREATED)
            except Exception as insert_error:
                error_str = str(insert_error)
                # If Spanish doesn't work, try English
                if 'CHK_APPLICATION_STATUS' in error_str or 'restricción' in error_str.lower():
                    sql_insert_en = """
                        INSERT INTO Volunteer_Application (
                            volunteer_id,
                            project_id,
                            application_date,
                            status
                        ) VALUES (
                            %s,
                            %s,
                            SYSTIMESTAMP,
                            'PENDING'
                        )
                    """
                    try:
                        with connection.cursor() as cursor:
                            cursor.execute(sql_insert_en, [volunteer_id, project_id_int])
                            sql_get_id_en = """
                                SELECT application_id 
                                FROM Volunteer_Application 
                                WHERE volunteer_id = %s AND project_id = %s 
                                AND status = 'PENDING'
                                ORDER BY application_date DESC
                                FETCH FIRST 1 ROW ONLY
                            """
                            app_data = fetch_raw_query(sql_get_id_en, [volunteer_id, project_id_int])
                            application_id = app_data[0].get('application_id') if app_data else None
                            connection.commit()
                            
                            return Response({
                                "message": "Application submitted successfully",
                                "application_id": application_id
                            }, status=status.HTTP_201_CREATED)
                    except Exception as insert_error_en:
                        logger.error(f"Error inserting application (English): {insert_error_en}")
                        raise insert_error_en
                else:
                    raise insert_error
                    
        except Exception as e:
            logger.error(f"Error applying to project: {e}")
            import traceback
            logger.error(traceback.format_exc())
            error_msg = str(e)
            if 'already have a pending application' in error_msg.lower() or 'already assigned' in error_msg.lower():
                return Response({"error": "You already have a pending application or are assigned to this project"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- REPRESENTATIVE ENDPOINTS ---

class RepresentativeMyProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects of the logged-in representative."""
        user = request.user
        if user.user_role != 'REPRESENTATIVE' or not user.representative_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            sql = """SELECT p.project_id, p.name, p.description, 
                     TO_CHAR(TRUNC(p.start_date), 'YYYY-MM-DD') as start_date,
                     TO_CHAR(TRUNC(p.end_date), 'YYYY-MM-DD') as end_date,
                     ps.status_name, 
                     ps.status_name as status,
                     n.name as ngo_name
                     FROM Project p
                     JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                     JOIN NGO n ON p.ong_id = n.ong_id
                     WHERE p.representative_id = %s
                     ORDER BY p.start_date DESC"""
            projects = fetch_raw_query(sql, [user.representative_id])
            return Response(projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching representative projects: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create project draft for representative."""
        user = request.user
        if user.user_role != 'REPRESENTATIVE' or not user.representative_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        try:
            from datetime import datetime
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date() if data.get('start_date') else None
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
            
            # Get NGO ID from representative
            with connection.cursor() as cursor:
                cursor.execute("SELECT ong_id FROM Representative WHERE representative_id = %s", [user.representative_id])
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "Representative not found"}, status=status.HTTP_404_NOT_FOUND)
                ong_id = row[0]
                
                # Use project_status_id from request, or default to PLANIFICACION
                status_id = data.get('project_status_id')
                if not status_id:
                    cursor.execute("SELECT project_status_id FROM Project_Status WHERE status_name = 'PLANIFICACION'")
                    row = cursor.fetchone()
                    if not row:
                        return Response({"error": "Project status not found"}, status=status.HTTP_404_NOT_FOUND)
                    status_id = row[0]
                else:
                    status_id = int(status_id)
            
            native_conn = connection.connection
            native_cursor = native_conn.cursor()
            out_id = native_cursor.var(oracledb.NUMBER)
            
            native_cursor.callproc('PKG_PROJECT_MGMT.create_project', [
                data.get('name'),
                data.get('description', ''),
                start_date,
                end_date,
                status_id,
                ong_id,
                user.representative_id,
                out_id
            ])
            native_cursor.close()
            return Response({"message": "Project draft created successfully", "project_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating project draft: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RepresentativeMyNGOView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get NGO information for the logged-in representative."""
        user = request.user
        if user.user_role != 'REPRESENTATIVE' or not user.representative_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            # Get basic NGO info
            sql_ngo = """SELECT n.ong_id, n.name, n.registration_number, n.country, n.city, 
                         n.address, n.contact_email, n.phone
                         FROM NGO n
                         JOIN Representative r ON n.ong_id = r.ong_id
                         WHERE r.representative_id = %s"""
            ngo_data = fetch_raw_query(sql_ngo, [user.representative_id])
            
            if not ngo_data:
                return Response({"error": "NGO not found"}, status=status.HTTP_404_NOT_FOUND)
            
            ngo = ngo_data[0]
            # Handle both lowercase and uppercase keys
            ong_id = ngo.get('ong_id') or ngo.get('ONG_ID')
            if not ong_id:
                logger.error(f"Could not extract ong_id from ngo data: {ngo}")
                return Response({"error": "Invalid NGO data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get financial overview - calculate directly instead of using view
            try:
                sql_financial = """SELECT 
                                  COUNT(DISTINCT p.project_id) as total_projects,
                                  COUNT(DISTINCT b.budget_id) as active_budgets,
                                  NVL(SUM(b.initial_amount), 0) as total_budget,
                                  NVL(SUM(d.amount), 0) as total_donations_received
                                  FROM NGO n
                                  LEFT JOIN Project p ON n.ong_id = p.ong_id
                                  LEFT JOIN Budget b ON p.project_id = b.project_id
                                  LEFT JOIN Donation d ON p.project_id = d.project_id
                                  WHERE n.ong_id = %s"""
                financial_data = fetch_raw_query(sql_financial, [ong_id])
                financial = financial_data[0] if financial_data else {}
            except Exception as fin_err:
                logger.error(f"Error fetching financial data: {fin_err}")
                financial = {}
            
            # Get representative info
            try:
                sql_rep = """SELECT r.first_name || ' ' || r.last_name as representative_name, r.email as rep_email
                             FROM Representative r
                             WHERE r.representative_id = %s"""
                rep_data = fetch_raw_query(sql_rep, [user.representative_id])
                rep = rep_data[0] if rep_data else {}
            except Exception as rep_err:
                logger.error(f"Error fetching representative data: {rep_err}")
                rep = {}
            
            # Get active projects with budget info
            sql_projects = """SELECT 
                             p.project_id,
                             p.name as project_name,
                             ps.status_name,
                             NVL(b.initial_amount, 0) as budget_amount,
                             NVL(c.currency_code, 'USD') as currency_code,
                             NVL(SUM(d.amount), 0) as total_received,
                             CASE 
                                 WHEN NVL(b.initial_amount, 0) > 0 
                                 THEN ROUND((NVL(SUM(d.amount), 0) / b.initial_amount) * 100, 2)
                                 ELSE 0
                             END as budget_utilization_percent
                             FROM Project p
                             JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                             LEFT JOIN Budget b ON p.project_id = b.project_id
                             LEFT JOIN Currency c ON b.currency_id = c.currency_id
                             LEFT JOIN Donation d ON p.project_id = d.project_id
                             WHERE p.ong_id = %s AND ps.status_name = 'ACTIVO'
                             GROUP BY p.project_id, p.name, ps.status_name, b.initial_amount, c.currency_code
                             ORDER BY p.name"""
            try:
                active_projects = fetch_raw_query(sql_projects, [ong_id])
            except Exception as proj_err:
                logger.error(f"Error fetching active projects: {proj_err}")
                active_projects = []
            
            # Calculate success rate (completed / total projects)
            try:
                sql_success = """SELECT 
                                COUNT(CASE WHEN ps.status_name = 'COMPLETADO' THEN 1 END) as completed,
                                COUNT(*) as total
                                FROM Project p
                                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                                WHERE p.ong_id = %s"""
                success_data = fetch_raw_query(sql_success, [ong_id])
                success = success_data[0] if success_data else {}
            except Exception as success_err:
                logger.error(f"Error fetching success rate data: {success_err}")
                success = {'completed': 0, 'total': 0}
            def safe_get_success(key):
                val = success.get(key.lower()) or success.get(key.upper()) or success.get(key) or 0
                return int(val) if val else 0
            completed = safe_get_success('completed')
            total = safe_get_success('total')
            success_rate = f"{round((completed / max(total, 1)) * 100, 1)}%" if total > 0 else "0%"
            
            # Helper function to safely get values from dict (handles both lowercase and uppercase keys)
            def safe_get(d, key, default=None):
                """Get value from dict handling both lowercase and uppercase keys"""
                if not d:
                    return default
                return d.get(key.lower()) or d.get(key.upper()) or d.get(key) or default
            
            # Structure response
            response_data = {
                "name": safe_get(ngo, 'name', 'N/A'),
                "city": safe_get(ngo, 'city', 'N/A'),
                "country": safe_get(ngo, 'country', 'N/A'),
                "memberSince": '2024',  # Default value, can be updated later if registration_date exists
                "overview": {
                    "totalProjects": int(safe_get(financial, 'total_projects', 0) or 0),
                    "active": int(safe_get(financial, 'active_budgets', 0) or 0),
                    "totalRaised": float(safe_get(financial, 'total_donations_received', 0) or 0),
                    "successRate": success_rate
                },
                "contact": {
                    "address": safe_get(ngo, 'address', 'N/A'),
                    "phone": safe_get(ngo, 'phone', 'N/A'),
                    "email": safe_get(ngo, 'contact_email') or safe_get(ngo, 'CONTACT_EMAIL') or 'N/A',
                    "representative": safe_get(rep, 'representative_name', 'N/A'),
                    "repEmail": safe_get(rep, 'rep_email') or safe_get(rep, 'REP_EMAIL') or 'N/A'
                },
                "activeProjects": active_projects or []
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching NGO info: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- EMPLOYEE ENDPOINTS ---

class EmployeeProjectManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get supervised projects for the logged-in employee."""
        user = request.user
        if user.user_role != 'EMPLOYEE' or not user.employee_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            employee_id = user.employee_id
            logger.info(f"Fetching supervised projects for employee_id: {employee_id}")
            
            # Get projects that have approvals assigned to this employee
            # Using subquery to get distinct projects and avoid ORA-01791 error
            sql = """
                SELECT 
                    p.project_id as id,
                    p.name,
                    NVL(p.description, 'No description available') as description,
                    TO_CHAR(p.start_date, 'YYYY-MM-DD') as start_date,
                    TO_CHAR(p.end_date, 'YYYY-MM-DD') as end_date,
                    ps.status_name as status,
                    n.name as ong_name,
                    NVL(e.first_name || ' ' || e.last_name, 'N/A') as team_lead,
                    NVL(b.initial_amount, 0) as budget_amount,
                    NVL(c.currency_code, 'USD') as currency_code,
                    NVL((SELECT COUNT(*) FROM Volunteer_Project vp WHERE vp.project_id = p.project_id AND vp.status = 'A'), 0) as volunteer_count,
                    (SELECT MAX(TO_CHAR(TRUNC(r.report_date), 'YYYY-MM-DD')) FROM Report r WHERE r.project_id = p.project_id) as last_report_date,
                    TO_CHAR(TRUNC(a.approval_date), 'YYYY-MM-DD') as last_updated
                FROM Project p
                JOIN NGO n ON p.ong_id = n.ong_id
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                JOIN Approval a ON p.project_id = a.project_id AND a.employee_id = %s
                LEFT JOIN Employee e ON a.employee_id = e.employee_id
                LEFT JOIN Budget b ON p.project_id = b.project_id
                LEFT JOIN Currency c ON b.currency_id = c.currency_id
                WHERE p.project_id IN (
                    SELECT DISTINCT project_id 
                    FROM Approval 
                    WHERE employee_id = %s
                )
                ORDER BY p.start_date DESC
            """
            logger.info(f"Executing SQL query with employee_id: {employee_id}")
            try:
                projects = fetch_raw_query(sql, [employee_id, employee_id])
                logger.info(f"Query executed successfully. Found {len(projects)} projects for employee_id {employee_id}")
                if projects:
                    logger.info(f"First project sample: {projects[0]}")
            except Exception as sql_err:
                logger.error(f"SQL Error in fetch_raw_query: {sql_err}")
                logger.error(f"SQL Query: {sql}")
                logger.error(f"Parameters: {[employee_id]}")
                import traceback
                logger.error(traceback.format_exc())
                raise sql_err
            
            # Format projects for frontend
            formatted_projects = []
            for proj in projects:
                try:
                    # Calculate days since last update
                    last_updated = proj.get('last_updated') or proj.get('start_date')
                    days_ago = "N/A"
                    if last_updated:
                        try:
                            from datetime import datetime
                            last_date = datetime.strptime(str(last_updated), '%Y-%m-%d').date()
                            days_diff = (date.today() - last_date).days
                            if days_diff == 0:
                                days_ago = "Today"
                            elif days_diff == 1:
                                days_ago = "1 day ago"
                            else:
                                days_ago = f"{days_diff} days ago"
                        except Exception as date_err:
                            logger.warning(f"Error parsing date {last_updated}: {date_err}")
                            days_ago = str(last_updated) if last_updated else "N/A"
                    
                    # Format status to lowercase for frontend
                    status_raw = proj.get('status') or 'Unknown'
                    status_lower = str(status_raw).lower()
                    
                    # Format budget amount safely
                    budget_amount = proj.get('budget_amount') or 0
                    try:
                        budget_float = float(budget_amount)
                        total_str = f"{budget_float:,.0f}"
                    except (ValueError, TypeError):
                        total_str = "0"
                    
                    formatted_projects.append({
                        'id': proj.get('id'),
                        'name': proj.get('name', 'Unnamed Project'),
                        'lead': proj.get('team_lead', 'N/A'),
                        'status': status_lower,
                        'end': proj.get('end_date', 'N/A'),
                        'updated': days_ago,
                        'ong': proj.get('ong_name', 'N/A'),
                        'currency': proj.get('currency_code', 'USD'),
                        'total': total_str,
                        'description': proj.get('description', ''),
                        'volunteer_count': int(proj.get('volunteer_count', 0) or 0)
                    })
                except Exception as format_err:
                    logger.error(f"Error formatting project {proj.get('id', 'unknown')}: {format_err}")
                    continue
            
            return Response(formatted_projects, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching employee supervised projects: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        """Update project details (for employees)."""
        data = request.data
        project_id = data.get('project_id')
        try:
            from datetime import datetime
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date() if data.get('start_date') else None
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
            
            with connection.cursor() as cursor:
                cursor.callproc('PKG_PROJECT_MGMT.update_project_details', [
                    project_id,
                    data.get('name'),
                    data.get('description', ''),
                    start_date,
                    end_date,
                    data.get('project_status_id'),
                    data.get('ong_id'),
                    data.get('representative_id')
                ])
            return Response({"message": "Project updated successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating project: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeVolunteerAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get volunteer-project assignments for projects supervised by the employee."""
        user = request.user
        if user.user_role != 'EMPLOYEE' or not user.employee_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        employee_id = user.employee_id
        assignment_type = request.query_params.get('type', 'assignments')  # 'assignments' or 'available'
        
        try:
            if assignment_type == 'assignments':
                # Get actual volunteer-project assignments for projects supervised by this employee
                sql = """
                    SELECT 
                        vp.assignment_id,
                        v.volunteer_id,
                        v.first_name || ' ' || v.last_name as volunteer_name,
                        p.project_id,
                        p.name as project_name,
                        TO_CHAR(TRUNC(vp.assignment_date), 'YYYY-MM-DD') as start_date,
                        TO_CHAR(TRUNC(vp.end_date), 'YYYY-MM-DD') as end_date,
                        vp.status as assignment_status,
                        (SELECT LISTAGG(s2.specialty_name, ', ') WITHIN GROUP (ORDER BY s2.specialty_name)
                         FROM Volunteer_Specialty vs2
                         JOIN Specialty s2 ON vs2.specialty_id = s2.specialty_id
                         WHERE vs2.volunteer_id = v.volunteer_id) as specialties
                    FROM Volunteer_Project vp
                    JOIN Volunteer v ON vp.volunteer_id = v.volunteer_id
                    JOIN Project p ON vp.project_id = p.project_id
                    JOIN Approval a ON p.project_id = a.project_id AND a.employee_id = %s
                    WHERE vp.status = 'A'
                    ORDER BY vp.assignment_date DESC
                """
                assignments = fetch_raw_query(sql, [employee_id])
                return Response(assignments, status=status.HTTP_200_OK)
            else:
                # Get available volunteers with their specialties for assignment
                specialty_id = request.query_params.get('specialty_id')
                if specialty_id:
                    sql = """SELECT v.volunteer_id, v.first_name, v.last_name, v.email, v.phone,
                             s.specialty_name, vs.assignment_date
                             FROM Volunteer v
                             JOIN Volunteer_Specialty vs ON v.volunteer_id = vs.volunteer_id
                             JOIN Specialty s ON vs.specialty_id = s.specialty_id
                             WHERE s.specialty_id = %s
                             ORDER BY v.last_name, v.first_name"""
                    volunteers = fetch_raw_query(sql, [specialty_id])
                else:
                    sql = """SELECT v.volunteer_id, v.first_name, v.last_name, v.email, v.phone,
                             LISTAGG(s.specialty_name, ', ') WITHIN GROUP (ORDER BY s.specialty_name) as specialties
                             FROM Volunteer v
                             LEFT JOIN Volunteer_Specialty vs ON v.volunteer_id = vs.volunteer_id
                             LEFT JOIN Specialty s ON vs.specialty_id = s.specialty_id
                             GROUP BY v.volunteer_id, v.first_name, v.last_name, v.email, v.phone
                             ORDER BY v.last_name, v.first_name"""
                    volunteers = fetch_raw_query(sql)
                return Response(volunteers, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching volunteer assignments: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Assign volunteer to project (for employees)."""
        user = request.user
        if user.user_role != 'EMPLOYEE' or not user.employee_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        project_id = data.get('project_id')
        volunteer_id = data.get('volunteer_id')
        
        if not project_id or not volunteer_id:
            return Response({"error": "project_id and volunteer_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify that the employee supervises this project
        try:
            check_sql = """
                SELECT COUNT(*) as cnt
                FROM Approval a
                WHERE a.project_id = %s AND a.employee_id = %s
            """
            check_result = fetch_raw_query(check_sql, [project_id, user.employee_id])
            if not check_result or check_result[0].get('cnt', 0) == 0:
                return Response({"error": "You can only assign volunteers to projects you supervise"}, status=status.HTTP_403_FORBIDDEN)
            
            with connection.cursor() as cursor:
                native_conn = connection.connection
                native_cursor = native_conn.cursor()
                out_id = native_cursor.var(oracledb.NUMBER)
                
                native_cursor.callproc('PKG_WORKFORCE.assign_volunteer_to_project', [
                    int(project_id),
                    int(volunteer_id),
                    out_id
                ])
                native_cursor.close()
                return Response({"message": "Volunteer assigned successfully", "assignment_id": out_id.getvalue()}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error assigning volunteer: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, assignment_id=None):
        """Remove volunteer from project (for employees)."""
        user = request.user
        if user.user_role != 'EMPLOYEE' or not user.employee_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        assignment_id = request.data.get('assignment_id') or assignment_id
        if not assignment_id:
            return Response({"error": "assignment_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify that the employee supervises the project for this assignment
            check_sql = """
                SELECT vp.project_id
                FROM Volunteer_Project vp
                JOIN Approval a ON vp.project_id = a.project_id AND a.employee_id = %s
                WHERE vp.assignment_id = %s
            """
            check_result = fetch_raw_query(check_sql, [user.employee_id, assignment_id])
            if not check_result:
                return Response({"error": "Assignment not found or you don't supervise this project"}, status=status.HTTP_404_NOT_FOUND)
            
            # Update assignment status to 'I' (Inactive) and set end_date
            update_sql = """
                UPDATE Volunteer_Project 
                SET status = 'I', end_date = SYSTIMESTAMP
                WHERE assignment_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(update_sql, [assignment_id])
            
            return Response({"message": "Volunteer removed successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error removing volunteer: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- PROJECT STATUS ENDPOINT ---

class ProjectStatusListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all project statuses."""
        try:
            sql = "SELECT project_status_id as id, status_name as name FROM Project_Status ORDER BY project_status_id"
            statuses = fetch_raw_query(sql)
            return Response(statuses, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching project statuses: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
