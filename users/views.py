import logging
from decimal import Decimal
from datetime import date, datetime 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from rest_framework import status
# Import native Oracle driver types for OUT parameters
try:
    import oracledb
    ORACLE_NUMBER = oracledb.NUMBER
except ImportError:
    ORACLE_NUMBER = int 

logger = logging.getLogger(__name__)

# Helper function to convert Oracle cursor rows to Python dictionaries
def dictfetchall(cursor):
    "Return all rows from a cursor as a dict with lowercase keys"
    columns = [col[0].lower() for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

# Helper function to execute a PIPELINED function
def fetch_pipelined_function(function_name):
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT * FROM TABLE({function_name}())")
            return dictfetchall(cursor)
        except Exception as e:
            logger.error(f"Error executing pipelined function {function_name}: {e}")
            return []

# Helper function to execute a stored procedure that returns a SYS_REFCURSOR
# The procedure call logic is simplified to handle only IN parameters and the Ref Cursor OUT.
def fetch_procedure_cursor(procedure_call, params=None, out_args_count=0):
    """Executes a procedure and handles the Ref Cursor. Ignores OUT params (p_total_count) for simplicity."""
    with connection.cursor() as cursor:
        try:
            # Prepare Ref Cursor (We use cursor.connection.cursor() as the standard for Ref Cursor)
            ref_cursor = cursor.connection.cursor()
            
            # Build Arguments (only IN parameters and the Ref Cursor)
            args = []
            if params: args.extend(params)
            
            # The Ref Cursor is the only OUT argument for the procedures used here
            args.append(ref_cursor) 
            
            # Call the procedure
            cursor.callproc(procedure_call, args)
            
            # Extract data from the Ref Cursor
            data = dictfetchall(ref_cursor)
            ref_cursor.close()
            
            # Returns data and None (since total_count is no longer fetched here)
            return data, None 

        except Exception as e:
            # Log the error but return empty data to prevent 500 error propagation
            logger.error(f"Error executing procedure {procedure_call}: {e}")
            return [], None 

class AdminDashboardData(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Fetch Main KPIs 
        kpis_raw = fetch_pipelined_function('PKG_DASHBOARD_ANALYTICS.get_main_kpis')
        kpi_map = {}

        for kpi in kpis_raw:
            trend_symbol = ''
            if kpi['trend'] == 'UP': trend_symbol = '+'
            elif kpi['trend'] == 'DOWN': trend_symbol = '-'
            else: trend_symbol = '='

            formatted_trend = f"{trend_symbol}{abs(kpi['percentage_change'])}% vs mes anterior"
            value_str = str(kpi['current_value'])
            
            if 'DONATIONS' in kpi['metric_name']: value_str = f"{Decimal(kpi['current_value']):,.0f}" 

            kpi_map[kpi['metric_name']] = {
                'value': value_str,
                'trend': formatted_trend if kpi['trend'] != 'STABLE' else f"={abs(kpi['percentage_change'])}% Sin cambios",
            }
        
        # 2. Fetch Active Projects Table (PAGINATED DATA)
        # Call uses out_args_count=0 as the total count procedure is removed.
        projects_raw, _ = fetch_procedure_cursor(
            'PKG_DASHBOARD_ANALYTICS.get_projects_paginated', 
            [1, 10, 'ACTIVO', None],
            out_args_count=0 
        )

        projects_table_data = []
        for project in projects_raw:
            end_date = project.get('end_date') 
            progress_label = "Fecha no disponible"
            
            # Date normalization and calculation
            if end_date:
                if isinstance(end_date, datetime):
                    end_date = end_date.date()
                
                if isinstance(end_date, date):
                    days_left = (end_date - date.today()).days
                    
                    if days_left > 0:
                        progress_label = f"{days_left} días restantes"
                    elif days_left == 0:
                        progress_label = "Hoy vence"
                    else:
                        progress_label = "Finalizado"
            
            projects_table_data.append({
                'id': project['project_id'], 
                'project': project['name'],  
                'ngo': project['ngo_name'],  
                'state': project['status_name'],
                'progressLabel': progress_label,
            })

        # 3. Get Total Project Count (Calculate directly from the list length)
        # This solves the DPY-3002 error permanently by avoiding the OUT NUMBER variable.
        total_count = len(projects_table_data) 

        # 4. Fetch Donation Trends (Area Chart)
        donation_trends_raw, _ = fetch_procedure_cursor('PKG_DASHBOARD_ANALYTICS.get_donation_trends', [date.today().year], out_args_count=0) 
        donation_trends = [
            {'name': row['mes_nombre'][:3], 'value': row['monto_total']}
            for row in donation_trends_raw
        ]
        
        # 5. Fetch Project Status Distribution (Pie Chart)
        project_status_pie_raw, _ = fetch_procedure_cursor('PKG_DASHBOARD_ANALYTICS.get_project_status_distribution', out_args_count=0)
        project_status_pie = [
            {'name': row['status_name'], 'value': row['cantidad']}
            for row in project_status_pie_raw
        ]

        # 6. Build final JSON response
        response_data = {
            "active_projects": kpi_map.get('ACTIVE_PROJECTS', {'value': '0', 'trend': '=0% Sin cambios'}),
            "monthly_donations": kpi_map.get('MONTHLY_DONATIONS', {'value': '0', 'trend': '=0% Sin cambios'}),
            "active_volunteers": kpi_map.get('ACTIVE_VOLUNTEERS', {'value': '0', 'trend': '=0% Sin cambios'}),
            "registered_ngos": kpi_map.get('TOTAL_NGOS', {'value': '0', 'trend': '=0% Sin cambios'}),
            "donation_trends": donation_trends,
            "project_status_pie": project_status_pie,
            "active_projects_table": projects_table_data,
            "total_project_count": total_count # Now using list length
        }

        return Response(response_data, status=status.HTTP_200_OK)