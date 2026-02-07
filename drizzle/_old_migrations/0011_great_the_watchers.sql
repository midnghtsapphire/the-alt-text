CREATE TABLE `aiCareerAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentRole` varchar(255),
	`currentIndustry` varchar(255),
	`yearsExperience` int,
	`educationLevel` varchar(100),
	`skills` text,
	`interests` text,
	`assessmentInput` text,
	`aiResponse` text,
	`recommendedPaths` text,
	`topMatch` varchar(255),
	`confidenceScore` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiCareerAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiCoachConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`context` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiCoachConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiOpportunityAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`opportunityType` enum('job','training','certification','location','emerging_role') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`matchScore` decimal(5,2),
	`matchReason` text,
	`salaryRange` varchar(100),
	`location` varchar(255),
	`url` varchar(500),
	`source` varchar(255),
	`userResponse` enum('interested','not_interested','applied','dismissed'),
	`isRead` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiOpportunityAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiRoiCalculations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assessmentId` int,
	`gapAnalysisId` int,
	`currentSalary` decimal(10,2) NOT NULL,
	`targetSalary` decimal(10,2) NOT NULL,
	`trainingCosts` decimal(10,2) NOT NULL,
	`opportunityCost` decimal(10,2),
	`timeToTransition` int,
	`breakEvenMonths` int,
	`fiveYearGain` decimal(12,2),
	`tenYearGain` decimal(12,2),
	`lifetimeGain` decimal(12,2),
	`riskFactors` text,
	`aiInsights` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiRoiCalculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiSkillsGapAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assessmentId` int,
	`currentSkills` text,
	`targetRole` varchar(255) NOT NULL,
	`requiredSkills` text,
	`missingSkills` text,
	`transferableSkills` text,
	`recommendedTraining` text,
	`estimatedTimeToReady` int,
	`estimatedCost` decimal(10,2),
	`aiAnalysis` text,
	`progressPercentage` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiSkillsGapAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ai_assessment_user_idx` ON `aiCareerAssessments` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_assessment_date_idx` ON `aiCareerAssessments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_coach_user_idx` ON `aiCoachConversations` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_coach_session_idx` ON `aiCoachConversations` (`sessionId`);--> statement-breakpoint
CREATE INDEX `ai_coach_date_idx` ON `aiCoachConversations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_opportunity_user_idx` ON `aiOpportunityAlerts` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_opportunity_type_idx` ON `aiOpportunityAlerts` (`opportunityType`);--> statement-breakpoint
CREATE INDEX `ai_opportunity_score_idx` ON `aiOpportunityAlerts` (`matchScore`);--> statement-breakpoint
CREATE INDEX `ai_opportunity_read_idx` ON `aiOpportunityAlerts` (`isRead`);--> statement-breakpoint
CREATE INDEX `ai_roi_user_idx` ON `aiRoiCalculations` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_roi_assessment_idx` ON `aiRoiCalculations` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `ai_gap_user_idx` ON `aiSkillsGapAnalysis` (`userId`);--> statement-breakpoint
CREATE INDEX `ai_gap_assessment_idx` ON `aiSkillsGapAnalysis` (`assessmentId`);