-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 27, 2026 at 06:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_star_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `period` varchar(50) NOT NULL,
  `living_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `job_study_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `human_support_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `health_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `feeling_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `choice_behavior_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `money_payment_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `life_skill_stars` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluations`
--

INSERT INTO `evaluations` (`id`, `user_id`, `period`, `living_stars`, `job_study_stars`, `human_support_stars`, `health_stars`, `feeling_stars`, `choice_behavior_stars`, `money_payment_stars`, `life_skill_stars`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-Q1', 4, 5, 4, 5, 4, 5, 4, 4, '2026-02-15 02:00:00', '2026-02-15 02:00:00'),
(2, 5, '2026-Q2', 5, 5, 5, 4, 5, 5, 5, 5, '2026-05-15 03:30:00', '2026-05-15 03:30:00'),
(3, 6, '2026-Q1', 3, 4, 4, 3, 4, 3, 4, 3, '2026-02-16 04:00:00', '2026-02-16 04:00:00'),
(4, 6, '2026-Q2', 4, 4, 5, 4, 4, 4, 4, 4, '2026-05-16 07:15:00', '2026-05-16 07:15:00'),
(5, 7, '2026-Q1', 5, 5, 5, 5, 5, 5, 5, 5, '2026-02-17 02:30:00', '2026-02-17 02:30:00'),
(6, 7, '2026-Q2', 5, 5, 5, 5, 5, 5, 5, 5, '2026-05-17 03:45:00', '2026-05-17 03:45:00'),
(7, 8, '2026-Q1', 4, 3, 4, 4, 3, 4, 3, 4, '2026-02-18 06:00:00', '2026-02-18 06:00:00'),
(8, 8, '2026-Q2', 4, 4, 4, 5, 4, 4, 4, 4, '2026-05-18 08:30:00', '2026-05-18 08:30:00'),
(9, 9, '2026-Q1', 5, 5, 4, 5, 5, 4, 5, 5, '2026-02-19 04:15:00', '2026-02-19 04:15:00'),
(10, 9, '2026-Q2', 5, 5, 5, 5, 5, 5, 5, 5, '2026-05-19 02:45:00', '2026-05-19 02:45:00'),
(11, 10, '2026-Q1', 4, 4, 4, 4, 4, 4, 4, 4, '2026-02-20 07:00:00', '2026-02-20 07:00:00'),
(12, 10, '2026-Q2', 5, 4, 5, 4, 5, 5, 4, 5, '2026-05-20 09:30:00', '2026-05-20 09:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

CREATE TABLE `feedbacks` (
  `id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `evaluation_id` int(10) UNSIGNED DEFAULT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedbacks`
--

INSERT INTO `feedbacks` (`id`, `teacher_id`, `student_id`, `evaluation_id`, `comment`, `created_at`, `updated_at`) VALUES
(3, 3, 6, 3, 'James has shown improvement but needs to focus more on homework completion and class participation.', '2026-02-16 04:30:00', '2026-02-16 04:30:00'),
(4, 3, 6, 4, 'Significant improvement this quarter! James is more engaged and his grades are improving.', '2026-05-16 07:45:00', '2026-05-16 07:45:00'),
(5, 4, 7, 5, 'Outstanding student! Lisa consistently exceeds expectations in all subjects.', '2026-02-17 03:00:00', '2026-02-17 03:00:00'),
(6, 4, 7, 6, 'Perfect performance again. Lisa continues to be an exceptional student.', '2026-05-17 04:15:00', '2026-05-17 04:15:00'),
(9, 3, 9, 9, 'Jennifer is a bright student who actively participates in class discussions.', '2026-02-19 04:45:00', '2026-02-19 04:45:00'),
(10, 3, 9, 10, 'Excellent critical thinking skills. Jennifer shows great potential in advanced subjects.', '2026-05-19 03:15:00', '2026-05-19 03:15:00'),
(11, 4, 10, 11, 'Robert is consistent in his work but could benefit from more class participation.', '2026-02-20 07:30:00', '2026-02-20 07:30:00'),
(12, 4, 10, 12, 'Good progress this quarter. Robert has become more confident in expressing his ideas.', '2026-05-20 10:00:00', '2026-05-20 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_schedule`
--

CREATE TABLE `meeting_schedule` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `education_officer_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `meeting_date` date NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meeting_schedule`
--

INSERT INTO `meeting_schedule` (`id`, `student_id`, `education_officer_id`, `manager_id`, `meeting_date`, `status`) VALUES
(1, 101, 201, 301, '2026-03-01', 'Scheduled'),
(2, 102, 202, 302, '2026-03-02', 'Completed'),
(3, 103, 203, 303, '2026-03-03', 'Cancelled'),
(4, 104, 204, 304, '2026-03-04', 'Scheduled');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 5, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-15 02:35:00', '2026-02-15 09:00:00'),
(2, 5, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-15 04:05:00', '2026-05-15 04:05:00'),
(3, 6, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-16 04:35:00', '2026-02-17 02:00:00'),
(4, 6, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-16 07:50:00', '2026-05-16 07:50:00'),
(5, 7, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-17 03:05:00', '2026-02-17 08:30:00'),
(6, 7, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-17 04:20:00', '2026-05-17 04:20:00'),
(7, 8, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-18 06:35:00', '2026-02-19 03:00:00'),
(8, 8, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-18 09:05:00', '2026-05-18 09:05:00'),
(9, 9, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-19 04:50:00', '2026-02-20 02:30:00'),
(10, 9, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-19 03:20:00', '2026-05-19 03:20:00'),
(11, 10, 'Your Q1 2026 evaluation has been completed. Please review your feedback.', 1, '2026-02-20 07:35:00', '2026-02-21 04:00:00'),
(12, 10, 'Your Q2 2026 evaluation has been completed. Please review your feedback.', 0, '2026-05-20 10:05:00', '2026-05-20 10:05:00'),
(14, 3, 'Reminder: Please complete pending evaluations for your students.', 1, '2026-02-14 02:00:00', '2026-02-14 08:30:00'),
(15, 4, 'Reminder: Please complete pending evaluations for your students.', 1, '2026-02-14 02:00:00', '2026-02-14 09:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `id` int(11) NOT NULL,
  `text` varchar(500) NOT NULL,
  `rating_scale` int(11) NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`id`, `text`, `rating_scale`, `created_by`) VALUES
(1, 'How satisfied are you with the teaching quality?', 5, 301),
(2, 'How clear is the course content?', 5, 302),
(3, 'How helpful is the education officer?', 5, 303),
(4, 'How satisfied are you with the learning environment?', 5, 304);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'evaluation_interval_days', '90', '2026-02-23 04:09:01', '2026-02-23 04:09:01'),
(2, 'max_stars_per_category', '5', '2026-02-23 04:09:01', '2026-02-23 04:09:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
  `class` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `class`, `created_at`, `updated_at`) VALUES
(3, 'Sarah Johnson', 'sarah.johnson@school.edu', '$2y$10$YourHashedPasswordHere', 'teacher', NULL, '2026-01-15 02:00:00', '2026-01-15 02:00:00'),
(4, 'Michael Brown', 'michael.brown@school.edu', '$2y$10$YourHashedPasswordHere', 'teacher', NULL, '2026-01-15 02:30:00', '2026-01-15 02:30:00'),
(5, 'Emily Davis', 'emily.davis@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-A', '2026-01-20 03:00:00', '2026-01-20 03:00:00'),
(6, 'James Wilson', 'james.wilson@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-A', '2026-01-20 03:15:00', '2026-01-20 03:15:00'),
(7, 'Lisa Anderson', 'lisa.anderson@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-B', '2026-01-20 03:30:00', '2026-01-20 03:30:00'),
(8, 'David Martinez', 'david.martinez@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-B', '2026-01-20 03:45:00', '2026-01-20 03:45:00'),
(9, 'Jennifer Lee', 'jennifer.lee@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '11-A', '2026-01-20 04:00:00', '2026-01-20 04:00:00'),
(10, 'Robert Taylor', 'robert.taylor@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '11-A', '2026-01-20 04:15:00', '2026-01-20 04:15:00'),
(11, 'John Doe', 'john@example.com', 'password123', '', 'A', '2026-02-25 03:40:17', '2026-02-25 03:40:17'),
(12, 'idk', 'idk@example.com', '$2b$10$3jUoMglRvD1OrhsVRdd35.ohHzk2oF7tN3kpFHugc7/rq9RuXTdV2', 'teacher', 'Web A', '2026-02-25 04:08:43', '2026-02-25 04:08:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_evaluations_user_period` (`user_id`,`period`);

--
-- Indexes for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_feedbacks_teacher` (`teacher_id`),
  ADD KEY `fk_feedbacks_student` (`student_id`),
  ADD KEY `fk_feedbacks_evaluation` (`evaluation_id`);

--
-- Indexes for table `meeting_schedule`
--
ALTER TABLE `meeting_schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `meeting_schedule`
--
ALTER TABLE `meeting_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `fk_evaluations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `fk_feedbacks_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedbacks_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedbacks_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
