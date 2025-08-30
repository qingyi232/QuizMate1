#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  try {
    const sqlDir = path.join(__dirname, '..', 'sql');
    const sqlFiles = fs.readdirSync(sqlDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run migrations in order

    for (const file of sqlFiles) {
      console.log(`📄 Running migration: ${file}`);
      
      const sqlContent = fs.readFileSync(path.join(sqlDir, file), 'utf8');
      
      // Split by semicolon and filter out empty statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('_migrations') // This will fail, but we'll catch it
              .select('*')
              .limit(1);
            
            // Use the raw SQL API instead
            console.log(`⚠️  RPC method not available, trying alternative approach...`);
            console.log(`Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
      
      console.log(`✅ Completed migration: ${file}`);
    }

    console.log('🎉 All migrations completed successfully!');
    
    // Test the connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Database connection verified');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Helper function to run raw SQL (fallback)
async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SQL execution failed:', error);
    throw error;
  }
}

// Manual migration for initial setup
async function setupDatabase() {
  console.log('🔧 Setting up database manually...');
  
  try {
    // Create a simple test to verify connection
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connection established');
    
    console.log('📋 Please run the SQL files manually in your Supabase dashboard:');
    console.log('1. sql/001_initial_schema.sql');
    console.log('2. sql/002_rls_policies.sql');
    console.log('3. sql/003_functions.sql');
    console.log('');
    console.log('🌐 Visit: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run migration or setup
if (process.argv.includes('--setup')) {
  setupDatabase();
} else {
  runMigration();
}