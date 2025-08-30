-- Row Level Security Policies for QuizMate
-- This script sets up RLS policies to ensure data isolation between users

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions policies
CREATE POLICY "Users can view own questions" ON questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON questions
  FOR DELETE USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Users can view answers for own questions" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for own questions" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for own questions" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete answers for own questions" ON answers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = answers.question_id 
      AND questions.user_id = auth.uid()
    )
  );

-- Flashcards policies
CREATE POLICY "Users can view flashcards for own questions" ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = flashcards.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flashcards for own questions" ON flashcards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = flashcards.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update flashcards for own questions" ON flashcards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = flashcards.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flashcards for own questions" ON flashcards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = flashcards.question_id 
      AND questions.user_id = auth.uid()
    )
  );

-- Quizzes policies
CREATE POLICY "Users can view own quizzes" ON quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE USING (auth.uid() = user_id);

-- Quiz items policies
CREATE POLICY "Users can view quiz items for own quizzes" ON quiz_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_items.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quiz items for own quizzes" ON quiz_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_items.quiz_id 
      AND quizzes.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = quiz_items.question_id 
      AND questions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quiz items for own quizzes" ON quiz_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_items.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quiz items for own quizzes" ON quiz_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = quiz_items.quiz_id 
      AND quizzes.user_id = auth.uid()
    )
  );

-- Attempts policies
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts" ON attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Usage daily policies
CREATE POLICY "Users can view own usage" ON usage_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_daily
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Answer cache policies (special case)
-- Read access for all authenticated users (for cache hits)
CREATE POLICY "Authenticated users can read answer cache" ON answer_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can write to answer cache
CREATE POLICY "Service role can manage answer cache" ON answer_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Special permissions for answer_cache
GRANT SELECT ON answer_cache TO authenticated;
GRANT ALL ON answer_cache TO service_role;