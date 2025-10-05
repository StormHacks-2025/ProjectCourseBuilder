-- Users Table
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    name text,
    created_at timestamp with time zone default now()
);

-- Courses Table
create table if not exists courses (
    id uuid primary key default gen_random_uuid(),
    department text not null,
    number text not null,
    title text not null,
    description text,
    prerequisites text[],
    units numeric,
    designation text,
    created_at timestamp with time zone default now()
);

-- Sections Table
create table if not exists sections (
    id uuid primary key default gen_random_uuid(),
    course_id uuid references courses(id) on delete cascade,
    term text not null,
    section text not null,
    class_type text,
    start_time time,
    end_time time,
    days text[],
    campus text,
    instructor_name text,
    is_exam boolean default false,
    grading_notes text,
    created_at timestamp with time zone default now()
);

-- Schedules Table
create table if not exists schedules (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    name text,
    created_at timestamp with time zone default now()
);

-- Schedule Courses Table
create table if not exists schedule_courses (
    id uuid primary key default gen_random_uuid(),
    schedule_id uuid references schedules(id) on delete cascade,
    section_id uuid references sections(id) on delete cascade,
    pinned boolean default false,
    created_at timestamp with time zone default now()
);
