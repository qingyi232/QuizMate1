-- Utility functions for QuizMate database operations

-- Function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    -- Get current usage count for the day
    SELECT count INTO usage_count
    FROM usage_daily
    WHERE user_id = p_user_id AND date = p_date;
    
    -- If no record exists, create one
    IF usage_count IS NULL THEN
        INSERT INTO usage_daily (user_id, date, count)
        VALUES (p_user_id, p_date, 0)
        ON CONFLICT (user_id, date) DO NOTHING;
        usage_count := 0;
    END IF;
    
    RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment daily usage
CREATE OR REPLACE FUNCTION increment_daily_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    -- Insert or update usage count
    INSERT INTO usage_daily (user_id, date, count)
    VALUES (p_user_id, p_date, 1)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET count = usage_daily.count + 1
    RETURNING count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached daily limit
CREATE OR REPLACE FUNCTION check_daily_limit(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    user_plan TEXT;
BEGIN
    -- Get user's plan
    SELECT plan INTO user_plan
    FROM profiles
    WHERE id = p_user_id;
    
    -- Pro users have unlimited usage
    IF user_plan = 'pro' THEN
        RETURN FALSE;
    END IF;
    
    -- Get current usage for today
    current_usage := get_daily_usage(p_user_id);
    
    -- Return true if limit is reached
    RETURN current_usage >= p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_plan TEXT;
    sub_status TEXT;
BEGIN
    -- Get user's plan from profiles
    SELECT plan INTO user_plan
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check subscription status if plan is pro
    IF user_plan = 'pro' THEN
        SELECT status INTO sub_status
        FROM subscriptions
        WHERE user_id = p_user_id;
        
        -- Downgrade to free if subscription is not active
        IF sub_status IS NULL OR sub_status NOT IN ('active') THEN
            UPDATE profiles 
            SET plan = 'free' 
            WHERE id = p_user_id;
            user_plan := 'free';
        END IF;
    END IF;
    
    RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old cache entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_cache(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM answer_cache
    WHERE created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update spaced repetition due date
CREATE OR REPLACE FUNCTION update_flashcard_due_date(
    p_flashcard_id UUID,
    p_performance INTEGER -- 0=again, 1=hard, 2=good, 3=easy
) RETURNS VOID AS $$
DECLARE
    current_interval INTEGER := 1;
    new_interval INTEGER;
    multiplier NUMERIC;
BEGIN
    -- Simple spaced repetition algorithm
    CASE p_performance
        WHEN 0 THEN -- Again
            new_interval := 1;
        WHEN 1 THEN -- Hard
            new_interval := GREATEST(1, current_interval);
        WHEN 2 THEN -- Good
            new_interval := current_interval * 2;
        WHEN 3 THEN -- Easy
            new_interval := current_interval * 3;
        ELSE
            new_interval := current_interval * 2;
    END CASE;
    
    -- Update the flashcard due date
    UPDATE flashcards
    SET spaced_due_at = NOW() + INTERVAL '1 day' * new_interval
    WHERE id = p_flashcard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get due flashcards for a user
CREATE OR REPLACE FUNCTION get_due_flashcards(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    flashcard_id UUID,
    question_content TEXT,
    front TEXT,
    back TEXT,
    hint TEXT,
    difficulty INTEGER,
    due_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id as flashcard_id,
        q.content as question_content,
        f.front,
        f.back,
        f.hint,
        f.difficulty,
        f.spaced_due_at as due_at
    FROM flashcards f
    JOIN questions q ON q.id = f.question_id
    WHERE q.user_id = p_user_id
    AND (f.spaced_due_at IS NULL OR f.spaced_due_at <= NOW())
    ORDER BY 
        f.spaced_due_at ASC NULLS FIRST,
        f.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;