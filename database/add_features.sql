-- Table for Community Events
CREATE TABLE community_events (
    event_id INT NOT NULL PRIMARY KEY,
    apartment_id INT,
    location VARCHAR(100),
    description TEXT,
    organizer_id INT,
    event_name VARCHAR(100),
    event_date DATE,
    FOREIGN KEY (organizer_id) REFERENCES block_admin(admin_id)
);

-- Table for Amenities
CREATE TABLE amenities (
    amenity_id INT NOT NULL PRIMARY KEY,
    amenity_name VARCHAR(100),
    description TEXT,
    phone_number VARCHAR(15),
    email VARCHAR(100),
    rating DECIMAL(3,2)
);

-- Table for Service Providers
CREATE TABLE service_providers (
    provider_id INT NOT NULL PRIMARY KEY,
    provider_name VARCHAR(100),
    service_type VARCHAR(50),
    contact_person VARCHAR(100),
    phone_number VARCHAR(15),
    email VARCHAR(100)
);

-- Create the complaints table with matching data types from block table
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    block_no INT NOT NULL,
    room_no INT NOT NULL,
    complaint_text VARCHAR(100) NOT NULL,
    reported_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_date DATETIME,
    resolution_notes VARCHAR(100),
    FOREIGN KEY (block_no) REFERENCES block(block_no)
) ENGINE=InnoDB;

-- Migrate existing complaints from block table to the new complaints table
INSERT INTO complaints (block_no, room_no, complaint_text, reported_by, status, reported_date)
SELECT 
    block_no,
    room_no,
    complaints,
    reported_by,
    COALESCE(status, 'Pending'),
    COALESCE(reported_date, NOW())
FROM block 
WHERE complaints IS NOT NULL AND complaints != '';
