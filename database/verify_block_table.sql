USE apartment_management;

-- Make sure block table has correct structure
CREATE TABLE IF NOT EXISTS block (
    block_no INT,
    room_no INT,
    block_name VARCHAR(10),
    complaints VARCHAR(100),
    reported_by VARCHAR(50),
    reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending',
    PRIMARY KEY (block_no, room_no)
);

-- Insert test complaint if none exist
INSERT INTO block (block_no, room_no, complaints, reported_by, status)
SELECT 1, 101, 'Test complaint', 'system', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM block WHERE complaints IS NOT NULL LIMIT 1);
