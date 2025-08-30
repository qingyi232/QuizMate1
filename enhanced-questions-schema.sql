-- QuizMate 增强题库架构 - 区分错题本和练习题库
-- 在 Supabase SQL 编辑器中运行此脚本

-- 1. 练习题库表 (全球经典题目，无user_id)
CREATE TABLE IF NOT EXISTS practice_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT,
    language TEXT DEFAULT 'en',
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay', 'calculation', 'coding', 'fill_blank')),
    tags TEXT[] DEFAULT '{}',
    source_info JSONB DEFAULT '{}', -- 题目来源信息（考试、教材、网站等）
    meta JSONB DEFAULT '{}',
    hash TEXT UNIQUE,
    verified BOOLEAN DEFAULT false, -- 是否已验证准确性
    popularity_score INTEGER DEFAULT 0, -- 受欢迎程度
    difficulty_score NUMERIC DEFAULT 0.5, -- AI评估的实际难度
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 练习题答案表
CREATE TABLE IF NOT EXISTS practice_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES practice_questions(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT NOT NULL,
    explanation TEXT,
    is_correct BOOLEAN DEFAULT true,
    confidence NUMERIC DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户错题本表 (用户解析的题目，有user_id)
CREATE TABLE IF NOT EXISTS user_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'upload' CHECK (source IN ('paste', 'upload', 'scan', 'import')),
    subject TEXT,
    grade TEXT,
    language TEXT DEFAULT 'en',
    original_file_name TEXT, -- 原始文件名
    original_file_type TEXT, -- 文件类型
    meta JSONB DEFAULT '{}',
    hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    solved_at TIMESTAMP WITH TIME ZONE, -- 用户解决时间
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5), -- 掌握程度 0-5
    review_count INTEGER DEFAULT 0, -- 复习次数
    last_reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 用户答案表 (用户的解答记录)
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES user_questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ai_answer TEXT NOT NULL,
    ai_explanation TEXT NOT NULL,
    user_feedback TEXT, -- 用户对AI答案的反馈
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5), -- 用户评分
    model_used TEXT DEFAULT 'gpt-4o-mini',
    tokens INTEGER DEFAULT 0,
    cost_cents INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    validation_data JSONB DEFAULT '{}', -- 验证信息
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 题目收藏表 (用户可以收藏练习题)
CREATE TABLE IF NOT EXISTS question_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES practice_questions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 6. 学习统计表
CREATE TABLE IF NOT EXISTS learning_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    questions_solved INTEGER DEFAULT 0,
    questions_mastered INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject)
);

-- 7. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_practice_questions_subject ON practice_questions(subject);
CREATE INDEX IF NOT EXISTS idx_practice_questions_grade ON practice_questions(grade);
CREATE INDEX IF NOT EXISTS idx_practice_questions_difficulty ON practice_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_practice_questions_language ON practice_questions(language);
CREATE INDEX IF NOT EXISTS idx_practice_questions_tags ON practice_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_practice_questions_hash ON practice_questions(hash);
CREATE INDEX IF NOT EXISTS idx_practice_questions_popularity ON practice_questions(popularity_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_questions_user_id ON user_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_subject ON user_questions(subject);
CREATE INDEX IF NOT EXISTS idx_user_questions_created_at ON user_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_questions_mastery ON user_questions(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_questions_hash ON user_questions(hash);

CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_created_at ON user_answers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_question_favorites_user_id ON question_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON learning_stats(user_id);

-- 8. 创建视图方便查询
CREATE OR REPLACE VIEW user_question_summary AS
SELECT 
    uq.id,
    uq.user_id,
    uq.content,
    uq.subject,
    uq.grade,
    uq.language,
    uq.mastery_level,
    uq.review_count,
    uq.created_at,
    uq.last_reviewed_at,
    ua.ai_answer,
    ua.ai_explanation,
    ua.feedback_rating,
    ua.model_used
FROM user_questions uq
LEFT JOIN user_answers ua ON uq.id = ua.question_id;

CREATE OR REPLACE VIEW practice_question_summary AS
SELECT 
    pq.id,
    pq.content,
    pq.subject,
    pq.grade,
    pq.language,
    pq.difficulty,
    pq.question_type,
    pq.tags,
    pq.popularity_score,
    pq.verified,
    pa.answer_text,
    pa.explanation,
    pq.created_at
FROM practice_questions pq
LEFT JOIN practice_answers pa ON pq.id = pa.question_id;

-- 9. 触发器：自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_questions_updated_at 
    BEFORE UPDATE ON practice_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_stats_updated_at 
    BEFORE UPDATE ON learning_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. RLS 策略 (行级别安全)
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;

-- 练习题库：所有人可读
CREATE POLICY "Practice questions are viewable by everyone" ON practice_questions
    FOR SELECT USING (true);

CREATE POLICY "Practice answers are viewable by everyone" ON practice_answers
    FOR SELECT USING (true);

-- 用户错题本：只有所有者可访问
CREATE POLICY "Users can view own questions" ON user_questions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own answers" ON user_answers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON question_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON learning_stats
    FOR ALL USING (auth.uid() = user_id);