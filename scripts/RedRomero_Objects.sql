-- CONFIGURATION TABLES
-- Table: Currency
CREATE TABLE Currency (
    currency_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    currency_name VARCHAR2(50) NOT NULL,
    currency_code VARCHAR2(4) NOT NULL UNIQUE,
    symbol VARCHAR2(10),
    exchange_rate_to_usd NUMBER(15,6) NOT NULL,
    last_updated TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_currency_code CHECK (LENGTH(currency_code) >= 3),
    CONSTRAINT chk_currency_rate CHECK (exchange_rate_to_usd > 0)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Donor_Type
CREATE TABLE Donor_Type (
    type_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(200)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Approval_Status
CREATE TABLE Approval_Status (
    approval_status_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status_name VARCHAR2(50) NOT NULL UNIQUE,
    CONSTRAINT chk_approval_status CHECK (status_name IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EN_REVISION'))
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Project_Status
CREATE TABLE Project_Status (
    project_status_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status_name VARCHAR2(50) NOT NULL UNIQUE,
    CONSTRAINT chk_project_status CHECK (status_name IN ('PLANIFICACION', 'ACTIVO', 'SUSPENDIDO', 'COMPLETADO', 'CANCELADO'))
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Specialty
CREATE TABLE Specialty (
    specialty_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    specialty_name VARCHAR2(100) NOT NULL UNIQUE,
    description VARCHAR2(500)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: SDG_Goal (Sustainable Development Goals)
CREATE TABLE SDG_Goal (
    sdg_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    goal_number NUMBER NOT NULL UNIQUE,
    goal_name VARCHAR2(200) NOT NULL,
    description VARCHAR2(1000),
    icon_url VARCHAR2(500),
    CONSTRAINT chk_sdg_goal_number CHECK (goal_number BETWEEN 1 AND 17)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- MAIN ENTITY TABLES

-- Table: NGO
CREATE TABLE NGO (
    ong_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    registration_number VARCHAR2(100) NOT NULL UNIQUE,
    country VARCHAR2(50) NOT NULL,
    city VARCHAR2(50) NOT NULL,
    address VARCHAR2(200),
    contact_email VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15),
    CONSTRAINT chk_ngo_email CHECK (contact_email LIKE '%@%.%')
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Employee
CREATE TABLE Employee (
    employee_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    birth_date DATE NOT NULL,
    address VARCHAR2(200),
    email VARCHAR2(100) NOT NULL UNIQUE,
    phone VARCHAR2(15),
    hire_date DATE NOT NULL,
    CONSTRAINT chk_employee_email CHECK (email LIKE '%@%.%')
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Volunteer
CREATE TABLE Volunteer (
    volunteer_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    birth_date DATE NOT NULL,
    address VARCHAR2(200),
    email VARCHAR2(100) NOT NULL UNIQUE,
    phone VARCHAR2(15),
    CONSTRAINT chk_volunteer_email CHECK (email LIKE '%@%.%')
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Representative
CREATE TABLE Representative (
    representative_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR2(100) NOT NULL,
    last_name VARCHAR2(100) NOT NULL,
    birth_date DATE NOT NULL,
    address VARCHAR2(200),
    email VARCHAR2(100) NOT NULL UNIQUE,
    phone VARCHAR2(15),
    ong_id NUMBER NOT NULL,
    CONSTRAINT chk_representative_email CHECK (email LIKE '%@%.%'),
    CONSTRAINT fk_representative_ong FOREIGN KEY (ong_id) REFERENCES NGO(ong_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Donor
CREATE TABLE Donor (
    donor_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100),
    phone VARCHAR2(15),
    type_id NUMBER NOT NULL,
    CONSTRAINT chk_donor_email CHECK (email IS NULL OR email LIKE '%@%.%'),
    CONSTRAINT fk_donor_type FOREIGN KEY (type_id) REFERENCES Donor_Type(type_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Project
CREATE TABLE Project (
    project_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(1000),
    start_date DATE NOT NULL,
    end_date DATE,
    project_status_id NUMBER NOT NULL,
    ong_id NUMBER NOT NULL,
    representative_id NUMBER NOT NULL,
    CONSTRAINT fk_project_status FOREIGN KEY (project_status_id) REFERENCES Project_Status(project_status_id),
    CONSTRAINT fk_project_ong FOREIGN KEY (ong_id) REFERENCES NGO(ong_id),
    CONSTRAINT fk_project_representative FOREIGN KEY (representative_id) REFERENCES Representative(representative_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: System_User
CREATE TABLE System_User (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(150) NOT NULL UNIQUE, 
    password VARCHAR2(255) NOT NULL,
    
    last_login TIMESTAMP,                    
    is_active NUMBER(1) DEFAULT 1 NOT NULL, 
    is_staff NUMBER(1) DEFAULT 0 NOT NULL,  
    is_superuser NUMBER(1) DEFAULT 0 NOT NULL, 

    country_of_issue VARCHAR2(50),
    user_role VARCHAR2(20) NOT NULL,
    employee_id NUMBER,
    volunteer_id NUMBER,
    representative_id NUMBER,

    CONSTRAINT chk_user_role CHECK (user_role IN ('ADMIN', 'EMPLOYEE', 'VOLUNTEER', 'REPRESENTATIVE')),
    CONSTRAINT chk_user_single_ref CHECK (
        (CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN volunteer_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN representative_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT fk_user_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT fk_user_representative FOREIGN KEY (representative_id) REFERENCES Representative(representative_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Identity_Document
CREATE TABLE Identity_Document (
    document_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_type VARCHAR2(50) NOT NULL,
    document_number VARCHAR2(20) NOT NULL,
    country_of_issue VARCHAR2(50) NOT NULL,
    representative_id NUMBER,
    employee_id NUMBER,
    volunteer_id NUMBER,
    donor_id NUMBER,
    CONSTRAINT chk_doc_type CHECK (document_type IN ('DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA', 'RUC', 'CEDULA')),
    CONSTRAINT chk_doc_single_ref CHECK (
        (CASE WHEN representative_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN employee_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN volunteer_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN donor_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT uq_doc_number_type UNIQUE (document_type, document_number),
    CONSTRAINT fk_doc_representative FOREIGN KEY (representative_id) REFERENCES Representative(representative_id),
    CONSTRAINT fk_doc_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT fk_doc_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT fk_doc_donor FOREIGN KEY (donor_id) REFERENCES Donor(donor_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- ========================================
-- APPROVALS AND REPORTS TABLES
-- ========================================

-- Table: Approval
CREATE TABLE Approval (
    approval_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    approval_date TIMESTAMP NOT NULL,
    approval_status_id NUMBER NOT NULL,
    employee_id NUMBER NOT NULL,
    project_id NUMBER NOT NULL,
    CONSTRAINT fk_approval_status FOREIGN KEY (approval_status_id) REFERENCES Approval_Status(approval_status_id),
    CONSTRAINT fk_approval_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT fk_approval_project FOREIGN KEY (project_id) REFERENCES Project(project_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Tabla para gestionar solicitudes pendientes
CREATE TABLE Volunteer_Application (
    application_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    volunteer_id NUMBER NOT NULL,
    project_id NUMBER NOT NULL,
    application_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDIENTE' NOT NULL,
    reviewed_by_employee_id NUMBER,
    reviewed_date TIMESTAMP,
    rejection_reason VARCHAR2(500),
    CONSTRAINT chk_application_status CHECK (status IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA')),
    CONSTRAINT fk_application_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT fk_application_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_application_reviewer FOREIGN KEY (reviewed_by_employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT uq_volunteer_project_application UNIQUE (volunteer_id, project_id, status)
) TABLESPACE DATA_TABLES_REDROMERO;


-- Table: Report
CREATE TABLE Report (
    report_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    report_date TIMESTAMP NOT NULL,
    title VARCHAR2(200) NOT NULL,
    description VARCHAR2(1000),
    file_url VARCHAR2(500),
    CONSTRAINT fk_report_project FOREIGN KEY (project_id) REFERENCES Project(project_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- ========================================
-- BUDGET AND FINANCE TABLES
-- ========================================

-- Table: Budget
CREATE TABLE Budget (
    budget_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    initial_amount NUMBER(15,2) NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    description VARCHAR2(200),
    project_id NUMBER NOT NULL,
    currency_id NUMBER NOT NULL,
    CONSTRAINT chk_budget_amount CHECK (initial_amount > 0),
    CONSTRAINT fk_budget_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_budget_currency FOREIGN KEY (currency_id) REFERENCES Currency(currency_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Donation
CREATE TABLE Donation (
    donation_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donation_date TIMESTAMP NOT NULL,
    amount NUMBER(15,2) NOT NULL,
    project_id NUMBER NOT NULL,
    currency_id NUMBER NOT NULL,
    donor_id NUMBER NOT NULL,
    CONSTRAINT fk_donation_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_donation_currency FOREIGN KEY (currency_id) REFERENCES Currency(currency_id),
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES Donor(donor_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- ========================================
-- ASSIGNMENT TABLES (N:M)
-- ========================================
CREATE TABLE Volunteer_Project (
    assignment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    volunteer_id NUMBER NOT NULL,
    assignment_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    end_date TIMESTAMP, 
    status CHAR(1) DEFAULT 'A' CHECK (status IN ('A', 'I')),
    CONSTRAINT fk_vp_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_vp_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT chk_vp_dates CHECK (end_date IS NULL OR end_date >= assignment_date)
) TABLESPACE DATA_TABLES_REDROMERO;
-- Table: Volunteer_Specialty
CREATE TABLE Volunteer_Specialty (
    assignment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    specialty_id NUMBER NOT NULL,
    volunteer_id NUMBER NOT NULL,
    assignment_date TIMESTAMP NOT NULL,
    CONSTRAINT uq_volunteer_specialty UNIQUE (specialty_id, volunteer_id),
    CONSTRAINT fk_vs_specialty FOREIGN KEY (specialty_id) REFERENCES Specialty(specialty_id),
    CONSTRAINT fk_vs_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Project_Category
CREATE TABLE Project_Category (
    category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR2(100) NOT NULL UNIQUE,
    description VARCHAR2(500),
    parent_category_id NUMBER,
    is_active CHAR(1) DEFAULT 'Y' NOT NULL,
    created_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    created_by_user_id NUMBER,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id) REFERENCES Project_Category(category_id),
    CONSTRAINT fk_category_user FOREIGN KEY (created_by_user_id) REFERENCES System_User(user_id)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Project_Subcategory
CREATE TABLE Project_Subcategory (
    subcategory_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id NUMBER NOT NULL,
    subcategory_name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    is_active CHAR(1) DEFAULT 'Y' NOT NULL,
    CONSTRAINT uq_subcategory_name UNIQUE (category_id, subcategory_name),
    CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES Project_Category(category_id)
) TABLESPACE CONFIG_TABLES_REDROMERO;

-- Table: Project_Category_Assignment
CREATE TABLE Project_Category_Assignment (
    assignment_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    category_id NUMBER NOT NULL,
    is_primary CHAR(1) DEFAULT 'N' NOT NULL,
    assignment_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    assigned_by_user_id NUMBER,
    CONSTRAINT uq_project_category UNIQUE (project_id, category_id),
    CONSTRAINT fk_pca_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_pca_category FOREIGN KEY (category_id) REFERENCES Project_Category(category_id),
    CONSTRAINT fk_pca_user FOREIGN KEY (assigned_by_user_id) REFERENCES System_User(user_id)
) TABLESPACE DATA_TABLES_REDROMERO;

-- Table: Project_SDG
CREATE TABLE Project_SDG (
    project_sdg_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    sdg_id NUMBER NOT NULL,
    contribution_level VARCHAR2(20) DEFAULT 'MEDIO' NOT NULL,
    assignment_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    assigned_by_user_id NUMBER,
    CONSTRAINT uq_project_sdg UNIQUE (project_id, sdg_id),
    CONSTRAINT fk_psdg_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_psdg_sdg FOREIGN KEY (sdg_id) REFERENCES SDG_Goal(sdg_id),
    CONSTRAINT fk_psdg_user FOREIGN KEY (assigned_by_user_id) REFERENCES System_User(user_id)
) TABLESPACE DATA_TABLES_REDROMERO;
-- Table to manage pending applications
CREATE TABLE Volunteer_Application (
    application_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    volunteer_id NUMBER NOT NULL,
    project_id NUMBER NOT NULL,
    application_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    reviewed_by_employee_id NUMBER,
    reviewed_date TIMESTAMP,
    rejection_reason VARCHAR2(500),
    CONSTRAINT chk_application_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT fk_application_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT fk_application_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_application_reviewer FOREIGN KEY (reviewed_by_employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT uq_volunteer_project_application UNIQUE (volunteer_id, project_id, status)
) TABLESPACE DATA_TABLES_REDROMERO;

-- ========================================
-- HISTORY AND AUDIT TABLES
-- ========================================

-- Table: Approval_History
CREATE TABLE Approval_History (
    history_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    approval_id NUMBER NOT NULL,
    previous_status VARCHAR2(20),
    new_status VARCHAR2(20) NOT NULL,
    change_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    employee_id NUMBER NOT NULL,
    comments VARCHAR2(500),
    CONSTRAINT fk_ah_approval FOREIGN KEY (approval_id) REFERENCES Approval(approval_id),
    CONSTRAINT fk_ah_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
) TABLESPACE HISTORY_TABLES_REDROMERO;


-- Table: Budget_History
CREATE TABLE Budget_History (
    history_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    budget_id NUMBER NOT NULL,
    employee_id NUMBER NOT NULL,
    old_amount NUMBER,
    new_amount NUMBER NOT NULL,
    reason VARCHAR2(500),
    change_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    action_type VARCHAR2(20) NOT NULL,
    CONSTRAINT chk_bh_action CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'ADJUST')),
    CONSTRAINT chk_bh_new_amount CHECK (new_amount >= 0),
    CONSTRAINT fk_bh_budget FOREIGN KEY (budget_id) REFERENCES Budget(budget_id),
    CONSTRAINT fk_bh_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
) TABLESPACE HISTORY_TABLES_REDROMERO;

-- Table: Project_Status_History
CREATE TABLE Project_Status_History (
    status_history_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    previous_status VARCHAR2(50),
    new_status VARCHAR2(50) NOT NULL,
    change_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    employee_id NUMBER NOT NULL,
    reason VARCHAR2(500),
    approval_id NUMBER,
    CONSTRAINT fk_psh_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_psh_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT fk_psh_approval FOREIGN KEY (approval_id) REFERENCES Approval(approval_id)
) TABLESPACE HISTORY_TABLES_REDROMERO;

-- Table: Donation_Transaction_Log
CREATE TABLE Donation_Transaction_Log (
    transaction_log_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donation_id NUMBER NOT NULL,
    action_type VARCHAR2(20) NOT NULL,
    old_amount NUMBER,
    new_amount NUMBER,
    old_currency_id NUMBER,
    new_currency_id NUMBER,
    change_date TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    changed_by_user_id NUMBER,
    ip_address VARCHAR2(45),
    reason VARCHAR2(500),
    CONSTRAINT fk_dtl_donation FOREIGN KEY (donation_id) REFERENCES Donation(donation_id),
    CONSTRAINT fk_dtl_old_currency FOREIGN KEY (old_currency_id) REFERENCES Currency(currency_id),
    CONSTRAINT fk_dtl_new_currency FOREIGN KEY (new_currency_id) REFERENCES Currency(currency_id),
    CONSTRAINT fk_dtl_user FOREIGN KEY (changed_by_user_id) REFERENCES System_User(user_id)
) TABLESPACE HISTORY_TABLES_REDROMERO;

-- Table: Project_Assignment_History
CREATE TABLE Project_Assignment_History (
    assignment_history_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id NUMBER NOT NULL,
    volunteer_id NUMBER,
    employee_id NUMBER,
    assignment_type VARCHAR2(20) NOT NULL,
    action VARCHAR2(20) NOT NULL,
    assignment_date TIMESTAMP,
    removal_date TIMESTAMP,
    reason VARCHAR2(500),
    assigned_by_user_id NUMBER,
    CONSTRAINT chk_pah_type CHECK (assignment_type IN ('VOLUNTEER', 'EMPLOYEE')),
    CONSTRAINT chk_pah_action CHECK (action IN ('ASSIGNED', 'REMOVED', 'REASSIGNED')),
    CONSTRAINT chk_pah_dates CHECK (removal_date IS NULL OR removal_date >= assignment_date),
    CONSTRAINT chk_pah_ref CHECK (
        (assignment_type = 'VOLUNTEER' AND volunteer_id IS NOT NULL AND employee_id IS NULL) OR
        (assignment_type = 'EMPLOYEE' AND employee_id IS NOT NULL AND volunteer_id IS NULL)
    ),
    CONSTRAINT fk_pah_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    CONSTRAINT fk_pah_volunteer FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id),
    CONSTRAINT fk_pah_employee FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    CONSTRAINT fk_pah_user FOREIGN KEY (assigned_by_user_id) REFERENCES System_User(user_id)
) TABLESPACE HISTORY_TABLES_REDROMERO;

-- Indexes on main tables
CREATE INDEX idx_project_status ON Project(project_status_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_project_ong ON Project(ong_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_project_representative ON Project(representative_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_project_status_dates ON Project(project_id, project_status_id, start_date, end_date) TABLESPACE INDEXES_REDROMERO;

CREATE INDEX idx_employee_hire_date ON Employee(hire_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_representative_ong ON Representative(ong_id) TABLESPACE INDEXES_REDROMERO;

-- Indexes on finance tables
CREATE INDEX idx_donation_project ON Donation(project_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_donation_donor ON Donation(donor_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_donation_date_currency ON Donation(donation_date, currency_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_budget_project ON Budget(project_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_budget_currency ON Budget(currency_id) TABLESPACE INDEXES_REDROMERO;

-- Indexes on approval tables
CREATE INDEX idx_approval_project ON Approval(project_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_approval_employee ON Approval(employee_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_approval_status_date ON Approval(approval_status_id, approval_date) TABLESPACE INDEXES_REDROMERO;

-- Indexes on assignment tables
CREATE INDEX idx_vp_date ON Volunteer_Project(assignment_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_vs_volunteer_specialty ON Volunteer_Specialty(volunteer_id, specialty_id) TABLESPACE INDEXES_REDROMERO;

-- Indexes on history tables
CREATE INDEX idx_ah_approval_date ON Approval_History(approval_id, change_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_bh_budget_date ON Budget_History(budget_id, change_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_psh_project_date ON Project_Status_History(project_id, change_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_dtl_donation_date ON Donation_Transaction_Log(donation_id, change_date) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_dtl_user ON Donation_Transaction_Log(changed_by_user_id) TABLESPACE INDEXES_REDROMERO;

-- Indexes on System_User
CREATE INDEX idx_user_employee ON System_User(employee_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_user_volunteer ON System_User(volunteer_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_user_representative ON System_User(representative_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_user_role ON System_User(user_role) TABLESPACE INDEXES_REDROMERO;

-- Indexes on Identity_Document
CREATE INDEX idx_doc_employee ON Identity_Document(employee_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_doc_volunteer ON Identity_Document(volunteer_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_doc_representative ON Identity_Document(representative_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_doc_donor ON Identity_Document(donor_id) TABLESPACE INDEXES_REDROMERO;

-- Indexes on reports
CREATE INDEX idx_report_project_date ON Report(project_id, report_date) TABLESPACE INDEXES_REDROMERO;
-- Indexes on application
CREATE INDEX idx_application_status ON Volunteer_Application(status) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_application_volunteer ON Volunteer_Application(volunteer_id) TABLESPACE INDEXES_REDROMERO;
CREATE INDEX idx_application_project ON Volunteer_Application(project_id) TABLESPACE INDEXES_REDROMERO;