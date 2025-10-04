USE apartment_management;

-- First, let's modify existing columns if they exist
ALTER TABLE block 
MODIFY COLUMN reported_by VARCHAR(50),
MODIFY COLUMN reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN status VARCHAR(20) DEFAULT 'Pending';

-- Update any NULL values with defaults
UPDATE block 
SET status = 'Pending' 
WHERE status IS NULL;

UPDATE block 
SET reported_date = CURRENT_TIMESTAMP 
WHERE reported_date IS NULL;
