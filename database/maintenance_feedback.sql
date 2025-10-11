CREATE TABLE IF NOT EXISTS maintenance (
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
  CONSTRAINT fk_maintenance_room FOREIGN KEY (apartment_id) REFERENCES room (room_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_type ENUM('owner', 'tenant') NOT NULL,
  feedback_text TEXT NOT NULL,
  feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'New',
  rating INT DEFAULT NULL,
  PRIMARY KEY (feedback_id),
  KEY idx_feedback_user (user_id, user_type),
  KEY idx_feedback_date (feedback_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add indexes for better performance
CREATE INDEX idx_maintenance_month ON maintenance(month);
CREATE INDEX idx_feedback_status ON feedback(status);