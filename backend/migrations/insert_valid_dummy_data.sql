-- Update meeting_schedule to use valid user IDs
DELETE FROM meeting_schedule;
INSERT INTO meeting_schedule (id, student_id, education_officer_id, manager_id, meeting_date, status) VALUES
(1, 5, 3, 13, '2026-03-20', 'Scheduled'),
(2, 6, 4, 16, '2026-03-21', 'Scheduled'),
(3, 7, 12, 17, '2026-03-22', 'Completed'),
(4, 8, 14, 13, '2026-03-23', 'Cancelled');

-- Update question to use valid user IDs
DELETE FROM question;
INSERT INTO question (id, text, rating_scale, created_by) VALUES
(1, 'How satisfied are you with the teaching quality?', 5, 13),
(2, 'How clear is the course content?', 5, 13),
(3, 'How helpful is the education officer?', 5, 16),
(4, 'How satisfied are you with the learning environment?', 5, 17);
