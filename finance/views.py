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

    finally:
        # Cerramos el cursor nativo para no dejar fugas
        native_cursor.close()

# ==============================================================================
#  MÓDULO 1: GESTIÓN FINANCIERA (PKG_FINANCE_CORE)
# ==============================================================================

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
                SELECT d.donor_id, d.name, d.email, d.phone, dt.type_name, 
                       CASE WHEN d.email IS NULL THEN 'Inactive' ELSE 'Active' END as status 
                FROM Donor d
                JOIN Donor_Type dt ON d.type_id = dt.type_id
                ORDER BY d.donor_id DESC
            """
            data = fetch_raw_query(query)
            return Response(data, status=200)
        except Exception as e:
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
        """Listar historial de donaciones."""
        try:
            # Query nativa uniendo tablas para obtener nombres
            query = """
                SELECT 
                    dn.donation_id, 
                    dn.amount, 
                    dn.donation_date,
                    d.name as donor_name,
                    p.name as project_name,
                    c.symbol as currency
                FROM Donation dn
                JOIN Donor d ON dn.donor_id = d.donor_id
                JOIN Project p ON dn.project_id = p.project_id
                JOIN Currency c ON dn.currency_id = c.currency_id
                ORDER BY dn.donation_date DESC
            """
            data = fetch_raw_query(query)
            return Response(data, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class BudgetManagementView(APIView):
    permission_classes = [IsAuthenticated]

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
            return Response({'error': str(e)}, status=500)

    def put(self, request):
        try:
            # Update no tiene parámetros de salida (out_param_index=None)
            execute_procedure_native(
                'PKG_FINANCE_CORE.update_budget',
                [
                    request.data.get('budget_id'),
                    request.data.get('amount'),
                    request.data.get('project_id'),
                    request.data.get('currency_id')
                ]
            )
            return Response({'message': 'Presupuesto actualizado'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def get(self, request):
        """Obtener estado del presupuesto por proyecto"""
        project_id = request.query_params.get('project_id')
        
        try:
            if project_id:
                # Datos específicos de un proyecto
                sql = """
                    SELECT * FROM vw_project_budget_status 
                    WHERE project_id = %s
                """
                data = fetch_raw_query(sql, [project_id])
            else:
                # Lista general para selectores
                sql = "SELECT project_id, project_name FROM vw_project_budget_status"
                data = fetch_raw_query(sql)
                
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
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