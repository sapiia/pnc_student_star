ALTER TABLE `users`
  ADD COLUMN `student_id` VARCHAR(50) NULL AFTER `class`,
  ADD UNIQUE KEY `uq_users_student_id` (`student_id`);
