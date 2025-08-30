-- QuizMate 数据库表结构创建脚本
-- 请在 Supabase Dashboard → SQL Editor 中运行

-- 1. 创建 uuid-ossp 扩展（如果还未创建）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 删除旧表（如果存在）
DROP TABLE IF EXISTS practice_answers CASCADE;
DROP TABLE IF EXISTS practice_questions CASCADE;

-- 3. 创建学科题库主表
CREATE TABLE IF NOT EXISTS subject_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject VARCHAR(50) NOT NULL,           -- 主学科: Mathematics, Physics, Chemistry等
    topic VARCHAR(100),                     -- 子主题: Algebra, Mechanics, Organic等
    difficulty VARCHAR(20) NOT NULL,        -- easy / medium / hard
    language VARCHAR(10) DEFAULT 'en',      -- en / zh / es / fr / de
    question TEXT NOT NULL,                 -- 题目内容
    question_type VARCHAR(30) DEFAULT 'multiple_choice', -- multiple_choice/short_answer/essay/calculation
    options JSONB,                          -- 多选项 ({"A": "option1", "B": "option2"})
    correct_answer TEXT NOT NULL,           -- 正确答案
    explanation TEXT NOT NULL,              -- 详细解析
    tags TEXT[] DEFAULT '{}',              -- 标签数组
    source_info JSONB DEFAULT '{}',        -- 来源信息
    verified BOOLEAN DEFAULT true,         -- 是否已验证
    popularity_score INTEGER DEFAULT 0,    -- 热门度评分
    difficulty_score NUMERIC DEFAULT 0.5, -- AI评估难度(0-1)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建学科分类表
CREATE TABLE IF NOT EXISTS subject_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,           -- 学科大类名称
    category_name_zh VARCHAR(100),                 -- 中文名称  
    category_icon VARCHAR(50),                     -- 图标名称
    category_color VARCHAR(20),                    -- 主题色
    description TEXT,                              -- 描述
    display_order INTEGER DEFAULT 0,              -- 显示顺序
    is_active BOOLEAN DEFAULT true
);

-- 5. 创建主题子分类表
CREATE TABLE IF NOT EXISTS question_topics (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(50) NOT NULL,           -- 对应主学科
    topic_name VARCHAR(100) NOT NULL,       -- 子主题名称
    topic_name_zh VARCHAR(100),             -- 中文名称
    description TEXT,                       -- 主题描述
    difficulty_level VARCHAR(20),          -- 推荐难度级别
    display_order INTEGER DEFAULT 0        -- 显示顺序
);

-- 6. 插入学科分类数据
INSERT INTO subject_categories (category_name, category_name_zh, category_icon, category_color, description, display_order) VALUES
('Mathematics', '数学', 'calculator', '#3B82F6', '代数、几何、微积分、统计与概率', 1),
('Science', '科学', 'atom', '#10B981', '物理、化学、生物、地球科学、环境科学', 2),
('Language_Literature', '语言与文学', 'book-open', '#8B5CF6', '英语、中文、西班牙语、法语、德语等各国语言', 3),
('History_Social', '历史与社会科学', 'globe', '#F59E0B', '历史、地理、政治、经济、社会学', 4),
('Computer_Technology', '计算机与技术', 'cpu', '#EF4444', '编程、算法、AI、网络安全', 5),
('Arts_Humanities', '艺术与人文', 'palette', '#EC4899', '音乐、美术、哲学、心理学', 6),
('Applied_Studies', '实用学科', 'briefcase', '#6B7280', '商业、医学、工程', 7);

-- 7. 插入主题分类数据
INSERT INTO question_topics (subject, topic_name, topic_name_zh, description, difficulty_level, display_order) VALUES
-- Mathematics
('Mathematics', 'Algebra', '代数', '方程式、函数、不等式', 'easy', 1),
('Mathematics', 'Geometry', '几何', '平面几何、立体几何、三角函数', 'medium', 2),
('Mathematics', 'Calculus', '微积分', '导数、积分、极限', 'hard', 3),
('Mathematics', 'Statistics_Probability', '统计与概率', '统计学、概率论、数据分析', 'medium', 4),

-- Physics  
('Physics', 'Mechanics', '力学', '运动学、动力学、静力学', 'medium', 1),
('Physics', 'Electromagnetism', '电磁学', '电场、磁场、电磁感应', 'hard', 2),
('Physics', 'Thermodynamics', '热学', '热力学定律、气体性质', 'medium', 3),
('Physics', 'Optics', '光学', '几何光学、波动光学', 'medium', 4),

-- Chemistry
('Chemistry', 'Inorganic', '无机化学', '元素、化合物、反应', 'medium', 1),
('Chemistry', 'Organic', '有机化学', '有机化合物结构与反应', 'hard', 2),
('Chemistry', 'Chemical_Equations', '化学方程式', '化学反应平衡配平', 'easy', 3),

-- Biology
('Biology', 'Cell_Biology', '细胞生物学', '细胞结构与功能', 'medium', 1),
('Biology', 'Genetics', '遗传学', 'DNA、基因、遗传规律', 'medium', 2),
('Biology', 'Ecology', '生态学', '生态系统、环境保护', 'easy', 3),

-- Computer Science
('Computer_Science', 'Programming_Basics', '编程基础', '语法、变量、控制结构', 'easy', 1),
('Computer_Science', 'Algorithms', '算法', '排序、搜索、复杂度分析', 'hard', 2),
('Computer_Science', 'Data_Structures', '数据结构', '数组、链表、树、图', 'medium', 3),

-- English
('English', 'Grammar', '语法', '时态、语法结构、句法', 'easy', 1),
('English', 'Reading_Comprehension', '阅读理解', '文章理解、推理判断', 'medium', 2),
('English', 'Vocabulary', '词汇', '单词、短语、词汇运用', 'easy', 3),

-- History
('History', 'World_History', '世界史', '古代史、近现代史', 'medium', 1),
('History', 'Geography', '地理', '自然地理、人文地理', 'easy', 2);

-- 8. 创建索引
CREATE INDEX IF NOT EXISTS idx_subject_questions_subject ON subject_questions(subject);
CREATE INDEX IF NOT EXISTS idx_subject_questions_difficulty ON subject_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_subject_questions_language ON subject_questions(language);
CREATE INDEX IF NOT EXISTS idx_subject_questions_verified ON subject_questions(verified);

-- 9. 创建查询视图
CREATE OR REPLACE VIEW subject_questions_with_categories AS
SELECT 
    sq.*,
    sc.category_name_zh,
    sc.category_icon,
    sc.category_color,
    qt.topic_name_zh,
    qt.description as topic_description
FROM subject_questions sq
LEFT JOIN subject_categories sc ON 
    (sq.subject = 'Mathematics' AND sc.category_name = 'Mathematics') OR
    (sq.subject IN ('Physics', 'Chemistry', 'Biology') AND sc.category_name = 'Science') OR
    (sq.subject = 'English' AND sc.category_name = 'Language_Literature') OR
    (sq.subject = 'History' AND sc.category_name = 'History_Social') OR
    (sq.subject = 'Computer_Science' AND sc.category_name = 'Computer_Technology')
LEFT JOIN question_topics qt ON sq.subject = qt.subject AND sq.topic = qt.topic_name;

-- 10. 创建统计视图
CREATE OR REPLACE VIEW subject_statistics AS
SELECT 
    subject,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
    COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
    COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count,
    ROUND(AVG(popularity_score), 2) as avg_popularity,
    COUNT(DISTINCT topic) as topic_count
FROM subject_questions 
GROUP BY subject
ORDER BY total_questions DESC;