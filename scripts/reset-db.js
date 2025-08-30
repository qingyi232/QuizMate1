#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  'quiz_items',
  'attempts', 
  'flashcards',
  'answers',
  'questions',
  'quizzes',
  'usage_daily',
  'subscriptions',
  'answer_cache',
  'profiles'
];

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('This operation cannot be undone.');
  
  // Check if this is production
  if (supabaseUrl.includes('supabase.co') && !process.argv.includes('--force')) {
    console.log('❌ Refusing to reset production database. Use --force flag if you really want to do this.');
    process.exit(1);
  }
  
  console.log('🗑️  Starting database reset...');
  
  try {
    // Drop tables in reverse order to handle foreign keys
    for (const table of TABLES) {
      console.log(`🔥 Truncating table: ${table}`);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error(`Failed to truncate ${table}:`, error);
      }
    }
    
    console.log('🎯 Database reset completed');
    
    // Verify tables are empty
    for (const table of ['profiles', 'questions', 'answers']) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`📊 ${table}: ${count} rows`);
      }
    }
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();