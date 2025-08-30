/**
 * 快速测试脚本 - 立即导入少量题目看效果
 * 运行: node quick-test.js
 */

const { createClient } = require('@supabase/supabase-js');

// 请替换为您的真实Supabase凭据
const supabaseUrl = 'https://whxukfuqzmbmapaksriz.supabase.co'; // 您的Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHVrZnVxem1ibWFwYWtzcml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzOTU5OCwiZXhwIjoyMDcxODE1NTk4fQ.82c8U8LkM19mjTTlA-usszDmJa-TfodX0ACxZpm-A3E'; // 您的Service Role Key

// 快速测试数据 - 每学科5道题
const testQuestions = [
  // 数学题目
  {
    subject: 'Mathematics',
    topic: 'Algebra', 
    difficulty: 'easy',
    language: 'en',
    question: 'Solve for x: 2x + 8 = 20',
    question_type: 'calculation',
    correct_answer: 'x = 6',
    explanation: 'Subtract 8 from both sides: 2x = 12, then divide by 2: x = 6',
    tags: ['linear_equations'],
    popularity_score: 90
  },
  {
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'easy', 
    language: 'en',
    question: 'What is the area of a rectangle with length 10 and width 4?',
    question_type: 'calculation',
    correct_answer: '40',
    explanation: 'Area = length × width = 10 × 4 = 40',
    tags: ['area', 'rectangles'],
    popularity_score: 95
  },
  {
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'medium',
    language: 'zh',
    question: '解方程：3x - 6 = 15',
    question_type: 'calculation', 
    correct_answer: 'x = 7',
    explanation: '两边加6：3x = 21，再除以3：x = 7',
    tags: ['一元一次方程'],
    popularity_score: 88
  },

  // 物理题目
  {
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'easy',
    language: 'en',
    question: 'What is the unit of force in the SI system?',
    question_type: 'multiple_choice',
    correct_answer: 'Newton',
    explanation: 'The Newton (N) is the SI unit for force',
    tags: ['units', 'force'],
    popularity_score: 92
  },
  {
    subject: 'Physics', 
    topic: 'Mechanics',
    difficulty: 'medium',
    language: 'en',
    question: 'A ball is dropped from 20m height. How long to reach ground? (g=10m/s²)',
    question_type: 'calculation',
    correct_answer: '2 seconds',
    explanation: 'Using h = ½gt²: 20 = ½×10×t², so t² = 4, t = 2 seconds',
    tags: ['free_fall', 'kinematics'],
    popularity_score: 85
  },

  // 化学题目  
  {
    subject: 'Chemistry',
    topic: 'Inorganic',
    difficulty: 'easy',
    language: 'en', 
    question: 'What is the chemical formula for water?',
    question_type: 'short_answer',
    correct_answer: 'H₂O',
    explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom',
    tags: ['formulas', 'water'],
    popularity_score: 96
  },
  {
    subject: 'Chemistry',
    topic: 'Chemical_Equations',
    difficulty: 'medium',
    language: 'en',
    question: 'Balance: __ Mg + __ O₂ → __ MgO',
    question_type: 'fill_blank',
    correct_answer: '2Mg + O₂ → 2MgO',
    explanation: 'Balance Mg and O atoms: 2Mg + O₂ → 2MgO',
    tags: ['balancing_equations'],
    popularity_score: 84
  },

  // 生物题目
  {
    subject: 'Biology',
    topic: 'Cell_Biology', 
    difficulty: 'easy',
    language: 'en',
    question: 'What organelle is known as the powerhouse of the cell?',
    question_type: 'short_answer',
    correct_answer: 'Mitochondria', 
    explanation: 'Mitochondria produce ATP through cellular respiration',
    tags: ['organelles', 'energy'],
    popularity_score: 94
  },
  {
    subject: 'Biology',
    topic: 'Genetics',
    difficulty: 'medium',
    language: 'en',
    question: 'What does DNA stand for?',
    question_type: 'short_answer',
    correct_answer: 'Deoxyribonucleic Acid',
    explanation: 'DNA is the molecule that carries genetic information',
    tags: ['dna', 'genetics'],
    popularity_score: 89
  },

  // 计算机题目
  {
    subject: 'Computer_Science',
    topic: 'Programming_Basics',
    difficulty: 'easy',
    language: 'en',
    question: 'Which language is primarily used for web development?',
    question_type: 'multiple_choice', 
    correct_answer: 'JavaScript',
    explanation: 'JavaScript is the main programming language for web development',
    tags: ['web_development', 'javascript'],
    popularity_score: 91
  },
  {
    subject: 'Computer_Science',
    topic: 'Algorithms',
    difficulty: 'medium', 
    language: 'en',
    question: 'What is the time complexity of bubble sort?',
    question_type: 'multiple_choice',
    correct_answer: 'O(n²)',
    explanation: 'Bubble sort has quadratic time complexity O(n²)',
    tags: ['sorting', 'complexity'],
    popularity_score: 82
  },

  // 英语题目
  {
    subject: 'English',
    topic: 'Grammar',
    difficulty: 'easy',
    language: 'en',
    question: 'Choose correct: I __ going to school.',
    question_type: 'multiple_choice',
    correct_answer: 'am',
    explanation: 'First person singular uses "am"',
    tags: ['be_verb', 'present_continuous'],
    popularity_score: 87
  },
  {
    subject: 'English', 
    topic: 'Vocabulary',
    difficulty: 'medium',
    language: 'en',
    question: 'What is a synonym for "big"?',
    question_type: 'multiple_choice',
    correct_answer: 'large',
    explanation: 'Large means the same as big',
    tags: ['synonyms', 'adjectives'],
    popularity_score: 86
  },

  // 历史题目
  {
    subject: 'History',
    topic: 'World_History',
    difficulty: 'easy', 
    language: 'en',
    question: 'Who discovered America in 1492?',
    question_type: 'short_answer',
    correct_answer: 'Christopher Columbus',
    explanation: 'Columbus reached the Americas in 1492',
    tags: ['exploration', 'americas'],
    popularity_score: 93
  },
  {
    subject: 'History',
    topic: 'Geography',
    difficulty: 'easy',
    language: 'en',
    question: 'What is the capital of France?',
    question_type: 'short_answer', 
    correct_answer: 'Paris',
    explanation: 'Paris is the capital and largest city of France',
    tags: ['capitals', 'europe'],
    popularity_score: 95
  }
];

async function quickTest() {
  console.log('🚀 Quick Test - Adding sample questions...');
  
  if (!supabaseUrl.startsWith('https://') || !supabaseKey.startsWith('eyJ')) {
    console.log('⚠️  Please configure your Supabase credentials:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('\\n   Or edit this file and replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  try {
    const { data, error } = await supabase.from('subject_categories').select('count', { count: 'exact' });
    if (error) {
      console.log('❌ Database connection failed. Make sure you have run the SQL script in Supabase first!');
      console.log('   Error:', error.message);
      return;
    }
    console.log('✅ Database connection successful!');
  } catch (err) {
    console.log('❌ Failed to connect to Supabase:', err.message);
    return;
  }

  // Insert test questions
  let successCount = 0;
  let errorCount = 0;

  for (const question of testQuestions) {
    try {
      const { error } = await supabase
        .from('subject_questions')
        .insert(question);
        
      if (error) {
        console.log(`❌ Failed to insert ${question.subject} question:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Added ${question.subject} - ${question.topic}: ${question.question.substring(0, 50)}...`);
        successCount++;
      }
    } catch (err) {
      console.log(`💥 Error inserting question:`, err.message);
      errorCount++;
    }
  }

  console.log(`\\n🎉 Quick test completed!`);
  console.log(`✅ Successfully added: ${successCount} questions`);  
  console.log(`❌ Failed: ${errorCount} questions`);

  // Show statistics
  try {
    const { data: stats } = await supabase.from('subject_statistics').select('*');
    if (stats && stats.length > 0) {
      console.log('\\n📊 Current database statistics:');
      stats.forEach(stat => {
        console.log(`   📚 ${stat.subject}: ${stat.total_questions} questions`);
      });
    }
  } catch (err) {
    console.log('Warning: Could not fetch statistics');
  }

  console.log('\\n🌟 Now visit http://localhost:3000/questions to see the subject categories!');
}

quickTest().catch(console.error);