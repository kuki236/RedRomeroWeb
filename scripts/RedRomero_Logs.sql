-- =============================================================================
-- PURPOSE: Centralized Triggers for Audit Logging, Data Validation & Integrity
-- =============================================================================

-- =============================================================================
-- SECTION 1: AUDIT LOGGING (Reactive - Recording History)
-- =============================================================================

-- 1.1. Audit Approval Status Changes
CREATE OR REPLACE TRIGGER trg_approval_status_audit
AFTER UPDATE OF approval_status_id ON Approval
FOR EACH ROW
WHEN (OLD.approval_status_id <> NEW.approval_status_id)
BEGIN
    INSERT INTO Approval_History (
        approval_id,
        previous_status,
        new_status,
        change_date,
        employee_id,
        comments
    ) VALUES (
        :NEW.approval_id,
        (SELECT status_name FROM Approval_Status WHERE approval_status_id = :OLD.approval_status_id),
        (SELECT status_name FROM Approval_Status WHERE approval_status_id = :NEW.approval_status_id),
        SYSTIMESTAMP,
        :NEW.employee_id,
        'Automatic audit: status changed'
    );
END;
/

-- 1.2. Audit Donation Transactions
CREATE OR REPLACE TRIGGER trg_donation_audit
AFTER UPDATE OF amount, currency_id ON Donation
FOR EACH ROW
DECLARE
    v_user_id NUMBER;
    v_ip VARCHAR2(45);
BEGIN
    v_user_id := NVL(TO_NUMBER(sys_context('USERENV', 'CLIENT_IDENTIFIER')), 0);
    v_ip := sys_context('USERENV', 'IP_ADDRESS');

    INSERT INTO Donation_Transaction_Log (
        donation_id,
        action_type,
        old_amount,
        new_amount,
        old_currency_id,
        new_currency_id,
        change_date,
        changed_by_user_id,
        ip_address,
        reason
    ) VALUES (
        :NEW.donation_id,
        'UPDATE',
        :OLD.amount,
        :NEW.amount,
        :OLD.currency_id,
        :NEW.currency_id,
        SYSTIMESTAMP,
        v_user_id,
        v_ip,
        'Donation details updated by user'
    );
EXCEPTION WHEN OTHERS THEN NULL; -- Fail-safe
END;
/

-- =============================================================================
-- SECTION 2: BUSINESS RULES & DATA INTEGRITY (Preventive)
-- =============================================================================

-- 2.1. Budget Date Validation
CREATE OR REPLACE TRIGGER trg_budget_date_validation
BEFORE INSERT OR UPDATE ON Budget
FOR EACH ROW
DECLARE
  v_project_start DATE;
  v_project_end DATE;
BEGIN
  SELECT start_date, end_date INTO v_project_start, v_project_end
  FROM Project WHERE project_id = :NEW.project_id;

  IF :NEW.creation_date < v_project_start THEN
    RAISE_APPLICATION_ERROR(-20801, 'Budget creation date cannot be before project start date');
  END IF;

  IF v_project_end IS NOT NULL AND :NEW.creation_date > v_project_end THEN
    RAISE_APPLICATION_ERROR(-20802, 'Budget creation date cannot be after project end date');
  END IF;
END;
/

-- 2.2. Donation Status Check
CREATE OR REPLACE TRIGGER trg_donation_project_status_check
BEFORE INSERT ON Donation
FOR EACH ROW
DECLARE
  v_status VARCHAR2(50);
BEGIN
  SELECT ps.status_name INTO v_status
  FROM Project p
  JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
  WHERE p.project_id = :NEW.project_id;

  IF v_status IN ('COMPLETADO', 'CANCELADO') THEN
    RAISE_APPLICATION_ERROR(-20803, 'Cannot accept donations to ' || v_status || ' projects');
  END IF;
END;
/

-- 2.3. Volunteer Assignment Check (Only active/planning projects)
CREATE OR REPLACE TRIGGER trg_volunteer_assignment_validation
BEFORE INSERT ON Volunteer_Project
FOR EACH ROW
DECLARE
  v_status VARCHAR2(50);
BEGIN
  SELECT ps.status_name INTO v_status
  FROM Project p
  JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
  WHERE p.project_id = :NEW.project_id;

  IF v_status NOT IN ('ACTIVO', 'PLANIFICACION') THEN
    RAISE_APPLICATION_ERROR(-20804, 'Cannot assign volunteers to ' || v_status || ' projects');
  END IF;
END;
/

-- 2.4. Prevent Duplicate Specialties
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_specialty
BEFORE INSERT ON Volunteer_Specialty
FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM Volunteer_Specialty
  WHERE volunteer_id = :NEW.volunteer_id AND specialty_id = :NEW.specialty_id;

  IF v_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20805, 'Volunteer already has this specialty assigned');
  END IF;
END;
/

-- 2.5. Approval Integrity Check
CREATE OR REPLACE TRIGGER trg_approval_project_validation
BEFORE INSERT ON Approval
FOR EACH ROW
DECLARE
  v_project_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_project_count FROM Project WHERE project_id = :NEW.project_id;
  IF v_project_count = 0 THEN
    RAISE_APPLICATION_ERROR(-20806, 'Cannot create approval for non-existent project');
  END IF;
END;
/

-- 2.6. Donation Date Check
CREATE OR REPLACE TRIGGER trg_donation_date_validation
BEFORE INSERT OR UPDATE ON Donation
FOR EACH ROW
DECLARE
  v_project_start DATE;
BEGIN
  SELECT start_date INTO v_project_start FROM Project WHERE project_id = :NEW.project_id;
  IF :NEW.donation_date < v_project_start THEN
    RAISE_APPLICATION_ERROR(-20807, 'Donation date cannot be before project start date');
  END IF;
END;
/

-- 2.7. Prevent Duplicate Active Volunteer Assignments
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_assignment
BEFORE INSERT ON Volunteer_Project
FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  -- Only check if the new assignment is trying to be Active ('A')
  IF :NEW.status = 'A' THEN 
      SELECT COUNT(*) INTO v_count
      FROM Volunteer_Project
      WHERE volunteer_id = :NEW.volunteer_id
      AND project_id = :NEW.project_id
      AND status = 'A'; -- Check against existing Active assignments

      IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20808, 'Volunteer is already actively assigned to this project');
      END IF;
  END IF;
END;
/

-- 2.8. Currency Rate Validation
CREATE OR REPLACE TRIGGER trg_currency_rate_validation
BEFORE INSERT OR UPDATE ON Currency
FOR EACH ROW
BEGIN
  IF :NEW.exchange_rate_to_usd <= 0 THEN
    RAISE_APPLICATION_ERROR(-20809, 'Exchange rate must be a positive number');
  END IF;
END;
/

-- 2.9. System User Role Consistency
CREATE OR REPLACE TRIGGER trg_system_user_role_validation
BEFORE INSERT OR UPDATE ON System_User
FOR EACH ROW
DECLARE
  v_exists NUMBER;
BEGIN
  IF :NEW.user_role = 'EMPLOYEE' THEN
    IF :NEW.employee_id IS NULL THEN RAISE_APPLICATION_ERROR(-20811, 'EMPLOYEE role requires employee_id'); END IF;
    -- Optional: Verify ID exists in Employee table
    SELECT COUNT(*) INTO v_exists FROM Employee WHERE employee_id = :NEW.employee_id;
    IF v_exists = 0 THEN RAISE_APPLICATION_ERROR(-20811, 'Referenced employee does not exist'); END IF;
    
  ELSIF :NEW.user_role = 'VOLUNTEER' THEN
    IF :NEW.volunteer_id IS NULL THEN RAISE_APPLICATION_ERROR(-20812, 'VOLUNTEER role requires volunteer_id'); END IF;
    SELECT COUNT(*) INTO v_exists FROM Volunteer WHERE volunteer_id = :NEW.volunteer_id;
    IF v_exists = 0 THEN RAISE_APPLICATION_ERROR(-20812, 'Referenced volunteer does not exist'); END IF;

  ELSIF :NEW.user_role = 'REPRESENTATIVE' THEN
    IF :NEW.representative_id IS NULL THEN RAISE_APPLICATION_ERROR(-20813, 'REPRESENTATIVE role requires representative_id'); END IF;
    SELECT COUNT(*) INTO v_exists FROM Representative WHERE representative_id = :NEW.representative_id;
    IF v_exists = 0 THEN RAISE_APPLICATION_ERROR(-20813, 'Referenced representative does not exist'); END IF;
  END IF;
END;
/

-- 2.10. Project Category Validation
CREATE OR REPLACE TRIGGER trg_project_category_validation
BEFORE INSERT ON Project_Category_Assignment
FOR EACH ROW
DECLARE
  v_category_active CHAR(1);
BEGIN
  SELECT is_active INTO v_category_active
  FROM Project_Category WHERE category_id = :NEW.category_id;

  IF v_category_active = 'N' THEN
    RAISE_APPLICATION_ERROR(-20815, 'Cannot assign inactive project category');
  END IF;
END;
/

-- 2.11. Prevent Duplicate Project-SDG
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_project_sdg
BEFORE INSERT ON Project_SDG
FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM Project_SDG
  WHERE project_id = :NEW.project_id AND sdg_id = :NEW.sdg_id;

  IF v_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20818, 'This project is already assigned to this SDG goal');
  END IF;
END;
/

-- 2.12. Donor Type Validation
CREATE OR REPLACE TRIGGER trg_donor_type_validation
BEFORE INSERT ON Donor
FOR EACH ROW
DECLARE
  v_type_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_type_exists FROM Donor_Type WHERE type_id = :NEW.type_id;
  IF v_type_exists = 0 THEN
    RAISE_APPLICATION_ERROR(-20819, 'Referenced donor type does not exist');
  END IF;
END;
/

-- 2.13. Report Deletion Policy (Soft Delete Enforcement)
CREATE OR REPLACE TRIGGER trg_prevent_report_hard_delete
BEFORE DELETE ON Report
FOR EACH ROW
BEGIN
  RAISE_APPLICATION_ERROR(-20820, 'Direct deletion of reports is not allowed. Use update to archive instead.');
END;
/







