

-- Drop and create database
DROP DATABASE IF EXISTS apartment_management;
CREATE DATABASE apartment_management;
USE apartment_management;

-- ================================================
-- CORE TABLES
-- ================================================

-- TABLE 1: BLOCK
CREATE TABLE block (
  block_no INT NOT NULL,
  block_name VARCHAR(10) DEFAULT NULL,
  room_no INT DEFAULT NULL,
  PRIMARY KEY (block_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE 2: ROOM
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

-- TABLE 3: BLOCK_ADMIN
CREATE TABLE block_admin (
  admin_id INT NOT NULL,
  admin_name VARCHAR(20) DEFAULT NULL,
  block_no INT DEFAULT NULL,
  PRIMARY KEY (admin_id),
  KEY fk_admin_block (block_no),
  CONSTRAINT fk_admin_block FOREIGN KEY (block_no) REFERENCES block (block_no) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE 4: AUTH (Authentication)
CREATE TABLE auth (
  user_id VARCHAR(10) NOT NULL,
  password VARCHAR(20) NOT NULL DEFAULT '12345678',
  id INT NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE 5: OWNER
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

-- TABLE 6: TENANT
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

-- TABLE 7: EMPLOYEE
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

-- TABLE 8: IDENTITY (Proof documents)
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

-- TABLE 9: RENTAL
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

-- TABLE 10: COMPLAINTS
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

-- TABLE 11: MAINTENANCE
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

-- TABLE 12: FEEDBACK
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

-- TABLE 13: COMMUNITY_EVENTS
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

-- TABLE 14: AMENITIES
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

-- TABLE 15: SERVICE_PROVIDERS
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
-- LEASE AGREEMENTS & VISITORS TABLES
-- ================================================

-- TABLE 16: LEASE_AGREEMENTS
CREATE TABLE lease_agreements (
  agreement_id INT NOT NULL AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  owner_id INT NOT NULL,
  apartment_no INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  lease_terms TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (agreement_id),
  KEY idx_lease_tenant (tenant_id),
  KEY idx_lease_owner (owner_id),
  KEY idx_lease_apartment (apartment_no),
  KEY idx_lease_status (status),
  KEY idx_lease_dates (start_date, end_date),
  CONSTRAINT fk_lease_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_lease_owner FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE CASCADE,
  CONSTRAINT fk_lease_apartment FOREIGN KEY (apartment_no) REFERENCES room (room_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- TABLE 17: VISITORS (WITH APPROVAL WORKFLOW)
CREATE TABLE visitors (
  visitor_id INT NOT NULL AUTO_INCREMENT,
  visitor_name VARCHAR(100) NOT NULL,
  apartment_no INT NOT NULL,
  owner_id INT DEFAULT NULL,
  tenant_id INT DEFAULT NULL,
  requested_by VARCHAR(20) NOT NULL,
  requester_id INT NOT NULL,
  entry_time DATETIME NOT NULL,
  exit_time DATETIME DEFAULT NULL,
  purpose VARCHAR(200) DEFAULT NULL,
  contact_number VARCHAR(15) DEFAULT NULL,
  id_proof_type VARCHAR(50) DEFAULT NULL,
  id_proof_number VARCHAR(50) DEFAULT NULL,
  approval_status VARCHAR(20) DEFAULT 'Pending',
  approved_by INT DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  rejection_reason VARCHAR(500) DEFAULT NULL,
  visitor_status VARCHAR(20) DEFAULT 'Requested',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visitor_id),
  KEY idx_visitor_apartment (apartment_no),
  KEY idx_visitor_owner (owner_id),
  KEY idx_visitor_tenant (tenant_id),
  KEY idx_visitor_entry (entry_time),
  KEY idx_visitor_approval_status (approval_status),
  KEY idx_visitor_status (visitor_status),
  CONSTRAINT fk_visitor_apartment FOREIGN KEY (apartment_no) REFERENCES room (room_no) ON DELETE CASCADE,
  CONSTRAINT fk_visitor_owner FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE SET NULL,
  CONSTRAINT fk_visitor_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

