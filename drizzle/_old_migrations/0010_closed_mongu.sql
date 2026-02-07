CREATE TABLE `affiliateClicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toolId` int NOT NULL,
	`userId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrer` varchar(500),
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliateClicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliateConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toolId` int NOT NULL,
	`clickId` int,
	`userId` int,
	`conversionType` enum('trial','purchase','subscription') NOT NULL,
	`amount` decimal(10,2),
	`commission` decimal(10,2),
	`status` enum('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
	`externalId` varchar(255),
	`notes` text,
	`convertedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliateConversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securityAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`organizationName` varchar(255),
	`assessmentType` enum('vulnerability_scan','risk_assessment','compliance_check','penetration_test','security_audit') NOT NULL,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`score` int,
	`findings` text,
	`recommendations` text,
	`complianceFramework` varchar(100),
	`scanResults` text,
	`reportUrl` varchar(500),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `securityAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securityTools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category` enum('network_security','vulnerability_scanning','endpoint_protection','identity_management','firewall','penetration_testing','incident_response','cloud_security','api_security','ai_security') NOT NULL,
	`type` enum('open_source','saas','hybrid') NOT NULL,
	`description` text NOT NULL,
	`benefits` text,
	`features` text,
	`useCases` text,
	`installationGuide` text,
	`documentationUrl` varchar(500),
	`githubUrl` varchar(500),
	`websiteUrl` varchar(500),
	`logoUrl` varchar(500),
	`pricing` text,
	`hasAffiliate` boolean NOT NULL DEFAULT false,
	`affiliateUrl` varchar(500),
	`affiliateCommission` varchar(100),
	`rating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`isPopular` boolean NOT NULL DEFAULT false,
	`isEmerging` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `securityTools_id` PRIMARY KEY(`id`),
	CONSTRAINT `securityTools_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `securityTrainingCourses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`category` enum('phishing_awareness','password_security','social_engineering','data_protection','compliance','incident_response','cloud_security','general_awareness') NOT NULL,
	`description` text NOT NULL,
	`duration` int,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`objectives` text,
	`content` text,
	`quizQuestions` text,
	`certificateAvailable` boolean NOT NULL DEFAULT false,
	`externalUrl` varchar(500),
	`thumbnailUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `securityTrainingCourses_id` PRIMARY KEY(`id`),
	CONSTRAINT `securityTrainingCourses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userTrainingProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('not_started','in_progress','completed','failed') NOT NULL DEFAULT 'not_started',
	`progress` int NOT NULL DEFAULT 0,
	`quizScore` int,
	`attempts` int NOT NULL DEFAULT 0,
	`certificateUrl` varchar(500),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userTrainingProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `click_tool_idx` ON `affiliateClicks` (`toolId`);--> statement-breakpoint
CREATE INDEX `click_user_idx` ON `affiliateClicks` (`userId`);--> statement-breakpoint
CREATE INDEX `click_date_idx` ON `affiliateClicks` (`clickedAt`);--> statement-breakpoint
CREATE INDEX `conversion_tool_idx` ON `affiliateConversions` (`toolId`);--> statement-breakpoint
CREATE INDEX `conversion_click_idx` ON `affiliateConversions` (`clickId`);--> statement-breakpoint
CREATE INDEX `conversion_user_idx` ON `affiliateConversions` (`userId`);--> statement-breakpoint
CREATE INDEX `conversion_status_idx` ON `affiliateConversions` (`status`);--> statement-breakpoint
CREATE INDEX `conversion_date_idx` ON `affiliateConversions` (`convertedAt`);--> statement-breakpoint
CREATE INDEX `assessment_user_idx` ON `securityAssessments` (`userId`);--> statement-breakpoint
CREATE INDEX `assessment_status_idx` ON `securityAssessments` (`status`);--> statement-breakpoint
CREATE INDEX `assessment_type_idx` ON `securityAssessments` (`assessmentType`);--> statement-breakpoint
CREATE INDEX `tool_slug_idx` ON `securityTools` (`slug`);--> statement-breakpoint
CREATE INDEX `tool_category_idx` ON `securityTools` (`category`);--> statement-breakpoint
CREATE INDEX `tool_type_idx` ON `securityTools` (`type`);--> statement-breakpoint
CREATE INDEX `tool_affiliate_idx` ON `securityTools` (`hasAffiliate`);--> statement-breakpoint
CREATE INDEX `course_slug_idx` ON `securityTrainingCourses` (`slug`);--> statement-breakpoint
CREATE INDEX `course_provider_idx` ON `securityTrainingCourses` (`provider`);--> statement-breakpoint
CREATE INDEX `course_category_idx` ON `securityTrainingCourses` (`category`);--> statement-breakpoint
CREATE INDEX `course_active_idx` ON `securityTrainingCourses` (`isActive`);--> statement-breakpoint
CREATE INDEX `progress_user_idx` ON `userTrainingProgress` (`userId`);--> statement-breakpoint
CREATE INDEX `progress_course_idx` ON `userTrainingProgress` (`courseId`);--> statement-breakpoint
CREATE INDEX `progress_status_idx` ON `userTrainingProgress` (`status`);--> statement-breakpoint
CREATE INDEX `progress_user_course_idx` ON `userTrainingProgress` (`userId`,`courseId`);