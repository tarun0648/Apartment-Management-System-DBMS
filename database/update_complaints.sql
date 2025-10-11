-- Add new fields to block table for better complaint tracking
ALTER TABLE block 
ADD COLUMN reported_by VARCHAR(50),
ADD COLUMN reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending';
