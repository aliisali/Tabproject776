import pg from 'pg';

const { Pool } = pg;

// Render PostgreSQL connection configuration
const getDatabaseConfig = () => {
  // Render automatically provides DATABASE_URL environment variable
  const databaseUrl = process.env.DATABASE_URL || 
    // Fallback for development
    'postgresql://username:password@hostname:port/database';
  
  return {
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

// Create connection pool
let pool: pg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool(getDatabaseConfig());
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
};

// Database service for Render PostgreSQL
export class DatabaseService {
  
  // Initialize database tables
  static async initializeTables() {
    const client = getPool();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
          business_id UUID,
          permissions TEXT[] DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          verification_token VARCHAR(255),
          parent_id UUID REFERENCES users(id),
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create businesses table
      await client.query(`
        CREATE TABLE IF NOT EXISTS businesses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(255),
          admin_id UUID REFERENCES users(id),
          features TEXT[] DEFAULT '{}',
          subscription VARCHAR(50) DEFAULT 'basic',
          vr_view_enabled BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create customers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          mobile VARCHAR(50),
          address TEXT NOT NULL,
          postcode VARCHAR(20),
          business_id UUID REFERENCES businesses(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create jobs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
          customer_id UUID REFERENCES customers(id),
          employee_id UUID REFERENCES users(id),
          business_id UUID REFERENCES businesses(id),
          scheduled_date TIMESTAMPTZ NOT NULL,
          completed_date TIMESTAMPTZ,
          quotation DECIMAL(10,2),
          invoice DECIMAL(10,2),
          signature TEXT,
          images TEXT[] DEFAULT '{}',
          documents TEXT[] DEFAULT '{}',
          checklist JSONB DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          description TEXT,
          image VARCHAR(500),
          model_3d VARCHAR(500),
          ar_model VARCHAR(500),
          specifications TEXT[] DEFAULT '{}',
          price DECIMAL(10,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create notifications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create module permissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS module_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          module_name VARCHAR(100) NOT NULL,
          can_access BOOLEAN DEFAULT false,
          can_grant_access BOOLEAN DEFAULT false,
          granted_by UUID REFERENCES users(id),
          granted_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create model permissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS model_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID REFERENCES businesses(id),
          can_view_3d_models BOOLEAN DEFAULT false,
          can_use_in_ar BOOLEAN DEFAULT false,
          granted_by UUID REFERENCES users(id),
          granted_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Insert default data if tables are empty
      await this.insertDefaultData();
      
      console.log('✅ Database tables initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database tables:', error);
      throw error;
    }
  }

  // Insert default data
  static async insertDefaultData() {
    const client = getPool();
    
    try {
      // Check if we already have users
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) > 0) {
        console.log('✅ Database already has data, skipping default insert');
        return;
      }

      // Insert default admin user
      const adminResult = await client.query(`
        INSERT INTO users (id, email, name, password, role, permissions, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        '550e8400-e29b-41d4-a716-446655440003',
        'admin@platform.com',
        'BlindsCloud Admin',
        'password',
        'admin',
        ['all'],
        true,
        true
      ]);

      // Insert default business
      const businessResult = await client.query(`
        INSERT INTO businesses (id, name, address, phone, email, features, subscription, vr_view_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        '550e8400-e29b-41d4-a716-446655440001',
        'BlindsCloud Solutions Ltd.',
        '456 Window Street, Blindfold City, BC 12345',
        '+1 (555) 123-4567',
        'contact@blindscloud.co.uk',
        ['job_management', 'calendar', 'reports', 'camera', 'ar_camera', 'vr_view', '3d_models'],
        'premium',
        true
      ]);

      // Insert business user
      await client.query(`
        INSERT INTO users (id, email, name, password, role, business_id, permissions, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        '550e8400-e29b-41d4-a716-446655440004',
        'business@company.com',
        'Blinds Business Manager',
        'password',
        'business',
        '550e8400-e29b-41d4-a716-446655440001',
        ['manage_employees', 'view_dashboard', 'create_jobs'],
        true,
        true
      ]);

      // Insert employee user
      await client.query(`
        INSERT INTO users (id, email, name, password, role, business_id, permissions, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        '550e8400-e29b-41d4-a716-446655440005',
        'employee@company.com',
        'Blinds Installation Specialist',
        'password',
        'employee',
        '550e8400-e29b-41d4-a716-446655440001',
        ['create_jobs', 'manage_tasks', 'capture_signatures', 'ar_camera_access'],
        true,
        true
      ]);

      // Insert default customers
      await client.query(`
        INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        '550e8400-e29b-41d4-a716-446655440006',
        'Luxury Homes Ltd.',
        'contact@luxuryhomes.com',
        '+1 (555) 111-2222',
        '+1 (555) 111-3333',
        '789 Luxury Lane, Premium District',
        '12345',
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440007',
        'Modern Office Complex',
        'facilities@modernoffice.com',
        '+1 (555) 222-3333',
        '+1 (555) 222-4444',
        '321 Corporate Plaza, Business District',
        '54321',
        '550e8400-e29b-41d4-a716-446655440001'
      ]);

      // Insert default products
      await client.query(`
        INSERT INTO products (id, name, category, description, image, specifications, price, is_active)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8),
        ($9, $10, $11, $12, $13, $14, $15, $16),
        ($17, $18, $19, $20, $21, $22, $23, $24),
        ($25, $26, $27, $28, $29, $30, $31, $32)
      `, [
        '550e8400-e29b-41d4-a716-446655440008',
        'Premium Blackout Blinds',
        'Window Blinds',
        'High-quality blackout blinds for complete light control and privacy',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        ['100% Light Blocking', 'Thermal Insulation', 'Easy Installation', 'Custom Sizing Available'],
        299,
        true,
        '550e8400-e29b-41d4-a716-446655440009',
        'Smart Motorized Blinds',
        'Smart Blinds',
        'App-controlled motorized blinds with scheduling and automation features',
        'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=400',
        ['WiFi Connectivity', 'Voice Control Compatible', 'Solar Panel Option', 'Smartphone App'],
        599,
        true,
        '550e8400-e29b-41d4-a716-44665544000a',
        'Venetian Blinds Collection',
        'Venetian Blinds',
        'Classic venetian blinds in various materials and colors',
        'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
        ['Aluminum Slats', 'Tilt Control', 'Multiple Colors', 'Durable Construction'],
        149,
        true,
        '550e8400-e29b-41d4-a716-44665544000b',
        'Roller Blinds Pro',
        'Roller Blinds',
        'Professional roller blinds for offices and commercial spaces',
        'https://images.pexels.com/photos/6969832/pexels-photo-6969832.jpeg?auto=compress&cs=tinysrgb&w=400',
        ['Fire Retardant Fabric', 'Commercial Grade', 'Chain Control', 'UV Protection'],
        199,
        true
      ]);

      console.log('✅ Default data inserted successfully');
    } catch (error) {
      console.error('❌ Failed to insert default data:', error);
    }
  }

  // User operations
  static async getUsers() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT 
          id, email, name, password, role, business_id, permissions, 
          is_active, email_verified, verification_token, parent_id, 
          created_by, created_at
        FROM users 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        name: row.name,
        password: row.password,
        role: row.role,
        businessId: row.business_id,
        permissions: row.permissions || [],
        isActive: row.is_active,
        emailVerified: row.email_verified,
        verificationToken: row.verification_token,
        parentId: row.parent_id,
        createdBy: row.created_by,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      throw error;
    }
  }

  static async createUser(userData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO users (email, name, password, role, business_id, permissions, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        userData.email,
        userData.name,
        userData.password,
        userData.role,
        userData.businessId || null,
        userData.permissions || [],
        userData.isActive !== false,
        userData.emailVerified || false
      ]);

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        businessId: user.business_id,
        permissions: user.permissions || [],
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: any) {
    const client = getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(userData.name);
      }
      if (userData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }
      if (userData.password !== undefined) {
        fields.push(`password = $${paramCount++}`);
        values.push(userData.password);
      }
      if (userData.role !== undefined) {
        fields.push(`role = $${paramCount++}`);
        values.push(userData.role);
      }
      if (userData.businessId !== undefined) {
        fields.push(`business_id = $${paramCount++}`);
        values.push(userData.businessId);
      }
      if (userData.permissions !== undefined) {
        fields.push(`permissions = $${paramCount++}`);
        values.push(userData.permissions);
      }
      if (userData.isActive !== undefined) {
        fields.push(`is_active = $${paramCount++}`);
        values.push(userData.isActive);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string) {
    const client = getPool();
    try {
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  // Business operations
  static async getBusinesses() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT 
          id, name, address, phone, email, admin_id, features, 
          subscription, vr_view_enabled, created_at
        FROM businesses 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        email: row.email,
        adminId: row.admin_id,
        features: row.features || [],
        subscription: row.subscription,
        vrViewEnabled: row.vr_view_enabled,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get businesses:', error);
      throw error;
    }
  }

  static async createBusiness(businessData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO businesses (name, address, phone, email, admin_id, features, subscription, vr_view_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        businessData.name,
        businessData.address,
        businessData.phone,
        businessData.email,
        businessData.adminId || null,
        businessData.features || [],
        businessData.subscription || 'basic',
        businessData.vrViewEnabled || false
      ]);

      const business = result.rows[0];
      return {
        id: business.id,
        name: business.name,
        address: business.address,
        phone: business.phone,
        email: business.email,
        adminId: business.admin_id,
        features: business.features || [],
        subscription: business.subscription,
        vrViewEnabled: business.vr_view_enabled,
        createdAt: business.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create business:', error);
      throw error;
    }
  }

  static async updateBusiness(id: string, businessData: any) {
    const client = getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (businessData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(businessData.name);
      }
      if (businessData.address !== undefined) {
        fields.push(`address = $${paramCount++}`);
        values.push(businessData.address);
      }
      if (businessData.phone !== undefined) {
        fields.push(`phone = $${paramCount++}`);
        values.push(businessData.phone);
      }
      if (businessData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(businessData.email);
      }
      if (businessData.features !== undefined) {
        fields.push(`features = $${paramCount++}`);
        values.push(businessData.features);
      }
      if (businessData.vrViewEnabled !== undefined) {
        fields.push(`vr_view_enabled = $${paramCount++}`);
        values.push(businessData.vrViewEnabled);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE businesses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to update business:', error);
      throw error;
    }
  }

  static async deleteBusiness(id: string) {
    const client = getPool();
    try {
      await client.query('DELETE FROM businesses WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete business:', error);
      throw error;
    }
  }

  // Job operations
  static async getJobs() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT 
          id, title, description, status, customer_id, employee_id, business_id,
          scheduled_date, completed_date, quotation, invoice, signature,
          images, documents, checklist, created_at
        FROM jobs 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        customerId: row.customer_id,
        employeeId: row.employee_id,
        businessId: row.business_id,
        scheduledDate: row.scheduled_date,
        completedDate: row.completed_date,
        quotation: parseFloat(row.quotation) || 0,
        invoice: parseFloat(row.invoice) || 0,
        signature: row.signature,
        images: row.images || [],
        documents: row.documents || [],
        checklist: row.checklist || [],
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get jobs:', error);
      throw error;
    }
  }

  static async createJob(jobData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, quotation, images, documents, checklist)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        jobData.id || `JOB-${Date.now().toString().slice(-6)}`,
        jobData.title,
        jobData.description,
        jobData.status || 'pending',
        jobData.customerId,
        jobData.employeeId,
        jobData.businessId,
        jobData.scheduledDate,
        jobData.quotation || 0,
        jobData.images || [],
        jobData.documents || [],
        JSON.stringify(jobData.checklist || [])
      ]);

      const job = result.rows[0];
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        status: job.status,
        customerId: job.customer_id,
        employeeId: job.employee_id,
        businessId: job.business_id,
        scheduledDate: job.scheduled_date,
        quotation: parseFloat(job.quotation) || 0,
        images: job.images || [],
        documents: job.documents || [],
        checklist: job.checklist || [],
        createdAt: job.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    }
  }

  static async updateJob(id: string, jobData: any) {
    const client = getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (jobData.title !== undefined) {
        fields.push(`title = $${paramCount++}`);
        values.push(jobData.title);
      }
      if (jobData.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(jobData.description);
      }
      if (jobData.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(jobData.status);
      }
      if (jobData.quotation !== undefined) {
        fields.push(`quotation = $${paramCount++}`);
        values.push(jobData.quotation);
      }
      if (jobData.checklist !== undefined) {
        fields.push(`checklist = $${paramCount++}`);
        values.push(JSON.stringify(jobData.checklist));
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      throw error;
    }
  }

  static async deleteJob(id: string) {
    const client = getPool();
    try {
      await client.query('DELETE FROM jobs WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete job:', error);
      throw error;
    }
  }

  // Customer operations
  static async getCustomers() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT id, name, email, phone, mobile, address, postcode, business_id, created_at
        FROM customers 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        mobile: row.mobile,
        address: row.address,
        postcode: row.postcode,
        businessId: row.business_id,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get customers:', error);
      throw error;
    }
  }

  static async createCustomer(customerData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO customers (name, email, phone, mobile, address, postcode, business_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        customerData.name,
        customerData.email,
        customerData.phone,
        customerData.mobile,
        customerData.address,
        customerData.postcode,
        customerData.businessId
      ]);

      const customer = result.rows[0];
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        mobile: customer.mobile,
        address: customer.address,
        postcode: customer.postcode,
        businessId: customer.business_id,
        createdAt: customer.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      throw error;
    }
  }

  static async updateCustomer(id: string, customerData: any) {
    const client = getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (customerData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(customerData.name);
      }
      if (customerData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(customerData.email);
      }
      if (customerData.phone !== undefined) {
        fields.push(`phone = $${paramCount++}`);
        values.push(customerData.phone);
      }
      if (customerData.address !== undefined) {
        fields.push(`address = $${paramCount++}`);
        values.push(customerData.address);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to update customer:', error);
      throw error;
    }
  }

  static async deleteCustomer(id: string) {
    const client = getPool();
    try {
      await client.query('DELETE FROM customers WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete customer:', error);
      throw error;
    }
  }

  // Product operations
  static async getProducts() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT id, name, category, description, image, model_3d, ar_model, specifications, price, is_active, created_at
        FROM products 
        WHERE is_active = true
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        image: row.image,
        model3d: row.model_3d,
        arModel: row.ar_model,
        specifications: row.specifications || [],
        price: parseFloat(row.price) || 0,
        isActive: row.is_active,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get products:', error);
      throw error;
    }
  }

  static async createProduct(productData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO products (name, category, description, image, specifications, price, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        productData.name,
        productData.category,
        productData.description,
        productData.image,
        productData.specifications || [],
        productData.price || 0,
        productData.isActive !== false
      ]);

      const product = result.rows[0];
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        image: product.image,
        specifications: product.specifications || [],
        price: parseFloat(product.price) || 0,
        isActive: product.is_active,
        createdAt: product.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, productData: any) {
    const client = getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (productData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(productData.name);
      }
      if (productData.price !== undefined) {
        fields.push(`price = $${paramCount++}`);
        values.push(productData.price);
      }
      if (productData.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(productData.description);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string) {
    const client = getPool();
    try {
      await client.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      throw error;
    }
  }

  // Notification operations
  static async getNotifications() {
    const client = getPool();
    try {
      const result = await client.query(`
        SELECT id, user_id, title, message, type, read, created_at
        FROM notifications 
        ORDER BY created_at DESC
        LIMIT 50
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: row.read,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get notifications:', error);
      throw error;
    }
  }

  static async createNotification(notificationData: any) {
    const client = getPool();
    try {
      const result = await client.query(`
        INSERT INTO notifications (user_id, title, message, type, read)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        notificationData.userId,
        notificationData.title,
        notificationData.message,
        notificationData.type || 'system',
        notificationData.read || false
      ]);

      const notification = result.rows[0];
      return {
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.created_at
      };
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      throw error;
    }
  }

  // Test database connection
  static async testConnection() {
    try {
      const client = getPool();
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Initialize database (call this once)
  static async initialize() {
    try {
      console.log('🚀 Initializing Render PostgreSQL database...');
      
      // Test connection first
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }

      // Initialize tables and default data
      await this.initializeTables();
      
      console.log('✅ Render database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }
}