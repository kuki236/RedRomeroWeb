-- ================================================================================
-- DATABASE TRANSACTION SCRIPTS (USING PACKAGES)
-- ================================================================================
-- This file contains transactional blocks demonstrating ACID principles.
-- It uses the new Package architecture (PKG_PROJECT_MGMT, PKG_FINANCE_CORE).
-- ================================================================================

SET SERVEROUTPUT ON;
SET DEFINE ON; 

-- ================================================================================
-- TRANSACTION 1: Register a Donation and Automatically Update Project Budget
-- ================================================================================
DECLARE
    v_donation_id   Donation.donation_id%TYPE;
    v_budget_id     Budget.budget_id%TYPE;
    
    -- User Input
    v_project_id    Project.project_id%TYPE   := &Enter_Project_ID;  
    v_donor_id      Donor.donor_id%TYPE       := &Enter_Donor_ID;
    v_amount        NUMBER                    := &Enter_Donation_Amount;
    v_currency_id   Currency.currency_id%TYPE := 1; -- Assuming 1 = USD
BEGIN
    SAVEPOINT sp_before_donation;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 1: Donation + Budget Update ---');

    -- 1. Call Package Procedure to insert donation
    PKG_FINANCE_CORE.register_donation(
        p_date   => SYSTIMESTAMP,
        p_amount => v_amount,
        p_proj   => v_project_id,
        p_curr   => v_currency_id,
        p_donor  => v_donor_id,
        p_new_id => v_donation_id 
    );

    DBMS_OUTPUT.PUT_LINE('Donation inserted successfully with ID: ' || v_donation_id);

    -- 2. Find the corresponding budget for this project
    BEGIN
        SELECT budget_id INTO v_budget_id
        FROM Budget
        WHERE project_id = v_project_id
          AND currency_id = v_currency_id
          AND ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-30002, 'No matching Budget found for Project ID ' || v_project_id);
    END;

    -- 3. Update the budget amount (Using Package logic is cleaner)
    -- We calculate new total = Current + Donation
    PKG_FINANCE_CORE.update_budget(
        p_id     => v_budget_id,
        p_amount => (SELECT initial_amount + v_amount FROM Budget WHERE budget_id = v_budget_id),
        p_proj   => v_project_id,
        p_curr   => v_currency_id
    );

    -- 4. Commit Transaction
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Transaction committed: Donation recorded and Budget updated.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_before_donation;
        DBMS_OUTPUT.PUT_LINE('ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/

-- ================================================================================
-- TRANSACTION 2: Project Approval Workflow
-- ================================================================================
DECLARE
    v_approval_id Approval.approval_id%TYPE;
    
    -- User Input
    v_project_id  Project.project_id%TYPE   := &Enter_Project_ID_to_Approve;
    v_employee_id Employee.employee_id%TYPE := &Enter_Employee_ID;
    v_status_id   Approval_Status.approval_status_id%TYPE := 2; -- Assuming 2 = APPROVED
BEGIN
    SAVEPOINT sp_before_approval;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 2: Project Approval ---');

    -- 1. Create Approval using Package
    PKG_PROJECT_MGMT.create_approval(
        p_date   => SYSTIMESTAMP,
        p_stat   => v_status_id,
        p_emp    => v_employee_id,
        p_proj   => v_project_id,
        p_new_id => v_approval_id
    );

    DBMS_OUTPUT.PUT_LINE('Approval record created with ID: ' || v_approval_id);

    -- 2. Process logic (Update project status) using Package Logic
    PKG_PROJECT_MGMT.process_approval(v_approval_id, 'APROBADO', v_employee_id);

    -- 3. Commit Transaction
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Transaction committed: Project approved and history logged.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_before_approval;
        DBMS_OUTPUT.PUT_LINE('ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/

-- ================================================================================
-- TRANSACTION 3: Register New Donor and First Donation
-- ================================================================================
DECLARE
    v_donor_id    Donor.donor_id%TYPE;
    v_donation_id Donation.donation_id%TYPE;
    
    -- User Input 
    v_name        Donor.name%TYPE  := '&Enter_New_Donor_Name'; 
    v_email       Donor.email%TYPE := '&Enter_New_Donor_Email';
    v_phone       Donor.phone%TYPE := '&Enter_New_Donor_Phone';
    v_amount      NUMBER           := &Enter_First_Donation_Amount;
    
    v_type_id     Donor.type_id%TYPE := 2; -- Assuming 2 = Corporate
    v_project_id  NUMBER := 13;            -- Default Project ID (Must be Active)
BEGIN
    SAVEPOINT sp_new_donor_donation;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 3: New Donor Registration ---');

    -- 1. Insert Donor via Package
    PKG_FINANCE_CORE.register_donor(
        p_name   => v_name,
        p_email  => v_email,
        p_phone  => v_phone,
        p_type   => v_type_id,
        p_new_id => v_donor_id
    );
    
    DBMS_OUTPUT.PUT_LINE('New Donor registered with ID: ' || v_donor_id);

    -- 2. Register donation via Package
    PKG_FINANCE_CORE.register_donation(
        p_date   => SYSTIMESTAMP,
        p_amount => v_amount,
        p_proj   => v_project_id,
        p_curr   => 1, -- USD
        p_donor  => v_donor_id,
        p_new_id => v_donation_id
    );

    DBMS_OUTPUT.PUT_LINE('First donation registered with ID: ' || v_donation_id);

    -- 3. Commit Transaction
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Transaction committed successfully.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_new_donor_donation;
        DBMS_OUTPUT.PUT_LINE('ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/

-- ================================================================================
-- TRANSACTION 4: Close Project and Release Volunteers
-- ================================================================================
DECLARE
    v_project_id NUMBER := &Enter_Project_ID_to_Close; 
BEGIN
    SAVEPOINT sp_close_project;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 4: Project Closure ---');

    -- 1. Use Package Logic to Close Project (updates status and releases volunteers)
    PKG_PROJECT_MGMT.close_project(v_project_id);
    
    DBMS_OUTPUT.PUT_LINE('Project ' || v_project_id || ' closed via Package Logic.');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Transaction committed successfully.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_close_project;
        DBMS_OUTPUT.PUT_LINE('ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/

-- ================================================================================
-- TRANSACTION 5: Budget Reallocation (Transfer Funds)
-- ================================================================================
DECLARE
    -- User Input
    v_budget_source_id NUMBER := &Enter_Source_Budget_ID; -- Only used for reading in this example block
    v_budget_target_id NUMBER := &Enter_Target_Budget_ID; -- Only used for reading
    v_amount_transfer  NUMBER := &Enter_Amount_to_Transfer;
    
    -- Logic requires Project IDs, so we derive them or ask for them. 
    -- For simplicity, assuming we have Project IDs 1 and 2 mapped to these budgets.
    v_source_proj_id   NUMBER := 1; 
    v_target_proj_id   NUMBER := 2;
    v_employee_id      NUMBER := 1; 
BEGIN
    SAVEPOINT sp_transfer_funds;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 5: Fund Transfer ---');

    -- Use Package Logic for Transfer
    PKG_FINANCE_CORE.transfer_funds(
        p_source_proj => v_source_proj_id,
        p_target_proj => v_target_proj_id,
        p_amount      => v_amount_transfer,
        p_emp_id      => v_employee_id
    );

    -- 3. Commit Transaction
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Transfer of ' || v_amount_transfer || ' completed successfully via Package.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_transfer_funds;
        DBMS_OUTPUT.PUT_LINE('ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/

-- ================================================================================
-- TRANSACTION 6: Full Project Initialization
-- ================================================================================
DECLARE
    v_new_proj_id  Project.project_id%TYPE;
    v_new_budg_id  Budget.budget_id%TYPE;
    
    -- User Input
    v_proj_name    VARCHAR2(100) := '&Enter_Project_Name';
    v_proj_desc    VARCHAR2(200) := '&Enter_Project_Description';
    v_init_funds   NUMBER        := &Enter_Initial_Budget;
    
    v_ong_id       NUMBER := 1;
    v_rep_id       NUMBER := 1;
    v_cat_id       NUMBER := 3; -- Example Category
BEGIN
    SAVEPOINT sp_full_project_creation;
    DBMS_OUTPUT.PUT_LINE('--- Starting Transaction 6: Full Project Initialization ---');

    -- 1. Create Project via Package
    PKG_PROJECT_MGMT.create_project(
        p_name   => v_proj_name,
        p_desc   => v_proj_desc,
        p_start  => SYSDATE + 10,
        p_end    => SYSDATE + 365,
        p_status => 1, -- PLANNING
        p_ong    => v_ong_id,
        p_rep    => v_rep_id,
        p_new_id => v_new_proj_id
    );
    DBMS_OUTPUT.PUT_LINE('Project created with ID: ' || v_new_proj_id);

    -- 2. Assign Primary Category (Manual insert as we might not have a specific proc for this simple link in package yet, or add one)
    INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assignment_date, assigned_by_user_id)
    VALUES (v_new_proj_id, v_cat_id, 'Y', SYSDATE, 1);
    
    DBMS_OUTPUT.PUT_LINE('Category assigned.');

    -- 3. Create Initial Budget via Package
    PKG_FINANCE_CORE.create_budget(
        p_amount => v_init_funds,
        p_desc   => 'Seed funding for ' || v_proj_name,
        p_proj   => v_new_proj_id,
        p_curr   => 1, -- USD
        p_new_id => v_new_budg_id
    );
    DBMS_OUTPUT.PUT_LINE('Initial budget created with ID: ' || v_new_budg_id);

    -- 4. Commit Transaction
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Project initialization completed successfully.');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_full_project_creation;
        DBMS_OUTPUT.PUT_LINE('FATAL ERROR: Transaction Rolled Back. Details: ' || SQLERRM);
END;
/