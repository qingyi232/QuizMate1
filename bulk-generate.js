/**
 * 大批量题目生成脚本 - 每学科200+道题
 * 运行: node bulk-generate.js
 */

const { createClient } = require('@supabase/supabase-js');

// 使用已配置的凭据
const supabaseUrl = 'https://whxukfuqzmbmapaksriz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHVrZnVxem1ibWFwYWtzcml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzOTU5OCwiZXhwIjoyMDcxODE1NTk4fQ.82c8U8LkM19mjTTlA-usszDmJa-TfodX0ACxZpm-A3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成函数库
function generateMathQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['Algebra', 'Geometry', 'Calculus', 'Statistics_Probability'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    // 代数题目模板
    if (topic === 'Algebra') {
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * 20) + 1;
      const c = Math.floor(Math.random() * 50) + 10;
      const x = Math.floor((c - b) / a);
      
      questions.push({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty,
        language: 'en',
        question: `Solve for x: ${a}x + ${b} = ${c}`,
        question_type: 'calculation',
        correct_answer: `x = ${x}`,
        explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}, then divide by ${a}: x = ${x}`,
        tags: ['linear_equations', 'algebra'],
        popularity_score: Math.floor(Math.random() * 30) + 70
      });
    }
    
    // 几何题目模板
    if (topic === 'Geometry') {
      const length = Math.floor(Math.random() * 15) + 5;
      const width = Math.floor(Math.random() * 12) + 3;
      const area = length * width;
      
      questions.push({
        subject: 'Mathematics',
        topic: 'Geometry',
        difficulty,
        language: 'en',
        question: `Find the area of a rectangle with length ${length} and width ${width}`,
        question_type: 'calculation',
        correct_answer: `${area}`,
        explanation: `Area = length × width = ${length} × ${width} = ${area}`,
        tags: ['area', 'rectangles', 'geometry'],
        popularity_score: Math.floor(Math.random() * 25) + 75
      });
    }
    
    // 微积分题目模板  
    if (topic === 'Calculus') {
      const coeff = Math.floor(Math.random() * 5) + 2;
      const power = Math.floor(Math.random() * 4) + 2;
      
      questions.push({
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty,
        language: 'en',
        question: `Find the derivative of f(x) = ${coeff}x^${power}`,
        question_type: 'calculation',
        correct_answer: `f'(x) = ${coeff * power}x^${power - 1}`,
        explanation: `Using power rule: d/dx(ax^n) = anx^(n-1), so f'(x) = ${coeff * power}x^${power - 1}`,
        tags: ['derivatives', 'calculus', 'power_rule'],
        popularity_score: Math.floor(Math.random() * 20) + 65
      });
    }
    
    // 统计题目模板
    if (topic === 'Statistics_Probability') {
      const total = Math.floor(Math.random() * 8) + 4;
      const favorable = Math.floor(Math.random() * total) + 1;
      
      questions.push({
        subject: 'Mathematics', 
        topic: 'Statistics_Probability',
        difficulty,
        language: 'en',
        question: `What is the probability of getting exactly ${favorable} successes in ${total} trials?`,
        question_type: 'calculation',
        correct_answer: `${favorable}/${total}`,
        explanation: `Probability = favorable outcomes / total outcomes = ${favorable}/${total}`,
        tags: ['probability', 'statistics', 'basic_probability'],
        popularity_score: Math.floor(Math.random() * 25) + 70
      });
    }
  }
  
  return questions;
}

function generatePhysicsQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'Mechanics') {
      const distance = Math.floor(Math.random() * 100) + 20;
      const time = Math.floor(Math.random() * 5) + 1;
      const speed = Math.floor(distance / time);
      
      questions.push({
        subject: 'Physics',
        topic: 'Mechanics', 
        difficulty,
        language: 'en',
        question: `A car travels ${distance} km in ${time} hours. What is its average speed?`,
        question_type: 'calculation',
        correct_answer: `${speed} km/h`,
        explanation: `Average speed = distance/time = ${distance}km/${time}h = ${speed} km/h`,
        tags: ['speed', 'kinematics', 'motion'],
        popularity_score: Math.floor(Math.random() * 25) + 75
      });
    }
    
    if (topic === 'Electromagnetism') {
      const voltage = Math.floor(Math.random() * 20) + 5;
      const resistance = Math.floor(Math.random() * 10) + 2;
      const current = Math.floor(voltage / resistance * 100) / 100;
      
      questions.push({
        subject: 'Physics',
        topic: 'Electromagnetism',
        difficulty,
        language: 'en', 
        question: `Using Ohm's law, find current when V=${voltage}V and R=${resistance}Ω`,
        question_type: 'calculation',
        correct_answer: `${current}A`,
        explanation: `Using V=IR: I = V/R = ${voltage}V/${resistance}Ω = ${current}A`,
        tags: ['ohms_law', 'current', 'electricity'],
        popularity_score: Math.floor(Math.random() * 20) + 70
      });
    }
  }
  
  return questions;
}

function generateChemistryQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['Inorganic', 'Organic', 'Chemical_Equations'];
  
  const elements = [
    {name: 'Carbon', symbol: 'C', atomic: 6, mass: 12},
    {name: 'Oxygen', symbol: 'O', atomic: 8, mass: 16}, 
    {name: 'Hydrogen', symbol: 'H', atomic: 1, mass: 1},
    {name: 'Nitrogen', symbol: 'N', atomic: 7, mass: 14},
    {name: 'Sodium', symbol: 'Na', atomic: 11, mass: 23}
  ];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'Inorganic') {
      const element = elements[Math.floor(Math.random() * elements.length)];
      
      questions.push({
        subject: 'Chemistry',
        topic: 'Inorganic',
        difficulty,
        language: 'en',
        question: `What is the chemical symbol for ${element.name}?`,
        question_type: 'short_answer',
        correct_answer: element.symbol,
        explanation: `${element.name} has the chemical symbol ${element.symbol}`,
        tags: ['elements', 'symbols', 'periodic_table'],
        popularity_score: Math.floor(Math.random() * 30) + 80
      });
    }
    
    if (topic === 'Chemical_Equations') {
      questions.push({
        subject: 'Chemistry',
        topic: 'Chemical_Equations',
        difficulty,
        language: 'en',
        question: 'Balance the equation: __ H₂ + __ O₂ → __ H₂O',
        question_type: 'fill_blank',
        correct_answer: '2H₂ + O₂ → 2H₂O',
        explanation: 'Balance hydrogen and oxygen atoms: 2H₂ + O₂ → 2H₂O',
        tags: ['balancing_equations', 'stoichiometry'],
        popularity_score: Math.floor(Math.random() * 25) + 75
      });
    }
  }
  
  return questions;
}

function generateBiologyQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard']; 
  const topics = ['Cell_Biology', 'Genetics', 'Ecology'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'Cell_Biology') {
      questions.push({
        subject: 'Biology',
        topic: 'Cell_Biology',
        difficulty,
        language: 'en',
        question: 'What is the basic unit of life?',
        question_type: 'short_answer',
        correct_answer: 'Cell',
        explanation: 'The cell is considered the basic unit of life',
        tags: ['cells', 'basic_biology'],
        popularity_score: Math.floor(Math.random() * 30) + 85
      });
    }
    
    if (topic === 'Genetics') {
      questions.push({
        subject: 'Biology',
        topic: 'Genetics',
        difficulty,
        language: 'en', 
        question: 'What does DNA stand for?',
        question_type: 'short_answer',
        correct_answer: 'Deoxyribonucleic Acid',
        explanation: 'DNA stands for Deoxyribonucleic Acid',
        tags: ['dna', 'genetics', 'molecular_biology'],
        popularity_score: Math.floor(Math.random() * 25) + 80
      });
    }
  }
  
  return questions;
}

function generateComputerScienceQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['Programming_Basics', 'Algorithms', 'Data_Structures'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'Programming_Basics') {
      questions.push({
        subject: 'Computer_Science',
        topic: 'Programming_Basics',
        difficulty,
        language: 'en',
        question: 'What does HTML stand for?',
        question_type: 'short_answer',
        correct_answer: 'Hypertext Markup Language',
        explanation: 'HTML stands for Hypertext Markup Language',
        tags: ['html', 'web_development'],
        popularity_score: Math.floor(Math.random() * 30) + 85
      });
    }
    
    if (topic === 'Algorithms') {
      questions.push({
        subject: 'Computer_Science',
        topic: 'Algorithms',
        difficulty,
        language: 'en',
        question: 'What is the time complexity of binary search?',
        question_type: 'short_answer', 
        correct_answer: 'O(log n)',
        explanation: 'Binary search eliminates half the search space each iteration',
        tags: ['binary_search', 'time_complexity'],
        popularity_score: Math.floor(Math.random() * 20) + 75
      });
    }
  }
  
  return questions;
}

function generateEnglishQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['Grammar', 'Vocabulary', 'Reading_Comprehension'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'Grammar') {
      questions.push({
        subject: 'English',
        topic: 'Grammar',
        difficulty,
        language: 'en',
        question: 'Choose the correct form: "I __ going to school."',
        question_type: 'multiple_choice',
        correct_answer: 'am',
        explanation: 'First person singular uses "am" in present continuous',
        tags: ['be_verb', 'present_continuous'],
        popularity_score: Math.floor(Math.random() * 30) + 80
      });
    }
    
    if (topic === 'Vocabulary') {
      questions.push({
        subject: 'English',
        topic: 'Vocabulary',
        difficulty,
        language: 'en',
        question: 'What is a synonym for "happy"?',
        question_type: 'short_answer',
        correct_answer: 'joyful',
        explanation: 'Joyful means the same as happy',
        tags: ['synonyms', 'emotions'],
        popularity_score: Math.floor(Math.random() * 25) + 85
      });
    }
  }
  
  return questions;
}

function generateHistoryQuestions(count = 250) {
  const questions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['World_History', 'Geography'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    if (topic === 'World_History') {
      questions.push({
        subject: 'History',
        topic: 'World_History', 
        difficulty,
        language: 'en',
        question: 'In which year did World War II end?',
        question_type: 'short_answer',
        correct_answer: '1945',
        explanation: 'World War II ended in 1945',
        tags: ['world_war_ii', '20th_century'],
        popularity_score: Math.floor(Math.random() * 30) + 85
      });
    }
    
    if (topic === 'Geography') {
      questions.push({
        subject: 'History',
        topic: 'Geography',
        difficulty,
        language: 'en',
        question: 'What is the capital of France?',
        question_type: 'short_answer',
        correct_answer: 'Paris',
        explanation: 'Paris is the capital and largest city of France',
        tags: ['capitals', 'europe'],
        popularity_score: Math.floor(Math.random() * 30) + 90
      });
    }
  }
  
  return questions;
}

async function bulkGenerate() {
  console.log('🚀 开始大批量生成题目...');
  console.log('目标: 每个学科250道题，总计1750道题');
  
  // 生成所有学科题目
  const allQuestions = [
    ...generateMathQuestions(250),
    ...generatePhysicsQuestions(250), 
    ...generateChemistryQuestions(250),
    ...generateBiologyQuestions(250),
    ...generateComputerScienceQuestions(250),
    ...generateEnglishQuestions(250),
    ...generateHistoryQuestions(250)
  ];
  
  console.log(`📊 总计生成: ${allQuestions.length} 道题目`);
  
  // 批量导入数据库
  console.log('📤 开始批量导入...');
  let successCount = 0;
  let errorCount = 0;
  
  // 分批导入，每批100道题
  const batchSize = 100;
  const totalBatches = Math.ceil(allQuestions.length / batchSize);
  
  for (let i = 0; i < allQuestions.length; i += batchSize) {
    const batch = allQuestions.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    try {
      console.log(`📦 导入批次 ${batchNum}/${totalBatches} (${batch.length} 道题)...`);
      
      const { data, error } = await supabase
        .from('subject_questions')
        .insert(batch);
      
      if (error) {
        console.error(`❌ 批次 ${batchNum} 导入失败:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`✅ 批次 ${batchNum} 导入成功`);
        successCount += batch.length;
      }
      
      // 防止API限制，每批间隔200ms
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`💥 批次 ${batchNum} 异常:`, err.message);
      errorCount += batch.length;
    }
  }
  
  console.log('\\n🎉 大批量生成完成！');
  console.log(`✅ 成功导入: ${successCount} 道题`);
  console.log(`❌ 导入失败: ${errorCount} 道题`);
  console.log(`📈 成功率: ${Math.round(successCount / allQuestions.length * 100)}%`);
  
  // 显示最终统计
  try {
    const { data: stats } = await supabase.from('subject_statistics').select('*');
    if (stats) {
      console.log('\\n📊 各学科最终统计:');
      stats.forEach(stat => {
        console.log(`   📚 ${stat.subject}: ${stat.total_questions} 道题 (简单: ${stat.easy_count}, 中等: ${stat.medium_count}, 困难: ${stat.hard_count})`);
      });
    }
  } catch (err) {
    console.log('统计获取失败，但题目导入已完成');
  }
  
  console.log('\\n🌟 现在访问 http://localhost:3000/questions 查看完整题库！');
}

bulkGenerate().catch(console.error);