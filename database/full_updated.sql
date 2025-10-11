-- ================================================
-- COMPLETE DATABASE SETUP FOR APARTMENT MANAGEMENT SYSTEM
-- ================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS apartment_management;
CREATE DATABASE apartment_management;
USE apartment_management;

-- ================================================
-- TABLE 1: BLOCK
-- ================================================
CREATE TABLE block (
  block_no INT NOT NULL,
  block_name VARCHAR(10) DEFAULT NULL,
  room_no INT DEFAULT NULL,
  PRIMARY KEY (block_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 2: ROOM
-- ================================================
CREATE TABLE room (
  room_no INT NOT NULL,
  type VARCHAR(10) DEFAULT NULL,
  floor INT DEFAULT NULL,
  parking_slot VARCHAR(10) DEFAULT NULL,
  reg_no INT DEFAULT NULL,
  block_no INT DEFAULT NULL,
  PRIMARY KEY (room_no),
  UNIQUE KEY parking_slot (parking_slot),
  UNIQUE KEY reg_no (reg_no),
  KEY fk_room_block (block_no),
  CONSTRAINT fk_room_block FOREIGN KEY (block_no) REFERENCES block (block_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 3: BLOCK_ADMIN
-- ================================================
CREATE TABLE block_admin (
  admin_id INT NOT NULL,
  admin_name VARCHAR(20) DEFAULT NULL,
  block_no INT DEFAULT NULL,
  PRIMARY KEY (admin_id),
  KEY fk_admin_block (block_no),
  CONSTRAINT fk_admin_block FOREIGN KEY (block_no) REFERENCES block (block_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 4: AUTH (Authentication)
-- ================================================
CREATE TABLE auth (
  user_id VARCHAR(10) NOT NULL,
  password VARCHAR(20) NOT NULL DEFAULT '12345678',
  id INT NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 5: OWNER
-- ================================================
CREATE TABLE owner (
  owner_id INT NOT NULL,
  name VARCHAR(20) DEFAULT NULL,
  age INT DEFAULT NULL,
  aggrement_status VARCHAR(20) NOT NULL,
  room_no INT DEFAULT NULL,
  dob VARCHAR(15) DEFAULT NULL,
  PRIMARY KEY (owner_id),
  KEY fk_owner_room (room_no),
  CONSTRAINT fk_owner_room FOREIGN KEY (room_no) REFERENCES room (room_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 6: TENANT
-- ================================================
CREATE TABLE tenant (
  tenant_id INT NOT NULL,
  name VARCHAR(30) DEFAULT NULL,
  dob VARCHAR(10) DEFAULT NULL,
  stat VARCHAR(10) DEFAULT NULL,
  room_no INT DEFAULT NULL,
  age INT DEFAULT NULL,
  PRIMARY KEY (tenant_id),
  KEY fk_tenant_room (room_no),
  CONSTRAINT fk_tenant_room FOREIGN KEY (room_no) REFERENCES room (room_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 7: EMPLOYEE
-- ================================================
CREATE TABLE employee (
  emp_id INT NOT NULL,
  emp_name VARCHAR(30) DEFAULT NULL,
  salary INT DEFAULT NULL,
  emp_type VARCHAR(20) DEFAULT NULL,
  age INT DEFAULT NULL,
  block_no INT DEFAULT NULL,
  PRIMARY KEY (emp_id),
  KEY fk_employee_block (block_no),
  CONSTRAINT fk_employee_block FOREIGN KEY (block_no) REFERENCES block (block_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 8: IDENTITY (Proof documents)
-- ================================================
CREATE TABLE identity (
  proof VARCHAR(15) DEFAULT NULL,
  owner_id INT DEFAULT NULL,
  tenant_id INT DEFAULT NULL,
  UNIQUE KEY proof (proof),
  KEY fk_identity_owner (owner_id),
  KEY fk_identity_tenant (tenant_id),
  CONSTRAINT fk_identity_owner FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE CASCADE,
  CONSTRAINT fk_identity_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 9: RENTAL
-- ================================================
CREATE TABLE rental (
  rental_id INT NOT NULL AUTO_INCREMENT,
  doj VARCHAR(20) DEFAULT NULL,
  monthly_rent INT DEFAULT NULL,
  room_no INT DEFAULT NULL,
  tenant_id INT DEFAULT NULL,
  PRIMARY KEY (rental_id),
  KEY fk_rental_room (room_no),
  KEY fk_rental_tenant (tenant_id),
  CONSTRAINT fk_rental_room FOREIGN KEY (room_no) REFERENCES room (room_no) ON DELETE CASCADE,
  CONSTRAINT fk_rental_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 10: COMPLAINTS
-- ================================================
CREATE TABLE complaints (
  complaint_id INT NOT NULL AUTO_INCREMENT,
  block_no INT NOT NULL,
  room_no INT NOT NULL,
  complaint_text VARCHAR(500) NOT NULL,
  reported_by VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (complaint_id),
  KEY idx_complaints_block_room (block_no, room_no),
  KEY idx_complaints_date (reported_date),
  KEY idx_complaints_status (status),
  CONSTRAINT fk_complaint_block FOREIGN KEY (block_no) REFERENCES block (block_no) ON DELETE CASCADE,
  CONSTRAINT fk_complaint_room FOREIGN KEY (room_no) REFERENCES room (room_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 11: MAINTENANCE
-- ================================================
CREATE TABLE maintenance (
  maintenance_id INT NOT NULL AUTO_INCREMENT,
  month VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Unpaid',
  apartment_id INT NOT NULL,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (maintenance_id),
  KEY idx_maintenance_apartment (apartment_id),
  KEY idx_maintenance_status (status),
  KEY idx_maintenance_month (month),
  CONSTRAINT fk_maintenance_room FOREIGN KEY (apartment_id) REFERENCES room (room_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 12: FEEDBACK
-- ================================================
CREATE TABLE feedback (
  feedback_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_type ENUM('owner', 'tenant') NOT NULL,
  feedback_text TEXT NOT NULL,
  feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'New',
  rating INT DEFAULT NULL,
  PRIMARY KEY (feedback_id),
  KEY idx_feedback_user (user_id, user_type),
  KEY idx_feedback_date (feedback_date),
  KEY idx_feedback_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 13: COMMUNITY_EVENTS
-- ================================================
CREATE TABLE community_events (
  event_id INT NOT NULL,
  apartment_id INT DEFAULT NULL,
  location VARCHAR(100) DEFAULT NULL,
  description TEXT,
  organizer_id INT DEFAULT NULL,
  event_name VARCHAR(100) DEFAULT NULL,
  event_date DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id),
  KEY idx_event_date (event_date),
  KEY fk_event_apartment (apartment_id),
  CONSTRAINT fk_event_apartment FOREIGN KEY (apartment_id) REFERENCES room (room_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 14: AMENITIES
-- ================================================
CREATE TABLE amenities (
  amenity_id INT NOT NULL,
  amenity_name VARCHAR(100) NOT NULL,
  description TEXT,
  phone_number VARCHAR(15) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  rating DECIMAL(3,2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (amenity_id),
  KEY idx_amenity_name (amenity_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE 15: SERVICE_PROVIDERS
-- ================================================
CREATE TABLE service_providers (
  provider_id INT NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  service_type VARCHAR(50) DEFAULT NULL,
  contact_number VARCHAR(15) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  rating DECIMAL(3,2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (provider_id),
  KEY idx_service_type (service_type),
  KEY idx_provider_name (provider_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- VIEWS
-- ================================================

-- View for available tenants
CREATE VIEW avt AS 
SELECT tenant_id, room_no, dob, name, age 
FROM tenant;

-- View for complaints
CREATE VIEW o AS 
SELECT complaints 
FROM block;

-- View for complaints with room numbers
CREATE VIEW oo AS 
SELECT complaints, room_no 
FROM block;

-- View for tenant details
CREATE VIEW tav AS 
SELECT tenant_id, room_no, dob, name 
FROM tenant;

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- Insert Block
INSERT INTO block (block_no, block_name, room_no) VALUES 
(1, 'Block A', NULL),
(2, 'Block B', NULL),
(3, 'Block C', NULL);

-- Insert Rooms
INSERT INTO room (room_no, type, floor, parking_slot, reg_no, block_no) VALUES 
(101, '2BHK', 1, NULL, NULL, 1),
(102, '1BHK', 1, NULL, NULL, 1),
(103, '3BHK', 1, NULL, NULL, 1),
(201, '2BHK', 2, NULL, NULL, 1),
(202, '1BHK', 2, NULL, NULL, 1),
(301, '2BHK', 1, NULL, NULL, 2),
(302, '3BHK', 1, NULL, NULL, 2);

-- Insert Admin
INSERT INTO block_admin (admin_id, admin_name, block_no) VALUES 
(101, 'System Admin', 1);

-- Insert Admin Auth
INSERT INTO auth (user_id, password, id) VALUES 
('a-101', 'admin123', 101);

-- Insert Sample Employee
INSERT INTO employee (emp_id, emp_name, salary, emp_type, age, block_no) VALUES 
(201, 'John Doe', 50000, 'Maintenance', 30, 1),
(202, 'Jane Smith', 45000, 'Security', 28, 1);

-- Insert Employee Auth
INSERT INTO auth (user_id, password, id) VALUES 
('e-201', 'employee123', 201),
('e-202', 'employee123', 202);

-- Insert Sample Owner
INSERT INTO owner (owner_id, name, age, aggrement_status, room_no, dob) VALUES 
(401, 'Robert Johnson', 45, 'Active', 101, '15-06-1979'),
(402, 'Sarah Williams', 38, 'Active', 201, '22-03-1986');

-- Insert Owner Auth
INSERT INTO auth (user_id, password, id) VALUES 
('o-401', 'owner123', 401),
('o-402', 'owner123', 402);

-- Insert Owner Identity
INSERT INTO identity (proof, owner_id, tenant_id) VALUES 
('AADHAR401', 401, NULL),
('AADHAR402', 402, NULL);

-- Insert Sample Tenant
INSERT INTO tenant (tenant_id, name, dob, stat, room_no, age) VALUES 
(301, 'Michael Brown', '20-08-1995', 'Active', 102, 29),
(302, 'Emily Davis', '15-12-1992', 'Active', 202, 32);

-- Insert Tenant Auth
INSERT INTO auth (user_id, password, id) VALUES 
('t-301', 'tenant123', 301),
('t-302', 'tenant123', 302);

-- Insert Tenant Identity
INSERT INTO identity (proof, owner_id, tenant_id) VALUES 
('AADHAR301', NULL, 301),
('AADHAR302', NULL, 302);

-- Insert Sample Rental
INSERT INTO rental (doj, monthly_rent, room_no, tenant_id) VALUES 
('01-01-2024', 15000, 102, 301),
('15-02-2024', 18000, 202, 302);

-- Insert Sample Complaints
INSERT INTO complaints (block_no, room_no, complaint_text, reported_by, status) VALUES 
(1, 101, 'Water leakage in bathroom', 'o-401', 'Pending'),
(1, 102, 'Broken door lock', 't-301', 'In Progress'),
(1, 201, 'AC not working', 'o-402', 'Resolved');

-- Insert Sample Maintenance Records
INSERT INTO maintenance (month, amount, status, apartment_id, due_date) VALUES 
('January 2025', 5000.00, 'Paid', 101, '2025-01-15'),
('February 2025', 5000.00, 'Unpaid', 101, '2025-02-15'),
('January 2025', 3500.00, 'Paid', 102, '2025-01-15'),
('February 2025', 3500.00, 'Unpaid', 102, '2025-02-15'),
('January 2025', 5000.00, 'Paid', 201, '2025-01-15');

-- Insert Sample Feedback
INSERT INTO feedback (user_id, user_type, feedback_text, rating, status) VALUES 
(401, 'owner', 'Great maintenance service! Very satisfied with the quick response.', 5, 'Resolved'),
(301, 'tenant', 'Security needs improvement. More guards needed at night.', 3, 'In Progress'),
(402, 'owner', 'Overall good experience living here. Clean and well-maintained.', 4, 'New');

-- Insert Sample Community Events
INSERT INTO community_events (event_id, apartment_id, location, description, organizer_id, event_name, event_date) VALUES 
(1, 101, 'Community Hall', 'Annual celebration with cultural programs and dinner', 401, 'New Year Celebration 2025', '2025-01-01 18:00:00'),
(2, 201, 'Clubhouse', 'Health and wellness workshop by certified trainer', 402, 'Yoga Workshop', '2025-02-15 07:00:00'),
(3, 101, 'Garden Area', 'Tree plantation drive for residents', 401, 'Green Initiative', '2025-03-05 09:00:00');

-- Insert Sample Amenities
INSERT INTO amenities (amenity_id, amenity_name, description, phone_number, email, rating) VALUES 
(1, 'Swimming Pool', '25m Olympic size pool with lifeguard. Open 6 AM - 9 PM', '9876543210', 'pool@jasmine.com', 4.50),
(2, 'Gymnasium', 'Fully equipped gym with latest equipment. Trainer available', '9876543211', 'gym@jasmine.com', 4.80),
(3, 'Community Hall', 'Large hall for events and gatherings. Advance booking required', '9876543212', 'hall@jasmine.com', 4.30),
(4, 'Kids Play Area', 'Safe and secure play area with modern equipment', '9876543213', 'play@jasmine.com', 4.60);

-- Insert Sample Service Providers
INSERT INTO service_providers (provider_id, provider_name, service_type, contact_number, email, rating) VALUES 
(1, 'Quick Plumbing Services', 'Plumbing', '9988776655', 'quick@plumbing.com', 4.70),
(2, 'Elite Electricians', 'Electrical', '9988776656', 'elite@electric.com', 4.50),
(3, 'Clean & Shine', 'Cleaning', '9988776657', 'clean@shine.com', 4.60),
(4, 'Perfect Painters', 'Painting', '9988776658', 'perfect@painters.com', 4.40),
(5, 'Pest Control Pro', 'Pest Control', '9988776659', 'pest@control.com', 4.80);

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
SELECT '✅ Database setup complete!' AS Status;
SELECT 'Total Tables Created: 15' AS Info;
SELECT 'Sample data inserted for testing' AS Info;

-- Display all users for reference
SELECT 
    'Login Credentials for Testing:' AS Info,
    user_id as Username, 
    password as Password,
    CASE 
        WHEN user_id LIKE 'a-%' THEN 'Admin'
        WHEN user_id LIKE 'e-%' THEN 'Employee'
        WHEN user_id LIKE 'o-%' THEN 'Owner'
        WHEN user_id LIKE 't-%' THEN 'Tenant'
    END as Role
FROM auth 
ORDER BY user_id;