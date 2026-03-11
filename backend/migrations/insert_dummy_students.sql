-- Dummy Data Insert Script for Student Star Application
-- Classes to populate:
-- - Gen 2026 - WEB DEV - Class WEB A: 5 students
-- - Gen 2026 - WEB DEV - Class Web B: 1 student
-- - Gen 2027 - Class SNA-C: 1 student
-- - Gen 2027 - Class Web C: 1 student

-- ==========================================
-- INSERT DUMMY STUDENTS (Users Table)
-- ==========================================

-- Gen 2026 - WEB DEV - Class WEB A (5 students)
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `class`, `student_id`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
('Sophy', 'Moeurn', 'sophy.web1@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class WEB A', '2026-WEB-001', 1, 0, NOW(), NOW()),
('Sokha', 'Mean', 'sokha.web2@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class WEB A', '2026-WEB-002', 1, 0, NOW(), NOW()),
('Dara', 'Sok', 'dara.web3@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class WEB A', '2026-WEB-003', 1, 0, NOW(), NOW()),
('Channak', 'Yun', 'channak.web4@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class WEB A', '2026-WEB-004', 1, 0, NOW(), NOW()),
('Visal', 'Sok', 'visal.web5@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class WEB A', '2026-WEB-005', 1, 0, NOW(), NOW());

-- Gen 2026 - WEB DEV - Class Web B (1 student)
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `class`, `student_id`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
('San', 'San', 'san.web@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2026 - WEB DEV - Class Web B', '2026-WEB-006', 1, 0, NOW(), NOW());

-- Gen 2027 - Class SNA-C (1 student)
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `class`, `student_id`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
('Sopheap', 'Nhim', 'sopheap.sna@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2027 - Class SNA-C', '2027-SNA-001', 1, 0, NOW(), NOW());

-- Gen 2027 - Class Web C (1 student)
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `role`, `class`, `student_id`, `is_active`, `is_deleted`, `created_at`, `updated_at`) VALUES
('Raksmey', 'Phan', 'raksmey.webc@student.pnc.edu', '$2b$10$DummyHashForPassword123', 'student', 'Gen 2027 - Class Web C', '2027-WEB-001', 1, 0, NOW(), NOW());

-- ==========================================
-- INSERT STUDENT RECORDS (Students Table)
-- ==========================================

-- Get the user_ids that were just inserted and add to students table
INSERT INTO `students` (`user_id`, `student_no`, `grade_level`, `section`, `created_at`, `updated_at`)
SELECT 
    u.id,
    CONCAT('S-', LPAD(u.id, 4, '0')),
    CASE 
        WHEN u.class LIKE 'Gen 2026%' THEN '2026'
        WHEN u.class LIKE 'Gen 2027%' THEN '2027'
        ELSE '2026'
    END,
    CASE 
        WHEN u.class LIKE '%WEB A%' THEN 'WEB-A'
        WHEN u.class LIKE '%Web B%' THEN 'WEB-B'
        WHEN u.class LIKE '%SNA-C%' THEN 'SNA-C'
        WHEN u.class LIKE '%Web C%' THEN 'WEB-C'
        ELSE 'GEN'
    END,
    NOW(),
    NOW()
FROM `users` u
WHERE u.email LIKE '%@student.pnc.edu%'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM `students` s WHERE s.user_id = u.id);

-- ==========================================
-- INSERT DUMMY EVALUATIONS
-- ==========================================

-- Insert evaluations for Q1 2026 and Q2 2026 for Gen 2026 students
-- Insert evaluations for Q1 2027 for Gen 2027 students

-- Helper procedure to generate random stars between 2-5
-- Using simple INSERT with random values

-- Gen 2026 students - Q1 Evaluation
INSERT INTO `evaluations` (`user_id`, `period`, `rating_scale`, `criteria_count`, `average_score`, `submitted_at`, `living_stars`, `job_study_stars`, `human_support_stars`, `health_stars`, `feeling_stars`, `choice_behavior_stars`, `money_payment_stars`, `life_skill_stars`, `created_at`, `updated_at`)
SELECT 
    u.id,
    '2026-Q1',
    5,
    8,
    3.75,
    '2026-02-15 02:00:00',
    4, 4, 3, 4, 4, 3, 4, 3,
    '2026-02-15 02:00:00',
    '2026-02-15 02:00:00'
FROM `users` u
WHERE u.class LIKE 'Gen 2026%' AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM `evaluations` e WHERE e.user_id = u.id AND e.period = '2026-Q1');

-- Gen 2026 students - Q2 Evaluation
INSERT INTO `evaluations` (`user_id`, `period`, `rating_scale`, `criteria_count`, `average_score`, `submitted_at`, `living_stars`, `job_study_stars`, `human_support_stars`, `health_stars`, `feeling_stars`, `choice_behavior_stars`, `money_payment_stars`, `life_skill_stars`, `created_at`, `updated_at`)
SELECT 
    u.id,
    '2026-Q2',
    5,
    8,
    4.25,
    '2026-05-15 03:00:00',
    4, 5, 4, 4, 5, 4, 4, 4,
    '2026-05-15 03:00:00',
    '2026-05-15 03:00:00'
FROM `users` u
WHERE u.class LIKE 'Gen 2026%' AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM `evaluations` e WHERE e.user_id = u.id AND e.period = '2026-Q2');

-- Gen 2027 students - Q1 Evaluation
INSERT INTO `evaluations` (`user_id`, `period`, `rating_scale`, `criteria_count`, `average_score`, `submitted_at`, `living_stars`, `job_study_stars`, `human_support_stars`, `health_stars`, `feeling_stars`, `choice_behavior_stars`, `money_payment_stars`, `life_skill_stars`, `created_at`, `updated_at`)
SELECT 
    u.id,
    '2027-Q1',
    5,
    8,
    3.50,
    '2026-03-10 04:00:00',
    3, 4, 3, 4, 3, 4, 3, 4,
    '2026-03-10 04:00:00',
    '2026-03-10 04:00:00'
FROM `users` u
WHERE u.class LIKE 'Gen 2027%' AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM `evaluations` e WHERE e.user_id = u.id AND e.period = '2027-Q1');

-- ==========================================
-- INSERT EVALUATION RESPONSES
-- ==========================================

-- Insert evaluation responses for all criteria

-- For 2026-Q1 evaluations
INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-001',
    'living',
    'Living',
    'Home',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'living');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-002',
    'jobStudy',
    'Job & Study',
    'Briefcase',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'jobStudy');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-003',
    'humanSupport',
    'Human & Support',
    'Users2',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'humanSupport');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-004',
    'health',
    'Health',
    'Heart',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'health');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-005',
    'feeling',
    'Your Feeling',
    'Smile',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'feeling');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-006',
    'choiceBehavior',
    'Choice & Behavior',
    'Brain',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'choiceBehavior');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-007',
    'moneyPayment',
    'Money & Payment',
    'CreditCard',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'moneyPayment');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-008',
    'lifeSkill',
    'Life Skill',
    'Wrench',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'lifeSkill');

-- For 2026-Q2 evaluations
INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-001',
    'living',
    'Living',
    'Home',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'living');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-002',
    'jobStudy',
    'Job & Study',
    'Briefcase',
    5,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'jobStudy');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-003',
    'humanSupport',
    'Human & Support',
    'Users2',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'humanSupport');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-004',
    'health',
    'Health',
    'Heart',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'health');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-005',
    'feeling',
    'Your Feeling',
    'Smile',
    5,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'feeling');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-006',
    'choiceBehavior',
    'Choice & Behavior',
    'Brain',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'choiceBehavior');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-007',
    'moneyPayment',
    'Money & Payment',
    'CreditCard',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'moneyPayment');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-008',
    'lifeSkill',
    'Life Skill',
    'Wrench',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2026-Q2' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2026%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'lifeSkill');

-- For 2027-Q1 evaluations (Gen 2027 students)
INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-001',
    'living',
    'Living',
    'Home',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'living');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-002',
    'jobStudy',
    'Job & Study',
    'Briefcase',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'jobStudy');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-003',
    'humanSupport',
    'Human & Support',
    'Users2',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'humanSupport');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-004',
    'health',
    'Health',
    'Heart',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'health');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-005',
    'feeling',
    'Your Feeling',
    'Smile',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'feeling');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-006',
    'choiceBehavior',
    'Choice & Behavior',
    'Brain',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'choiceBehavior');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-007',
    'moneyPayment',
    'Money & Payment',
    'CreditCard',
    3,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'moneyPayment');

INSERT INTO `evaluation_responses` (`evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `created_at`, `updated_at`)
SELECT 
    e.id,
    'CRIT-008',
    'lifeSkill',
    'Life Skill',
    'Wrench',
    4,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.period = '2027-Q1' AND e.user_id IN (SELECT id FROM users WHERE class LIKE 'Gen 2027%')
AND NOT EXISTS (SELECT 1 FROM `evaluation_responses` er WHERE er.evaluation_id = e.id AND er.criterion_key = 'lifeSkill');

-- ==========================================
-- INSERT FEEDBACK FOR NEW STUDENTS
-- ==========================================

-- Add feedback for new Gen 2026 students from teacher (id=3)
INSERT INTO `feedbacks` (`teacher_id`, `student_id`, `evaluation_id`, `comment`, `created_at`, `updated_at`)
SELECT 
    3,
    s.user_id,
    e.id,
    'Good progress this quarter. Keep up the consistent effort in your studies.',
    NOW(),
    NOW()
FROM `students` s
JOIN `users` u ON u.id = s.user_id AND u.class LIKE 'Gen 2026%'
JOIN `evaluations` e ON e.user_id = s.user_id AND e.period = '2026-Q1'
WHERE NOT EXISTS (SELECT 1 FROM `feedbacks` f WHERE f.student_id = s.user_id AND f.evaluation_id = e.id);

-- Add feedback for new Gen 2027 students from teacher (id=4)
INSERT INTO `feedbacks` (`teacher_id`, `student_id`, `evaluation_id`, `comment`, `created_at`, `updated_at`)
SELECT 
    4,
    s.user_id,
    e.id,
    'Welcome to the program! Good start in your first evaluation.',
    NOW(),
    NOW()
FROM `students` s
JOIN `users` u ON u.id = s.user_id AND u.class LIKE 'Gen 2027%'
JOIN `evaluations` e ON e.user_id = s.user_id AND e.period = '2027-Q1'
WHERE NOT EXISTS (SELECT 1 FROM `feedbacks` f WHERE f.student_id = s.user_id AND f.evaluation_id = e.id);

-- ==========================================
-- INSERT NOTIFICATIONS
-- ==========================================

-- Add notifications for new students
INSERT INTO `notifications` (`user_id`, `message`, `is_read`, `created_at`, `updated_at`)
SELECT 
    u.id,
    'Welcome to Student Star! Your account has been created successfully.',
    0,
    NOW(),
    NOW()
FROM `users` u
WHERE u.email LIKE '%@student.pnc.edu%'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM `notifications` n WHERE n.user_id = u.id AND n.message LIKE '%Welcome to Student Star%');

-- Add evaluation completion notifications
INSERT INTO `notifications` (`user_id`, `message`, `is_read`, `created_at`, `updated_at`)
SELECT 
    e.user_id,
    CONCAT('Your ', e.period, ' evaluation has been completed. Please review your feedback.'),
    0,
    NOW(),
    NOW()
FROM `evaluations` e
WHERE e.user_id IN (SELECT id FROM users WHERE email LIKE '%@student.pnc.edu%')
AND NOT EXISTS (SELECT 1 FROM `notifications` n WHERE n.user_id = e.user_id AND n.message LIKE CONCAT('%', e.period, '%'));

-- ==========================================
-- SUMMARY
-- ==========================================
-- Total students inserted: 8
-- - Gen 2026 - WEB DEV - Class WEB A: 5 students
-- - Gen 2026 - WEB DEV - Class Web B: 1 student
-- - Gen 2027 - Class SNA-C: 1 student
-- - Gen 2027 - Class Web C: 1 student
-- 
-- Each student has:
-- - User account
-- - Student record
-- - 1-2 Evaluations (Q1 2026, Q2 2026 for Gen 2026; Q1 2027 for Gen 2027)
-- - 8 Evaluation responses per evaluation (for each criterion)
-- - Feedback from teachers
-- - Notifications
