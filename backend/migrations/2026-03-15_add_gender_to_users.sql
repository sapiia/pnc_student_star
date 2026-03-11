ALTER TABLE `users`
  ADD COLUMN `gender` ENUM('male', 'female', 'other') NULL DEFAULT NULL AFTER `class`;

