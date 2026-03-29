ALTER TABLE `users`
  ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `student_id`,
  ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`,
  ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `is_deleted`,
  ADD KEY `idx_users_active_deleted` (`is_active`, `is_deleted`);
