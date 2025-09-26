# 🚀 Complete Server Deployment Guide

## 📋 Prerequisites
- cPanel hosting account or VPS server
- Domain name configured
- FTP/File Manager access
- MySQL database access

## 📥 Step 1: Build Your Project

### Local Build (if you have Node.js):
```bash
npm install
npm run build
```

### Files to Upload:
If you can't build locally, I'll provide all the built files below.

## 📂 Step 2: Upload Files to Server

### Using cPanel File Manager:
1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to public_html** (or your domain folder)
4. **Upload all files** from the list below
5. **Set file permissions:**
   - Files: 644
   - Folders: 755
   - .htaccess: 644

### Using FTP:
1. **Connect via FTP client** (FileZilla, etc.)
2. **Navigate to public_html**
3. **Upload all files maintaining folder structure**

## 📁 Required Files Structure:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── vite.svg
```

## 🗄️ Step 3: Database Setup

### Option A: MySQL Database (Recommended)

#### Create Database:
1. **Login to cPanel**
2. **Go to MySQL Databases**
3. **Create new database:** `your_domain_jobmanager`
4. **Create database user:** `jobmanager_user`
5. **Set strong password**
6. **Add user to database** with ALL PRIVILEGES

#### Run SQL Commands:
Execute this SQL in phpMyAdmin or MySQL command line:

```sql
-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'business', 'employee') NOT NULL,
  business_id VARCHAR(50),
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  admin_id VARCHAR(50),
  features JSON,
  subscription ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
  vr_view_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
  customer_id VARCHAR(50),
  employee_id VARCHAR(50),
  business_id VARCHAR(50),
  scheduled_date DATETIME NOT NULL,
  completed_date DATETIME,
  quotation DECIMAL(10,2) DEFAULT 0,
  invoice DECIMAL(10,2) DEFAULT 0,
  signature TEXT,
  images JSON,
  documents JSON,
  checklist JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  address TEXT NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  business_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  model_3d TEXT,
  ar_model TEXT,
  specifications JSON,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('reminder', 'job', 'system') DEFAULT 'system',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Data
INSERT INTO businesses (id, name, address, phone, email, admin_id, features, subscription) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', '550e8400-e29b-41d4-a716-446655440002', '["job_management", "calendar", "reports", "camera"]', 'premium');

INSERT INTO users (id, email, name, password, role, business_id, permissions, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@platform.com', 'Platform Admin', 'password', 'admin', NULL, '["all"]', TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'business@company.com', 'Business Manager', 'password', 'business', '550e8400-e29b-41d4-a716-446655440001', '["manage_employees", "view_dashboard", "create_jobs"]', TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'employee@company.com', 'Field Employee', 'password', 'employee', '550e8400-e29b-41d4-a716-446655440001', '["create_jobs", "manage_tasks", "capture_signatures", "vr_view"]', TRUE, TRUE);

INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', '["Cooling Capacity: 5 Tons", "Heating Capacity: 120,000 BTU", "Energy Rating: SEER 16"]', 2500.00, TRUE);

INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15 09:00:00', '2024-01-15 16:30:00', 2500.00, 2500.00, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}]');

INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', FALSE);
```

### Option B: Use Existing localStorage (No Database)
If you prefer to keep using localStorage (current system), no database setup needed. The app will work as-is.

## ⚙️ Step 4: Configure Application

### Update Database Connection (if using MySQL):
Create a PHP API file to connect your app to MySQL:

```php
<?php
// api/config.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'your_domain_jobmanager';
$username = 'jobmanager_user';
$password = 'your_database_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

## 🔧 Step 5: Test Your Deployment

### 1. Check File Access:
- Visit: `https://yourdomain.com`
- Should load the login page

### 2. Test Login:
- Admin: `admin@platform.com` / `password`
- Business: `business@company.com` / `password`
- Employee: `employee@company.com` / `password`

### 3. Test Features:
- Create new users
- Manage businesses
- Access VR View
- All data should persist

## 🚨 Troubleshooting

### Common Issues:

**1. Pages don't load:**
- Check `.htaccess` file is uploaded
- Verify file permissions (644 for files, 755 for folders)

**2. Styles don't load:**
- Verify `assets` folder is uploaded
- Check file paths in browser developer tools

**3. Database connection fails:**
- Verify database credentials
- Check database user permissions
- Ensure database exists

**4. VR View doesn't work:**
- Requires HTTPS (SSL certificate)
- Check camera permissions in browser

## 📞 Support

### If you need help:
1. Check browser console for errors (F12)
2. Check cPanel error logs
3. Verify all files uploaded correctly
4. Test database connection

## 🎉 You're Done!

Your JobManager Pro platform should now be live on your new server!

**Features Available:**
- ✅ Complete user management
- ✅ Business operations
- ✅ VR/AR capabilities (with HTTPS)
- ✅ Job tracking
- ✅ Customer management
- ✅ Reports and analytics

**Next Steps:**
1. Set up SSL certificate for HTTPS
2. Configure email settings
3. Customize branding
4. Add your own content