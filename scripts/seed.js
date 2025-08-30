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

// Sample data for seeding
const SAMPLE_DATA = {
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@quizmate.app',
      display_name: 'Demo User',
      plan: 'free',
      locale: 'en'
    },
    {
      id: '00000000-0000-0000-0000-000000000002', 
      email: 'pro@quizmate.app',
      display_name: 'Pro User',
      plan: 'pro',
      locale: 'en'
    }
  ],
  
  questions: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      source: 'paste',
      content: 'What is the capital of France?\nA) London\nB) Berlin\nC) Paris\nD) Madrid',
      language: 'en',
      subject: 'Geography',
      grade: 'Elementary',
      hash: 'sample_hash_1'
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000001',
      source: 'paste',
      content: 'Solve: 2x + 5 = 17. Find the value of x.',
      language: 'en',
      subject: 'Mathematics',
      grade: 'Middle School',
      hash: 'sample_hash_2'
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      user_id: '00000000-0000-0000-0000-000000000002',
      source: 'upload',
      content: 'Which gas is most responsible for the greenhouse effect?\nA) Oxygen\nB) Nitrogen\nC) Carbon dioxide\nD) Argon',
      language: 'en',
      subject: 'Science',
      grade: 'High School',
      hash: 'sample_hash_3'
    }
  ],
  
  answers: [
    {
      question_id: '10000000-0000-0000-0000-000000000001',
      answer: 'C) Paris',
      explanation: 'Paris is the capital and largest city of France. It has been the country\'s capital since the 6th century and is known for landmarks like the Eiffel Tower and Louvre Museum.',
      confidence: 0.95,
      model: 'gpt-4o-mini',
      tokens: 150,
      cost_cents: 2,
      lang: 'en'
    },
    {
      question_id: '10000000-0000-0000-0000-000000000002',
      answer: 'x = 6',
      explanation: 'To solve 2x + 5 = 17:\n1. Subtract 5 from both sides: 2x = 12\n2. Divide both sides by 2: x = 6\n3. Check: 2(6) + 5 = 12 + 5 = 17 ✓',
      confidence: 0.98,
      model: 'gpt-4o-mini',
      tokens: 120,
      cost_cents: 1,
      lang: 'en'
    },
    {
      question_id: '10000000-0000-0000-0000-000000000003',
      answer: 'C) Carbon dioxide',
      explanation: 'Carbon dioxide (CO2) is the primary greenhouse gas responsible for global warming. While other gases like methane and water vapor also contribute, CO2 has the greatest impact due to its abundance and long atmospheric lifetime.',
      confidence: 0.92,
      model: 'gpt-4o-mini',
      tokens: 180,
      cost_cents: 3,
      lang: 'en'
    }
  ],
  
  flashcards: [
    {
      question_id: '10000000-0000-0000-0000-000000000001',
      front: 'What is the capital of France?',
      back: 'Paris',
      hint: 'Famous for the Eiffel Tower',
      tags: ['geography', 'capitals', 'europe'],
      difficulty: 2
    },
    {
      question_id: '10000000-0000-0000-0000-000000000002',
      front: 'Solve: 2x + 5 = 17',
      back: 'x = 6',
      hint: 'Isolate x by doing inverse operations',
      tags: ['algebra', 'equations', 'math'],
      difficulty: 3
    },
    {
      question_id: '10000000-0000-0000-0000-000000000002',
      front: 'Steps to solve linear equations',
      back: '1. Isolate the variable term\n2. Divide by the coefficient\n3. Check your answer',
      hint: 'Think about inverse operations',
      tags: ['algebra', 'process', 'math'],
      difficulty: 3
    },
    {
      question_id: '10000000-0000-0000-0000-000000000003',
      front: 'Main greenhouse gas',
      back: 'Carbon dioxide (CO2)',
      hint: 'Gas produced by burning fossil fuels',
      tags: ['environment', 'climate', 'science'],
      difficulty: 2
    }
  ],
  
  quizzes: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'Geography & Math Quiz',
      meta: {
        description: 'Mixed questions on geography and mathematics',
        difficulty: 'beginner'
      }
    }
  ],
  
  quiz_items: [
    {
      quiz_id: '20000000-0000-0000-0000-000000000001',
      question_id: '10000000-0000-0000-0000-000000000001',
      order: 1
    },
    {
      quiz_id: '20000000-0000-0000-0000-000000000001', 
      question_id: '10000000-0000-0000-0000-000000000002',
      order: 2
    }
  ],
  
  usage_daily: [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      date: new Date().toISOString().split('T')[0],
      count: 2
    }
  ],
  
  answer_cache: [
    {
      hash: 'sample_hash_1',
      normalized_prompt: 'capital france multiple choice',
      answer: {
        language: 'en',
        question_type: 'mcq',
        answer: 'C) Paris',
        explanation: 'Paris is the capital of France.',
        confidence: 0.95,
        flashcards: []
      }
    }
  ]
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Insert data in the correct order to satisfy foreign key constraints
    const tables = Object.keys(SAMPLE_DATA);
    
    for (const tableName of tables) {
      const data = SAMPLE_DATA[tableName];
      
      if (data.length > 0) {
        console.log(`📊 Seeding ${tableName} (${data.length} records)...`);
        
        const { data: result, error } = await supabase
          .from(tableName)
          .insert(data)
          .select();
        
        if (error) {
          console.error(`❌ Failed to seed ${tableName}:`, error);
          continue;
        }
        
        console.log(`✅ Successfully seeded ${tableName}: ${result?.length || 0} records`);
      }
    }
    
    console.log('🎉 Database seeding completed!');
    
    // Verify the data
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: questionCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Summary: ${profileCount} profiles, ${questionCount} questions`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();