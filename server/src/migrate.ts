import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Read and execute schema - handle both dev and production paths
    let schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.sql');
    }
    
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️ Schema file not found, skipping migration');
      console.log('✅ Database should be initialized via Supabase migrations');
      process.exit(0);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Create uploads directory
    const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
    }

    console.log('🎉 All migrations completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();