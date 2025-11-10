-- ================================================
-- VIEWS
-- ================================================

CREATE VIEW avt AS 
SELECT tenant_id, room_no, dob, name, age 
FROM tenant;

CREATE VIEW o AS 
SELECT complaint_text as complaints 
FROM complaints;

CREATE VIEW oo AS 
SELECT complaint_text as complaints, room_no 
FROM complaints;

CREATE VIEW tav AS 
SELECT tenant_id, room_no, dob, name 
FROM tenant;

CREATE OR REPLACE VIEW active_leases_view AS
SELECT 
    la.agreement_id, la.apartment_no, la.start_date, la.end_date,
    la.monthly_rent, la.security_deposit, la.status,
    t.tenant_id, t.name as tenant_name,
    o.owner_id, o.name as owner_name,
    r.type as room_type, r.floor, b.block_name,
    DATEDIFF(la.end_date, CURDATE()) as days_remaining
FROM lease_agreements la
INNER JOIN tenant t ON la.tenant_id = t.tenant_id
INNER JOIN owner o ON la.owner_id = o.owner_id
INNER JOIN room r ON la.apartment_no = r.room_no
INNER JOIN block b ON r.block_no = b.block_no
WHERE la.status = 'Active';

CREATE OR REPLACE VIEW visitor_statistics_view AS
SELECT 
    v.apartment_no, r.type as room_type, b.block_name,
    COUNT(*) as total_visitors,
    COUNT(DISTINCT DATE(v.entry_time)) as days_with_visitors,
    AVG(TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)) as avg_visit_duration_minutes,
    MAX(v.entry_time) as last_visitor_time
FROM visitors v
INNER JOIN room r ON v.apartment_no = r.room_no
INNER JOIN block b ON r.block_no = b.block_no
WHERE v.exit_time IS NOT NULL
GROUP BY v.apartment_no, r.type, b.block_name;

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
-- TRIGGERS
-- ================================================

DELIMITER //

CREATE TRIGGER after_lease_insert
AFTER INSERT ON lease_agreements
FOR EACH ROW
BEGIN
    INSERT INTO rental (doj, monthly_rent, room_no, tenant_id)
    VALUES (NEW.start_date, NEW.monthly_rent, NEW.apartment_no, NEW.tenant_id)
    ON DUPLICATE KEY UPDATE
        monthly_rent = NEW.monthly_rent,
        doj = NEW.start_date;
END //

CREATE TRIGGER before_lease_check_expiry
BEFORE UPDATE ON lease_agreements
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND OLD.status = 'Active' THEN
        SET NEW.status = 'Expired';
    END IF;
END //

CREATE TRIGGER after_visitor_approval
AFTER UPDATE ON visitors
FOR EACH ROW
BEGIN
    IF NEW.approval_status = 'Approved' AND OLD.approval_status != 'Approved' THEN
        UPDATE visitors 
        SET visitor_status = 'Approved'
        WHERE visitor_id = NEW.visitor_id;
    END IF;
    
    IF NEW.approval_status = 'Rejected' AND OLD.approval_status != 'Rejected' THEN
        UPDATE visitors 
        SET visitor_status = 'Rejected'
        WHERE visitor_id = NEW.visitor_id;
    END IF;
END //

DELIMITER ;

-- ================================================
-- STORED PROCEDURES
-- ================================================

DELIMITER //

CREATE PROCEDURE GetExpiringLeases(IN days_param INT)
BEGIN
    SELECT 
        la.*, t.name as tenant_name, t.age as tenant_age,
        o.name as owner_name, r.type as room_type, r.floor, b.block_name,
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

CREATE PROCEDURE GetLeaseDetails(IN lease_id_param INT)
BEGIN
    SELECT 
        la.*, t.name as tenant_name, t.age as tenant_age, t.dob as tenant_dob,
        o.name as owner_name, o.age as owner_age,
        r.type as room_type, r.floor, r.parking_slot,
        b.block_no, b.block_name,
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

CREATE PROCEDURE GetCurrentVisitorsInside()
BEGIN
    SELECT 
        v.*, r.type as room_type, r.floor, b.block_name,
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

CREATE PROCEDURE GetPendingVisitorRequests()
BEGIN
    SELECT 
        v.*, r.type as room_type, r.floor, b.block_name,
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

CREATE PROCEDURE GetApartmentVisitorHistory(IN apartment_param INT, IN days_param INT)
BEGIN
    SELECT 
        v.*,
        CASE 
            WHEN v.requested_by = 'owner' THEN o.name
            WHEN v.requested_by = 'tenant' THEN t.name
            ELSE 'Unknown'
        END as requester_name,
        TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time) as visit_duration_minutes
    FROM visitors v
    LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
    LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
    WHERE v.apartment_no = apartment_param
    AND v.entry_time >= DATE_SUB(CURDATE(), INTERVAL days_param DAY)
    ORDER BY v.entry_time DESC;
END //

CREATE PROCEDURE GetMyVisitorRequests(IN user_type_param VARCHAR(20), IN user_id_param INT)
BEGIN
    SELECT 
        v.*, r.type as room_type, r.floor, b.block_name,
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
-- FUNCTIONS
-- ================================================

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

