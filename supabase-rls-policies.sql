-- QuizMate 行级安全策略 (RLS)
-- 在创建表结构后运行此脚本

-- 启用所有表的行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_cache ENABLE ROW LEVEL SECURITY;

-- 用户资料策略
CREATE POLICY "用户只能查看自己的资料" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的资料" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "系统可以插入新用户资料" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 问题表策略
CREATE POLICY "用户只能查看自己的问题" ON questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的问题" ON questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的问题" ON questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的问题" ON questions
    FOR DELETE USING (auth.uid() = user_id);

-- 答案表策略
CREATE POLICY "用户只能查看自己问题的答案" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = answers.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能创建自己问题的答案" ON answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = answers.question_id 
            AND questions.user_id = auth.uid()
        )
    );

-- 记忆卡片策略
CREATE POLICY "用户只能查看自己问题的卡片" ON flashcards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = flashcards.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能创建自己问题的卡片" ON flashcards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = flashcards.question_id 
            AND questions.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能更新自己问题的卡片" ON flashcards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM questions 
            WHERE questions.id = flashcards.question_id 
            AND questions.user_id = auth.uid()
        )
    );

-- 测验集合策略
CREATE POLICY "用户只能查看自己的测验" ON quizzes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的测验" ON quizzes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的测验" ON quizzes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的测验" ON quizzes
    FOR DELETE USING (auth.uid() = user_id);

-- 测验项目策略
CREATE POLICY "用户只能查看自己测验的项目" ON quiz_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_items.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能创建自己测验的项目" ON quiz_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quizzes 
            WHERE quizzes.id = quiz_items.quiz_id 
            AND quizzes.user_id = auth.uid()
        )
    );

-- 答题记录策略
CREATE POLICY "用户只能查看自己的答题记录" ON attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的答题记录" ON attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 使用量统计策略
CREATE POLICY "用户只能查看自己的使用量" ON usage_daily
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的使用量记录" ON usage_daily
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的使用量记录" ON usage_daily
    FOR UPDATE USING (auth.uid() = user_id);

-- 订阅信息策略
CREATE POLICY "用户只能查看自己的订阅信息" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的订阅信息" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- 答案缓存策略（所有已认证用户可读，提高性能）
CREATE POLICY "已认证用户可以读取缓存" ON answer_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- 服务角色可以写入缓存（仅后端API使用）
CREATE POLICY "服务角色可以管理缓存" ON answer_cache
    FOR ALL USING (auth.role() = 'service_role');