-- ================================================
-- LEASE AGREEMENTS & VISITORS - DATABASE SCHEMA
-- ================================================

USE apartment_management;

-- ================================================
-- TABLE: LEASE_AGREEMENTS
-- ================================================
CREATE TABLE IF NOT EXISTS lease_agreements (
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

-- ================================================
-- TABLE: VISITORS
-- ================================================
CREATE TABLE IF NOT EXISTS visitors (
  visitor_id INT NOT NULL AUTO_INCREMENT,
  visitor_name VARCHAR(100) NOT NULL,
  apartment_no INT NOT NULL,
  owner_id INT DEFAULT NULL,
  tenant_id INT DEFAULT NULL,
  entry_time DATETIME NOT NULL,
  exit_time DATETIME DEFAULT NULL,
  purpose VARCHAR(200) DEFAULT NULL,
  contact_number VARCHAR(15) DEFAULT NULL,
  id_proof_type VARCHAR(50) DEFAULT NULL,
  id_proof_number VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'Inside',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (visitor_id),
  KEY idx_visitor_apartment (apartment_no),
  KEY idx_visitor_owner (owner_id),
  KEY idx_visitor_tenant (tenant_id),
  KEY idx_visitor_entry (entry_time),
  KEY idx_visitor_status (status),
  CONSTRAINT fk_visitor_apartment FOREIGN KEY (apartment_no) REFERENCES room (room_no) ON DELETE CASCADE,
  CONSTRAINT fk_visitor_owner FOREIGN KEY (owner_id) REFERENCES owner (owner_id) ON DELETE SET NULL,
  CONSTRAINT fk_visitor_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (tenant_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TRIGGERS FOR LEASE AGREEMENTS
-- ================================================

-- Trigger to update rental table when lease is created
DELIMITER //
CREATE TRIGGER after_lease_insert
AFTER INSERT ON lease_agreements
FOR EACH ROW
BEGIN
    -- Update or insert rental record
    INSERT INTO rental (doj, monthly_rent, room_no, tenant_id)
    VALUES (NEW.start_date, NEW.monthly_rent, NEW.apartment_no, NEW.tenant_id)
    ON DUPLICATE KEY UPDATE
        monthly_rent = NEW.monthly_rent,
        doj = NEW.start_date;
END //
DELIMITER ;

-- Trigger to automatically expire leases
DELIMITER //
CREATE TRIGGER before_lease_check_expiry
BEFORE UPDATE ON lease_agreements
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND OLD.status = 'Active' THEN
        SET NEW.status = 'Expired';
    END IF;
END //
DELIMITER ;

-- ================================================
-- STORED PROCEDURES FOR LEASE AGREEMENTS
-- ================================================

-- Procedure to get active leases expiring soon
DELIMITER //
CREATE PROCEDURE GetExpiringLeases(IN days_param INT)
BEGIN
    SELECT 
        la.*,
        t.name as tenant_name,
        t.age as tenant_age,
        o.name as owner_name,
        r.type as room_type,
        r.floor,
        b.block_name,
        DATEDIFF(la.end_date, CURDATE()) as days_remaining
    FROM lease_agreements la
    INNER JOIN tenant t ON la.tenant_id = t.tenant_id
    INNER JOIN owner o ON la.owner_id = o.owner_id
    INNER JOIN room r ON la.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    WHERE la.status = 'Active'
    AND la.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL days_param DAY)
    ORDER BY la.end_date ASC;
END //
DELIMITER ;

-- Procedure to get lease details with full information
DELIMITER //
CREATE PROCEDURE GetLeaseDetails(IN lease_id_param INT)
BEGIN
    SELECT 
        la.*,
        t.name as tenant_name,
        t.age as tenant_age,
        t.dob as tenant_dob,
        o.name as owner_name,
        o.age as owner_age,
        r.type as room_type,
        r.floor,
        r.parking_slot,
        b.block_no,
        b.block_name,
        DATEDIFF(la.end_date, CURDATE()) as days_remaining,
        DATEDIFF(CURDATE(), la.start_date) as days_elapsed,
        DATEDIFF(la.end_date, la.start_date) as total_lease_days
    FROM lease_agreements la
    INNER JOIN tenant t ON la.tenant_id = t.tenant_id
    INNER JOIN owner o ON la.owner_id = o.owner_id
    INNER JOIN room r ON la.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    WHERE la.agreement_id = lease_id_param;
END //
DELIMITER ;

-- ================================================
-- STORED PROCEDURES FOR VISITORS
-- ================================================

-- Procedure to get current visitors (still inside)
DELIMITER //
CREATE PROCEDURE GetCurrentVisitors()
BEGIN
    SELECT 
        v.*,
        r.type as room_type,
        r.floor,
        b.block_name,
        CASE 
            WHEN v.owner_id IS NOT NULL THEN o.name
            WHEN v.tenant_id IS NOT NULL THEN t.name
            ELSE 'Unknown'
        END as host_name,
        CASE 
            WHEN v.owner_id IS NOT NULL THEN 'Owner'
            WHEN v.tenant_id IS NOT NULL THEN 'Tenant'
            ELSE 'Unknown'
        END as host_type,
        TIMESTAMPDIFF(MINUTE, v.entry_time, NOW()) as minutes_inside
    FROM visitors v
    INNER JOIN room r ON v.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    LEFT JOIN owner o ON v.owner_id = o.owner_id
    LEFT JOIN tenant t ON v.tenant_id = t.tenant_id
    WHERE v.status = 'Inside'
    ORDER BY v.entry_time DESC;
END //
DELIMITER ;

-- Procedure to get visitor history for an apartment
DELIMITER //
CREATE PROCEDURE GetApartmentVisitorHistory(
    IN apartment_param INT,
    IN days_param INT
)
BEGIN
    SELECT 
        v.*,
        CASE 
            WHEN v.owner_id IS NOT NULL THEN o.name
            WHEN v.tenant_id IS NOT NULL THEN t.name
            ELSE 'Unknown'
        END as host_name,
        TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time) as visit_duration_minutes
    FROM visitors v
    LEFT JOIN owner o ON v.owner_id = o.owner_id
    LEFT JOIN tenant t ON v.tenant_id = t.tenant_id
    WHERE v.apartment_no = apartment_param
    AND v.entry_time >= DATE_SUB(CURDATE(), INTERVAL days_param DAY)
    ORDER BY v.entry_time DESC;
END //
DELIMITER ;

-- ================================================
-- USER-DEFINED FUNCTIONS
-- ================================================

-- Function to calculate total lease value
DELIMITER //
CREATE FUNCTION GetTotalLeaseValue(lease_id_param INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE total_value DECIMAL(12,2);
    DECLARE months_count INT;
    DECLARE monthly_amount DECIMAL(10,2);
    
    SELECT 
        TIMESTAMPDIFF(MONTH, start_date, end_date),
        monthly_rent
    INTO months_count, monthly_amount
    FROM lease_agreements
    WHERE agreement_id = lease_id_param;
    
    SET total_value = months_count * monthly_amount;
    
    RETURN total_value;
END //
DELIMITER ;

-- Function to get visitor count for apartment
DELIMITER //
CREATE FUNCTION GetApartmentVisitorCount(apartment_param INT, days_param INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE visitor_count INT;
    
    SELECT COUNT(*) INTO visitor_count
    FROM visitors
    WHERE apartment_no = apartment_param
    AND entry_time >= DATE_SUB(CURDATE(), INTERVAL days_param DAY);
    
    RETURN visitor_count;
END //
DELIMITER ;

-- ================================================
-- VIEWS
-- ================================================

-- View for active leases with complete details
CREATE OR REPLACE VIEW active_leases_view AS
SELECT 
    la.agreement_id,
    la.apartment_no,
    la.start_date,
    la.end_date,
    la.monthly_rent,
    la.security_deposit,
    la.status,
    t.tenant_id,
    t.name as tenant_name,
    o.owner_id,
    o.name as owner_name,
    r.type as room_type,
    r.floor,
    b.block_name,
    DATEDIFF(la.end_date, CURDATE()) as days_remaining
FROM lease_agreements la
INNER JOIN tenant t ON la.tenant_id = t.tenant_id
INNER JOIN owner o ON la.owner_id = o.owner_id
INNER JOIN room r ON la.apartment_no = r.room_no
INNER JOIN block b ON r.block_no = b.block_no
WHERE la.status = 'Active';

-- View for visitor statistics by apartment
CREATE OR REPLACE VIEW visitor_statistics_view AS
SELECT 
    v.apartment_no,
    r.type as room_type,
    b.block_name,
    COUNT(*) as total_visitors,
    COUNT(DISTINCT DATE(v.entry_time)) as days_with_visitors,
    AVG(TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)) as avg_visit_duration_minutes,
    MAX(v.entry_time) as last_visitor_time
FROM visitors v
INNER JOIN room r ON v.apartment_no = r.room_no
INNER JOIN block b ON r.block_no = b.block_no
WHERE v.exit_time IS NOT NULL
GROUP BY v.apartment_no, r.type, b.block_name;

-- ================================================
-- SAMPLE DATA
-- ================================================

-- Insert sample lease agreements
INSERT INTO lease_agreements (tenant_id, owner_id, apartment_no, start_date, end_date, monthly_rent, security_deposit, lease_terms, status) VALUES
(301, 401, 102, '2024-01-01', '2025-12-31', 15000.00, 30000.00, 'Standard lease agreement with 2 years tenure. Rent payable by 5th of every month.', 'Active'),
(302, 402, 202, '2024-03-15', '2025-03-14', 18000.00, 36000.00, 'One year lease. Includes water charges. Electricity separate.', 'Active');

-- Insert sample visitors
INSERT INTO visitors (visitor_name, apartment_no, owner_id, entry_time, exit_time, purpose, contact_number, id_proof_type, id_proof_number, status) VALUES
('Rajesh Kumar', 101, 401, '2025-10-12 10:30:00', '2025-10-12 12:00:00', 'Family Visit', '9876543210', 'Aadhar', 'XXXX-XXXX-1234', 'Exited'),
('Priya Sharma', 102, NULL, '2025-10-12 14:00:00', NULL, 'Delivery', '9876543211', 'DL', 'DL-0720231234', 'Inside'),
('Amit Singh', 201, 402, '2025-10-12 16:30:00', NULL, 'Friend Visit', '9876543212', 'Aadhar', 'XXXX-XXXX-5678', 'Inside');

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
SELECT '✅ Lease Agreements & Visitors Tables Created Successfully!' AS Status;
SELECT 'Tables: 2, Triggers: 2, Procedures: 4, Functions: 2, Views: 2' AS Summary;




-- ================================================
-- VISITORS WITH APPROVAL WORKFLOW - DATABASE SCHEMA
-- ================================================

USE apartment_management;

-- Drop existing visitors table
DROP TABLE IF EXISTS visitors;

-- ================================================
-- TABLE: VISITORS (WITH APPROVAL WORKFLOW)
-- ================================================
CREATE TABLE visitors (
  visitor_id INT NOT NULL AUTO_INCREMENT,
  visitor_name VARCHAR(100) NOT NULL,
  apartment_no INT NOT NULL,
  owner_id INT DEFAULT NULL,
  tenant_id INT DEFAULT NULL,
  requested_by VARCHAR(20) NOT NULL, -- 'owner' or 'tenant'
  requester_id INT NOT NULL, -- ID of person who requested
  entry_time DATETIME NOT NULL,
  exit_time DATETIME DEFAULT NULL,
  purpose VARCHAR(200) DEFAULT NULL,
  contact_number VARCHAR(15) DEFAULT NULL,
  id_proof_type VARCHAR(50) DEFAULT NULL,
  id_proof_number VARCHAR(50) DEFAULT NULL,
  approval_status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
  approved_by INT DEFAULT NULL, -- Admin who approved
  approved_at DATETIME DEFAULT NULL,
  rejection_reason VARCHAR(500) DEFAULT NULL,
  visitor_status VARCHAR(20) DEFAULT 'Requested', -- Requested, Approved, Inside, Exited, Rejected
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

-- ================================================
-- TRIGGERS FOR VISITOR APPROVAL
-- ================================================

-- Trigger to update visitor_status when approved
DELIMITER //
CREATE TRIGGER after_visitor_approval
AFTER UPDATE ON visitors
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' AND OLD.approval_status != 'Approved' THEN
        -- Update visitor_status to 'Approved'
        UPDATE visitors 
        SET visitor_status = 'Approved'
        WHERE visitor_id = NEW.visitor_id;
    END IF;
    
    IF NEW.approval_status = 'Rejected' AND OLD.approval_status != 'Rejected' THEN
        -- Update visitor_status to 'Rejected'
        UPDATE visitors 
        SET visitor_status = 'Rejected'
        WHERE visitor_id = NEW.visitor_id;
    END IF;
END //
DELIMITER ;

-- ================================================
-- STORED PROCEDURES FOR VISITOR APPROVAL
-- ================================================

-- Procedure to get pending visitor requests
DELIMITER //
CREATE PROCEDURE GetPendingVisitorRequests()
BEGIN
    SELECT 
        v.*,
        r.type as room_type,
        r.floor,
        b.block_name,
        CASE 
            WHEN v.requested_by = 'owner' THEN o.name
            WHEN v.requested_by = 'tenant' THEN t.name
            ELSE 'Unknown'
        END as requester_name,
        TIMESTAMPDIFF(HOUR, v.created_at, NOW()) as hours_pending
    FROM visitors v
    INNER JOIN room r ON v.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
    LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
    WHERE v.approval_status = 'Pending'
    ORDER BY v.created_at ASC;
END //
DELIMITER ;

-- Procedure to get approved visitors ready for entry
DELIMITER //
CREATE PROCEDURE GetApprovedVisitors()
BEGIN
    SELECT 
        v.*,
        r.type as room_type,
        r.floor,
        b.block_name,
        CASE 
            WHEN v.requested_by = 'owner' THEN o.name
            WHEN v.requested_by = 'tenant' THEN t.name
            ELSE 'Unknown'
        END as requester_name
    FROM visitors v
    INNER JOIN room r ON v.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
    LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
    WHERE v.approval_status = 'Approved' 
    AND v.visitor_status = 'Approved'
    ORDER BY v.entry_time ASC;
END //
DELIMITER ;

-- Procedure to get current visitors (already inside)
DELIMITER //
CREATE PROCEDURE GetCurrentVisitorsInside()
BEGIN
    SELECT 
        v.*,
        r.type as room_type,
        r.floor,
        b.block_name,
        CASE 
            WHEN v.requested_by = 'owner' THEN o.name
            WHEN v.requested_by = 'tenant' THEN t.name
            ELSE 'Unknown'
        END as requester_name,
        TIMESTAMPDIFF(MINUTE, v.entry_time, NOW()) as minutes_inside
    FROM visitors v
    INNER JOIN room r ON v.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
    LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
    WHERE v.visitor_status = 'Inside'
    ORDER BY v.entry_time DESC;
END //
DELIMITER ;

-- Procedure to get visitor requests by user
DELIMITER //
CREATE PROCEDURE GetMyVisitorRequests(
    IN user_type_param VARCHAR(20),
    IN user_id_param INT
)
BEGIN
    SELECT 
        v.*,
        r.type as room_type,
        r.floor,
        b.block_name,
        CASE 
            WHEN v.approved_by IS NOT NULL THEN 
                (SELECT admin_name FROM block_admin WHERE admin_id = v.approved_by)
            ELSE NULL
        END as approved_by_name
    FROM visitors v
    INNER JOIN room r ON v.apartment_no = r.room_no
    INNER JOIN block b ON r.block_no = b.block_no
    WHERE v.requested_by = user_type_param 
    AND v.requester_id = user_id_param
    ORDER BY v.created_at DESC;
END //
DELIMITER ;

-- ================================================
-- VIEWS FOR VISITOR MANAGEMENT
-- ================================================

-- View for visitor approval statistics
CREATE OR REPLACE VIEW visitor_approval_stats AS
SELECT 
    COUNT(*) as total_requests,
    SUM(CASE WHEN approval_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN approval_status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
    SUM(CASE WHEN visitor_status = 'Inside' THEN 1 ELSE 0 END) as currently_inside,
    AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_approval_time_hours
FROM visitors;

-- ================================================
-- SAMPLE DATA
-- ================================================

-- Clear existing data
DELETE FROM visitors;

-- Insert sample visitor requests
INSERT INTO visitors (visitor_name, apartment_no, owner_id, tenant_id, requested_by, requester_id, entry_time, purpose, contact_number, id_proof_type, id_proof_number, approval_status, visitor_status) VALUES
-- Pending requests
('Ramesh Kumar', 101, 401, NULL, 'owner', 401, '2025-10-13 14:00:00', 'Family Visit', '9876543210', 'Aadhar', 'XXXX-XXXX-1234', 'Pending', 'Requested'),
('Suresh Sharma', 102, NULL, 301, 'tenant', 301, '2025-10-13 16:00:00', 'Friend Visit', '9876543211', 'DL', 'DL-0720231234', 'Pending', 'Requested'),
-- Approved requests
('Priya Singh', 201, 402, NULL, 'owner', 402, '2025-10-13 10:00:00', 'Delivery', '9876543212', 'Aadhar', 'XXXX-XXXX-5678', 'Approved', 'Approved'),
-- Already inside
('Amit Patel', 102, NULL, 301, 'tenant', 301, '2025-10-12 18:00:00', 'Family Visit', '9876543213', 'Passport', 'P1234567', 'Approved', 'Inside'),
-- Rejected
('Unknown Person', 101, 401, NULL, 'owner', 401, '2025-10-11 20:00:00', 'No proper reason', '9876543214', 'None', 'None', 'Rejected', 'Rejected');

-- Update approved visitors with approval details
UPDATE visitors 
SET approved_by = 101, approved_at = '2025-10-13 10:30:00' 
WHERE approval_status = 'Approved';

UPDATE visitors 
SET approved_by = 101, approved_at = '2025-10-11 20:30:00', rejection_reason = 'Insufficient information provided'
WHERE approval_status = 'Rejected';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
SELECT '✅ Visitors Table with Approval Workflow Created Successfully!' AS Status;
SELECT 'Workflow: Tenant/Owner Request → Admin Approve → Security Check-in → Check-out' AS Flow;