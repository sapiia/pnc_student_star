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
  `rating_scale` int(11) NOT NULL DEFAULT 5,
  `criteria_count` int(11) NOT NULL DEFAULT 0,
  `average_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
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

INSERT INTO `evaluations` (`id`, `user_id`, `period`, `rating_scale`, `criteria_count`, `average_score`, `submitted_at`, `living_stars`, `job_study_stars`, `human_support_stars`, `health_stars`, `feeling_stars`, `choice_behavior_stars`, `money_payment_stars`, `life_skill_stars`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-Q1', 5, 8, 4.38, '2026-02-15 02:00:00', 4, 5, 4, 5, 4, 5, 4, 4, '2026-02-15 02:00:00', '2026-02-15 02:00:00'),
(2, 5, '2026-Q2', 5, 8, 4.88, '2026-05-15 03:30:00', 5, 5, 5, 4, 5, 5, 5, 5, '2026-05-15 03:30:00', '2026-05-15 03:30:00'),
(3, 6, '2026-Q1', 5, 8, 3.50, '2026-02-16 04:00:00', 3, 4, 4, 3, 4, 3, 4, 3, '2026-02-16 04:00:00', '2026-02-16 04:00:00'),
(4, 6, '2026-Q2', 5, 8, 4.13, '2026-05-16 07:15:00', 4, 4, 5, 4, 4, 4, 4, 4, '2026-05-16 07:15:00', '2026-05-16 07:15:00'),
(5, 7, '2026-Q1', 5, 8, 5.00, '2026-02-17 02:30:00', 5, 5, 5, 5, 5, 5, 5, 5, '2026-02-17 02:30:00', '2026-02-17 02:30:00'),
(6, 7, '2026-Q2', 5, 8, 5.00, '2026-05-17 03:45:00', 5, 5, 5, 5, 5, 5, 5, 5, '2026-05-17 03:45:00', '2026-05-17 03:45:00'),
(7, 8, '2026-Q1', 5, 8, 3.63, '2026-02-18 06:00:00', 4, 3, 4, 4, 3, 4, 3, 4, '2026-02-18 06:00:00', '2026-02-18 06:00:00'),
(8, 8, '2026-Q2', 5, 8, 4.13, '2026-05-18 08:30:00', 4, 4, 4, 5, 4, 4, 4, 4, '2026-05-18 08:30:00', '2026-05-18 08:30:00'),
(9, 9, '2026-Q1', 5, 8, 4.75, '2026-02-19 04:15:00', 5, 5, 4, 5, 5, 4, 5, 5, '2026-02-19 04:15:00', '2026-02-19 04:15:00'),
(10, 9, '2026-Q2', 5, 8, 5.00, '2026-05-19 02:45:00', 5, 5, 5, 5, 5, 5, 5, 5, '2026-05-19 02:45:00', '2026-05-19 02:45:00'),
(11, 10, '2026-Q1', 5, 8, 4.00, '2026-02-20 07:00:00', 4, 4, 4, 4, 4, 4, 4, 4, '2026-02-20 07:00:00', '2026-02-20 07:00:00'),
(12, 10, '2026-Q2', 5, 8, 4.63, '2026-05-20 09:30:00', 5, 4, 5, 4, 5, 5, 4, 5, '2026-05-20 09:30:00', '2026-05-20 09:30:00');

--
-- Table structure for table `evaluation_responses`
--

CREATE TABLE `evaluation_responses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `evaluation_id` int(10) UNSIGNED NOT NULL,
  `criterion_id` varchar(20) DEFAULT NULL,
  `criterion_key` varchar(120) NOT NULL,
  `criterion_name` varchar(120) NOT NULL,
  `criterion_icon` varchar(120) DEFAULT NULL,
  `star_value` int(11) NOT NULL DEFAULT 0,
  `reflection` text DEFAULT NULL,
  `tip_snapshot` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_responses`
--

INSERT INTO `evaluation_responses` (`id`, `evaluation_id`, `criterion_id`, `criterion_key`, `criterion_name`, `criterion_icon`, `star_value`, `reflection`, `tip_snapshot`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'living', 'Living', 'Home', 4, NULL, NULL, '2026-02-15 02:00:00', '2026-02-15 02:00:00'),
(2, 1, NULL, 'jobStudy', 'Job & Study', 'Briefcase', 5, NULL, NULL, '2026-02-15 02:00:00', '2026-02-15 02:00:00'),
(3, 1, NULL, 'humanSupport', 'Human & Support', 'Users2', 4, NULL, NULL, '2026-02-15 02:00:00', '2026-02-15 02:00:00'),
(4, 1, NULL, 'health', 'Health', 'Heart', 5, NULL, NULL, '2026-02-15 02:00:00', '2026-02-15 02:00:00');

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
-- Table structure for table `evaluation_criteria`
--

CREATE TABLE `evaluation_criteria` (
  `id` varchar(20) NOT NULL,
  `name` varchar(120) NOT NULL,
  `icon` varchar(120) NOT NULL,
  `description` text NOT NULL,
  `status` enum('Active','Draft') NOT NULL DEFAULT 'Active',
  `display_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_criteria`
--

INSERT INTO `evaluation_criteria` (`id`, `name`, `icon`, `description`, `status`, `display_order`, `created_at`, `updated_at`) VALUES
('CRIT-001', 'Living', 'Home', 'Focus on your living environment, cleanliness of housing, and overall organization of daily chores.', 'Active', 1, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-002', 'Job and Study', 'Briefcase', 'Reflect on your academic performance, attendance, internship dedication, and continuous learning efforts.', 'Active', 2, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-003', 'Human and Support', 'Users2', 'Interpersonal relationships, teamwork skills, and the strength of your social support network.', 'Active', 3, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-004', 'Health', 'Heart', 'Assessment of physical health, sleep patterns, nutrition, and exercise.', 'Active', 4, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-005', 'Your Feeling', 'Smile', 'Self-reflection on happiness, stress management, and emotional stability.', 'Active', 5, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-006', 'Choice and Behavior', 'Brain', 'Evaluating the maturity of your decisions and the responsibility taken for personal actions.', 'Active', 6, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-007', 'Money and Payment', 'CreditCard', 'Financial management, budgeting skills, and meeting financial obligations.', 'Active', 7, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-008', 'Life Skill', 'Wrench', 'Practical skills including time management, problem-solving, and self-sufficiency.', 'Active', 8, '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
('CRIT-009', 'Communication', 'MessageCircle', 'Clarity of expression, active listening, respectful dialogue, and constructive participation.', 'Active', 9, '2026-03-06 00:00:00', '2026-03-06 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_criterion_star_descriptions`
--

CREATE TABLE `evaluation_criterion_star_descriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `criterion_id` varchar(20) NOT NULL,
  `star_value` int(11) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_criterion_star_descriptions`
--

INSERT INTO `evaluation_criterion_star_descriptions` (`id`, `criterion_id`, `star_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'CRIT-001', 1, 'Needs significant support in living, with frequent gaps that require close coaching.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(2, 'CRIT-001', 2, 'Shows early progress in living, but performance is still inconsistent and needs regular follow-up.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(3, 'CRIT-001', 3, 'Meets the expected baseline in living with steady but still improvable habits.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(4, 'CRIT-001', 4, 'Performs well in living and demonstrates reliable, above-average behavior in most situations.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(5, 'CRIT-001', 5, 'Consistently excels in living and models outstanding behavior with minimal guidance.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(6, 'CRIT-002', 1, 'Needs significant support in job and study habits, with major gaps in consistency and commitment.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(7, 'CRIT-002', 2, 'Shows early progress in job and study habits, but still needs regular guidance to stay on track.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(8, 'CRIT-002', 3, 'Meets the baseline expectations in job and study with acceptable consistency.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(9, 'CRIT-002', 4, 'Performs well in job and study and demonstrates reliable learning discipline.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(10, 'CRIT-002', 5, 'Consistently excels in job and study with strong ownership, discipline, and continuous improvement.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(11, 'CRIT-003', 1, 'Needs significant support in relationships and teamwork, with frequent conflict or withdrawal.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(12, 'CRIT-003', 2, 'Shows some positive interactions but still struggles to build stable support and collaboration.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(13, 'CRIT-003', 3, 'Maintains acceptable relationships and participates in teamwork at a basic level.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(14, 'CRIT-003', 4, 'Works well with others and contributes positively to a supportive environment.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(15, 'CRIT-003', 5, 'Builds strong relationships, supports peers consistently, and elevates team dynamics.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(16, 'CRIT-004', 1, 'Health habits need urgent improvement, with clear risk factors in sleep, nutrition, or physical care.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(17, 'CRIT-004', 2, 'Some healthy behaviors exist, but routines are still weak and inconsistent.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(18, 'CRIT-004', 3, 'Maintains a basic acceptable level of health habits, though improvement is still needed.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(19, 'CRIT-004', 4, 'Demonstrates solid health routines and generally takes good care of physical well-being.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(20, 'CRIT-004', 5, 'Shows excellent health habits and maintains a strong, disciplined wellness routine.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(21, 'CRIT-005', 1, 'Emotional well-being is under strain and requires significant support and attention.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(22, 'CRIT-005', 2, 'Shows some ability to manage feelings, but stress and emotional balance remain unstable.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(23, 'CRIT-005', 3, 'Maintains a generally acceptable emotional state with room for healthier coping habits.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(24, 'CRIT-005', 4, 'Demonstrates good emotional awareness and handles stress in constructive ways.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(25, 'CRIT-005', 5, 'Shows strong emotional balance, resilience, and healthy self-awareness consistently.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(26, 'CRIT-006', 1, 'Choices and behavior often create problems and need close supervision and reflection.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(27, 'CRIT-006', 2, 'Some responsible choices are visible, but behavior is still inconsistent.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(28, 'CRIT-006', 3, 'Demonstrates acceptable judgment and takes basic responsibility for actions.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(29, 'CRIT-006', 4, 'Usually makes thoughtful decisions and behaves responsibly in most situations.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(30, 'CRIT-006', 5, 'Consistently makes mature choices and models responsible behavior for others.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(31, 'CRIT-007', 1, 'Financial habits need major improvement, with frequent difficulty managing obligations.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(32, 'CRIT-007', 2, 'Shows some awareness of budgeting, but financial decisions remain unstable.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(33, 'CRIT-007', 3, 'Handles basic financial responsibilities at an acceptable level.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(34, 'CRIT-007', 4, 'Demonstrates good budgeting habits and manages financial obligations well.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(35, 'CRIT-007', 5, 'Shows excellent financial discipline, planning, and consistent responsibility.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(36, 'CRIT-008', 1, 'Needs significant development in practical life skills and daily self-management.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(37, 'CRIT-008', 2, 'Shows some practical ability, but still depends heavily on guidance.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(38, 'CRIT-008', 3, 'Demonstrates an acceptable level of life skills for daily functioning.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(39, 'CRIT-008', 4, 'Handles practical tasks well and shows growing independence.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(40, 'CRIT-008', 5, 'Demonstrates strong life skills, initiative, and self-sufficiency consistently.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(41, 'CRIT-009', 1, 'Communication needs significant improvement, with frequent misunderstandings or lack of clarity.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(42, 'CRIT-009', 2, 'Shows some communication effort, but clarity and listening remain inconsistent.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(43, 'CRIT-009', 3, 'Communicates at a basic acceptable level and listens with moderate consistency.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(44, 'CRIT-009', 4, 'Communicates clearly, listens actively, and participates constructively most of the time.', '2026-03-06 00:00:00', '2026-03-06 00:00:00'),
(45, 'CRIT-009', 5, 'Communicates with confidence, clarity, empathy, and strong constructive impact.', '2026-03-06 00:00:00', '2026-03-06 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
  `class` varchar(100) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `class`, `student_id`, `is_active`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES
(3, 'Sarah', 'Johnson', 'sarah.johnson@school.edu', '$2y$10$YourHashedPasswordHere', 'teacher', NULL, NULL, 1, 0, NULL, '2026-01-15 02:00:00', '2026-01-15 02:00:00'),
(4, 'Michael', 'Brown', 'michael.brown@school.edu', '$2y$10$YourHashedPasswordHere', 'teacher', NULL, NULL, 1, 0, NULL, '2026-01-15 02:30:00', '2026-01-15 02:30:00'),
(5, 'Emily', 'Davis', 'emily.davis@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-A', '2026-005', 1, 0, NULL, '2026-01-20 03:00:00', '2026-01-20 03:00:00'),
(6, 'James', 'Wilson', 'james.wilson@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-A', '2026-006', 1, 0, NULL, '2026-01-20 03:15:00', '2026-01-20 03:15:00'),
(7, 'Lisa', 'Anderson', 'lisa.anderson@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-B', '2026-007', 1, 0, NULL, '2026-01-20 03:30:00', '2026-01-20 03:30:00'),
(8, 'David', 'Martinez', 'david.martinez@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '10-B', '2026-008', 1, 0, NULL, '2026-01-20 03:45:00', '2026-01-20 03:45:00'),
(9, 'Jennifer', 'Lee', 'jennifer.lee@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '11-A', '2026-009', 1, 0, NULL, '2026-01-20 04:00:00', '2026-01-20 04:00:00'),
(10, 'Robert', 'Taylor', 'robert.taylor@student.school.edu', '$2y$10$YourHashedPasswordHere', 'student', '11-A', '2026-010', 1, 0, NULL, '2026-01-20 04:15:00', '2026-01-20 04:15:00'),
(11, 'John', 'Doe', 'john@example.com', 'password123', 'student', 'A', '2026-011', 1, 0, NULL, '2026-02-25 03:40:17', '2026-02-25 03:40:17'),
(12, 'idk', NULL, 'idk@example.com', '$2b$10$3jUoMglRvD1OrhsVRdd35.ohHzk2oF7tN3kpFHugc7/rq9RuXTdV2', 'teacher', 'Web A', NULL, 1, 0, NULL, '2026-02-25 04:08:43', '2026-02-25 04:08:43'),
(13, 'Sophy', NULL, 'sophy@gmail.com', 'password', 'admin', NULL, NULL, 1, 0, NULL, '2026-03-03 00:00:00', '2026-03-03 00:00:00'),
(14, 'Him', NULL, 'him@gmail.com', 'password', 'teacher', NULL, NULL, 1, 0, NULL, '2026-03-03 00:00:00', '2026-03-03 00:00:00'),
(15, 'San', NULL, 'san@gmail.com', 'password', 'student', '10-A', '2026-015', 1, 0, NULL, '2026-03-03 00:00:00', '2026-03-03 00:00:00'),
(16, 'Moeurn', 'Sophy', 'moeurnsophy55@gmail.com', 'password', 'admin', NULL, NULL, 1, 0, NULL, '2026-03-03 00:00:00', '2026-03-03 00:00:00'),
(17, 'Moeurn', 'Sophy', 'moeurnsophy92@gmail.com', 'password', 'admin', NULL, NULL, 1, 0, NULL, '2026-03-04 00:00:00', '2026-03-04 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `employee_no` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`user_id`, `employee_no`, `department`, `created_at`, `updated_at`) VALUES
(3, 'T-0003', 'General', '2026-01-15 02:00:00', '2026-01-15 02:00:00'),
(4, 'T-0004', 'General', '2026-01-15 02:30:00', '2026-01-15 02:30:00'),
(12, 'T-0012', 'Web', '2026-02-25 04:08:43', '2026-02-25 04:08:43'),
(14, 'T-0014', 'General', '2026-03-03 00:00:00', '2026-03-03 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `student_no` varchar(50) DEFAULT NULL,
  `grade_level` varchar(20) DEFAULT NULL,
  `section` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`user_id`, `student_no`, `grade_level`, `section`, `created_at`, `updated_at`) VALUES
(5, 'S-0005', '10', 'A', '2026-01-20 03:00:00', '2026-01-20 03:00:00'),
(6, 'S-0006', '10', 'A', '2026-01-20 03:15:00', '2026-01-20 03:15:00'),
(7, 'S-0007', '10', 'B', '2026-01-20 03:30:00', '2026-01-20 03:30:00'),
(8, 'S-0008', '10', 'B', '2026-01-20 03:45:00', '2026-01-20 03:45:00'),
(9, 'S-0009', '11', 'A', '2026-01-20 04:00:00', '2026-01-20 04:00:00'),
(10, 'S-0010', '11', 'A', '2026-01-20 04:15:00', '2026-01-20 04:15:00'),
(11, 'S-0011', NULL, 'A', '2026-02-25 03:40:17', '2026-02-25 03:40:17'),
(15, 'S-0015', '10', 'A', '2026-03-03 00:00:00', '2026-03-03 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_evaluations_user_period` (`user_id`,`period`),
  ADD KEY `idx_evaluations_submitted_at` (`submitted_at`);

--
-- Indexes for table `evaluation_responses`
--
ALTER TABLE `evaluation_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_evaluation_criterion_key` (`evaluation_id`,`criterion_key`),
  ADD KEY `idx_evaluation_responses_criterion_id` (`criterion_id`);

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
-- Indexes for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_criterion_star_descriptions`
--
ALTER TABLE `evaluation_criterion_star_descriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_criterion_star` (`criterion_id`,`star_value`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_no` (`student_no`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `employee_no` (`employee_no`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uq_users_student_id` (`student_id`),
  ADD KEY `idx_users_active_deleted` (`is_active`,`is_deleted`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `evaluation_responses`
--
ALTER TABLE `evaluation_responses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT for table `evaluation_criterion_star_descriptions`
--
ALTER TABLE `evaluation_criterion_star_descriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `fk_evaluations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluation_responses`
--
ALTER TABLE `evaluation_responses`
  ADD CONSTRAINT `fk_evaluation_responses_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD CONSTRAINT `fk_feedbacks_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedbacks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feedbacks_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluation_criterion_star_descriptions`
--
ALTER TABLE `evaluation_criterion_star_descriptions`
  ADD CONSTRAINT `fk_criterion_star_descriptions_criterion` FOREIGN KEY (`criterion_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
