USE apartment_management;

-- Drop existing complaints table if it exists to avoid constraint issues
DROP TABLE IF EXISTS `complaints`;

-- Create new complaints table
CREATE TABLE `complaints` (
  `complaint_id` INT NOT NULL AUTO_INCREMENT,
  `block_no` INT NOT NULL,
  `room_no` INT NOT NULL,
  `complaint_text` VARCHAR(500) NOT NULL,
  `reported_by` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Pending',
  `reported_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  KEY `idx_complaints_block_room` (`block_no`, `room_no`),
  KEY `idx_complaints_date` (`reported_date`),
  KEY `idx_complaints_status` (`status`),
  CONSTRAINT `fk_complaint_block` FOREIGN KEY (`block_no`) REFERENCES `block` (`block_no`),
  CONSTRAINT `fk_complaint_room` FOREIGN KEY (`room_no`) REFERENCES `room` (`room_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Migrate existing complaints
INSERT INTO complaints (block_no, room_no, complaint_text, reported_by, status, reported_date)
SELECT b.block_no, b.room_no, b.complaints, COALESCE(b.reported_by, 'Unknown'), COALESCE(b.status, 'Pending'), COALESCE(b.reported_date, CURRENT_TIMESTAMP)
FROM block b
WHERE b.complaints IS NOT NULL AND b.complaints != '';

-- Remove old complaints columns from block table
ALTER TABLE block DROP COLUMN complaints;
ALTER TABLE block DROP COLUMN reported_by;
ALTER TABLE block DROP COLUMN status;
ALTER TABLE block DROP COLUMN reported_date;
