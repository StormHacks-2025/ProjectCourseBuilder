DROP TABLE IF EXISTS schedule_courses;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    major text,
    profile_pic text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    department text NOT NULL,
    number text NOT NULL,
    title text NOT NULL,
    description text,
    prerequisites text[],
    units numeric,
    designation text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    term text NOT NULL,
    section text NOT NULL,
    class_type text,
    start_time time,
    end_time time,
    days text[],
    campus text,
    instructor_name text,
    is_exam boolean DEFAULT false,
    grading_notes text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    name text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid REFERENCES schedules(id) ON DELETE CASCADE,
    section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
    pinned boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    like boolean,
    dislike boolean,
    difficulty_rating numeric,
    avg_hours numeric,
    grade text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_friends (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    friend_ids uuid[],
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_instructors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    instructor_name text,
    year text,
    term text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_grade_distribution (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
    grade text,
    count int,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_courses_schedule ON schedule_courses(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_courses_section ON schedule_courses(section_id);
CREATE INDEX IF NOT EXISTS idx_sections_course ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_course ON course_comments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_course ON course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_friends_course ON course_friends(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_grade_distribution_course ON course_grade_distribution(course_id);
