-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create comprehensive profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  course TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity DATE DEFAULT CURRENT_DATE,
  badges TEXT[] DEFAULT '{}',
  completed_lessons INTEGER DEFAULT 0,
  completed_quizzes INTEGER DEFAULT 0,
  total_study_hours INTEGER DEFAULT 0,
  current_module TEXT DEFAULT 'web-fundamentals',
  current_lesson INTEGER DEFAULT 1,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  total_quiz_attempts INTEGER DEFAULT 0,
  average_quiz_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create lesson progress table with detailed tracking
CREATE TABLE lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, module_id, lesson_id)
);

-- Create quiz attempts with detailed tracking
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL NOT NULL,
  time_taken INTEGER, -- in seconds
  answers JSONB NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create certificates table
CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  final_score INTEGER NOT NULL,
  total_lessons INTEGER NOT NULL,
  total_quizzes INTEGER NOT NULL,
  study_hours INTEGER NOT NULL,
  skills TEXT[] NOT NULL,
  instructor TEXT NOT NULL,
  institution TEXT DEFAULT 'Lagos State University',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- Create leaderboard view for performance
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.course,
  p.avatar_url,
  p.xp,
  p.level,
  p.streak,
  p.completed_lessons,
  p.completed_quizzes,
  p.weekly_xp,
  p.badges,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.level DESC, p.completed_lessons DESC) as rank
FROM profiles p
ORDER BY p.xp DESC;

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own lesson progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view leaderboard (public data)
CREATE POLICY "Anyone can view leaderboard" ON profiles FOR SELECT USING (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    course, 
    avatar_url,
    xp,
    level,
    streak,
    badges,
    completed_lessons,
    completed_quizzes,
    total_study_hours,
    current_module,
    current_lesson
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'course',
    NEW.raw_user_meta_data->>'avatar_url',
    0, -- Start with 0 XP
    1, -- Start at level 1
    0, -- Start with 0 streak
    '{}', -- Start with no badges
    0, -- Start with 0 completed lessons
    0, -- Start with 0 completed quizzes
    0, -- Start with 0 study hours
    'web-fundamentals', -- Start with first module
    1 -- Start with first lesson
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_stats_after_quiz()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile stats
  UPDATE profiles 
  SET 
    completed_quizzes = completed_quizzes + 1,
    total_quiz_attempts = total_quiz_attempts + 1,
    xp = xp + NEW.xp_earned,
    level = GREATEST(1, (xp + NEW.xp_earned) / 1000 + 1),
    weekly_xp = weekly_xp + NEW.xp_earned,
    monthly_xp = monthly_xp + NEW.xp_earned,
    average_quiz_score = (
      SELECT AVG(percentage) 
      FROM quiz_attempts 
      WHERE user_id = NEW.user_id
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
CREATE TRIGGER after_quiz_completion
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW EXECUTE PROCEDURE update_user_stats_after_quiz();

-- Function to update user stats after lesson completion
CREATE OR REPLACE FUNCTION update_user_stats_after_lesson()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if lesson is being marked as completed for the first time
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
    UPDATE profiles 
    SET 
      completed_lessons = completed_lessons + 1,
      xp = xp + 25, -- 25 XP per lesson
      level = GREATEST(1, (xp + 25) / 1000 + 1),
      weekly_xp = weekly_xp + 25,
      monthly_xp = monthly_xp + 25,
      total_study_hours = total_study_hours + COALESCE(NEW.time_spent, 0),
      current_module = NEW.module_id,
      current_lesson = CAST(NEW.lesson_id AS INTEGER),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson completion
CREATE TRIGGER after_lesson_completion
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE PROCEDURE update_user_stats_after_lesson();
