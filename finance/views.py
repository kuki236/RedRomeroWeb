import logging
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import connection
import oracledb

logger = logging.getLogger(__name__)

# --- UTILS ---
def fetch_raw_query(query, params=None):
    """Para consultas SELECT simples usamos el cursor normal de Django."""
    with connection.cursor() as cursor:
        cursor.execute(query, params if params else [])
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

def execute_procedure_native(proc_name, params, out_param_index=None, out_param_type=oracledb.NUMBER):
    """
    Ejecuta un procedimiento almacenado usando un cursor 100% nativo de Oracle
    para evitar conflictos de tipos con Django (DPY-3002).
    """
    # 1. Aseguramos que Django haya abierto la conexión
    if connection.connection is None:
        connection.connect()
        
    # 2. Obtenemos la conexión cruda (Raw Connection)
    native_conn = connection.connection
    
    # 3. Creamos un cursor nativo nuevo
    native_cursor = native_conn.cursor()
    
    try:
        # Preparar argumentos
        final_params = list(params)
        out_var = None

        # Si hay un parámetro de salida, lo creamos con el cursor nativo
        if out_param_index is not None:
            out_var = native_cursor.var(out_param_type)
            # Insertamos la variable en la posición correcta (o al final si index es -1)
            if out_param_index == -1:
                final_params.append(out_var)
            else:
                final_params.insert(out_param_index, out_var)

        # Ejecutar
        native_cursor.callproc(proc_name, final_params)
        
        # Retornar valor si existe
        if out_var:
            return out_var.getvalue()
        return None
    
    except Exception as e:
        # Si algo falla, hacemos rollback por seguridad
        try: native_conn.rollback() 
        except: pass
        raise e # Re-lanzamos el error para que lo capture la vista

    finally:
        # Cerramos el cursor nativo para no dejar fugas
        native_cursor.close()

# ==============================================================================
#  MÓDULO 1: GESTIÓN FINANCIERA (PKG_FINANCE_CORE)
# ==============================================================================

# para consultar la tabla Donor_Type.
class DonorTypesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener lista de tipos de donantes para dropdowns"""
        try:
            sql = "SELECT type_id, type_name as name FROM Donor_Type ORDER BY type_id ASC"
            data = fetch_raw_query(sql)
            return Response(data, status=200)
        except Exception as e:
            logger.error(f"Error fetching donor types: {e}")
            return Response({'error': str(e)}, status=500)
        

class DonorManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # OUT parameter es el último (-1)
            new_id = execute_procedure_native(
                'PKG_FINANCE_CORE.register_donor',
                [
                    request.data.get('name'),
                    request.data.get('email'),
                    request.data.get('phone'),
                    request.data.get('type_id')
                ],
                out_param_index=-1
            )
            
            return Response({
                'message': 'Donante registrado exitosamente',
                'donor_id': new_id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error registering donor: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        """Listar todos los donantes."""
        try:
            # Puedes usar una vista de Oracle si la tienes, o query directa
            query = """
                SELECT d.donor_id, d.name, d.email, d.phone, d.type_id, dt.type_name, 
                       CASE WHEN d.email IS NULL THEN 'Inactive' ELSE 'Active' END as status 
                FROM Donor d
                JOIN Donor_Type dt ON d.type_id = dt.type_id
                ORDER BY d.donor_id DESC
            """
            data = fetch_raw_query(query)
            return Response(data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    def put(self, request):
        try:
            execute_procedure_native(
                'PKG_FINANCE_CORE.update_donor',
                [
                    request.data.get('donor_id'),
                    request.data.get('name'),
                    request.data.get('email'),
                    request.data.get('phone'),
                    request.data.get('type_id')
                ]
            )
            return Response({'message': 'Donante actualizado correctamente'}, status=200)
        except Exception as e:
            logger.error(f"Error updating donor: {e}")
            return Response({'error': str(e)}, status=500)

class DonationTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # OUT parameter es el último (-1)
            new_id = execute_procedure_native(
                'PKG_FINANCE_CORE.register_donation',
                [
                    request.data.get('date', datetime.now().date()),
                    request.data.get('amount'),
                    request.data.get('project_id'),
                    request.data.get('currency_id'),
                    request.data.get('donor_id')
                ],
                out_param_index=-1
            )

            return Response({
                'message': 'Donación registrada correctamente',
                'donation_id': new_id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error registering donation: {e}")
            return Response({'error': str(e)}, status=500)
    
    def get(self, request):
        """Listar historial de donaciones. Filtra por ONG si el usuario es representante."""
        try:
            user = request.user
            # Query nativa uniendo tablas para obtener nombres
            query = """
                SELECT 
                    dn.donation_id, 
                    dn.amount, 
                    dn.donation_date,
                    d.name as donor_name,
                    p.name as project_name,
                    p.project_id,
                    c.symbol as currency,
                    c.currency_code
                FROM Donation dn
                JOIN Donor d ON dn.donor_id = d.donor_id
                JOIN Project p ON dn.project_id = p.project_id
                JOIN Currency c ON dn.currency_id = c.currency_id
            """
            params = []
            
            # Si el usuario es representante, filtrar por su ONG
            if user.user_role == 'REPRESENTATIVE' and user.representative_id:
                query += """
                    JOIN Representative r ON p.representative_id = r.representative_id
                    WHERE r.representative_id = %s
                """
                params.append(user.representative_id)
            
            query += " ORDER BY dn.donation_date DESC"
            
            data = fetch_raw_query(query, params if params else None)
            return Response(data, status=200)
        except Exception as e:
            logger.error(f"Error fetching donations: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({'error': str(e)}, status=500)

class BudgetManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get('project_id')
        try:
            if project_id:
                # Usamos la vista SQL que creamos
                sql = "SELECT * FROM vw_project_budget_status WHERE project_id = %s"
                data = fetch_raw_query(sql, [project_id])
            else:
                sql = "SELECT DISTINCT project_id, project_name FROM vw_project_budget_status ORDER BY project_name"
                data = fetch_raw_query(sql)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def post(self, request):
        try:
            new_id = execute_procedure_native(
                'PKG_FINANCE_CORE.create_budget',
                [
                    request.data.get('amount'),
                    request.data.get('description'),
                    request.data.get('project_id'),
                    request.data.get('currency_id')
                ],
                out_param_index=-1
            )
            return Response({'budget_id': new_id}, status=201)
        except Exception as e:
            logger.error(f"Error creating budget: {e}")
            return Response({'error': str(e)}, status=500)

    def put(self, request):
        try:
            # Validar que lleguen los datos necesarios
            b_id = request.data.get('budget_id')
            if not b_id:
                return Response({'error': 'Budget ID is required for update'}, status=400)

            execute_procedure_native(
                'PKG_FINANCE_CORE.update_budget',
                [
                    b_id,
                    request.data.get('amount'),
                    request.data.get('project_id'),
                    request.data.get('currency_id')
                ]
            )
            return Response({'message': 'Presupuesto actualizado'}, status=200)
        except Exception as e:
            logger.error(f"Error updating budget: {e}")
            return Response({'error': str(e)}, status=500)

# ==============================================================================
#  MÓDULO 2: WORKFLOW Y APROBACIONES (PKG_PROJECT_MGMT)
# ==============================================================================

class ApprovalWorkflowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            new_id = execute_procedure_native(
                'PKG_PROJECT_MGMT.create_approval',
                [
                    datetime.now().date(),
                    request.data.get('status_id', 1),
                    request.data.get('employee_id'),
                    request.data.get('project_id')
                ],
                out_param_index=-1
            )
            return Response({'approval_request_id': new_id}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def put(self, request):
        try:
            execute_procedure_native(
                'PKG_PROJECT_MGMT.process_approval',
                [
                    request.data.get('approval_id'),
                    request.data.get('decision'),
                    request.data.get('employee_id')
                ]
            )
            return Response({'message': 'Solicitud procesada'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ProjectReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            new_id = execute_procedure_native(
                'PKG_PROJECT_MGMT.create_report',
                [
                    request.data.get('project_id'),
                    datetime.now().date(),
                    request.data.get('title'),
                    request.data.get('description'),
                    request.data.get('file_url', '')
                ],
                out_param_index=-1
            )
            return Response({'report_id': new_id}, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def get(self, request):
        """Listar reportes de proyectos con JOIN a la tabla de proyectos. Filtra por ONG si el usuario es representante."""
        try:
            user = request.user
            # Usamos alias (AS) para evitar confusiones con los nombres de columnas
            # TO_CHAR convierte la fecha de Oracle a string directo para el JSON
            query = """
                SELECT 
                    r.report_id, 
                    r.title,
                    r.description, 
                    p.name as project_name,
                    p.project_id,
                    TO_CHAR(r.report_date, 'YYYY-MM-DD') as date_str
                FROM Report r
                JOIN Project p ON r.project_id = p.project_id
            """
            params = []
            
            # Si el usuario es representante, filtrar por su ONG
            if user.user_role == 'REPRESENTATIVE' and user.representative_id:
                query += """
                    JOIN Representative rep ON p.representative_id = rep.representative_id
                    WHERE rep.representative_id = %s
                """
                params.append(user.representative_id)
            
            query += " ORDER BY r.report_date DESC"
            
            # Ejecutamos la consulta cruda
            # fetch_raw_query devuelve una lista de diccionarios con claves en minúsculas
            raw_data = fetch_raw_query(query, params if params else None)
            
            # Formateamos la respuesta para que coincida EXACTAMENTE con lo que espera React
            response_data = []
            for row in raw_data:
                response_data.append({
                    "id": row.get('report_id'),      # Coincide con r.report_id
                    "title": row.get('title'),       # Coincide con r.title
                    "project": row.get('project_name'), # Coincide con p.name as project_name
                    "description": row.get('description'),
                    "date": row.get('date_str'),     # Coincide con as date_str
                    "status": "Approved"             # Valor quemado (hardcoded) ya que la tabla no tiene status
                })

            return Response(response_data, status=200)
        except Exception as e:
            logger.error(f"Error fetching reports: {e}")
            return Response({'error': str(e)}, status=500)

# ==============================================================================
#  MÓDULO 3: AUDITORÍA Y KPIS
# ==============================================================================

class AuditLogsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        log_type = request.query_params.get('type') 
        query_map = {
            'approvals': "SELECT * FROM vw_approval_workflow_status ORDER BY approval_date DESC",
            'projects': "SELECT * FROM vw_project_status_transitions ORDER BY change_date DESC",
            'finance': "SELECT * FROM vw_ngo_financial_overview"
        }
        
        if log_type not in query_map:
            return Response({'error': 'Invalid type'}, status=400)

        try:
            data = fetch_raw_query(query_map[log_type])
            return Response(data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class FinancialKPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = fetch_raw_query("SELECT * FROM vw_ngo_financial_overview")
            return Response(data[0] if data else {}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        



# =================
class SystemConfigView(APIView):
    """
    Vista Maestra para la pantalla ConfigurationSettings.jsx.
    Maneja múltiples tipos de configuración (Monedas, Tipos de Donante, etc.) 
    basándose en el parámetro 'type'.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config_type = request.query_params.get('type')
        try:
            data = []
            if config_type == 'currencies':
                # Mapeamos columnas para que coincidan con lo que espera el Frontend (id, name, code, etc.)
                sql = """
                    SELECT currency_id as id, currency_name as name, 
                           currency_code as code, symbol, exchange_rate_to_usd as rate 
                    FROM Currency ORDER BY currency_id ASC
                """
                data = fetch_raw_query(sql)
            
            elif config_type == 'donorTypes':
                sql = """
                    SELECT type_id as id, type_name as name, description 
                    FROM Donor_Type ORDER BY type_id ASC
                """
                data = fetch_raw_query(sql)
            
            # Aquí puedes agregar más 'elif' para Categories, Specialties, etc. cuando tengas las tablas.
            
            return Response(data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def post(self, request):
        config_type = request.data.get('type')
        try:
            if config_type == 'currencies':
                # 1. Crear la moneda
                new_id = execute_procedure_native(
                    'PKG_FINANCE_CORE.create_currency',
                    [
                        request.data.get('name'),
                        request.data.get('code'),
                        request.data.get('symbol')
                    ],
                    out_param_index=-1
                )
                
                # 2. Si viene una tasa (rate), la actualizamos inmediatamente
                rate = request.data.get('rate')
                if rate:
                    execute_procedure_native(
                        'PKG_FINANCE_CORE.update_currency_rate',
                        [
                            request.data.get('code'),
                            float(rate)
                        ]
                    )
                return Response({'message': 'Currency created', 'id': new_id}, status=201)

            elif config_type == 'donorTypes':
                new_id = execute_procedure_native(
                    'PKG_FINANCE_CORE.create_donor_type',
                    [
                        request.data.get('name'),
                        request.data.get('description')
                    ],
                    out_param_index=-1
                )
                return Response({'message': 'Donor Type created', 'id': new_id}, status=201)

            return Response({'error': 'Invalid configuration type'}, status=400)

        except Exception as e:
            logger.error(f"Error saving config {config_type}: {e}")
            return Response({'error': str(e)}, status=500)

    def delete(self, request):
        config_type = request.query_params.get('type')
        item_id = request.query_params.get('id')
        
        try:
            # Usamos SQL directo para eliminar ya que no siempre hay SPs de borrado para configs
            if config_type == 'currencies':
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM Currency WHERE currency_id = %s", [item_id])
            
            elif config_type == 'donorTypes':
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM Donor_Type WHERE type_id = %s", [item_id])
            
            else:
                return Response({'error': 'Delete not supported for this type'}, status=400)

            return Response({'message': 'Item deleted'}, status=200)
        except Exception as e:
            # Capturar error de integridad (ej: borrar moneda usada en donaciones)
            if 'ORA-02292' in str(e):
                return Response({'error': 'Cannot delete: Item is in use.'}, status=400)
            return Response({'error': str(e)}, status=500)
        
class ReportsAnalyticsView(APIView):
    """
    Vista para reportes financieros y analíticas del dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type')
        
        try:
            data = []
            if report_type == 'budget_status':
                # Estado del presupuesto para el Dashboard
                sql = """
                    SELECT project_name, budget_amount, total_received, 
                           remaining_budget, budget_utilization_percent, currency_code
                    FROM vw_project_budget_status
                    ORDER BY budget_utilization_percent DESC
                """
                data = fetch_raw_query(sql)

            elif report_type == 'donor_ranking':
                # Ranking de donantes
                sql = """
                    SELECT donor_name, donor_type, total_amount_donated, 
                           total_donations, average_donation_amount, currency_code
                    FROM vw_donor_contributions_ranking
                    WHERE ROWNUM <= 10
                """
                data = fetch_raw_query(sql)

            elif report_type == 'currency_trends':
                # Tendencias por moneda
                sql = """
                    SELECT currency_code, total_donations_local, donation_count
                    FROM vw_donation_trends_by_currency
                """
                data = fetch_raw_query(sql)
            
            else:
                # Si no se envía tipo, devolvemos un resumen general (opcional)
                return Response({'error': 'Invalid report type'}, status=400)

            return Response(data, status=200)

        except Exception as e:
            logger.error(f"Error in ReportsAnalyticsView: {e}")
            return Response({'error': str(e)}, status=500)
        
class RepresentativeNGOView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Validaciones de seguridad
        if user.user_role != 'REPRESENTATIVE':
             return Response({'error': 'Role mismatch'}, 403)
        if not user.representative_id:
             return Response({'error': 'User has no representative_id linked'}, 404)

        try:
            with connection.cursor() as cursor:
                # 1. Obtener ID de la ONG
                cursor.execute("SELECT ong_id FROM Representative WHERE representative_id = %s", [user.representative_id])
                row = cursor.fetchone()
                if not row or not row[0]:
                    return Response({'error': 'Representative is not linked to any NGO'}, 404)
                ong_id = row[0]

            # 2. Datos Generales
            # CORRECCIÓN: Se eliminaron las columnas 'address', 'phone' y 'registration_date' de la consulta
            # porque no existen en tu tabla NGO actual.
            sql_ngo = """
                SELECT n.name, n.city, n.country, n.contact_email,
                       r.first_name || ' ' || r.last_name as rep_name, r.email as rep_email
                FROM NGO n
                JOIN Representative r ON n.ong_id = r.ong_id
                WHERE n.ong_id = %s AND r.representative_id = %s
            """
            ngo_data = fetch_raw_query(sql_ngo, [ong_id, user.representative_id])
            if not ngo_data: return Response({'error': 'NGO data not found'}, 404)
            ngo_info = ngo_data[0]

            # 3. Resumen Financiero
            sql_overview = """
                SELECT total_projects, active_budgets, total_donations_received, total_remaining_budget
                FROM vw_ngo_financial_overview WHERE ong_id = %s
            """
            overview_data = fetch_raw_query(sql_overview, [ong_id])
            overview = overview_data[0] if overview_data else {
                'total_projects': 0, 'active_budgets': 0, 'total_donations_received': 0, 'total_remaining_budget': 0
            }

            # 4. Proyectos
            sql_projects = """
                SELECT v.project_id, v.project_name, 
                       v.budget_amount, v.total_received, v.currency_code,
                       v.budget_utilization_percent, ps.status_name
                FROM vw_project_budget_status v
                JOIN Project p ON v.project_id = p.project_id
                JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
                WHERE p.ong_id = %s
            """
            projects = fetch_raw_query(sql_projects, [ong_id])

            # Construir respuesta con valores por defecto para los datos faltantes en BD
            response = {
                "name": ngo_info['name'],
                "city": ngo_info['city'] or 'Unknown',
                "country": ngo_info['country'],
                "memberSince": "N/A",  # No existe en BD, enviamos valor genérico
                "overview": {
                    "totalProjects": overview['total_projects'],
                    "active": overview['active_budgets'],
                    "completed": 0, 
                    "totalRaised": overview['total_donations_received'],
                    "successRate": "100%" 
                },
                "contact": {
                    "address": "Not registered", # No existe en BD
                    "phone": "Not registered",   # No existe en BD
                    "email": ngo_info['contact_email'],
                    "representative": ngo_info['rep_name'],
                    "repEmail": ngo_info['rep_email']
                },
                "activeProjects": projects
            }

            return Response(response, status=200)

        except Exception as e:
            logger.error(f"Error fetching My NGO data: {e}")
            return Response({'error': str(e)}, status=500)
        

    # --- MÉTODO POST EXISTENTE (Crear Reporte) ---
    def post(self, request):
        try:
            new_id = execute_procedure_native(
                'PKG_PROJECT_MGMT.create_report', 
                [
                    request.data.get('project_id'), 
                    datetime.now().date(), 
                    request.data.get('title'), 
                    request.data.get('description'), 
                    request.data.get('file_url', '')
                ], 
                out_param_index=-1
            )
            return Response({'id': new_id}, status=201)
        except Exception as e: 
            return Response({'error': str(e)}, status=500)