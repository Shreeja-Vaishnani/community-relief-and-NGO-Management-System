DROP DATABASE IF EXISTS community_relief;
CREATE DATABASE community_relief;
USE community_relief;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','volunteer','donor','beneficiary') NOT NULL DEFAULT 'donor',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('money','food','clothes','medicine','other') DEFAULT 'money',
  description TEXT,
  status ENUM('pending','received','distributed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE relief_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category ENUM('food','shelter','medical','education','clothing','other') DEFAULT 'other',
  urgency ENUM('low','medium','high','critical') DEFAULT 'medium',
  status ENUM('pending','approved','in_progress','fulfilled','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE volunteer_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT,
  assigned_by INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  due_date DATE,
  status ENUM('open','assigned','in_progress','completed','cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'shreeja@relief.org', 'shreeja', 'admin');

INSERT INTO users (name, email, password, role, phone) VALUES
('Alice Volunteer', 'alice@relief.org', 'alice123', 'volunteer', '9000000001'),
('Bob Volunteer', 'bob@relief.org', 'bob123', 'volunteer', '9000000002'),
('Carol Volunteer', 'carol@relief.org', 'carol123', 'volunteer', '9000000003');
