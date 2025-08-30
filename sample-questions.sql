-- 导入国际化样本题目到QuizMate数据库
-- 在Supabase SQL编辑器中运行此脚本

-- 插入样本题目 - 数学类
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Solve for x: 2x + 7 = 15', 'math', 'middle_school', 'en', 'import', 'hash_math_001', '{"difficulty": "easy", "tags": ["algebra", "linear_equations"], "expected_answer": "x = 4", "question_type": "calculation", "is_sample": true, "public": true}'),
('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000000', 'Calculate the area of a circle with radius 5 units.', 'math', 'high_school', 'en', 'import', 'hash_math_002', '{"difficulty": "medium", "tags": ["geometry", "area", "circle"], "expected_answer": "25π square units or approximately 78.54 square units", "question_type": "calculation", "is_sample": true, "public": true}'),
('11111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000000', 'Find the derivative of f(x) = 3x² + 2x - 1', 'math', 'college', 'en', 'import', 'hash_math_003', '{"difficulty": "hard", "tags": ["calculus", "derivatives"], "expected_answer": "f(x) = 6x + 2", "question_type": "calculation", "is_sample": true, "public": true}'),
('11111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000000', '解方程：3x - 5 = 16', 'math', 'middle_school', 'zh', 'import', 'hash_math_004', '{"difficulty": "easy", "tags": ["代数", "一元一次方程"], "expected_answer": "x = 7", "question_type": "calculation", "is_sample": true, "public": true}'),
('11111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000000', 'What is 2 + 2?', 'math', 'elementary', 'en', 'import', 'hash_math_005', '{"difficulty": "easy", "tags": ["arithmetic", "basic_math"], "expected_answer": "4", "question_type": "calculation", "is_sample": true, "public": true}'),
('11111111-1111-1111-1111-111111111116', '00000000-0000-0000-0000-000000000000', 'If you flip a fair coin twice, what is the probability of getting two heads?', 'math', 'high_school', 'en', 'import', 'hash_math_006', '{"difficulty": "medium", "tags": ["probability", "statistics"], "expected_answer": "1/4 or 25%", "question_type": "calculation", "is_sample": true, "public": true}');

-- 插入样本题目 - 科学类
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('22222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000000', 'What is the chemical formula for water?', 'chemistry', 'middle_school', 'en', 'import', 'hash_chem_001', '{"difficulty": "easy", "tags": ["chemistry", "formulas", "basic"], "expected_answer": "H₂O", "question_type": "short_answer", "is_sample": true, "public": true}'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', '水的化学分子式是什么？', 'chemistry', 'middle_school', 'zh', 'import', 'hash_chem_002', '{"difficulty": "easy", "tags": ["化学", "分子式"], "expected_answer": "H₂O", "question_type": "short_answer", "is_sample": true, "public": true}'),
('22222222-2222-2222-2222-222222222223', '00000000-0000-0000-0000-000000000000', 'Explain Newton''s first law of motion.', 'physics', 'high_school', 'en', 'import', 'hash_phys_001', '{"difficulty": "medium", "tags": ["physics", "mechanics", "laws"], "expected_answer": "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.", "question_type": "essay", "is_sample": true, "public": true}'),
('22222222-2222-2222-2222-222222222224', '00000000-0000-0000-0000-000000000000', '解释牛顿第一定律的内容。', 'physics', 'high_school', 'zh', 'import', 'hash_phys_002', '{"difficulty": "medium", "tags": ["物理", "力学", "定律"], "expected_answer": "物体在不受外力或所受合外力为零时，保持静止状态或匀速直线运动状态。", "question_type": "essay", "is_sample": true, "public": true}'),
('22222222-2222-2222-2222-222222222225', '00000000-0000-0000-0000-000000000000', 'What is the powerhouse of the cell?', 'biology', 'middle_school', 'en', 'import', 'hash_bio_001', '{"difficulty": "easy", "tags": ["biology", "cell_biology"], "expected_answer": "Mitochondria", "question_type": "short_answer", "is_sample": true, "public": true}'),
('22222222-2222-2222-2222-222222222226', '00000000-0000-0000-0000-000000000000', 'What is photosynthesis?', 'biology', 'middle_school', 'en', 'import', 'hash_bio_002', '{"difficulty": "medium", "tags": ["biology", "plants", "photosynthesis"], "expected_answer": "The process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.", "question_type": "essay", "is_sample": true, "public": true}');

-- 插入样本题目 - 语言类
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('33333333-3333-3333-3333-333333333331', '00000000-0000-0000-0000-000000000000', 'Choose the correct form: ''She _____ to the store yesterday.'' (A) go (B) goes (C) went (D) going', 'english', 'elementary', 'en', 'import', 'hash_eng_001', '{"difficulty": "easy", "tags": ["grammar", "past_tense"], "expected_answer": "C) went", "question_type": "multiple_choice", "is_sample": true, "public": true}'),
('33333333-3333-3333-3333-333333333332', '00000000-0000-0000-0000-000000000000', 'What is a metaphor? Provide an example.', 'english', 'high_school', 'en', 'import', 'hash_eng_002', '{"difficulty": "medium", "tags": ["literature", "figurative_language"], "expected_answer": "A metaphor is a figure of speech that compares two unlike things without using like or as. Example: Life is a journey.", "question_type": "essay", "is_sample": true, "public": true}');

-- 插入样本题目 - 历史地理类
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('44444444-4444-4444-4444-444444444441', '00000000-0000-0000-0000-000000000000', 'In what year did World War II end?', 'history', 'high_school', 'en', 'import', 'hash_hist_001', '{"difficulty": "easy", "tags": ["world_history", "world_war_ii"], "expected_answer": "1945", "question_type": "short_answer", "is_sample": true, "public": true}'),
('44444444-4444-4444-4444-444444444442', '00000000-0000-0000-0000-000000000000', 'Who was the first person to walk on the moon?', 'history', 'middle_school', 'en', 'import', 'hash_hist_002', '{"difficulty": "easy", "tags": ["space_exploration", "20th_century"], "expected_answer": "Neil Armstrong", "question_type": "short_answer", "is_sample": true, "public": true}'),
('44444444-4444-4444-4444-444444444443', '00000000-0000-0000-0000-000000000000', 'Name the seven continents.', 'geography', 'elementary', 'en', 'import', 'hash_geo_001', '{"difficulty": "easy", "tags": ["geography", "continents"], "expected_answer": "Asia, Africa, North America, South America, Antarctica, Europe, Australia", "question_type": "short_answer", "is_sample": true, "public": true}'),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'What is the capital of France?', 'geography', 'elementary', 'en', 'import', 'hash_geo_002', '{"difficulty": "easy", "tags": ["geography", "capitals", "europe"], "expected_answer": "Paris", "question_type": "short_answer", "is_sample": true, "public": true}');

-- 插入样本题目 - 计算机科学类
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('55555555-5555-5555-5555-555555555551', '00000000-0000-0000-0000-000000000000', 'What does ''HTML'' stand for?', 'computer_science', 'high_school', 'en', 'import', 'hash_cs_001', '{"difficulty": "easy", "tags": ["web_development", "acronyms"], "expected_answer": "HyperText Markup Language", "question_type": "short_answer", "is_sample": true, "public": true}'),
('55555555-5555-5555-5555-555555555552', '00000000-0000-0000-0000-000000000000', 'Write a simple function in Python that returns the sum of two numbers.', 'computer_science', 'college', 'en', 'import', 'hash_cs_002', '{"difficulty": "medium", "tags": ["python", "functions", "programming"], "expected_answer": "def add(a, b):\n    return a + b", "question_type": "coding", "is_sample": true, "public": true}');

-- 插入样本题目 - 其他学科
INSERT INTO questions (id, user_id, content, subject, grade, language, source, hash, meta) VALUES
('66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000000', 'Who painted the Mona Lisa?', 'art', 'middle_school', 'en', 'import', 'hash_art_001', '{"difficulty": "easy", "tags": ["art_history", "renaissance"], "expected_answer": "Leonardo da Vinci", "question_type": "short_answer", "is_sample": true, "public": true}'),
('66666666-6666-6666-6666-666666666662', '00000000-0000-0000-0000-000000000000', 'How many players are on a basketball team during a game?', 'physical_education', 'elementary', 'en', 'import', 'hash_pe_001', '{"difficulty": "easy", "tags": ["sports", "basketball"], "expected_answer": "5 players per team", "question_type": "short_answer", "is_sample": true, "public": true}');

-- 验证导入结果
SELECT 
    subject, 
    COUNT(*) as question_count,
    array_agg(DISTINCT language) as languages,
    array_agg(DISTINCT meta->>'difficulty') as difficulties
FROM questions 
WHERE meta->>'is_sample' = 'true'
GROUP BY subject
ORDER BY subject;