-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_PROJECT_MGMT
-- =============================================================================
CREATE OR REPLACE PACKAGE PKG_PROJECT_MGMT AS
    -- CRUD: Project
    PROCEDURE create_project(
        p_name IN Project.name%TYPE, p_desc IN Project.description%TYPE, 
        p_start IN Project.start_date%TYPE, p_end IN Project.end_date%TYPE,
        p_status IN Project.project_status_id%TYPE, p_ong IN Project.ong_id%TYPE, 
        p_rep IN Project.representative_id%TYPE, p_new_id OUT Project.project_id%TYPE
    );
    PROCEDURE update_project_details(
        p_id IN Project.project_id%TYPE, p_name IN Project.name%TYPE, 
        p_desc IN Project.description%TYPE, p_start IN Project.start_date%TYPE, 
        p_end IN Project.end_date%TYPE, p_status IN Project.project_status_id%TYPE,
        p_ong IN Project.ong_id%TYPE, p_rep IN Project.representative_id%TYPE
    );
    PROCEDURE delete_project(p_id IN Project.project_id%TYPE);

    -- Status & Types CRUD
    PROCEDURE create_project_status(p_name IN Project_Status.status_name%TYPE, p_new_id OUT Project_Status.project_status_id%TYPE);
    PROCEDURE update_project_status(p_id IN Project_Status.project_status_id%TYPE, p_name IN Project_Status.status_name%TYPE);
    PROCEDURE delete_project_status(p_id IN Project_Status.project_status_id%TYPE);
    
    -- Business Logic & Analytics
    FUNCTION get_duration_days(p_project_id IN NUMBER) RETURN NUMBER; -- [NEW FUNCTION]
    PROCEDURE assign_sdg(
        p_proj_id IN Project_SDG.project_id%TYPE, p_sdg_id IN Project_SDG.sdg_id%TYPE,
        p_contrib IN Project_SDG.contribution_level%TYPE, p_user IN Project_SDG.assigned_by_user_id%TYPE,
        p_new_id OUT Project_SDG.project_sdg_id%TYPE
    );
    PROCEDURE create_sdg_goal(
        p_num IN SDG_Goal.goal_number%TYPE, p_name IN SDG_Goal.goal_name%TYPE,
        p_desc IN SDG_Goal.description%TYPE, p_icon IN SDG_Goal.icon_url%TYPE,
        p_new_id OUT SDG_Goal.sdg_id%TYPE
    );
    
    -- Lifecycle operations
    PROCEDURE close_project(p_project_id IN Project.project_id%TYPE);
    PROCEDURE reactivate_project(p_project_id IN Project.project_id%TYPE);
    PROCEDURE extend_deadline(p_project_id IN Project.project_id%TYPE, p_months IN NUMBER);
    PROCEDURE process_approval(p_approval_id IN Approval.approval_id%TYPE, p_decision IN VARCHAR2, p_emp_id IN Employee.employee_id%TYPE);
    
    -- Reports & Approvals
    PROCEDURE create_report(
        p_proj IN Report.project_id%TYPE, p_date IN Report.report_date%TYPE,
        p_title IN Report.title%TYPE, p_desc IN Report.description%TYPE,
        p_file IN Report.file_url%TYPE, p_new_id OUT Report.report_id%TYPE
    );
    PROCEDURE create_approval(
        p_date IN Approval.approval_date%TYPE, p_stat IN Approval.approval_status_id%TYPE,
        p_emp IN Approval.employee_id%TYPE, p_proj IN Approval.project_id%TYPE,
        p_new_id OUT Approval.approval_id%TYPE
    );

END PKG_PROJECT_MGMT;
/

-- =============================================================================
-- PACKAGE BODY: PKG_PROJECT_MGMT
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_PROJECT_MGMT AS

    -- [NEW FUNCTION IMPLEMENTATION]
    FUNCTION get_duration_days(p_project_id IN NUMBER) RETURN NUMBER IS
        v_start DATE; v_end DATE;
    BEGIN
        SELECT start_date, NVL(end_date, SYSDATE) INTO v_start, v_end 
        FROM Project WHERE project_id = p_project_id;
        RETURN v_end - v_start;
    END get_duration_days;

    -- Project CRUD
    PROCEDURE create_project(
        p_name IN Project.name%TYPE, p_desc IN Project.description%TYPE, 
        p_start IN Project.start_date%TYPE, p_end IN Project.end_date%TYPE,
        p_status IN Project.project_status_id%TYPE, p_ong IN Project.ong_id%TYPE, 
        p_rep IN Project.representative_id%TYPE, p_new_id OUT Project.project_id%TYPE
    ) IS BEGIN
        INSERT INTO Project(name, description, start_date, end_date, project_status_id, ong_id, representative_id)
        VALUES (p_name, p_desc, p_start, p_end, p_status, p_ong, p_rep) RETURNING project_id INTO p_new_id;
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20201, 'Error creating project: ' || SQLERRM); END;

    PROCEDURE update_project_details(
        p_id IN Project.project_id%TYPE, p_name IN Project.name%TYPE, 
        p_desc IN Project.description%TYPE, p_start IN Project.start_date%TYPE, 
        p_end IN Project.end_date%TYPE, p_status IN Project.project_status_id%TYPE,
        p_ong IN Project.ong_id%TYPE, p_rep IN Project.representative_id%TYPE
    ) IS BEGIN
        UPDATE Project SET name=p_name, description=p_desc, start_date=p_start, end_date=p_end, 
        project_status_id=p_status, ong_id=p_ong, representative_id=p_rep WHERE project_id = p_id;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20202, 'Project not found'); END IF;
    END;

    PROCEDURE delete_project(p_id IN Project.project_id%TYPE) IS 
        v_chk NUMBER; 
    BEGIN
        SELECT COUNT(*) INTO v_chk FROM Donation WHERE project_id = p_id;
        IF v_chk > 0 THEN RAISE_APPLICATION_ERROR(-20204, 'Cannot delete: Project has donations.'); END IF;
        DELETE FROM Project WHERE project_id = p_id;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20206, 'Project not found'); END IF;
    END;

    -- Status & Types CRUD (Estos faltaban o dieron error)
    PROCEDURE create_project_status(p_name IN Project_Status.status_name%TYPE, p_new_id OUT Project_Status.project_status_id%TYPE) IS 
    BEGIN
        INSERT INTO Project_Status(status_name) VALUES (p_name) RETURNING project_status_id INTO p_new_id;
    END;

    PROCEDURE update_project_status(p_id IN Project_Status.project_status_id%TYPE, p_name IN Project_Status.status_name%TYPE) IS 
    BEGIN
        UPDATE Project_Status SET status_name = p_name WHERE project_status_id = p_id;
    END;

    PROCEDURE delete_project_status(p_id IN Project_Status.project_status_id%TYPE) IS 
    BEGIN
        DELETE FROM Project_Status WHERE project_status_id = p_id;
    END;

    -- SDG Logic (Estos faltaban o dieron error)
    PROCEDURE assign_sdg(
        p_proj_id IN Project_SDG.project_id%TYPE, p_sdg_id IN Project_SDG.sdg_id%TYPE,
        p_contrib IN Project_SDG.contribution_level%TYPE, p_user IN Project_SDG.assigned_by_user_id%TYPE,
        p_new_id OUT Project_SDG.project_sdg_id%TYPE
    ) IS
        v_chk NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_chk FROM Project_SDG WHERE project_id=p_proj_id AND sdg_id=p_sdg_id;
        IF v_chk > 0 THEN RAISE_APPLICATION_ERROR(-20601, 'SDG already assigned'); END IF;
        INSERT INTO Project_SDG(project_id, sdg_id, contribution_level, assigned_by_user_id)
        VALUES (p_proj_id, p_sdg_id, p_contrib, p_user) RETURNING project_sdg_id INTO p_new_id;
    END;

    PROCEDURE create_sdg_goal(
        p_num IN SDG_Goal.goal_number%TYPE, p_name IN SDG_Goal.goal_name%TYPE,
        p_desc IN SDG_Goal.description%TYPE, p_icon IN SDG_Goal.icon_url%TYPE,
        p_new_id OUT SDG_Goal.sdg_id%TYPE
    ) IS BEGIN
        INSERT INTO SDG_Goal(goal_number, goal_name, description, icon_url) 
        VALUES (p_num, p_name, p_desc, p_icon) RETURNING sdg_id INTO p_new_id;
    END;

    -- Operations
    PROCEDURE close_project(p_project_id IN Project.project_id%TYPE) IS
        v_stat NUMBER;
    BEGIN
        SELECT project_status_id INTO v_stat FROM Project_Status WHERE status_name = 'COMPLETADO';
        UPDATE Project SET project_status_id = v_stat, end_date = SYSDATE WHERE project_id = p_project_id;
        UPDATE Volunteer_Project SET end_date = SYSDATE, status = 'I' WHERE project_id = p_project_id AND status = 'A';
    EXCEPTION WHEN OTHERS THEN RAISE_APPLICATION_ERROR(-20801, 'Error closing project: ' || SQLERRM); END;

    PROCEDURE reactivate_project(p_project_id IN Project.project_id%TYPE) IS
        v_stat NUMBER;
    BEGIN
        SELECT project_status_id INTO v_stat FROM Project_Status WHERE status_name = 'ACTIVO';
        UPDATE Project SET project_status_id = v_stat, end_date = NULL WHERE project_id = p_project_id;
    END;

    PROCEDURE extend_deadline(p_project_id IN Project.project_id%TYPE, p_months IN NUMBER) IS
    BEGIN
        UPDATE Project SET end_date = ADD_MONTHS(end_date, p_months) WHERE project_id = p_project_id;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20903, 'Project not found'); END IF;
    END;

    PROCEDURE process_approval(p_approval_id IN Approval.approval_id%TYPE, p_decision IN VARCHAR2, p_emp_id IN Employee.employee_id%TYPE) IS
        v_stat_id NUMBER; v_proj_id NUMBER;
    BEGIN
        SELECT approval_status_id INTO v_stat_id FROM Approval_Status WHERE status_name = p_decision;
        UPDATE Approval SET approval_status_id = v_stat_id, approval_date = SYSTIMESTAMP, employee_id = p_emp_id
        WHERE approval_id = p_approval_id RETURNING project_id INTO v_proj_id;
        IF p_decision = 'APROBADO' THEN
            UPDATE Project SET project_status_id = (SELECT project_status_id FROM Project_Status WHERE status_name = 'ACTIVO')
            WHERE project_id = v_proj_id;
        END IF;
    END;

    -- Reports & Approvals CRUD (Estos faltaban o dieron error)
    PROCEDURE create_report(
        p_proj IN Report.project_id%TYPE, p_date IN Report.report_date%TYPE,
        p_title IN Report.title%TYPE, p_desc IN Report.description%TYPE,
        p_file IN Report.file_url%TYPE, p_new_id OUT Report.report_id%TYPE
    ) IS BEGIN
        INSERT INTO Report(project_id, report_date, title, description, file_url) 
        VALUES (p_proj, p_date, p_title, p_desc, p_file) RETURNING report_id INTO p_new_id;
    END;

    PROCEDURE create_approval(
        p_date IN Approval.approval_date%TYPE, p_stat IN Approval.approval_status_id%TYPE,
        p_emp IN Approval.employee_id%TYPE, p_proj IN Approval.project_id%TYPE,
        p_new_id OUT Approval.approval_id%TYPE
    ) IS BEGIN
        INSERT INTO Approval(approval_date, approval_status_id, employee_id, project_id) 
        VALUES (p_date, p_stat, p_emp, p_proj) RETURNING approval_id INTO p_new_id;
    END;

END PKG_PROJECT_MGMT;
/
-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_FINANCE_CORE
-- =============================================================================
CREATE OR REPLACE PACKAGE PKG_FINANCE_CORE AS
    -- Donations
    PROCEDURE register_donation(
        p_date IN Donation.donation_date%TYPE, p_amount IN Donation.amount%TYPE,
        p_proj IN Donation.project_id%TYPE, p_curr IN Donation.currency_id%TYPE,
        p_donor IN Donation.donor_id%TYPE, p_new_id OUT Donation.donation_id%TYPE
    );
    PROCEDURE update_donation(p_id IN Donation.donation_id%TYPE, p_amount IN Donation.amount%TYPE);
    PROCEDURE delete_donation(p_id IN Donation.donation_id%TYPE);

    -- Budget
    PROCEDURE create_budget(
        p_amount IN Budget.initial_amount%TYPE, p_desc IN Budget.description%TYPE,
        p_proj IN Budget.project_id%TYPE, p_curr IN Budget.currency_id%TYPE,
        p_new_id OUT Budget.budget_id%TYPE
    );
    PROCEDURE update_budget(p_id IN NUMBER, p_amount IN NUMBER, p_proj IN NUMBER, p_curr IN NUMBER);
    PROCEDURE delete_budget(p_id IN NUMBER);

    -- Donors & Types
    PROCEDURE register_donor(
        p_name IN Donor.name%TYPE, p_email IN Donor.email%TYPE, 
        p_phone IN Donor.phone%TYPE, p_type IN Donor.type_id%TYPE, p_new_id OUT Donor.donor_id%TYPE
    );
    PROCEDURE update_donor(p_id IN NUMBER, p_name IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2, p_type IN NUMBER);
    PROCEDURE delete_donor(p_id IN NUMBER);
    PROCEDURE create_donor_type(p_name IN VARCHAR2, p_desc IN VARCHAR2, p_new_id OUT NUMBER);
    PROCEDURE anonymize_donor(p_donor_id IN NUMBER);

    -- Currency
    PROCEDURE create_currency(p_name IN VARCHAR2, p_code IN VARCHAR2, p_sym IN VARCHAR2, p_new_id OUT NUMBER);
    PROCEDURE update_currency_rate(p_code IN VARCHAR2, p_rate IN NUMBER);

    -- Functions (Calculations)
    FUNCTION get_total_donations(p_project_id IN NUMBER) RETURN NUMBER; -- [NEW]
    FUNCTION get_remaining_budget(p_project_id IN NUMBER) RETURN NUMBER; -- [NEW]
    FUNCTION get_donor_rank(p_donor_id IN NUMBER) RETURN VARCHAR2; -- [NEW]
    FUNCTION convert_currency(p_amount IN NUMBER, p_from_id IN NUMBER, p_to_id IN NUMBER) RETURN NUMBER; -- [NEW]

    -- Business Logic
    PROCEDURE get_financial_summary(p_proj_id IN NUMBER, p_budget OUT NUMBER, p_donations OUT NUMBER, p_balance OUT NUMBER);

END PKG_FINANCE_CORE;
/

-- =============================================================================
-- PACKAGE BODY: PKG_FINANCE_CORE
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_FINANCE_CORE AS

    -- [FUNCTION IMPLEMENTATIONS]
    FUNCTION get_total_donations(p_project_id IN NUMBER) RETURN NUMBER IS
        v_total NUMBER(15,2);
    BEGIN
        SELECT NVL(SUM(amount), 0) INTO v_total FROM Donation WHERE project_id = p_project_id;
        RETURN v_total;
    END get_total_donations;

    FUNCTION get_remaining_budget(p_project_id IN NUMBER) RETURN NUMBER IS
        v_budget NUMBER(15,2); v_donations NUMBER(15,2);
    BEGIN
        SELECT NVL(SUM(initial_amount), 0) INTO v_budget FROM Budget WHERE project_id = p_project_id;
        SELECT NVL(SUM(amount), 0) INTO v_donations FROM Donation WHERE project_id = p_project_id;
        RETURN v_budget - v_donations;
    END get_remaining_budget;

    FUNCTION get_donor_rank(p_donor_id IN NUMBER) RETURN VARCHAR2 IS
        v_total NUMBER(15,2); v_rank NUMBER;
    BEGIN
        SELECT SUM(amount) INTO v_total FROM Donation WHERE donor_id = p_donor_id;
        IF v_total IS NULL THEN RETURN 'No donations found.'; END IF;
        SELECT rank_position INTO v_rank FROM (
            SELECT donor_id, RANK() OVER (ORDER BY SUM(amount) DESC) AS rank_position
            FROM Donation GROUP BY donor_id
        ) WHERE donor_id = p_donor_id;
        RETURN 'Rank: ' || v_rank || ' | Total: ' || v_total;
    EXCEPTION WHEN NO_DATA_FOUND THEN RETURN 'Donor not found.';
    END get_donor_rank;

    FUNCTION convert_currency(p_amount IN NUMBER, p_from_id IN NUMBER, p_to_id IN NUMBER) RETURN NUMBER IS
        v_from_rate NUMBER(15,6); v_to_rate NUMBER(15,6);
    BEGIN
        SELECT exchange_rate_to_usd INTO v_from_rate FROM Currency WHERE currency_id = p_from_id;
        SELECT exchange_rate_to_usd INTO v_to_rate FROM Currency WHERE currency_id = p_to_id;
        RETURN ROUND((p_amount * v_from_rate) / v_to_rate, 2);
    EXCEPTION 
        WHEN NO_DATA_FOUND THEN RAISE_APPLICATION_ERROR(-20002, 'Invalid currency ID');
        WHEN ZERO_DIVIDE THEN RAISE_APPLICATION_ERROR(-20003, 'Zero exchange rate error');
    END convert_currency;

    -- Donation CRUD
    PROCEDURE register_donation(
        p_date IN Donation.donation_date%TYPE, p_amount IN Donation.amount%TYPE,
        p_proj IN Donation.project_id%TYPE, p_curr IN Donation.currency_id%TYPE,
        p_donor IN Donation.donor_id%TYPE, p_new_id OUT Donation.donation_id%TYPE
    ) IS BEGIN
        INSERT INTO Donation(donation_date, amount, project_id, currency_id, donor_id)
        VALUES (p_date, p_amount, p_proj, p_curr, p_donor) RETURNING donation_id INTO p_new_id;
    END;

    -- [ESTOS FALTABAN]
    PROCEDURE update_donation(p_id IN Donation.donation_id%TYPE, p_amount IN Donation.amount%TYPE) IS 
    BEGIN
        UPDATE Donation SET amount = p_amount WHERE donation_id = p_id;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20302, 'Donation not found'); END IF;
    END;

    PROCEDURE delete_donation(p_id IN Donation.donation_id%TYPE) IS 
    BEGIN
        DELETE FROM Donation WHERE donation_id = p_id;
        IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20304, 'Donation not found'); END IF;
    END;

    -- Budget CRUD
    PROCEDURE create_budget(
        p_amount IN Budget.initial_amount%TYPE, p_desc IN Budget.description%TYPE,
        p_proj IN Budget.project_id%TYPE, p_curr IN Budget.currency_id%TYPE,
        p_new_id OUT Budget.budget_id%TYPE
    ) IS BEGIN
        INSERT INTO Budget(initial_amount, creation_date, description, project_id, currency_id)
        VALUES (p_amount, SYSTIMESTAMP, p_desc, p_proj, p_curr) RETURNING budget_id INTO p_new_id;
    END;
    PROCEDURE update_budget(p_id IN NUMBER, p_amount IN NUMBER, p_proj IN NUMBER, p_curr IN NUMBER) IS BEGIN
        UPDATE Budget SET initial_amount=p_amount, project_id=p_proj, currency_id=p_curr WHERE budget_id=p_id;
    END;
    PROCEDURE delete_budget(p_id IN NUMBER) IS BEGIN
        DELETE FROM Budget WHERE budget_id = p_id;
    END;

    -- Donor CRUD
    PROCEDURE register_donor(
        p_name IN Donor.name%TYPE, p_email IN Donor.email%TYPE, 
        p_phone IN Donor.phone%TYPE, p_type IN Donor.type_id%TYPE, p_new_id OUT Donor.donor_id%TYPE
    ) IS BEGIN
        INSERT INTO Donor(name, email, phone, type_id) VALUES (p_name, p_email, p_phone, p_type)
        RETURNING donor_id INTO p_new_id;
    END;
    PROCEDURE update_donor(p_id IN NUMBER, p_name IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2, p_type IN NUMBER) IS BEGIN
        UPDATE Donor SET name=p_name, email=p_email, phone=p_phone, type_id=p_type WHERE donor_id=p_id;
    END;
    PROCEDURE delete_donor(p_id IN NUMBER) IS BEGIN
        DELETE FROM Donor WHERE donor_id = p_id;
    END;
    PROCEDURE create_donor_type(p_name IN VARCHAR2, p_desc IN VARCHAR2, p_new_id OUT NUMBER) IS BEGIN
        INSERT INTO Donor_Type(type_name, description) VALUES (p_name, p_desc) RETURNING type_id INTO p_new_id;
    END;
    PROCEDURE anonymize_donor(p_donor_id IN NUMBER) IS BEGIN
        UPDATE Donor SET name='Anonymous '||p_donor_id, email=NULL, phone=NULL WHERE donor_id=p_donor_id;
        DELETE FROM Identity_Document WHERE donor_id=p_donor_id;
    END;

    -- Currency CRUD
    PROCEDURE create_currency(p_name IN VARCHAR2, p_code IN VARCHAR2, p_sym IN VARCHAR2, p_new_id OUT NUMBER) IS BEGIN
        INSERT INTO Currency(currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES (p_name, p_code, p_sym, 1) RETURNING currency_id INTO p_new_id;
    END;
    PROCEDURE update_currency_rate(p_code IN VARCHAR2, p_rate IN NUMBER) IS BEGIN
        UPDATE Currency SET exchange_rate_to_usd = p_rate, last_updated = SYSTIMESTAMP WHERE currency_code = p_code;
    END;

    -- Logic
    PROCEDURE get_financial_summary(p_proj_id IN NUMBER, p_budget OUT NUMBER, p_donations OUT NUMBER, p_balance OUT NUMBER) IS BEGIN
        SELECT NVL(SUM(initial_amount), 0) INTO p_budget FROM Budget WHERE project_id = p_proj_id;
        SELECT NVL(SUM(amount), 0) INTO p_donations FROM Donation WHERE project_id = p_proj_id;
        p_balance := p_budget - p_donations;
    END;

END PKG_FINANCE_CORE;
/
-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_WORKFORCE
-- =============================================================================
CREATE OR REPLACE PACKAGE PKG_WORKFORCE AS
    -- Employees
    PROCEDURE create_employee(
        p_fname IN Employee.first_name%TYPE, p_lname IN Employee.last_name%TYPE,
        p_birth IN Employee.birth_date%TYPE, p_addr IN Employee.address%TYPE,
        p_email IN Employee.email%TYPE, p_phone IN Employee.phone%TYPE,
        p_hire IN Employee.hire_date%TYPE, p_new_id OUT Employee.employee_id%TYPE
    );
    PROCEDURE update_employee(p_id IN NUMBER, p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2);
    PROCEDURE delete_employee(p_id IN NUMBER);

    -- Volunteers
    PROCEDURE create_volunteer(
        p_fname IN Volunteer.first_name%TYPE, p_lname IN Volunteer.last_name%TYPE,
        p_birth IN Volunteer.birth_date%TYPE, p_addr IN Volunteer.address%TYPE,
        p_email IN Volunteer.email%TYPE, p_phone IN Volunteer.phone%TYPE,
        p_new_id OUT Volunteer.volunteer_id%TYPE
    );
    PROCEDURE update_volunteer(p_id IN NUMBER, p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2);
    PROCEDURE delete_volunteer(p_id IN NUMBER);

    -- Representatives
    PROCEDURE create_representative(
        p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_birth IN DATE, p_addr IN VARCHAR2,
        p_email IN VARCHAR2, p_phone IN VARCHAR2, p_ong IN NUMBER, p_new_id OUT NUMBER
    );
    PROCEDURE delete_representative(p_id IN NUMBER);

    -- Specialties & Assignments
    PROCEDURE create_specialty(p_name IN VARCHAR2, p_desc IN VARCHAR2, p_new_id OUT NUMBER);
    PROCEDURE add_volunteer_specialty(p_vol_id IN NUMBER, p_spec_id IN NUMBER, p_new_id OUT NUMBER);
    PROCEDURE assign_volunteer_to_project(p_proj_id IN NUMBER, p_vol_id IN NUMBER, p_new_id OUT NUMBER);

    -- NGO
    PROCEDURE create_ngo(p_name IN VARCHAR2, p_reg IN VARCHAR2, p_ctry IN VARCHAR2, p_email IN VARCHAR2, p_new_id OUT NUMBER);
    PROCEDURE delete_ngo(p_id IN NUMBER);

    PROCEDURE volunteer_apply_to_project(
        p_volunteer_id IN NUMBER,
        p_project_id IN NUMBER,
        p_user_id IN NUMBER, -- To validate user is the volunteer
        p_application_id OUT NUMBER
    );
    
    PROCEDURE review_volunteer_application(
        p_application_id IN NUMBER,
        p_employee_id IN NUMBER,
        p_decision IN VARCHAR2, -- 'APPROVED' or 'REJECTED'
        p_rejection_reason IN VARCHAR2 DEFAULT NULL
    );
    
    PROCEDURE cancel_volunteer_application(
        p_application_id IN NUMBER,
        p_volunteer_id IN NUMBER -- To validate volunteer cancels own application
    );
    
    FUNCTION can_volunteer_apply(
        p_volunteer_id IN NUMBER,
        p_project_id IN NUMBER
    ) RETURN VARCHAR2; -- Returns 'Y' or error message
    
    PROCEDURE get_volunteer_applications(
        p_volunteer_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    );
    
    PROCEDURE get_pending_applications(
        p_project_id IN NUMBER DEFAULT NULL,
        p_cursor OUT SYS_REFCURSOR
    );

END PKG_WORKFORCE;
/

-- =============================================================================
-- PACKAGE BODY: PKG_WORKFORCE
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_WORKFORCE AS

    -- Employee
    PROCEDURE create_employee(
        p_fname IN Employee.first_name%TYPE, p_lname IN Employee.last_name%TYPE,
        p_birth IN Employee.birth_date%TYPE, p_addr IN Employee.address%TYPE,
        p_email IN Employee.email%TYPE, p_phone IN Employee.phone%TYPE,
        p_hire IN Employee.hire_date%TYPE, p_new_id OUT Employee.employee_id%TYPE
    ) IS BEGIN
        INSERT INTO Employee(first_name, last_name, birth_date, address, email, phone, hire_date)
        VALUES (p_fname, p_lname, p_birth, p_addr, p_email, p_phone, p_hire) RETURNING employee_id INTO p_new_id;
    END;
    PROCEDURE update_employee(p_id IN NUMBER, p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2) IS BEGIN
        UPDATE Employee SET first_name=p_fname, last_name=p_lname, email=p_email, phone=p_phone WHERE employee_id=p_id;
    END;
    PROCEDURE delete_employee(p_id IN NUMBER) IS BEGIN
        DELETE FROM Employee WHERE employee_id = p_id;
    END;

    -- Volunteer
    PROCEDURE create_volunteer(
        p_fname IN Volunteer.first_name%TYPE, p_lname IN Volunteer.last_name%TYPE,
        p_birth IN Volunteer.birth_date%TYPE, p_addr IN Volunteer.address%TYPE,
        p_email IN Volunteer.email%TYPE, p_phone IN Volunteer.phone%TYPE,
        p_new_id OUT Volunteer.volunteer_id%TYPE
    ) IS BEGIN
        INSERT INTO Volunteer(first_name, last_name, birth_date, address, email, phone)
        VALUES (p_fname, p_lname, p_birth, p_addr, p_email, p_phone) RETURNING volunteer_id INTO p_new_id;
    END;
    PROCEDURE update_volunteer(p_id IN NUMBER, p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_email IN VARCHAR2, p_phone IN VARCHAR2) IS BEGIN
        UPDATE Volunteer SET first_name=p_fname, last_name=p_lname, email=p_email, phone=p_phone WHERE volunteer_id=p_id;
    END;
    PROCEDURE delete_volunteer(p_id IN NUMBER) IS BEGIN
        DELETE FROM Volunteer WHERE volunteer_id = p_id;
    END;

    -- Representative
    PROCEDURE create_representative(
        p_fname IN VARCHAR2, p_lname IN VARCHAR2, p_birth IN DATE, p_addr IN VARCHAR2,
        p_email IN VARCHAR2, p_phone IN VARCHAR2, p_ong IN NUMBER, p_new_id OUT NUMBER
    ) IS BEGIN
        INSERT INTO Representative(first_name, last_name, birth_date, address, email, phone, ong_id)
        VALUES (p_fname, p_lname, p_birth, p_addr, p_email, p_phone, p_ong) RETURNING representative_id INTO p_new_id;
    END;
    PROCEDURE delete_representative(p_id IN NUMBER) IS BEGIN
        DELETE FROM Representative WHERE representative_id = p_id;
    END;

    -- NGO
    PROCEDURE create_ngo(p_name IN VARCHAR2, p_reg IN VARCHAR2, p_ctry IN VARCHAR2, p_email IN VARCHAR2, p_new_id OUT NUMBER) IS BEGIN
        INSERT INTO NGO(name, registration_number, country, city, contact_email) VALUES (p_name, p_reg, p_ctry, 'Unknown', p_email) RETURNING ong_id INTO p_new_id;
    END;
    PROCEDURE delete_ngo(p_id IN NUMBER) IS BEGIN
        DELETE FROM NGO WHERE ong_id = p_id;
    END;

    -- Assignments
    PROCEDURE create_specialty(p_name IN VARCHAR2, p_desc IN VARCHAR2, p_new_id OUT NUMBER) IS BEGIN
        INSERT INTO Specialty(specialty_name, description) VALUES (p_name, p_desc) RETURNING specialty_id INTO p_new_id;
    END;
    PROCEDURE add_volunteer_specialty(p_vol_id IN NUMBER, p_spec_id IN NUMBER, p_new_id OUT NUMBER) IS 
        v_chk NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_chk FROM Volunteer_Specialty WHERE volunteer_id=p_vol_id AND specialty_id=p_spec_id;
        IF v_chk > 0 THEN RAISE_APPLICATION_ERROR(-20701, 'Specialty already assigned'); END IF;
        INSERT INTO Volunteer_Specialty(volunteer_id, specialty_id, assignment_date) VALUES (p_vol_id, p_spec_id, SYSTIMESTAMP) RETURNING assignment_id INTO p_new_id;
    END;
    PROCEDURE assign_volunteer_to_project(p_proj_id IN NUMBER, p_vol_id IN NUMBER, p_new_id OUT NUMBER) IS
        v_chk NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_chk FROM Volunteer_Project WHERE project_id=p_proj_id AND volunteer_id=p_vol_id AND status='A';
        IF v_chk > 0 THEN RAISE_APPLICATION_ERROR(-20501, 'Volunteer active in project'); END IF;
        INSERT INTO Volunteer_Project(project_id, volunteer_id, assignment_date, status) VALUES (p_proj_id, p_vol_id, SYSTIMESTAMP, 'A') RETURNING assignment_id INTO p_new_id;
    END;

   FUNCTION can_volunteer_apply(
        p_volunteer_id IN NUMBER,
        p_project_id IN NUMBER
    ) RETURN VARCHAR2 IS
        v_project_status VARCHAR2(50);
        v_active_assignment NUMBER;
        v_pending_application NUMBER;
        v_project_end_date DATE;
    BEGIN
        -- Verify project exists and is active
        BEGIN
            SELECT ps.status_name, p.end_date
            INTO v_project_status, v_project_end_date
            FROM Project p
            JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
            WHERE p.project_id = p_project_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RETURN 'ERROR: Project does not exist';
        END;
        
        IF v_project_status != 'ACTIVO' THEN
            RETURN 'ERROR: Project is not active';
        END IF;
        
        -- Verify project has not ended
        IF v_project_end_date IS NOT NULL AND v_project_end_date < SYSDATE THEN
            RETURN 'ERROR: Project has already ended';
        END IF;
        
        -- Verify not already actively assigned
        SELECT COUNT(*)
        INTO v_active_assignment
        FROM Volunteer_Project
        WHERE volunteer_id = p_volunteer_id
          AND project_id = p_project_id
          AND status = 'A';
        
        IF v_active_assignment > 0 THEN
            RETURN 'ERROR: You are already assigned to this project';
        END IF;
        
        -- Verify no pending application exists
        SELECT COUNT(*)
        INTO v_pending_application
        FROM Volunteer_Application
        WHERE volunteer_id = p_volunteer_id
          AND project_id = p_project_id
          AND status = 'PENDING';
        
        IF v_pending_application > 0 THEN
            RETURN 'ERROR: You already have a pending application for this project';
        END IF;
        
        RETURN 'Y';
    END can_volunteer_apply;

    -- NEW PROCEDURE: Volunteer self-registration
    PROCEDURE volunteer_apply_to_project(
        p_volunteer_id IN NUMBER,
        p_project_id IN NUMBER,
        p_user_id IN NUMBER,
        p_application_id OUT NUMBER
    ) IS
        v_validation VARCHAR2(500);
        v_user_volunteer_id NUMBER;
    BEGIN
        -- Validate system user corresponds to volunteer
        BEGIN
            SELECT volunteer_id
            INTO v_user_volunteer_id
            FROM System_User
            WHERE user_id = p_user_id
              AND user_role = 'VOLUNTEER';
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20001, 'Unauthorized user');
        END;
        
        IF v_user_volunteer_id != p_volunteer_id THEN
            RAISE_APPLICATION_ERROR(-20002, 'Cannot apply on behalf of another volunteer');
        END IF;
        
        -- Validate if can apply
        v_validation := can_volunteer_apply(p_volunteer_id, p_project_id);
        
        IF v_validation != 'Y' THEN
            RAISE_APPLICATION_ERROR(-20003, v_validation);
        END IF;
        
        -- Create application
        INSERT INTO Volunteer_Application (
            volunteer_id,
            project_id,
            application_date,
            status
        ) VALUES (
            p_volunteer_id,
            p_project_id,
            SYSTIMESTAMP,
            'PENDING'
        ) RETURNING application_id INTO p_application_id;
        
        COMMIT;
        
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20004, 'Error creating application: ' || SQLERRM);
    END volunteer_apply_to_project;

    -- NEW PROCEDURE: Review volunteer application
    PROCEDURE review_volunteer_application(
        p_application_id IN NUMBER,
        p_employee_id IN NUMBER,
        p_decision IN VARCHAR2,
        p_rejection_reason IN VARCHAR2 DEFAULT NULL
    ) IS
        v_volunteer_id NUMBER;
        v_project_id NUMBER;
        v_current_status VARCHAR2(20);
        v_assignment_id NUMBER;
    BEGIN
        -- Validate decision
        IF p_decision NOT IN ('APPROVED', 'REJECTED') THEN
            RAISE_APPLICATION_ERROR(-20005, 'Invalid decision. Use APPROVED or REJECTED');
        END IF;
        
        -- Get application information
        BEGIN
            SELECT volunteer_id, project_id, status
            INTO v_volunteer_id, v_project_id, v_current_status
            FROM Volunteer_Application
            WHERE application_id = p_application_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20006, 'Application not found');
        END;
        
        -- Validate application is pending
        IF v_current_status != 'PENDING' THEN
            RAISE_APPLICATION_ERROR(-20007, 'Application has already been processed');
        END IF;
        
        -- Update application
        UPDATE Volunteer_Application
        SET status = p_decision,
            reviewed_by_employee_id = p_employee_id,
            reviewed_date = SYSTIMESTAMP,
            rejection_reason = p_rejection_reason
        WHERE application_id = p_application_id;
        
        -- If approved, create assignment
        IF p_decision = 'APPROVED' THEN
            INSERT INTO Volunteer_Project (
                project_id,
                volunteer_id,
                assignment_date,
                status
            ) VALUES (
                v_project_id,
                v_volunteer_id,
                SYSTIMESTAMP,
                'A'
            ) RETURNING assignment_id INTO v_assignment_id;
            
            -- Record in history
            INSERT INTO Project_Assignment_History (
                project_id,
                volunteer_id,
                assignment_type,
                action,
                assignment_date,
                reason,
                assigned_by_user_id
            ) VALUES (
                v_project_id,
                v_volunteer_id,
                'VOLUNTEER',
                'ASSIGNED',
                SYSTIMESTAMP,
                'Self-registration approval',
                (SELECT user_id FROM System_User WHERE employee_id = p_employee_id AND ROWNUM = 1)
            );
        END IF;
        
        COMMIT;
        
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20008, 'Error processing application: ' || SQLERRM);
    END review_volunteer_application;

    -- NEW PROCEDURE: Cancel application
    PROCEDURE cancel_volunteer_application(
        p_application_id IN NUMBER,
        p_volunteer_id IN NUMBER
    ) IS
        v_app_volunteer_id NUMBER;
        v_status VARCHAR2(20);
    BEGIN
        -- Validate application belongs to volunteer
        BEGIN
            SELECT volunteer_id, status
            INTO v_app_volunteer_id, v_status
            FROM Volunteer_Application
            WHERE application_id = p_application_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20009, 'Application not found');
        END;
        
        IF v_app_volunteer_id != p_volunteer_id THEN
            RAISE_APPLICATION_ERROR(-20010, 'Cannot cancel another volunteer application');
        END IF;
        
        IF v_status != 'PENDING' THEN
            RAISE_APPLICATION_ERROR(-20011, 'Can only cancel pending applications');
        END IF;
        
        UPDATE Volunteer_Application
        SET status = 'CANCELLED'
        WHERE application_id = p_application_id;
        
        COMMIT;
        
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20012, 'Error cancelling application: ' || SQLERRM);
    END cancel_volunteer_application;

    -- NEW PROCEDURE: Get volunteer applications
    PROCEDURE get_volunteer_applications(
        p_volunteer_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT 
                va.application_id,
                va.application_date,
                va.status,
                p.project_id,
                p.name AS project_name,
                p.description AS project_description,
                ps.status_name AS project_status,
                n.name AS ngo_name,
                va.reviewed_date,
                e.first_name || ' ' || e.last_name AS reviewed_by,
                va.rejection_reason
            FROM Volunteer_Application va
            JOIN Project p ON va.project_id = p.project_id
            JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
            JOIN NGO n ON p.ong_id = n.ong_id
            LEFT JOIN Employee e ON va.reviewed_by_employee_id = e.employee_id
            WHERE va.volunteer_id = p_volunteer_id
            ORDER BY va.application_date DESC;
    END get_volunteer_applications;

    -- NEW PROCEDURE: Get pending applications (for employees/admins)
    PROCEDURE get_pending_applications(
        p_project_id IN NUMBER DEFAULT NULL,
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        IF p_project_id IS NULL THEN
            -- All pending applications
            OPEN p_cursor FOR
                SELECT 
                    va.application_id,
                    va.application_date,
                    v.volunteer_id,
                    v.first_name || ' ' || v.last_name AS volunteer_name,
                    v.email AS volunteer_email,
                    p.project_id,
                    p.name AS project_name,
                    n.name AS ngo_name,
                    -- Volunteer specialties
                    (SELECT LISTAGG(s.specialty_name, ', ') WITHIN GROUP (ORDER BY s.specialty_name)
                     FROM Volunteer_Specialty vs
                     JOIN Specialty s ON vs.specialty_id = s.specialty_id
                     WHERE vs.volunteer_id = v.volunteer_id) AS specialties
                FROM Volunteer_Application va
                JOIN Volunteer v ON va.volunteer_id = v.volunteer_id
                JOIN Project p ON va.project_id = p.project_id
                JOIN NGO n ON p.ong_id = n.ong_id
                WHERE va.status = 'PENDING'
                ORDER BY va.application_date ASC;
        ELSE
            -- Pending applications for specific project
            OPEN p_cursor FOR
                SELECT 
                    va.application_id,
                    va.application_date,
                    v.volunteer_id,
                    v.first_name || ' ' || v.last_name AS volunteer_name,
                    v.email AS volunteer_email,
                    v.phone AS volunteer_phone,
                    (SELECT LISTAGG(s.specialty_name, ', ') WITHIN GROUP (ORDER BY s.specialty_name)
                     FROM Volunteer_Specialty vs
                     JOIN Specialty s ON vs.specialty_id = s.specialty_id
                     WHERE vs.volunteer_id = v.volunteer_id) AS specialties,
                    (SELECT COUNT(*) 
                     FROM Volunteer_Project vp 
                     WHERE vp.volunteer_id = v.volunteer_id) AS projects_completed
                FROM Volunteer_Application va
                JOIN Volunteer v ON va.volunteer_id = v.volunteer_id
                WHERE va.project_id = p_project_id
                  AND va.status = 'PENDING'
                ORDER BY va.application_date ASC;
        END IF;
    END get_pending_applications;

END PKG_WORKFORCE;

/
-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_SYSTEM_SECURITY (Synchronized with Django)
-- =============================================================================
CREATE OR REPLACE PACKAGE PKG_SYSTEM_SECURITY AS
    
    PROCEDURE create_user(
        p_user IN System_User.username%TYPE, p_pass IN System_User.password%TYPE,
        p_ctry IN System_User.country_of_issue%TYPE, p_role IN System_User.user_role%TYPE,
        p_emp IN NUMBER, p_vol IN NUMBER, p_rep IN NUMBER
    );

    -- THIS IS THE IMPORTANT PROCEDURE THAT YOU MUST UPDATE
    -- Note that it NO LONGER has the parameter "p_new_user_id OUT NUMBER" at the end
    PROCEDURE create_full_user(
        p_username   IN VARCHAR2,
        p_password   IN VARCHAR2,
        p_role       IN VARCHAR2,
        p_country    IN VARCHAR2,
        p_first_name IN VARCHAR2,
        p_last_name  IN VARCHAR2,
        p_email      IN VARCHAR2,
        p_phone      IN VARCHAR2,
        p_address    IN VARCHAR2,
        p_birth_date IN DATE,
        p_ong_id     IN NUMBER DEFAULT NULL
    );

    PROCEDURE update_user(p_id IN NUMBER, p_user IN VARCHAR2, p_role IN VARCHAR2);
    PROCEDURE delete_user(p_id IN NUMBER);
    PROCEDURE login_user(p_user IN VARCHAR2, p_pass IN VARCHAR2, p_id OUT NUMBER, p_role OUT VARCHAR2, p_ok OUT NUMBER);

    PROCEDURE create_identity_doc(
        p_type IN VARCHAR2, p_num IN VARCHAR2, p_ctry IN VARCHAR2,
        p_rep IN NUMBER, p_emp IN NUMBER, p_vol IN NUMBER, p_donor IN NUMBER
    );
    PROCEDURE update_identity_doc(p_id IN NUMBER, p_type IN VARCHAR2, p_num IN VARCHAR2);
    PROCEDURE delete_identity_doc(p_id IN NUMBER);

END PKG_SYSTEM_SECURITY;
/

-- =============================================================================
-- PACKAGE BODY: PKG_SYSTEM_SECURITY
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_SYSTEM_SECURITY AS

    PROCEDURE create_user(
        p_user IN System_User.username%TYPE, p_pass IN System_User.password%TYPE,
        p_ctry IN System_User.country_of_issue%TYPE, p_role IN System_User.user_role%TYPE,
        p_emp IN NUMBER, p_vol IN NUMBER, p_rep IN NUMBER
    ) IS BEGIN
        INSERT INTO System_User(username, password, country_of_issue, user_role, employee_id, volunteer_id, representative_id, is_active)
        VALUES (p_user, p_pass, p_ctry, p_role, p_emp, p_vol, p_rep, 1);
        COMMIT;
    END;

    -- FIXED VERSION WITHOUT OUTPUT PARAMETER
    PROCEDURE create_full_user(
        p_username   IN VARCHAR2,
        p_password   IN VARCHAR2,
        p_role       IN VARCHAR2,
        p_country    IN VARCHAR2,
        p_first_name IN VARCHAR2,
        p_last_name  IN VARCHAR2,
        p_email      IN VARCHAR2,
        p_phone      IN VARCHAR2,
        p_address    IN VARCHAR2,
        p_birth_date IN DATE,
        p_ong_id     IN NUMBER DEFAULT NULL
    ) IS
        v_emp_id NUMBER := NULL;
        v_vol_id NUMBER := NULL;
        v_rep_id NUMBER := NULL;
    BEGIN
        IF p_role IN ('ADMIN', 'EMPLOYEE') THEN
            INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date)
            VALUES (p_first_name, p_last_name, p_birth_date, p_address, p_email, p_phone, SYSDATE)
            RETURNING employee_id INTO v_emp_id;
            
        ELSIF p_role = 'VOLUNTEER' THEN
            INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone)
            VALUES (p_first_name, p_last_name, p_birth_date, p_address, p_email, p_phone)
            RETURNING volunteer_id INTO v_vol_id;
            
        ELSIF p_role = 'REPRESENTATIVE' THEN
            IF p_ong_id IS NULL THEN
                RAISE_APPLICATION_ERROR(-20001, 'ONG ID is required for Representatives');
            END IF;
            INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id)
            VALUES (p_first_name, p_last_name, p_birth_date, p_address, p_email, p_phone, p_ong_id)
            RETURNING representative_id INTO v_rep_id;
        END IF;

        INSERT INTO System_User (
            username, password, country_of_issue, user_role, 
            employee_id, volunteer_id, representative_id, 
            is_active, is_staff, is_superuser
        )
        VALUES (
            p_username, p_password, p_country, p_role, 
            v_emp_id, v_vol_id, v_rep_id, 
            1, 
            CASE WHEN p_role = 'ADMIN' THEN 1 ELSE 0 END,
            CASE WHEN p_role = 'ADMIN' THEN 1 ELSE 0 END
        );
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END create_full_user;

    -- Remaining auxiliary procedures (unchanged)
    PROCEDURE update_user(p_id IN NUMBER, p_user IN VARCHAR2, p_role IN VARCHAR2) IS BEGIN
        UPDATE System_User SET username=p_user, user_role=p_role WHERE user_id=p_id;
        COMMIT;
    END;

    PROCEDURE delete_user(p_id IN NUMBER) IS BEGIN
        DELETE FROM System_User WHERE user_id=p_id;
        COMMIT;
    END;

    PROCEDURE login_user(p_user IN VARCHAR2, p_pass IN VARCHAR2, p_id OUT NUMBER, p_role OUT VARCHAR2, p_ok OUT NUMBER) IS BEGIN
        SELECT user_id, user_role INTO p_id, p_role FROM System_User WHERE username=p_user AND password=p_pass;
        p_ok := 1;
    EXCEPTION WHEN NO_DATA_FOUND THEN p_ok := 0; END;

    PROCEDURE create_identity_doc(
        p_type IN VARCHAR2, p_num IN VARCHAR2, p_ctry IN VARCHAR2,
        p_rep IN NUMBER, p_emp IN NUMBER, p_vol IN NUMBER, p_donor IN NUMBER
    ) IS BEGIN
        INSERT INTO Identity_Document(document_type, document_number, country_of_issue, representative_id, employee_id, volunteer_id, donor_id)
        VALUES (p_type, p_num, p_ctry, p_rep, p_emp, p_vol, p_donor);
        COMMIT;
    END;

    PROCEDURE update_identity_doc(p_id IN NUMBER, p_type IN VARCHAR2, p_num IN VARCHAR2) IS BEGIN
        UPDATE Identity_Document SET document_type=p_type, document_number=p_num WHERE document_id=p_id;
        COMMIT;
    END;

    PROCEDURE delete_identity_doc(p_id IN NUMBER) IS BEGIN
        DELETE FROM Identity_Document WHERE document_id=p_id;
        COMMIT;
    END;

END PKG_SYSTEM_SECURITY;
/


-- =============================================================================
-- =============================================================================
-- PACKAGE: PKG_DASHBOARD_ANALYTICS (FINAL CLEANUP)
-- Purpose: Centralized dashboard queries with optimized performance
-- =============================================================================
CREATE OR REPLACE PACKAGE PKG_DASHBOARD_ANALYTICS AS
    
    -- Main Dashboard KPIs Record Type
    TYPE t_kpi_record IS RECORD (
        metric_name VARCHAR2(50),
        current_value NUMBER,
        previous_value NUMBER,
        percentage_change NUMBER,
        trend VARCHAR2(10)
    );
    TYPE t_kpi_table IS TABLE OF t_kpi_record;
    
    -- Get all main KPIs in one call
    FUNCTION get_main_kpis RETURN t_kpi_table PIPELINED;
    
    -- Filtered data with pagination (No longer fetches total count)
    PROCEDURE get_projects_paginated(
        p_page IN NUMBER DEFAULT 1,
        p_page_size IN NUMBER DEFAULT 10,
        p_status IN VARCHAR2 DEFAULT NULL,
        p_ong_id IN NUMBER DEFAULT NULL,
        p_cursor OUT SYS_REFCURSOR
    );
    
    -- Data for Area Chart
    PROCEDURE get_donation_trends(
        p_year IN NUMBER DEFAULT EXTRACT(YEAR FROM SYSDATE),
        p_cursor OUT SYS_REFCURSOR
    );
    
    -- Data for Pie Chart
    PROCEDURE get_project_status_distribution(p_cursor OUT SYS_REFCURSOR);
    
    -- NOTE: get_projects_total_count has been REMOVED from the spec.
    
END PKG_DASHBOARD_ANALYTICS;
/

-- =============================================================================
-- PACKAGE BODY: PKG_DASHBOARD_ANALYTICS (FINAL CLEANUP)
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_DASHBOARD_ANALYTICS AS

    -- =========================================================================
    -- FUNCTION: get_main_kpis (PIPELINED)
    -- =========================================================================
    FUNCTION get_main_kpis RETURN t_kpi_table PIPELINED IS
        v_kpi t_kpi_record;
        v_current NUMBER;
        v_previous NUMBER;
    BEGIN
        -- KPI 1: Active Projects
        SELECT COUNT(*) INTO v_current
        FROM Project p
        JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
        WHERE ps.status_name = 'ACTIVO';
        
        SELECT COUNT(*) INTO v_previous
        FROM Project p
        JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
        WHERE ps.status_name = 'ACTIVO'
          AND p.start_date < ADD_MONTHS(SYSDATE, -1);
        
        v_kpi.metric_name := 'ACTIVE_PROJECTS';
        v_kpi.current_value := v_current;
        v_kpi.previous_value := v_previous;
        v_kpi.percentage_change := ROUND(((v_current - v_previous) / NULLIF(v_previous, 0)) * 100, 2);
        v_kpi.trend := CASE 
            WHEN v_current > v_previous THEN 'UP'
            WHEN v_current < v_previous THEN 'DOWN'
            ELSE 'STABLE'
        END;
        PIPE ROW(v_kpi);
        
        -- KPI 2: Total Donations (this month)
        SELECT NVL(SUM(amount), 0) INTO v_current
        FROM Donation
        WHERE TRUNC(donation_date, 'MM') = TRUNC(SYSDATE, 'MM');
        
        SELECT NVL(SUM(amount), 0) INTO v_previous
        FROM Donation
        WHERE TRUNC(donation_date, 'MM') = TRUNC(ADD_MONTHS(SYSDATE, -1), 'MM');
        
        v_kpi.metric_name := 'MONTHLY_DONATIONS';
        v_kpi.current_value := v_current;
        v_kpi.previous_value := v_previous;
        v_kpi.percentage_change := ROUND(((v_current - v_previous) / NULLIF(v_previous, 0)) * 100, 2);
        v_kpi.trend := CASE 
            WHEN v_current > v_previous THEN 'UP'
            WHEN v_current < v_previous THEN 'DOWN'
            ELSE 'STABLE'
        END;
        PIPE ROW(v_kpi);
        
        -- KPI 3: Active Volunteers
        SELECT COUNT(DISTINCT volunteer_id) INTO v_current
        FROM Volunteer_Project
        WHERE status = 'A';
        
        SELECT COUNT(DISTINCT volunteer_id) INTO v_previous
        FROM Volunteer_Project
        WHERE status = 'A'
          AND assignment_date < ADD_MONTHS(SYSDATE, -1);
        
        v_kpi.metric_name := 'ACTIVE_VOLUNTEERS';
        v_kpi.current_value := v_current;
        v_kpi.previous_value := v_previous;
        v_kpi.percentage_change := ROUND(((v_current - v_previous) / NULLIF(v_previous, 0)) * 100, 2);
        v_kpi.trend := CASE 
            WHEN v_current > v_previous THEN 'UP'
            WHEN v_current < v_previous THEN 'DOWN'
            ELSE 'STABLE'
        END;
        PIPE ROW(v_kpi);
        
        -- KPI 4: Active NGOs
        SELECT COUNT(*) INTO v_current FROM NGO;
        v_previous := v_current; -- Assume stable for NGOs
        
        v_kpi.metric_name := 'TOTAL_NGOS';
        v_kpi.current_value := v_current;
        v_kpi.previous_value := v_previous;
        v_kpi.percentage_change := 0;
        v_kpi.trend := 'STABLE';
        PIPE ROW(v_kpi);
        
        RETURN;
    END get_main_kpis;

    -- =========================================================================
    -- PROCEDURE: get_donation_trends (Data for Area Chart)
    -- =========================================================================
    PROCEDURE get_donation_trends(
        p_year IN NUMBER DEFAULT EXTRACT(YEAR FROM SYSDATE),
        p_cursor OUT SYS_REFCURSOR
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT 
                TO_CHAR(donation_date, 'YYYY-MM') AS mes,
                TO_CHAR(donation_date, 'Month', 'NLS_DATE_LANGUAGE=ENGLISH') AS mes_nombre,
                COUNT(*) AS num_donaciones,
                NVL(SUM(amount), 0) AS monto_total,
                NVL(AVG(amount), 0) AS monto_promedio,
                COUNT(DISTINCT donor_id) AS donantes_unicos
            FROM Donation
            WHERE EXTRACT(YEAR FROM donation_date) = p_year
            GROUP BY TO_CHAR(donation_date, 'YYYY-MM'), 
                     TO_CHAR(donation_date, 'Month', 'NLS_DATE_LANGUAGE=ENGLISH')
            ORDER BY mes;
    END get_donation_trends;

    -- =========================================================================
    -- PROCEDURE: get_project_status_distribution (Data for Pie Chart)
    -- =========================================================================
    PROCEDURE get_project_status_distribution(p_cursor OUT SYS_REFCURSOR) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT 
                ps.status_name,
                COUNT(*) AS cantidad,
                ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) AS porcentaje
            FROM Project p
            JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
            GROUP BY ps.status_name
            ORDER BY cantidad DESC;
    END get_project_status_distribution;

    -- =========================================================================
    -- PROCEDURE: get_projects_paginated (Unchanged body)
    -- =========================================================================
    PROCEDURE get_projects_paginated(
        p_page IN NUMBER DEFAULT 1,
        p_page_size IN NUMBER DEFAULT 10,
        p_status IN VARCHAR2 DEFAULT NULL,
        p_ong_id IN NUMBER DEFAULT NULL,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_offset NUMBER;
    BEGIN
        v_offset := (p_page - 1) * p_page_size;
        
        -- Get paginated data using OFFSET/FETCH
        OPEN p_cursor FOR
            SELECT 
                p.project_id,
                p.name,
                p.description,
                ps.status_name,
                n.name AS ngo_name,
                p.start_date,
                p.end_date
            FROM Project p
            JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
            JOIN NGO n ON p.ong_id = n.ong_id
            WHERE (p_status IS NULL OR ps.status_name = p_status)
            AND (p_ong_id IS NULL OR p.ong_id = p_ong_id)
            ORDER BY p.start_date DESC
            OFFSET v_offset ROWS FETCH NEXT p_page_size ROWS ONLY;
    END get_projects_paginated;

    -- NOTE: get_projects_total_count body is deleted.
    
END PKG_DASHBOARD_ANALYTICS;
/
-- ================================================================================
-- VIEWS - REPORTING AND BUSINESS INTELLIGENCE
-- ================================================================================

-- VIEW 1: Active Projects Summary
CREATE OR REPLACE VIEW vw_active_projects_summary AS
SELECT
  p.project_id,
  p.name AS project_name,
  ps.status_name AS project_status,
  p.start_date,
  p.end_date,
  n.name AS ngo_name,
  n.country,
  COUNT(DISTINCT vp.volunteer_id) AS volunteer_count,
  COUNT(DISTINCT d.donation_id) AS donation_count,
  NVL(SUM(d.amount), 0) AS total_donations_amount,
  TRUNC(SYSDATE) - TRUNC(p.start_date) AS days_active
FROM Project p
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
JOIN NGO n ON p.ong_id = n.ong_id
LEFT JOIN Volunteer_Project vp ON p.project_id = vp.project_id
LEFT JOIN Donation d ON p.project_id = d.project_id
WHERE ps.status_name = 'ACTIVO'
GROUP BY
  p.project_id, p.name, ps.status_name, p.start_date, p.end_date,
  n.name, n.country;

-- VIEW 2: Donor Contributions Ranking
CREATE OR REPLACE VIEW vw_donor_contributions_ranking AS
SELECT
  d.donor_id,
  d.name AS donor_name,
  dt.type_name AS donor_type,
  COUNT(DISTINCT don.donation_id) AS total_donations,
  NVL(SUM(don.amount), 0) AS total_amount_donated,
  c.currency_code,
  RANK() OVER (ORDER BY NVL(SUM(don.amount), 0) DESC) AS donor_rank,
  MAX(don.donation_date) AS last_donation_date,
  NVL(AVG(don.amount), 0) AS average_donation_amount
FROM Donor d
JOIN Donor_Type dt ON d.type_id = dt.type_id
LEFT JOIN Donation don ON d.donor_id = don.donor_id
LEFT JOIN Currency c ON don.currency_id = c.currency_id
GROUP BY
  d.donor_id, d.name, dt.type_name, c.currency_code
ORDER BY total_amount_donated DESC;

-- VIEW 3: Project Budget Status
CREATE OR REPLACE VIEW vw_project_budget_status AS
SELECT
  p.project_id,
  p.name AS project_name,
  b.budget_id,
  b.initial_amount AS budget_amount,
  c.currency_code,
  NVL(SUM(d.amount), 0) AS total_received,
  b.initial_amount - NVL(SUM(d.amount), 0) AS remaining_budget,
  ROUND((NVL(SUM(d.amount), 0) / NULLIF(b.initial_amount, 0)) * 100, 2) AS budget_utilization_percent,
  b.creation_date AS budget_created_date,
  p.start_date,
  p.end_date
FROM Project p
LEFT JOIN Budget b ON p.project_id = b.project_id
LEFT JOIN Currency c ON b.currency_id = c.currency_id
LEFT JOIN Donation d ON p.project_id = d.project_id
GROUP BY
  p.project_id, p.name, b.budget_id, b.initial_amount,
  c.currency_code, b.creation_date, p.start_date, p.end_date;

-- VIEW 4: Volunteer Expertise Mapping
CREATE OR REPLACE VIEW vw_volunteer_expertise_mapping AS
SELECT
  v.volunteer_id,
  v.first_name || ' ' || v.last_name AS volunteer_name,
  v.email,
  COUNT(DISTINCT vs.specialty_id) AS total_specialties,
  COUNT(DISTINCT vp.project_id) AS projects_assigned
FROM Volunteer v
LEFT JOIN Volunteer_Specialty vs ON v.volunteer_id = vs.volunteer_id
LEFT JOIN Volunteer_Project vp ON v.volunteer_id = vp.volunteer_id
GROUP BY
  v.volunteer_id, v.first_name, v.last_name, v.email;

-- VIEW 5: NGO Project Portfolio
CREATE OR REPLACE VIEW vw_ngo_project_portfolio AS
SELECT
  n.ong_id,
  n.name AS ngo_name,
  n.country,
  n.contact_email,
  COUNT(DISTINCT p.project_id) AS total_projects,
  SUM(CASE WHEN ps.status_name = 'ACTIVO' THEN 1 ELSE 0 END) AS active_projects,
  SUM(CASE WHEN ps.status_name = 'COMPLETADO' THEN 1 ELSE 0 END) AS completed_projects,
  SUM(CASE WHEN ps.status_name = 'CANCELADO' THEN 1 ELSE 0 END) AS cancelled_projects,
  MIN(p.start_date) AS first_project_date,
  MAX(p.start_date) AS latest_project_date
FROM NGO n
LEFT JOIN Project p ON n.ong_id = p.ong_id
LEFT JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
GROUP BY
  n.ong_id, n.name, n.country, n.contact_email;

-- VIEW 6: Employee Workload Analysis
CREATE OR REPLACE VIEW vw_employee_workload_analysis AS
SELECT
  e.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  e.email,
  e.hire_date,
  COUNT(DISTINCT a.approval_id) AS approvals_issued,
  ROUND(MONTHS_BETWEEN(SYSDATE, e.hire_date), 1) AS months_employed
FROM Employee e
LEFT JOIN Approval a ON e.employee_id = a.employee_id
GROUP BY
  e.employee_id, e.first_name, e.last_name, e.email, e.hire_date;

-- VIEW 7: Project Approval Status Flow
CREATE OR REPLACE VIEW vw_project_approval_flow AS
SELECT
  p.project_id,
  p.name AS project_name,
  ps.status_name AS project_status,
  a.approval_id,
  ask.status_name AS approval_status,
  a.approval_date,
  e.first_name || ' ' || e.last_name AS approver_name
FROM Project p
LEFT JOIN Approval a ON p.project_id = a.project_id
LEFT JOIN Approval_Status ask ON a.approval_status_id = ask.approval_status_id
LEFT JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
LEFT JOIN Employee e ON a.employee_id = e.employee_id;

-- VIEW 8: Donation Trends by Currency
CREATE OR REPLACE VIEW vw_donation_trends_by_currency AS
SELECT
  c.currency_id,
  c.currency_name,
  c.currency_code,
  c.symbol,
  COUNT(d.donation_id) AS donation_count,
  NVL(SUM(d.amount), 0) AS total_donations_local,
  NVL(AVG(d.amount), 0) AS average_donation_local,
  NVL(MIN(d.amount), 0) AS min_donation,
  NVL(MAX(d.amount), 0) AS max_donation,
  COUNT(DISTINCT d.project_id) AS projects_receiving,
  COUNT(DISTINCT d.donor_id) AS unique_donors
FROM Currency c
LEFT JOIN Donation d ON c.currency_id = d.currency_id
GROUP BY
  c.currency_id, c.currency_name, c.currency_code, c.symbol;

-- VIEW 9: Project Performance Metrics
CREATE OR REPLACE VIEW vw_project_performance_metrics AS
SELECT
  p.project_id,
  p.name AS project_name,
  ps.status_name,
  TRUNC(SYSDATE) - TRUNC(p.start_date) AS days_in_project,
  CASE
    WHEN p.end_date IS NULL THEN TRUNC(SYSDATE - TRUNC(p.start_date))
    ELSE TRUNC(p.end_date - TRUNC(p.start_date))
  END AS total_planned_days,
  COUNT(DISTINCT vp.volunteer_id) AS active_volunteers,
  COUNT(DISTINCT d.donation_id) AS total_donations,
  NVL(SUM(d.amount), 0) AS funds_raised,
  COUNT(DISTINCT r.report_id) AS reports_filed,
  COUNT(DISTINCT a.approval_id) AS approvals_needed,
  COUNT(DISTINCT pca.category_id) AS assigned_categories
FROM Project p
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
LEFT JOIN Volunteer_Project vp ON p.project_id = vp.project_id
LEFT JOIN Donation d ON p.project_id = d.project_id
LEFT JOIN Report r ON p.project_id = r.project_id
LEFT JOIN Approval a ON p.project_id = a.project_id
LEFT JOIN Project_Category_Assignment pca ON p.project_id = pca.project_id
GROUP BY
  p.project_id, p.name, ps.status_name, p.start_date, p.end_date;

-- VIEW 10: System User Activity Summary
CREATE OR REPLACE VIEW vw_system_user_activity AS
SELECT
  u.user_id,
  u.username,
  u.user_role,
  CASE 
      WHEN u.is_active = 1 THEN 'Active' 
      ELSE 'Inactive' 
  END AS status_label,
  -- CORRECCIÓN: Usamos TRIM() para convertir espacios vacíos en NULL
  COALESCE(
      TRIM(e.first_name || ' ' || e.last_name),
      TRIM(v.first_name || ' ' || v.last_name),
      TRIM(r.first_name || ' ' || r.last_name),
      u.username -- Ahora sí llegará aquí si no hay nombre
  ) AS user_full_name,
  COALESCE(e.email, v.email, r.email, 'N/A') AS email,
  COUNT(DISTINCT a.approval_id) AS approvals_processed,
  u.country_of_issue
FROM System_User u
LEFT JOIN Employee e ON u.employee_id = e.employee_id
LEFT JOIN Volunteer v ON u.volunteer_id = v.volunteer_id
LEFT JOIN Representative r ON u.representative_id = r.representative_id
LEFT JOIN Approval a ON e.employee_id = a.employee_id
GROUP BY
  u.user_id, u.username, u.user_role, u.is_active,
  e.first_name, e.last_name, e.email,
  v.first_name, v.last_name, v.email,
  r.first_name, r.last_name, r.email,
  u.country_of_issue;

-- VIEW 11: SDG Goal Impact Analysis
CREATE OR REPLACE VIEW vw_sdg_goal_impact_analysis AS
SELECT
  s.sdg_id,
  s.goal_number,
  s.goal_name,
  COUNT(DISTINCT ps.project_id) AS associated_projects,
  COUNT(DISTINCT CASE WHEN ps.contribution_level = 'ALTO' THEN ps.project_id END) AS high_impact_projects,
  COUNT(DISTINCT CASE WHEN ps.contribution_level = 'CRITICO' THEN ps.project_id END) AS critical_projects,
  NVL(SUM(d.amount), 0) AS total_funds_allocated,
  COUNT(DISTINCT d.donation_id) AS total_donations,
  COUNT(DISTINCT v.volunteer_id) AS volunteers_engaged
FROM SDG_Goal s
LEFT JOIN Project_SDG ps ON s.sdg_id = ps.sdg_id
LEFT JOIN Project p ON ps.project_id = p.project_id
LEFT JOIN Donation d ON p.project_id = d.project_id
LEFT JOIN Volunteer_Project vp ON p.project_id = vp.project_id
LEFT JOIN Volunteer v ON vp.volunteer_id = v.volunteer_id
GROUP BY
  s.sdg_id, s.goal_number, s.goal_name;

-- VIEW 12: Project Volunteer Capacity
CREATE OR REPLACE VIEW vw_project_volunteer_capacity AS
SELECT
  p.project_id,
  p.name AS project_name,
  ps.status_name,
  COUNT(DISTINCT vp.volunteer_id) AS current_volunteers,
  COUNT(DISTINCT vs.specialty_id) AS specialties_in_team,
  p.start_date,
  p.end_date
FROM Project p
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
LEFT JOIN Volunteer_Project vp ON p.project_id = vp.project_id
LEFT JOIN Volunteer_Specialty vs ON vp.volunteer_id = vs.volunteer_id
GROUP BY
  p.project_id, p.name, ps.status_name, p.start_date, p.end_date;

-- VIEW 13: NGO Financial Overview
CREATE OR REPLACE VIEW vw_ngo_financial_overview AS
SELECT
  n.ong_id,
  n.name AS ngo_name,
  COUNT(DISTINCT p.project_id) AS total_projects,
  COUNT(DISTINCT b.budget_id) AS active_budgets,
  NVL(SUM(b.initial_amount), 0) AS total_budget,
  NVL(SUM(d.amount), 0) AS total_donations_received,
  NVL(SUM(b.initial_amount), 0) - NVL(SUM(d.amount), 0) AS total_remaining_budget,
  COUNT(DISTINCT don.donor_id) AS unique_donors
FROM NGO n
LEFT JOIN Project p ON n.ong_id = p.ong_id
LEFT JOIN Budget b ON p.project_id = b.project_id
LEFT JOIN Donation d ON p.project_id = d.project_id
LEFT JOIN Donor don ON d.donor_id = don.donor_id
GROUP BY
  n.ong_id, n.name;

-- VIEW 14: Volunteer Project Assignments
CREATE OR REPLACE VIEW vw_volunteer_project_assignments AS
SELECT
  vp.assignment_id,
  v.volunteer_id,
  v.first_name || ' ' || v.last_name AS volunteer_name,
  p.project_id,
  p.name AS project_name,
  ps.status_name AS project_status,
  vp.assignment_date,
    CASE 
        WHEN vp.end_date IS NOT NULL THEN TRUNC(vp.end_date) - TRUNC(vp.assignment_date)
        ELSE TRUNC(SYSDATE) - TRUNC(vp.assignment_date)
    END AS days_assigned
FROM Volunteer_Project vp
JOIN Volunteer v ON vp.volunteer_id = v.volunteer_id
JOIN Project p ON vp.project_id = p.project_id
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id;

-- VIEW 15: Currency Exchange Rate Status
CREATE OR REPLACE VIEW vw_currency_exchange_rate_status AS
SELECT
  c.currency_id,
  c.currency_name,
  c.currency_code,
  c.symbol,
  c.exchange_rate_to_usd,
  c.last_updated,
  COUNT(DISTINCT d.donation_id) AS donations_in_currency,
  NVL(SUM(d.amount), 0) AS total_amount_in_currency
FROM Currency c
LEFT JOIN Donation d ON c.currency_id = d.currency_id
GROUP BY
  c.currency_id, c.currency_name, c.currency_code, c.symbol,
  c.exchange_rate_to_usd, c.last_updated;

-- VIEW 16: Project Category Assignment Report
CREATE OR REPLACE VIEW vw_project_category_assignment_report AS
SELECT
  pca.assignment_id,
  p.project_id,
  p.name AS project_name,
  pc.category_name,
  pca.is_primary,
  pca.assignment_date,
  COUNT(DISTINCT pca2.project_id) AS total_projects_in_category
FROM Project_Category_Assignment pca
JOIN Project p ON pca.project_id = p.project_id
JOIN Project_Category pc ON pca.category_id = pc.category_id
LEFT JOIN Project_Category_Assignment pca2 ON pc.category_id = pca2.category_id
GROUP BY
  pca.assignment_id, p.project_id, p.name, pc.category_name,
  pca.is_primary, pca.assignment_date;

-- VIEW 17: Representative NGO Connections
CREATE OR REPLACE VIEW vw_representative_ngo_connections AS
SELECT
  r.representative_id,
  r.first_name || ' ' || r.last_name AS representative_name,
  r.email,
  r.phone,
  n.ong_id,
  n.name AS ngo_name,
  n.country,
  COUNT(DISTINCT p.project_id) AS projects_managed,
  MAX(p.start_date) AS most_recent_project_date
FROM Representative r
JOIN NGO n ON r.ong_id = n.ong_id
LEFT JOIN Project p ON n.ong_id = p.ong_id
GROUP BY
  r.representative_id, r.first_name, r.last_name, r.email, r.phone,
  n.ong_id, n.name, n.country;

-- VIEW 18: Donation Activity by Project
CREATE OR REPLACE VIEW vw_donation_activity_by_project AS
SELECT
  p.project_id,
  p.name AS project_name,
  ps.status_name AS project_status,
  COUNT(d.donation_id) AS total_donations,
  NVL(SUM(d.amount), 0) AS total_amount_received,
  COUNT(DISTINCT d.donor_id) AS unique_donors,
  MAX(d.donation_date) AS latest_donation_date,
  MIN(d.donation_date) AS first_donation_date
FROM Project p
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
LEFT JOIN Donation d ON p.project_id = d.project_id
GROUP BY
  p.project_id, p.name, ps.status_name;

-- VIEW 19: Approval Workflow Status
CREATE OR REPLACE VIEW vw_approval_workflow_status AS
SELECT
  a.approval_id,
  p.project_id,
  p.name AS project_name,
  ask.status_name AS approval_status,
  a.approval_date,
  e.first_name || ' ' || e.last_name AS assigned_to,
  TRUNC(SYSDATE) - TRUNC(a.approval_date) AS days_pending
FROM Approval a
JOIN Project p ON a.project_id = p.project_id
JOIN Approval_Status ask ON a.approval_status_id = ask.approval_status_id
LEFT JOIN Employee e ON a.employee_id = e.employee_id;

-- VIEW 20: Identity Document Registry
CREATE OR REPLACE VIEW vw_identity_document_registry AS
SELECT
  id.document_id,
  id.document_type,
  id.document_number,
  id.country_of_issue,
  COALESCE(r.first_name || ' ' || r.last_name,
           e.first_name || ' ' || e.last_name,
           v.first_name || ' ' || v.last_name,
           don.name) AS person_name,
  CASE
    WHEN r.representative_id IS NOT NULL THEN 'Representative'
    WHEN e.employee_id IS NOT NULL THEN 'Employee'
    WHEN v.volunteer_id IS NOT NULL THEN 'Volunteer'
    WHEN don.donor_id IS NOT NULL THEN 'Donor'
  END AS document_holder_type
FROM Identity_Document id
LEFT JOIN Representative r ON id.representative_id = r.representative_id
LEFT JOIN Employee e ON id.employee_id = e.employee_id
LEFT JOIN Volunteer v ON id.volunteer_id = v.volunteer_id
LEFT JOIN Donor don ON id.donor_id = don.donor_id;

-- VIEW 21: Donor Type Distribution
CREATE OR REPLACE VIEW vw_donor_type_distribution AS
SELECT
  dt.type_id,
  dt.type_name,
  dt.description,
  COUNT(d.donor_id) AS total_donors,
  NVL(SUM(don.amount), 0) AS total_contributions,
  COUNT(DISTINCT don.donation_id) AS total_donations,
  ROUND(AVG(don.amount), 2) AS average_donation
FROM Donor_Type dt
LEFT JOIN Donor d ON dt.type_id = d.type_id
LEFT JOIN Donation don ON d.donor_id = don.donor_id
GROUP BY
  dt.type_id, dt.type_name, dt.description;

-- VIEW 22: Project Status Transitions
CREATE OR REPLACE VIEW vw_project_status_transitions AS
SELECT
  psh.status_history_id,
  psh.project_id,
  p.name AS project_name,
  psh.previous_status,
  psh.new_status,
  psh.change_date,
  psh.reason,
  TRUNC(SYSDATE) - TRUNC(psh.change_date) AS days_since_transition
FROM Project_Status_History psh
JOIN Project p ON psh.project_id = p.project_id;

-- VIEW 23: Specialty Skills Available
CREATE OR REPLACE VIEW vw_specialty_skills_available AS
SELECT
  s.specialty_id,
  s.specialty_name,
  COUNT(DISTINCT vs.volunteer_id) AS volunteers_with_skill,
  COUNT(DISTINCT vp.project_id) AS projects_needing_skill
FROM Specialty s
LEFT JOIN Volunteer_Specialty vs ON s.specialty_id = vs.specialty_id
LEFT JOIN Volunteer_Project vp ON vs.volunteer_id = vp.volunteer_id
GROUP BY
  s.specialty_id, s.specialty_name;

-- VIEW 24: Report Generation Activity
CREATE OR REPLACE VIEW vw_report_generation_activity AS
SELECT
  r.report_id,
  p.project_id,
  p.name AS project_name,
  r.title AS report_title,
  r.report_date,
  TRUNC(SYSDATE) - TRUNC(r.report_date) AS days_since_report,
  COUNT(*) OVER (PARTITION BY p.project_id) AS reports_per_project
FROM Report r
JOIN Project p ON r.project_id = p.project_id;

-- VIEW 25: Project SDG Alignment
CREATE OR REPLACE VIEW vw_project_sdg_alignment AS
SELECT
    p.project_id,
    p.name AS project_name,
    COUNT(DISTINCT ps.sdg_id) AS aligned_sdg_goals,
    LISTAGG(DISTINCT s.goal_number || ' - ' || s.goal_name, ', ')
        WITHIN GROUP (ORDER BY s.goal_number) AS sdg_goals
FROM Project p
LEFT JOIN Project_SDG ps ON p.project_id = ps.project_id
LEFT JOIN SDG_Goal s ON ps.sdg_id = s.sdg_id
GROUP BY
    p.project_id, p.name;
    -- 26. View for volunteers to see available projects
CREATE OR REPLACE VIEW vw_available_projects_for_volunteers AS
SELECT 
    p.project_id,
    p.name AS project_name,
    p.description,
    p.start_date,
    p.end_date,
    n.name AS ngo_name,
    n.country,
    n.city,
    ps.status_name,
    COUNT(DISTINCT vp.volunteer_id) AS current_volunteers,
    -- Associated SDGs
    (SELECT LISTAGG(s.goal_number || ': ' || s.goal_name, '; ') 
            WITHIN GROUP (ORDER BY s.goal_number)
     FROM Project_SDG psdg
     JOIN SDG_Goal s ON psdg.sdg_id = s.sdg_id
     WHERE psdg.project_id = p.project_id) AS sdg_goals,
    -- Categories
    (SELECT LISTAGG(pc.category_name, ', ') WITHIN GROUP (ORDER BY pc.category_name)
     FROM Project_Category_Assignment pca
     JOIN Project_Category pc ON pca.category_id = pc.category_id
     WHERE pca.project_id = p.project_id) AS categories
FROM Project p
JOIN Project_Status ps ON p.project_status_id = ps.project_status_id
JOIN NGO n ON p.ong_id = n.ong_id
LEFT JOIN Volunteer_Project vp ON p.project_id = vp.project_id AND vp.status = 'A'
WHERE ps.status_name = 'ACTIVO'
  AND (p.end_date IS NULL OR p.end_date > SYSDATE)
GROUP BY 
    p.project_id, p.name, p.description, p.start_date, p.end_date,
    n.name, n.country, n.city, ps.status_name
ORDER BY p.start_date DESC;