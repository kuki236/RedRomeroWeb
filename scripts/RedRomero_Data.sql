-- =================================================================
-- DATA INSERTION SCRIPT - NGO Management System (NO EXPLICIT IDs)
-- =================================================================

SET DEFINE OFF;
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS';

-- ========================================
-- INSERTS: CONFIGURATION TABLES
-- ========================================

-- Table: Currency
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('US Dollar', 'USD', '$', 1.000000);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Euro', 'EUR', '€', 1.165500);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Peruvian Sol', 'PEN', 'S/', 0.295200);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('British Pound', 'GBP', '£', 1.335000);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Canadian Dollar', 'CAD', 'C$', 0.715000);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Mexican Peso', 'MXN', '$', 0.054300);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Colombian Peso', 'COP', '$', 0.000260);
INSERT INTO Currency (currency_name, currency_code, symbol, exchange_rate_to_usd) VALUES ('Chilean Peso', 'CLP', '$', 0.001060);

-- Table: Donor_Type
INSERT INTO Donor_Type (type_name, description) VALUES ('Individual', 'Personal or private donor');
INSERT INTO Donor_Type (type_name, description) VALUES ('Corporate', 'Business or corporate donor');
INSERT INTO Donor_Type (type_name, description) VALUES ('Foundation', 'Foundation or other non-profit organization');
INSERT INTO Donor_Type (type_name, description) VALUES ('Government', 'Government entity or public fund');
INSERT INTO Donor_Type (type_name, description) VALUES ('Anonymous', 'Donor who does not wish to be identified');

-- Table: Approval_Status
INSERT INTO Approval_Status (status_name) VALUES ('PENDIENTE');
INSERT INTO Approval_Status (status_name) VALUES ('APROBADO');
INSERT INTO Approval_Status (status_name) VALUES ('RECHAZADO');
INSERT INTO Approval_Status (status_name) VALUES ('EN_REVISION');

-- Table: Project_Status
INSERT INTO Project_Status (status_name) VALUES ('PLANIFICACION');
INSERT INTO Project_Status (status_name) VALUES ('ACTIVO');
INSERT INTO Project_Status (status_name) VALUES ('SUSPENDIDO');
INSERT INTO Project_Status (status_name) VALUES ('COMPLETADO');
INSERT INTO Project_Status (status_name) VALUES ('CANCELADO');

-- Table: Specialty
INSERT INTO Specialty (specialty_name, description) VALUES ('Medicina General', 'Primary and emergency medical care.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Educación Infantil', 'Teaching and childcare.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Ingeniería Civil', 'Construction of basic infrastructure.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Desarrollo de Software', 'Technological support and platform development.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Logística y Distribución', 'Supply chain and humanitarian aid management.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Agricultura Sostenible', 'Cultivation techniques and food security.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Asesoría Legal', 'Support on legal issues and human rights.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Marketing y Comunicación', 'Project dissemination and fundraising.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Gestión de Proyectos', 'Coordination and administration of social projects.');
INSERT INTO Specialty (specialty_name, description) VALUES ('Psicología Comunitaria', 'Psychosocial support to vulnerable communities.');

-- Table: SDG_Goal
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (1, 'No Poverty');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (2, 'Zero Hunger');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (3, 'Good Health and Well-being');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (4, 'Quality Education');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (5, 'Gender Equality');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (6, 'Clean Water and Sanitation');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (7, 'Affordable and Clean Energy');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (8, 'Decent Work and Economic Growth');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (9, 'Industry, Innovation and Infrastructure');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (10, 'Reduced Inequalities');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (11, 'Sustainable Cities and Communities');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (12, 'Responsible Consumption and Production');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (13, 'Climate Action');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (14, 'Life Below Water');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (15, 'Life on Land');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (16, 'Peace, Justice and Strong Institutions');
INSERT INTO SDG_Goal (goal_number, goal_name) VALUES (17, 'Partnerships for the Goals');

COMMIT;

-- ========================================
-- INSERTS: MAIN ENTITIES (Level 1)
-- ========================================

-- Table: NGO
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Manos Unidas Global', 'ONG-001-PER', 'Perú', 'Lima', 'Av. Solidaridad 123', 'info@manosunidas.org', '987654321');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Educación Sin Fronteras', 'ONG-002-COL', 'Colombia', 'Bogotá', 'Calle Falsa 123', 'contacto@educasf.co', '555123456');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Salud Para Todos', 'ONG-003-ARG', 'Argentina', 'Buenos Aires', 'Av. de Mayo 500', 'salud@ong.ar', '11555001');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Green Planet Initiative', 'ONG-004-USA', 'USA', 'New York', '120 Green St', 'contact@greenplanet.org', '121255501');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Futuro Andino', 'ONG-005-PER', 'Perú', 'Cusco', 'Plaza de Armas 10', 'info@futuroandino.pe', '987000123');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Amazonía Resiliente', 'ONG-006-BRA', 'Brasil', 'Manaus', 'Rua das Arvores 50', 'contato@amazonia.br', '559255501');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Voces Iguales', 'ONG-007-MEX', 'México', 'CDMX', 'Insurgentes Sur 1000', 'voces@ong.mx', '525555501');
INSERT INTO NGO (name, registration_number, country, city, address, contact_email, phone) VALUES ('Red de Apoyo Comunitario', 'ONG-008-ESP', 'España', 'Madrid', 'Calle Mayor 15', 'apoyo@redcom.es', '349155501');

-- Table: Employee
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Admin', 'Global', '1980-05-10', 'Calle Admin 100', 'admin@plataforma.com', '999999999', '2020-01-15');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Ana', 'Torres', '1990-03-15', 'Av. Central 200', 'atorres@plataforma.com', '988888888', '2021-06-01');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Luis', 'Gomez', '1992-11-20', 'Jr. Robles 300', 'lgomez@plataforma.com', '977777777', '2022-02-10');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Maria', 'Fernandez', '1988-07-30', 'Calle Sur 400', 'mfernandez@plataforma.com', '966666666', '2023-01-20');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Carlos', 'Mendoza', '1995-01-05', 'Av. Oeste 500', 'cmendoza@plataforma.com', '955555555', '2023-11-01');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Lucia', 'Ramos', '1993-09-12', 'Av. Norte 600', 'lramos@plataforma.com', '944444444', '2024-03-15');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Jorge', 'Paredes', '1985-02-28', 'Calle Este 700', 'jparedes@plataforma.com', '933333333', '2024-07-01');
INSERT INTO Employee (first_name, last_name, birth_date, address, email, phone, hire_date) VALUES ('Sofia', 'Vega', '1998-06-18', 'Jr. Centro 800', 'svega@plataforma.com', '922222222', '2025-01-10');

-- Table: Volunteer
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Elena', 'Vargas', '1998-02-10', 'Av. Arequipa 100', 'elena.vargas@gmail.com', '911111111');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Bruno', 'Diaz', '2000-06-25', 'Calle Pardo 200', 'bruno.diaz@hotmail.com', '922222222');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Carla', 'Ruiz', '1995-09-05', 'Jr. Union 300', 'carla.ruiz@yahoo.com', '933333333');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('David', 'Soto', '2001-12-12', 'Av. Larco 400', 'david.soto@outlook.com', '944444444');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Sofia', 'Reyes', '1999-04-30', 'Calle Sol 500', 'sofia.reyes@gmail.com', '955555111');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Mateo', 'Flores', '1997-08-18', 'Av. Grau 600', 'mateo.flores@gmail.com', '966666222');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Lucia', 'Campos', '2002-01-22', 'Jr. Luna 700', 'lucia.campos@hotmail.com', '977777333');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Javier', 'Perez', '1996-03-14', 'Av. 28 de Julio 800', 'javier.perez@yahoo.com', '988888444');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Valeria', 'Chavez', '2000-11-01', 'Calle Salaverry 900', 'valeria.chavez@gmail.com', '912345678');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Miguel', 'Ortiz', '1994-07-07', 'Av. Benavides 1000', 'miguel.ortiz@outlook.com', '923456789');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Gabriela', 'Luna', '1998-05-16', 'Calle Berlin 1100', 'gabi.luna@gmail.com', '934567890');
INSERT INTO Volunteer (first_name, last_name, birth_date, address, email, phone) VALUES ('Diego', 'Ramos', '1999-10-20', 'Jr. Ica 1200', 'diego.ramos@hotmail.com', '945678901');

-- Table: Representative
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Rosa', 'Morales', '1985-04-12', 'Av. Solidaridad 123', 'rosa.morales@manosunidas.org', '987654320', 1);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Juan', 'Valdez', '1982-08-20', 'Calle Falsa 123', 'juan.valdez@educasf.co', '555123455', 2);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Martin', 'Paz', '1979-12-01', 'Av. de Mayo 500', 'martin.paz@ong.ar', '11555002', 3);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('John', 'Smith', '1988-06-15', '120 Green St', 'j.smith@greenplanet.org', '121255502', 4);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Killa', 'Quispe', '1990-01-30', 'Plaza de Armas 10', 'killa.quispe@futuroandino.pe', '987000122', 5);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Thiago', 'Silva', '1991-09-10', 'Rua das Arvores 50', 'thiago.silva@amazonia.br', '559255502', 6);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Ximena', 'Herrera', '1986-07-22', 'Insurgentes Sur 1000', 'ximena.herrera@ong.mx', '525555502', 7);
INSERT INTO Representative (first_name, last_name, birth_date, address, email, phone, ong_id) VALUES ('Pedro', 'Garcia', '1983-03-05', 'Calle Mayor 15', 'pedro.garcia@redcom.es', '349155502', 8);

-- Table: Donor
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Empresa ABC S.A.C.', 'donaciones@empresaabc.com', '980000001', 2);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Ana Sofia Gonzales', 'anasofia@gmail.com', '980000002', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Fundación El Sol', 'contacto@fundacionelsol.org', '980000003', 3);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Carlos Jimenez', 'carlos.jimenez@outlook.com', '980000004', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Tech Solutions Ltd.', 'csr@techsolutions.com', '980000005', 2);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Maria Luisa Peña', 'marialuisa@yahoo.com', '980000006', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Gobierno Regional de Lima', 'proyectos@regionlima.gob.pe', '14015000', 4);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Comercial del Norte S.R.L.', 'gerencia@comercialnorte.com', '980000008', 2);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Fundación Porvenir', 'admin@porvenir.org', '980000009', 3);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Laura Fernandez', 'laura.f@gmail.com', '980000010', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Ricardo Palma', 'ricardo.p@gmail.com', '980000011', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Global Enterprises', 'contact@globalent.com', '980000012', 2);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Lucia Mendez', 'lucia.mendez@outlook.com', '980000013', 1);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Hope Foundation', 'hope@foundation.org', '980000014', 3);
INSERT INTO Donor (name, email, phone, type_id) VALUES ('Donante Confidencial', null, null, 5);

COMMIT;

-- ========================================
-- INSERTS: MAIN ENTITIES (Level 2 - Depend on Level 1)
-- ========================================

-- Table: System_User
-- 1. ADMIN GLOBAL (User with access to the Django´s Panel)
INSERT INTO System_User 
(username, password, country_of_issue, user_role, employee_id, is_active, is_staff, is_superuser) 
VALUES 
('admin_global', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'ADMIN', 1, 1, 1, 1);

INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('atorres', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 2);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('lgomez', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 3);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('mfernandez', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 4);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('cmendoza', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 5);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('lramos', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 6);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('jparedes', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 7);
INSERT INTO System_User (username, password, country_of_issue, user_role, employee_id) VALUES ('svega', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'EMPLOYEE', 8);

INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('rmorales', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'REPRESENTATIVE', 1);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('jvaldez', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Colombia', 'REPRESENTATIVE', 2);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('mpaz', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Argentina', 'REPRESENTATIVE', 3);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('jsmith', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'USA', 'REPRESENTATIVE', 4);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('kquispe', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'REPRESENTATIVE', 5);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('tsilva', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Brasil', 'REPRESENTATIVE', 6);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('xherrera', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'México', 'REPRESENTATIVE', 7);
INSERT INTO System_User (username, password, country_of_issue, user_role, representative_id) VALUES ('pgarcia', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'España', 'REPRESENTATIVE', 8);


INSERT INTO System_User (username, password, country_of_issue, user_role, volunteer_id) VALUES ('evargas', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'VOLUNTEER', 1);
INSERT INTO System_User (username, password, country_of_issue, user_role, volunteer_id) VALUES ('bdiaz', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'VOLUNTEER', 2);
INSERT INTO System_User (username, password, country_of_issue, user_role, volunteer_id) VALUES ('cruiz', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'VOLUNTEER', 3);
INSERT INTO System_User (username, password, country_of_issue, user_role, volunteer_id) VALUES ('dsoto', 'pbkdf2_sha256$1000000$1wwK3DU7DhkUbZHql7MFaV$MdNZva9DxIaQAO0oFVg7B8Lwkserri9JIzlX7S/e1Vk=', 'Perú', 'VOLUNTEER', 4);

-- Table: Project_Category (8 Categories)

INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Educación', 'Projects related to teaching and training.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Salud', 'Medical infrastructure projects and health campaigns.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Medio Ambiente', 'Conservation and sustainability projects.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Desarrollo Comunitario', 'Social and economic infrastructure projects.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Derechos Humanos', 'Human rights defense and promotion projects.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Tecnología e Innovación', 'Digital divide and development projects.', null, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Infraestructura Básica', 'Water, sanitation, and housing projects.', 4, 'Y', 1);
INSERT INTO Project_Category (category_name, description, parent_category_id, is_active, created_by_user_id) 
VALUES ('Ayuda Humanitaria', 'Emergency and disaster response.', null, 'Y', 1);

-- TABLE: Identity_Document
-- Employees
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000001', 'Perú', 1);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000002', 'Perú', 2);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000003', 'Perú', 3);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000004', 'Perú', 4);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000005', 'Perú', 5);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000006', 'Perú', 6);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000007', 'Perú', 7);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, employee_id) VALUES ('DNI', '10000008', 'Perú', 8);
-- Representatives
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('DNI', '20000001', 'Perú', 1);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('CEDULA', '20000002', 'Colombia', 2);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('DNI', '20000003', 'Argentina', 3);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('PASAPORTE', 'P20000004', 'USA', 4);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('DNI', '20000005', 'Perú', 5);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('CEDULA', '20000006', 'Brasil', 6);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('CEDULA', '20000007', 'México', 7);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, representative_id) VALUES ('PASAPORTE', 'P20000008', 'España', 8);
-- Volunteers
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000001', 'Perú', 1);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000002', 'Perú', 2);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000003', 'Perú', 3);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000004', 'Perú', 4);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000005', 'Perú', 5);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000006', 'Perú', 6);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000007', 'Perú', 7);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000008', 'Perú', 8);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000009', 'Perú', 9);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000010', 'Perú', 10);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000011', 'Perú', 11);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, volunteer_id) VALUES ('DNI', '30000012', 'Perú', 12);
-- Donors
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('RUC', '20123456789', 'Perú', 1);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000002', 'Perú', 2);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('RUC', '20987654321', 'Perú', 3);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000004', 'Perú', 4);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('PASAPORTE', 'P40000005', 'USA', 5);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000006', 'Perú', 6);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('RUC', '20111111111', 'Perú', 7);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('RUC', '20222222222', 'Perú', 8);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('RUC', '20333333333', 'Colombia', 9);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000010', 'Perú', 10);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000011', 'Perú', 11);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('PASAPORTE', 'P40000012', 'USA', 12);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '40000013', 'Argentina', 13);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('PASAPORTE', 'P40000014', 'Canadá', 14);
INSERT INTO Identity_Document (document_type, document_number, country_of_issue, donor_id) VALUES ('DNI', '99999999', 'Perú', 15);

COMMIT;

-- TABLE: Project
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Escuela Rural Puno 2024', 'Construction of 2 classrooms in Puno.', '2024-02-01', '2024-08-30', 4, 1, 1);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Posta Médica Iquitos 2024', 'Equipping a medical post.', '2024-03-15', '2024-10-15', 4, 3, 3);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Alfabetización Digital Bogotá 2024', 'Computer classes for adults.', '2024-04-01', '2024-12-10', 4, 2, 2);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Comedor Comunitario Cusco 2024', 'Implementation of a dining hall for 100 children.', '2024-05-10', '2024-12-20', 4, 5, 5);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Reforestación Amazonas 2024', 'Planting of 5000 trees.', '2024-06-01', '2024-12-01', 4, 6, 6);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Agua Limpia Arequipa 2024', 'Installation of water filters.', '2024-03-01', '2024-12-05', 4, 1, 1);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Liderazgo Femenino CDMX 2024', 'Workshops for entrepreneurial women.', '2024-07-01', '2024-12-15', 4, 7, 7);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Apoyo Legal Migrantes Madrid 2024', 'Free legal advice.', '2024-02-15', '2024-12-18', 4, 8, 8);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Reciclaje Comunitario NY 2024', 'Collection and recycling center.', '2024-05-01', '2024-12-22', 4, 4, 4);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Campaña Vacunación Buenos Aires 2024', 'Influenza vaccination.', '2024-08-01', '2024-12-01', 4, 3, 3);

-- 2025 Projects
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Agua Potable Ayacucho 2025', 'Installation of water and sanitation system.', '2025-01-15', '2025-06-30', 4, 1, 1);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Programa de Becas CDMX 2025', 'Scholarships for girls in STEM careers.', '2025-02-01', '2025-09-30', 4, 7, 7);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Apoyo a Refugiados Madrid 2025', 'Legal and food assistance.', '2025-03-01', '2025-12-31', 2, 8, 8);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Centro de Reciclaje NY 2025', 'Implementation of a community center.', '2025-05-01', '2026-04-30', 2, 4, 4);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Taller Liderazgo Femenino BA 2025', 'Workshops in Buenos Aires.', '2025-06-01', '2025-11-30', 2, 3, 3);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Conservación Tortugas Manaus 2025', 'Nest protection in the Amazon.', '2025-04-01', '2025-12-01', 2, 6, 6);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Biblioteca Móvil Cusco 2025', 'Itinerant bus with books for children.', '2025-07-01', '2026-06-30', 2, 5, 5);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Tech para Todos Bogotá 2025', 'Delivery of tablets to rural schools.', '2025-02-15', '2025-11-15', 2, 2, 2);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Salud Mental Comunitaria Lima 2025', 'Psychological support campaigns.', '2025-08-01', '2026-02-28', 2, 1, 1);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Energía Solar Andina 2025', 'Installation of solar panels in Apurimac.', '2025-09-01', '2026-08-31', 2, 5, 5);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Red de Cooperativas Cafetaleras 2025', 'Support for coffee producers in Colombia.', '2025-05-15', '2026-05-14', 2, 2, 2);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Huertos Urbanos Madrid 2025', 'Creation of rooftop gardens.', '2025-10-01', '2026-09-30', 2, 8, 8);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Campaña de Invierno BA 2025', 'Collection and delivery of warm clothing.', '2025-11-01', '2026-01-31', 1, 3, 3);
INSERT INTO Project (name, description, start_date, end_date, project_status_id, ong_id, representative_id) 
VALUES ('Cumbre Climática Juvenil NY 2025', 'Event organization.', '2025-12-01', '2026-03-31', 1, 4, 4);

COMMIT;

-- TABLE: Approval

INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-01-25 10:00:00', 2, 2, 1);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-03-10 11:00:00', 2, 3, 2);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-03-25 12:00:00', 2, 4, 3);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-05-01 14:00:00', 2, 5, 4);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-05-20 15:00:00', 2, 2, 5);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-02-20 09:00:00', 2, 3, 6);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-06-15 10:00:00', 2, 4, 7);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-02-10 11:00:00', 2, 5, 8);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-04-20 12:00:00', 2, 2, 9);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2024-07-20 14:00:00', 2, 3, 10);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-01-10 09:00:00', 2, 4, 11);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-01-20 10:00:00', 2, 5, 12);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-02-20 11:00:00', 2, 6, 13);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-04-15 12:00:00', 2, 7, 14);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-05-20 14:00:00', 2, 8, 15);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-03-20 15:00:00', 2, 6, 16);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-06-15 09:00:00', 2, 7, 17);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-02-10 10:00:00', 2, 8, 18);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-07-20 11:00:00', 2, 6, 19);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-08-20 12:00:00', 2, 7, 20);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-05-10 14:00:00', 2, 8, 21);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-09-20 15:00:00', 2, 6, 22);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-10-20 09:00:00', 1, 7, 23);
INSERT INTO Approval (approval_date, approval_status_id, employee_id, project_id) VALUES ('2025-10-25 10:00:00', 1, 8, 24);

-- TABLE: Budget

INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (15000.00, '2024-01-26 00:00:00', 'Initial construction budget', 1, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (20000.00, '2024-03-11 00:00:00', 'Medical equipment', 2, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (10000.00, '2024-03-26 00:00:00', 'Computer equipment', 3, 7);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (25000.00, '2024-05-02 00:00:00', 'Food and implementation', 4, 3);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (18000.00, '2024-05-21 00:00:00', 'Saplings and tools', 5, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (12000.00, '2024-02-21 00:00:00', 'Filters and training', 6, 3);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (15000.00, '2024-06-16 00:00:00', 'Materials and speakers', 7, 6);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (20000.00, '2024-02-11 00:00:00', 'Operating and legal expenses', 8, 2);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (30000.00, '2024-04-21 00:00:00', 'Machinery and permits', 9, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (10000.00, '2024-07-21 00:00:00', 'Medical supplies', 10, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (40000.00, '2025-01-11 00:00:00', 'Construction materials', 11, 3);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (50000.00, '2025-01-21 00:00:00', 'Scholarship fund', 12, 6);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (25000.00, '2025-02-21 00:00:00', 'Assistance fund', 13, 2);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (35000.00, '2025-04-16 00:00:00', 'Recycling infrastructure', 14, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (15000.00, '2025-05-21 00:00:00', 'Workshop materials', 15, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (18000.00, '2025-03-21 00:00:00', 'Monitoring equipment', 16, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (22000.00, '2025-06-16 00:00:00', 'Vehicle adaptation and books', 17, 3);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (30000.00, '2025-02-11 00:00:00', 'Acquisition of 100 tablets', 18, 7);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (15000.00, '2025-07-21 00:00:00', 'Professionals and materials', 19, 3);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (45000.00, '2025-08-21 00:00:00', 'Solar panels and installation', 20, 1);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (25000.00, '2025-05-11 00:00:00', 'Initial training fund', 21, 7);
INSERT INTO Budget (initial_amount, creation_date, description, project_id, currency_id) VALUES (10000.00, '2025-09-21 00:00:00', 'Seeds, soil, and tools', 22, 2);

-- TABLE: Donation

INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-02-15 10:00:00', 5000.00, 1, 1, 1);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-02-20 11:00:00', 1000.00, 1, 3, 2);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-03-20 12:00:00', 10000.00, 2, 1, 3);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-04-05 14:00:00', 500.00, 3, 7, 4);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-04-10 15:00:00', 5000.00, 3, 7, 5);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-05-15 09:00:00', 10000.00, 4, 3, 7);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-05-20 10:00:00', 5000.00, 4, 3, 6);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-06-10 11:00:00', 8000.00, 5, 1, 8);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-06-15 12:00:00', 2000.00, 5, 1, 9);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-03-01 14:00:00', 3000.00, 6, 3, 10);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-03-05 15:00:00', 4000.00, 6, 3, 11);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-07-05 09:00:00', 5000.00, 7, 6, 12);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-07-10 10:00:00', 1500.00, 7, 6, 13);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-02-20 11:00:00', 10000.00, 8, 2, 14);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-02-25 12:00:00', 5000.00, 8, 2, 15);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-05-01 14:00:00', 15000.00, 9, 1, 5);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-05-05 15:00:00', 5000.00, 9, 1, 12);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-08-10 09:00:00', 2000.00, 10, 1, 1);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-08-15 10:00:00', 3000.00, 10, 1, 2);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2024-09-01 11:00:00', 2500.00, 1, 1, 4);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-01-20 10:00:00', 10000.00, 11, 3, 7);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-01-25 11:00:00', 5000.00, 11, 3, 1);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-02-01 12:00:00', 20000.00, 12, 6, 9);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-02-05 14:00:00', 10000.00, 12, 6, 5);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-03-05 15:00:00', 5000.00, 13, 2, 14);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-03-10 09:00:00', 2500.00, 13, 2, 10);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-04-20 10:00:00', 10000.00, 14, 1, 12);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-06-01 11:00:00', 5000.00, 15, 1, 3);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-04-01 12:00:00', 7000.00, 16, 1, 8);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-07-05 14:00:00', 5000.00, 17, 3, 6);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-02-20 15:00:00', 15000.00, 18, 7, 5);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-08-01 09:00:00', 2000.00, 19, 3, 11);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-08-10 10:00:00', 3000.00, 19, 3, 13);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-09-01 11:00:00', 20000.00, 20, 1, 1);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-05-20 12:00:00', 10000.00, 21, 7, 9);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-09-25 14:00:00', 5000.00, 22, 2, 14);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-10-21 15:00:00', 5000.00, 23, 1, 3);
INSERT INTO Donation (donation_date, amount, project_id, currency_id, donor_id) VALUES ('2025-10-26 09:00:00', 10000.00, 24, 1, 5);

-- TABLE: Report
INSERT INTO Report (project_id, report_date, title, description) VALUES (1, '2024-05-01 00:00:00', 'Progress Report 1 - Puno', 'Foundations completed.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (1, '2024-09-01 00:00:00', 'Final Report - Puno', 'Work delivered and audited.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (2, '2024-06-15 00:00:00', 'Progress Report 1 - Iquitos', 'Equipment acquired.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (2, '2024-10-16 00:00:00', 'Final Report - Iquitos', 'Medical post operational.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (3, '2024-08-01 00:00:00', 'Midterm Report - Bogotá', '50% of participants trained.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (3, '2024-12-11 00:00:00', 'Final Report - Bogotá', 'Project closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (4, '2024-08-10 00:00:00', 'Progress Report - Cusco', 'Kitchen implemented.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (4, '2024-12-21 00:00:00', 'Final Report - Cusco', 'Dining hall operational.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (5, '2024-09-01 00:00:00', 'Midterm Report - Amazonas', '2500 trees planted.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (5, '2024-12-02 00:00:00', 'Final Report - Amazonas', 'Goal of 5000 trees met.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (6, '2024-07-01 00:00:00', 'Progress Report - Arequipa', 'Filter installation.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (6, '2024-12-06 00:00:00', 'Final Report - Arequipa', 'Project closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (7, '2024-09-15 00:00:00', 'Progress Report - CDMX', 'First cycle of workshops.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (7, '2024-12-16 00:00:00', 'Final Report - CDMX', 'Project closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (8, '2024-12-19 00:00:00', 'Final Report - Madrid', 'Project closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (9, '2024-12-23 00:00:00', 'Final Report - NY', 'Project closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (10, '2024-10-01 00:00:00', 'Progress Report - BA', '50% vaccinated.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (10, '2024-12-02 00:00:00', 'Final Report - BA', 'Campaign closure.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (11, '2025-04-01 00:00:00', 'Progress Report - Ayacucho', 'Pipes installed.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (11, '2025-07-01 00:00:00', 'Final Report - Ayacucho', 'Water system operational.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (12, '2025-05-01 00:00:00', 'Progress Report - Becas CDMX', 'Beneficiaries selected.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (12, '2025-10-01 00:00:00', 'Final Report - Becas CDMX', 'Funds delivered.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (13, '2025-06-01 00:00:00', 'Q2 Report - Refugiados Madrid', '100 people served.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (13, '2025-09-01 00:00:00', 'Q3 Report - Refugiados Madrid', '250 people served.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (14, '2025-08-01 00:00:00', 'Progress Report - Reciclaje NY', 'Infrastructure at 50%.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (14, '2025-10-15 00:00:00', 'Progress Report 2 - Reciclaje NY', 'Agreement with municipality.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (15, '2025-09-01 00:00:00', 'Progress Report - Liderazgo BA', 'First cycle of workshops.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (16, '2025-07-01 00:00:00', 'Progress Report - Tortugas Manaus', 'Monitoring started.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (16, '2025-10-01 00:00:00', 'Progress Report 2 - Tortugas Manaus', '50 nests protected.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (17, '2025-09-01 00:00:00', 'Progress Report - Biblioteca Cusco', 'Vehicle adapted.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (17, '2025-10-15 00:00:00', 'Progress Report 2 - Biblioteca Cusco', 'Route 1 started.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (18, '2025-06-15 00:00:00', 'Progress Report - Tech Bogotá', 'Tablets acquired.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (18, '2025-09-15 00:00:00', 'Progress Report 2 - Tech Bogotá', 'Delivery in 5 schools.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (19, '2025-10-01 00:00:00', 'Progress Report - Salud Mental Lima', 'Campaign plan defined.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (20, '2025-10-15 00:00:00', 'Initial Report - Energía Andina', 'Field study completed.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (21, '2025-08-15 00:00:00', 'Progress Report - Cooperativas Café', 'Cooperative diagnosis.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (21, '2025-10-15 00:00:00', 'Progress Report 2 - Cooperativas Café', 'First management workshop.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (22, '2025-10-20 00:00:00', 'Initial Report - Huertos Madrid', 'Locations selected.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (15, '2025-10-25 00:00:00', 'Progress Report 2 - Liderazgo BA', 'Second cycle completed.');
INSERT INTO Report (project_id, report_date, title, description) VALUES (13, '2025-10-25 00:00:00', 'Q3-B Report - Refugiados Madrid', 'Expansion of legal services.');

COMMIT;
-- TABLE: Volunteer_Project
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (1, 1, '2024-02-10 00:00:00', '2024-08-10 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (1, 3, '2024-02-10 00:00:00', '2024-08-10 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (2, 1, '2024-03-20 00:00:00', '2024-09-20 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (2, 2, '2024-03-20 00:00:00', '2024-09-20 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (3, 4, '2024-04-05 00:00:00', '2024-10-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (3, 5, '2024-04-05 00:00:00', '2024-10-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (4, 6, '2024-05-15 00:00:00', '2024-11-15 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (5, 7, '2024-06-05 00:00:00', '2024-12-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (6, 8, '2024-03-05 00:00:00', '2024-09-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (7, 9, '2024-07-05 00:00:00', '2025-01-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (8, 10, '2024-02-20 00:00:00', '2024-08-20 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (9, 11, '2024-05-05 00:00:00', '2024-11-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (10, 12, '2024-08-05 00:00:00', '2025-02-05 00:00:00', 'I');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (11, 1, '2025-01-20 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (11, 3, '2025-01-20 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (12, 5, '2025-02-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (12, 9, '2025-02-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (13, 10, '2025-03-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (14, 11, '2025-05-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (15, 9, '2025-06-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (16, 7, '2025-04-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (17, 6, '2025-07-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (17, 2, '2025-07-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (18, 4, '2025-02-20 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (18, 5, '2025-02-20 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (19, 12, '2025-08-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (20, 3, '2025-09-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (21, 8, '2025-05-20 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (22, 10, '2025-10-05 00:00:00', NULL, 'A');
INSERT INTO Volunteer_Project (project_id, volunteer_id, assignment_date, end_date, status) VALUES (22, 11, '2025-10-05 00:00:00', NULL, 'A');

-- Table: Volunteer_Specialty (15 Assignments)
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (1, 1, '2024-01-10 00:00:00'); -- Elena - Medicine
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (1, 2, '2024-01-10 00:00:00'); -- Bruno - Medicine
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (3, 3, '2024-01-11 00:00:00'); -- Carla - Civil Eng.
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (4, 4, '2024-01-11 00:00:00'); -- David - Software
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (2, 5, '2024-01-12 00:00:00'); -- Sofia - Education
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (2, 6, '2024-01-12 00:00:00'); -- Mateo - Education
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (6, 7, '2024-01-13 00:00:00'); -- Lucia - Agriculture
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (9, 8, '2024-01-13 00:00:00'); -- Javier - Project Management
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (2, 9, '2024-01-14 00:00:00'); -- Valeria - Education
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (8, 9, '2024-01-14 00:00:00'); -- Valeria - Marketing
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (7, 10, '2024-01-15 00:00:00'); -- Miguel - Legal
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (5, 11, '2024-01-15 00:00:00'); -- Gabriela - Logistics
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (10, 12, '2024-01-16 00:00:00'); -- Diego - Psychology
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (9, 3, '2024-01-16 00:00:00'); -- Carla - Project Management
INSERT INTO Volunteer_Specialty (specialty_id, volunteer_id, assignment_date) VALUES (4, 5, '2024-01-17 00:00:00'); -- Sofia - Software

-- Table: Project_Category_Assignment (24 Assignments, 1 per project)
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (1, 1, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (2, 2, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (3, 6, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (4, 4, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (5, 3, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (6, 7, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (7, 5, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (8, 8, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (9, 3, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (10, 2, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (11, 7, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (12, 1, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (13, 8, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (14, 3, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (15, 5, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (16, 3, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (17, 1, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (18, 6, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (19, 2, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (20, 7, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (21, 4, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (22, 4, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (23, 8, 'Y', 1);
INSERT INTO Project_Category_Assignment (project_id, category_id, is_primary, assigned_by_user_id) VALUES (24, 3, 'Y', 1);

-- Table: Project_SDG (30 Assignments)
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (1, 4, 'ALTO', 1); -- Education
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (2, 3, 'ALTO', 1); -- Health
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (3, 4, 'MEDIO', 1); -- Education
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (3, 10, 'MEDIO', 1); -- Reduced Inequalities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (4, 2, 'ALTO', 1); -- Zero Hunger
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (5, 15, 'ALTO', 1); -- Life on Land
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (6, 6, 'ALTO', 1); -- Clean Water
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (7, 5, 'ALTO', 1); -- Gender Equality
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (7, 8, 'MEDIO', 1); -- Decent Work
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (8, 10, 'ALTO', 1); -- Reduced Inequalities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (8, 16, 'MEDIO', 1); -- Peace and Justice
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (9, 11, 'MEDIO', 1); -- Sustainable Cities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (9, 12, 'MEDIO', 1); -- Responsible Consumption
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (10, 3, 'ALTO', 1); -- Health
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (11, 6, 'ALTO', 1); -- Clean Water
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (12, 4, 'ALTO', 1); -- Education
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (12, 5, 'MEDIO', 1); -- Gender Equality
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (13, 10, 'ALTO', 1); -- Reduced Inequalities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (14, 11, 'MEDIO', 1); -- Sustainable Cities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (15, 5, 'ALTO', 1); -- Gender Equality
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (16, 14, 'MEDIO', 1); -- Life Below Water (related)
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (16, 15, 'ALTO', 1); -- Life on Land
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (17, 4, 'ALTO', 1); -- Education
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (18, 9, 'MEDIO', 1); -- Innovation
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (19, 3, 'ALTO', 1); -- Health
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (20, 7, 'ALTO', 1); -- Energy
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (21, 8, 'MEDIO', 1); -- Decent Work
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (22, 11, 'MEDIO', 1); -- Sustainable Cities
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (23, 1, 'MEDIO', 1); -- No Poverty
INSERT INTO Project_SDG (project_id, sdg_id, contribution_level, assigned_by_user_id) VALUES (24, 13, 'ALTO', 1); -- Climate Action

COMMIT;

-- ========================================
-- INSERTS: HISTORY AND AUDIT TABLES
-- ========================================

-- Table: Approval_History (22 Records for APPROVED projects)
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (1, 'PENDIENTE', 'APROBADO', '2024-01-25 10:00:00', 2, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (2, 'PENDIENTE', 'APROBADO', '2024-03-10 11:00:00', 3, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (3, 'PENDIENTE', 'APROBADO', '2024-03-25 12:00:00', 4, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (4, 'PENDIENTE', 'APROBADO', '2024-05-01 14:00:00', 5, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (5, 'PENDIENTE', 'APROBADO', '2024-05-20 15:00:00', 2, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (6, 'PENDIENTE', 'APROBADO', '2024-02-20 09:00:00', 3, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (7, 'PENDIENTE', 'APROBADO', '2024-06-15 10:00:00', 4, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (8, 'PENDIENTE', 'APROBADO', '2024-02-10 11:00:00', 5, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (9, 'PENDIENTE', 'APROBADO', '2024-04-20 12:00:00', 2, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (10, 'PENDIENTE', 'APROBADO', '2024-07-20 14:00:00', 3, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (11, 'PENDIENTE', 'APROBADO', '2025-01-10 09:00:00', 4, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (12, 'PENDIENTE', 'APROBADO', '2025-01-20 10:00:00', 5, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (13, 'PENDIENTE', 'APROBADO', '2025-02-20 11:00:00', 6, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (14, 'PENDIENTE', 'APROBADO', '2025-04-15 12:00:00', 7, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (15, 'PENDIENTE', 'APROBADO', '2025-05-20 14:00:00', 8, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (16, 'PENDIENTE', 'APROBADO', '2025-03-20 15:00:00', 6, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (17, 'PENDIENTE', 'APROBADO', '2025-06-15 09:00:00', 7, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (18, 'PENDIENTE', 'APROBADO', '2025-02-10 10:00:00', 8, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (19, 'PENDIENTE', 'APROBADO', '2025-07-20 11:00:00', 6, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (20, 'PENDIENTE', 'APROBADO', '2025-08-20 12:00:00', 7, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (21, 'PENDIENTE', 'APROBADO', '2025-05-10 14:00:00', 8, 'Approved by committee');
INSERT INTO Approval_History (approval_id, previous_status, new_status, change_date, employee_id, comments) VALUES (22, 'PENDIENTE', 'APROBADO', '2025-09-20 15:00:00', 6, 'Approved by committee');

-- Table: Budget_History (23 Records: 22 'CREATE' + 1 'ADJUST')
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (1, 2, null, 15000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (2, 3, null, 20000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (3, 4, null, 10000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (4, 5, null, 25000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (5, 2, null, 18000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (6, 3, null, 12000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (7, 4, null, 15000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (8, 5, null, 20000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (9, 2, null, 30000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (10, 3, null, 10000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (11, 4, null, 40000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (12, 5, null, 50000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (13, 6, null, 25000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (14, 7, null, 35000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (15, 8, null, 15000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (16, 6, null, 18000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (17, 7, null, 22000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (18, 8, null, 30000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (19, 6, null, 15000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (20, 7, null, 45000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (21, 8, null, 25000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (22, 6, null, 10000.00, 'Initial creation', 'CREATE');
INSERT INTO Budget_History (budget_id, employee_id, old_amount, new_amount, reason, action_type) VALUES (21, 8, 25000.00, 30000.00, 'Expansion due to donation', 'ADJUST'); -- Adjustment

-- Table: Project_Status_History (36 Records: 22 P->A + 12 A->C)
-- 'PLANNING' -> 'ACTIVE' (Projects 1-22)
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (1, 'PLANIFICACION', 'ACTIVO', 2, 'Project approved', 1);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (2, 'PLANIFICACION', 'ACTIVO', 3, 'Project approved', 2);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (3, 'PLANIFICACION', 'ACTIVO', 4, 'Project approved', 3);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (4, 'PLANIFICACION', 'ACTIVO', 5, 'Project approved', 4);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (5, 'PLANIFICACION', 'ACTIVO', 2, 'Project approved', 5);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (6, 'PLANIFICACION', 'ACTIVO', 3, 'Project approved', 6);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (7, 'PLANIFICACION', 'ACTIVO', 4, 'Project approved', 7);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (8, 'PLANIFICACION', 'ACTIVO', 5, 'Project approved', 8);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (9, 'PLANIFICACION', 'ACTIVO', 2, 'Project approved', 9);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (10, 'PLANIFICACION', 'ACTIVO', 3, 'Project approved', 10);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (11, 'PLANIFICACION', 'ACTIVO', 4, 'Project approved', 11);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (12, 'PLANIFICACION', 'ACTIVO', 5, 'Project approved', 12);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (13, 'PLANIFICACION', 'ACTIVO', 6, 'Project approved', 13);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (14, 'PLANIFICACION', 'ACTIVO', 7, 'Project approved', 14);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (15, 'PLANIFICACION', 'ACTIVO', 8, 'Project approved', 15);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (16, 'PLANIFICACION', 'ACTIVO', 6, 'Project approved', 16);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (17, 'PLANIFICACION', 'ACTIVO', 7, 'Project approved', 17);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (18, 'PLANIFICACION', 'ACTIVO', 8, 'Project approved', 18);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (19, 'PLANIFICACION', 'ACTIVO', 6, 'Project approved', 19);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (20, 'PLANIFICACION', 'ACTIVO', 7, 'Project approved', 20);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (21, 'PLANIFICACION', 'ACTIVO', 8, 'Project approved', 21);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (22, 'PLANIFICACION', 'ACTIVO', 6, 'Project approved', 22);
-- 'ACTIVE' -> 'COMPLETED' (Projects 1-10 from 2024 and 11-12 from 2025. Total 12)
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (1, 'ACTIVO', 'COMPLETADO', 2, 'Work closure');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (2, 'ACTIVO', 'COMPLETADO', 3, 'Equipment delivered');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (3, 'ACTIVO', 'COMPLETADO', 4, 'Course closure');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (4, 'ACTIVO', 'COMPLETADO', 5, 'Dining hall operational');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (5, 'ACTIVO', 'COMPLETADO', 2, 'Goal reached');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (6, 'ACTIVO', 'COMPLETADO', 3, 'Community trained');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (7, 'ACTIVO', 'COMPLETADO', 4, 'Workshop closure');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (8, 'ACTIVO', 'COMPLETADO', 5, 'End of assistance period');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (9, 'ACTIVO', 'COMPLETADO', 2, 'Center inaugurated');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (10, 'ACTIVO', 'COMPLETADO', 3, 'Campaign closure');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (11, 'ACTIVO', 'COMPLETADO', 4, 'Water system delivered');
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason) VALUES (12, 'ACTIVO', 'COMPLETADO', 5, 'Scholarship funds assigned');
-- Initial records for projects in PLANNING (Projects 23-24)
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (23, null, 'PLANIFICACION', 7, 'Project creation', 23);
INSERT INTO Project_Status_History (project_id, previous_status, new_status, employee_id, reason, approval_id) VALUES (24, null, 'PLANIFICACION', 8, 'Project creation', 24);

-- Table: Donation_Transaction_Log (10 Example Records)
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (1, 'CREATE', 5000.00, 1, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (2, 'CREATE', 1000.00, 3, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (3, 'CREATE', 10000.00, 1, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (4, 'CREATE', 500.00, 7, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, old_amount, new_amount, old_currency_id, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (4, 'UPDATE', 500.00, 600.00, 7, 7, 2, '200.1.5.10', 'Amount correction');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (21, 'CREATE', 10000.00, 3, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (22, 'CREATE', 5000.00, 3, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (23, 'CREATE', 20000.00, 6, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (37, 'CREATE', 5000.00, 1, 1, '192.168.1.10', 'Initial donation record');
INSERT INTO Donation_Transaction_Log (donation_id, action_type, new_amount, new_currency_id, changed_by_user_id, ip_address, reason) VALUES (38, 'CREATE', 10000.00, 1, 1, '192.168.1.10', 'Initial donation record');

-- Table: Project_Assignment_History (10 Example Records)
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (1, 1, 'VOLUNTEER', 'ASSIGNED', '2024-02-10 00:00:00', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (1, 3, 'VOLUNTEER', 'ASSIGNED', '2024-02-10 00:00:00', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, removal_date, reason, assigned_by_user_id) VALUES (1, 1, 'VOLUNTEER', 'REMOVED', '2024-02-10 00:00:00', '2024-09-01 00:00:00', 'End of volunteer service', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, removal_date, reason, assigned_by_user_id) VALUES (1, 3, 'VOLUNTEER', 'REMOVED', '2024-02-10 00:00:00', '2024-09-01 00:00:00', 'End of volunteer service', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (11, 1, 'VOLUNTEER', 'ASSIGNED', '2025-01-20 00:00:00', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (11, 3, 'VOLUNTEER', 'ASSIGNED', '2025-01-20 00:00:00', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, removal_date, reason, assigned_by_user_id) VALUES (11, 1, 'VOLUNTEER', 'REMOVED', '2025-01-20 00:00:00', '2025-07-01 00:00:00', 'Project completed', 1);
INSERT INTO Project_Assignment_History (project_id, volunteer_id, assignment_type, action, assignment_date, removal_date, reason, assigned_by_user_id) VALUES (11, 3, 'VOLUNTEER', 'REMOVED', '2025-01-20 00:00:00', '2025-07-01 00:00:00', 'Project completed', 1);
INSERT INTO Project_Assignment_History (project_id, employee_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (13, 6, 'EMPLOYEE', 'ASSIGNED', '2025-02-20 11:00:00', 1);
INSERT INTO Project_Assignment_History (project_id, employee_id, assignment_type, action, assignment_date, assigned_by_user_id) VALUES (14, 7, 'EMPLOYEE', 'ASSIGNED', '2025-04-15 12:00:00', 1);

COMMIT;

SELECT COUNT(*) FROM Currency; -- 8
SELECT COUNT(*) FROM Donor_Type; -- 5
SELECT COUNT(*) FROM Approval_Status; -- 4
SELECT COUNT(*) FROM Project_Status; -- 5
SELECT COUNT(*) FROM Specialty; -- 10
SELECT COUNT(*) FROM SDG_Goal; -- 17
SELECT COUNT(*) FROM Project_Category; -- 8
SELECT COUNT(*) FROM NGO; -- 8
SELECT COUNT(*) FROM Employee; -- 8
SELECT COUNT(*) FROM Volunteer; -- 12
SELECT COUNT(*) FROM Representative; -- 8
SELECT COUNT(*) FROM Donor; -- 15
SELECT COUNT(*) FROM Project; -- 24
SELECT COUNT(*) FROM Approval; -- 24
SELECT COUNT(*) FROM Budget; -- 22
SELECT COUNT(*) FROM Donation; -- 38
SELECT COUNT(*) FROM Report; -- 40 