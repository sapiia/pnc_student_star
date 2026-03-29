-- Add generation field to users table
-- Migration: 2026-03-11_add_generation_to_users.sql

ALTER TABLE `users` 
ADD COLUMN `generation` VARCHAR(10) DEFAULT NULL AFTER `student_id`;

-- Update existing users to extract generation from student_id if possible
UPDATE `users` 
SET `generation` = SUBSTRING(`student_id`, 1, 4) 
WHERE `student_id` IS NOT NULL 
AND `student_id` REGEXP '^[0-9]{4}-[0-9]+$'
AND `generation` IS NULL;
