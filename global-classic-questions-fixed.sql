-- 全球经典练习题库 - 各学科经典例题、考题（修复版）
-- 在 Supabase SQL 编辑器中运行此脚本（在 enhanced-questions-schema.sql 之后）

-- 数学类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 初等数学
('If 3x + 7 = 22, what is the value of x?', 'math', 'middle_school', 'en', 'easy', 'calculation', '{algebra,linear_equations,basic}', '{"source": "Khan Academy", "type": "practice", "curriculum": "Common Core"}', true, 95),
('解方程：2x - 5 = 11，求x的值。', 'math', 'middle_school', 'zh', 'easy', 'calculation', '{代数,一元一次方程,基础}', '{"source": "人教版数学", "type": "教材例题", "curriculum": "中国初中数学"}', true, 92),
('Find the area of a rectangle with length 8 cm and width 5 cm.', 'math', 'elementary', 'en', 'easy', 'calculation', '{geometry,area,rectangle}', '{"source": "Singapore Math", "type": "textbook", "curriculum": "Singapore Primary"}', true, 88),

-- 几何
('In a right triangle, if one leg is 3 units and the hypotenuse is 5 units, find the length of the other leg.', 'math', 'high_school', 'en', 'medium', 'calculation', '{geometry,pythagorean_theorem,triangles}', '{"source": "SAT Practice", "type": "standardized_test", "curriculum": "US High School"}', true, 91),
('在直角三角形中，如果一条直角边长为6cm，斜边长为10cm，求另一条直角边的长度。', 'math', 'high_school', 'zh', 'medium', 'calculation', '{几何,勾股定理,直角三角形}', '{"source": "高考真题", "type": "考试题目", "curriculum": "中国高中数学"}', true, 89),

-- 微积分
('Find the derivative of f(x) = 4x³ - 2x² + 7x - 1', 'math', 'college', 'en', 'hard', 'calculation', '{calculus,derivatives,polynomials}', '{"source": "AP Calculus", "type": "exam_question", "curriculum": "Advanced Placement"}', true, 85),
('Evaluate the definite integral: ∫[0 to 2] (x² + 3x) dx', 'math', 'college', 'en', 'hard', 'calculation', '{calculus,integration,definite_integrals}', '{"source": "MIT OpenCourseWare", "type": "problem_set", "curriculum": "University Calculus"}', true, 83),

-- 概率统计
('A bag contains 5 red marbles and 3 blue marbles. If you draw 2 marbles without replacement, what is the probability that both are red?', 'math', 'high_school', 'en', 'medium', 'calculation', '{probability,statistics,combinations}', '{"source": "IB Mathematics", "type": "curriculum_question", "curriculum": "International Baccalaureate"}', true, 87);

-- 物理类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 力学
('A car accelerates from rest at 2 m/s² for 10 seconds. Calculate the distance traveled.', 'physics', 'high_school', 'en', 'medium', 'calculation', '{mechanics,kinematics,acceleration}', '{"source": "Physics Classroom", "type": "practice_problem", "curriculum": "AP Physics 1"}', true, 90),
('一个物体从静止开始做匀加速直线运动，加速度为3m/s²，求5秒后的位移。', 'physics', 'high_school', 'zh', 'medium', 'calculation', '{力学,运动学,匀加速运动}', '{"source": "物理竞赛题", "type": "竞赛题目", "curriculum": "中国高中物理"}', true, 88),

-- 电磁学
('Calculate the electric field at a point 0.1 m away from a point charge of +2.0 × 10⁻⁶ C.', 'physics', 'college', 'en', 'hard', 'calculation', '{electromagnetism,electric_field,coulomb_law}', '{"source": "Halliday Resnick Walker", "type": "textbook_problem", "curriculum": "University Physics"}', true, 82),

-- 热力学
('Explain the first law of thermodynamics and provide a real-world example.', 'physics', 'college', 'en', 'medium', 'essay', '{thermodynamics,conservation_of_energy,physics_laws}', '{"source": "OpenStax Physics", "type": "conceptual_question", "curriculum": "College Physics"}', true, 79);

-- 化学类经典题目  
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 基础化学
('What is the molar mass of water (H₂O)?', 'chemistry', 'high_school', 'en', 'easy', 'calculation', '{stoichiometry,molar_mass,molecular_formulas}', '{"source": "NIST Chemistry WebBook", "type": "reference_problem", "curriculum": "AP Chemistry"}', true, 94),
('计算氯化钠(NaCl)的分子量。', 'chemistry', 'high_school', 'zh', 'easy', 'calculation', '{化学计量,分子量,离子化合物}', '{"source": "人教版化学", "type": "教材习题", "curriculum": "中国高中化学"}', true, 91),

-- 有机化学
('Draw the structural formula for 2-methylbutane.', 'chemistry', 'college', 'en', 'medium', 'short_answer', '{organic_chemistry,alkanes,structural_formulas}', '{"source": "Organic Chemistry by Clayden", "type": "textbook_exercise", "curriculum": "University Organic Chemistry"}', true, 86),

-- 化学反应
('Balance the following equation: ___Al + ___O₂ → ___Al₂O₃', 'chemistry', 'high_school', 'en', 'medium', 'fill_blank', '{chemical_reactions,balancing_equations,stoichiometry}', '{"source": "ChemTeam.info", "type": "practice_drill", "curriculum": "High School Chemistry"}', true, 89),

-- 电化学（呼应您之前的化学题目）
('For the galvanic cell: Zn|Zn²⁺||Cu²⁺|Cu, calculate the standard cell potential given E°(Zn²⁺/Zn) = -0.76 V and E°(Cu²⁺/Cu) = +0.34 V', 'chemistry', 'college', 'en', 'hard', 'calculation', '{electrochemistry,galvanic_cells,standard_potentials}', '{"source": "Atkins Physical Chemistry", "type": "exam_problem", "curriculum": "University Physical Chemistry"}', true, 78);

-- 生物类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 细胞生物学
('What are the main differences between prokaryotic and eukaryotic cells?', 'biology', 'high_school', 'en', 'medium', 'essay', '{cell_biology,prokaryotes,eukaryotes}', '{"source": "Campbell Biology", "type": "textbook_question", "curriculum": "AP Biology"}', true, 92),
('简述DNA复制的基本过程。', 'biology', 'high_school', 'zh', 'medium', 'essay', '{分子生物学,DNA复制,遗传}', '{"source": "生物奥赛题库", "type": "竞赛题目", "curriculum": "中国高中生物"}', true, 88),

-- 遗传学
('In pea plants, purple flowers (P) are dominant to white flowers (p). If a heterozygous plant is crossed with a homozygous recessive plant, what is the expected phenotypic ratio of the offspring?', 'biology', 'high_school', 'en', 'medium', 'calculation', '{genetics,mendelian_inheritance,dominance}', '{"source": "Genetics Problems by Brooker", "type": "practice_problem", "curriculum": "High School Biology"}', true, 85),

-- 生态学
('Explain the concept of ecological succession with examples.', 'biology', 'college', 'en', 'medium', 'essay', '{ecology,succession,ecosystems}', '{"source": "Ecology by Begon", "type": "discussion_question", "curriculum": "University Ecology"}', true, 81);

-- 英语语言类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 语法
('Choose the correct verb form: "Neither the students nor the teacher _____ present." (A) was (B) were', 'english', 'high_school', 'en', 'medium', 'multiple_choice', '{grammar,subject_verb_agreement,neither_nor}', '{"source": "SAT Writing", "type": "standardized_test", "curriculum": "US College Prep"}', true, 87),

-- 词汇
('What does the word "ubiquitous" mean? Provide a sentence using it correctly.', 'english', 'college', 'en', 'medium', 'short_answer', '{vocabulary,advanced_words,usage}', '{"source": "GRE Vocabulary", "type": "test_prep", "curriculum": "Graduate School Prep"}', true, 83),

-- 文学分析
('Analyze the use of symbolism in the opening paragraph of "The Great Gatsby."', 'english', 'college', 'en', 'hard', 'essay', '{literature,symbolism,american_literature}', '{"source": "Norton Anthology", "type": "literary_analysis", "curriculum": "College English Literature"}', true, 75),

-- 写作
('Write a persuasive paragraph arguing for or against school uniforms. Include at least three supporting reasons.', 'english', 'middle_school', 'en', 'medium', 'essay', '{writing,persuasive_essay,argumentation}', '{"source": "Common Core Writing Standards", "type": "assessment_task", "curriculum": "US Middle School English"}', true, 82);

-- 历史类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 世界历史
('What were the main causes of World War I? Explain at least three factors.', 'history', 'high_school', 'en', 'medium', 'essay', '{world_history,world_war_i,causation}', '{"source": "AP World History", "type": "exam_question", "curriculum": "Advanced Placement"}', true, 89),
('简述中国古代丝绸之路的历史意义。', 'history', 'middle_school', 'zh', 'medium', 'essay', '{中国历史,丝绸之路,古代贸易}', '{"source": "中学历史教材", "type": "课后习题", "curriculum": "中国初中历史"}', true, 86),

-- 美国历史
('Analyze the impact of the Industrial Revolution on American society in the 19th century.', 'history', 'college', 'en', 'hard', 'essay', '{american_history,industrial_revolution,social_change}', '{"source": "APUSH Exam", "type": "document_based_question", "curriculum": "AP US History"}', true, 84),

-- 古代历史
('Compare and contrast the political systems of ancient Athens and Sparta.', 'history', 'high_school', 'en', 'hard', 'essay', '{ancient_history,greece,political_systems}', '{"source": "World History Patterns of Interaction", "type": "comparative_analysis", "curriculum": "World History"}', true, 78);

-- 地理类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 自然地理
('Explain how the water cycle works and identify its main components.', 'geography', 'middle_school', 'en', 'medium', 'essay', '{physical_geography,water_cycle,earth_systems}', '{"source": "National Geographic Education", "type": "curriculum_standard", "curriculum": "Middle School Earth Science"}', true, 90),

-- 人文地理
('What factors influence population distribution patterns around the world?', 'geography', 'high_school', 'en', 'medium', 'essay', '{human_geography,population,settlement_patterns}', '{"source": "AP Human Geography", "type": "exam_topic", "curriculum": "Advanced Placement"}', true, 85),

-- 世界地理
('Name the capital cities of the following countries: Brazil, Australia, Canada, South Africa.', 'geography', 'elementary', 'en', 'easy', 'short_answer', '{world_geography,capitals,countries}', '{"source": "Geography Bee", "type": "competition_question", "curriculum": "Elementary Geography"}', true, 92);

-- 计算机科学类经典题目
INSERT INTO practice_questions (content, subject, grade, language, difficulty, question_type, tags, source_info, verified, popularity_score) VALUES

-- 编程基础
('What is the difference between a compiler and an interpreter?', 'computer_science', 'college', 'en', 'medium', 'essay', '{programming_concepts,compilers,interpreters}', '{"source": "Introduction to Computer Science", "type": "conceptual_question", "curriculum": "University CS"}', true, 88),

-- 算法
('Write a Python function to find the factorial of a given number using recursion.', 'computer_science', 'college', 'en', 'medium', 'coding', '{algorithms,recursion,python,mathematics}', '{"source": "LeetCode", "type": "coding_practice", "curriculum": "Programming Interview Prep"}', true, 91),

-- 数据结构
('Explain the difference between a stack and a queue. Give examples of when you would use each.', 'computer_science', 'college', 'en', 'medium', 'essay', '{data_structures,stack,queue,abstract_data_types}', '{"source": "Data Structures and Algorithms", "type": "textbook_question", "curriculum": "Computer Science Fundamentals"}', true, 86),

-- Web开发
('What does HTML stand for? List five common HTML tags and their purposes.', 'computer_science', 'high_school', 'en', 'easy', 'short_answer', '{web_development,html,markup_languages}', '{"source": "W3Schools", "type": "tutorial_question", "curriculum": "Web Development Basics"}', true, 89);