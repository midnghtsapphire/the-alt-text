CREATE TABLE `affiliateLinks` (
	`id` varchar(100) NOT NULL,
	`productId` varchar(100) NOT NULL,
	`affiliateUrl` text NOT NULL,
	`trackingCode` varchar(50) NOT NULL,
	`campaign` varchar(100) NOT NULL,
	`medium` varchar(50) NOT NULL,
	`source` varchar(50) NOT NULL,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`revenue` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliateLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignEvents` (
	`id` varchar(100) NOT NULL,
	`campaignId` varchar(100) NOT NULL,
	`eventType` enum('page_view','quiz_start','quiz_complete','lead_capture','click','conversion','share') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(100) NOT NULL,
	`userId` int,
	`metadata` json,
	`utmParameters` json,
	`referrer` varchar(500),
	`ipAddress` varchar(45),
	`userAgent` text,
	CONSTRAINT `campaignEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('quiz','landing_page','email','social','affiliate') NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizConfigs` (
	`id` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`config` json NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizResponses` (
	`id` varchar(100) NOT NULL,
	`quizId` varchar(100) NOT NULL,
	`answers` json NOT NULL,
	`leadInfo` json,
	`score` int,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizResults` (
	`id` varchar(100) NOT NULL,
	`responseId` varchar(100) NOT NULL,
	`quizId` varchar(100) NOT NULL,
	`score` int NOT NULL,
	`aiInsights` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `aff_link_product_idx` ON `affiliateLinks` (`productId`);--> statement-breakpoint
CREATE INDEX `aff_link_campaign_idx` ON `affiliateLinks` (`campaign`);--> statement-breakpoint
CREATE INDEX `aff_link_tracking_idx` ON `affiliateLinks` (`trackingCode`);--> statement-breakpoint
CREATE INDEX `event_campaign_idx` ON `campaignEvents` (`campaignId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `campaignEvents` (`eventType`);--> statement-breakpoint
CREATE INDEX `event_timestamp_idx` ON `campaignEvents` (`timestamp`);--> statement-breakpoint
CREATE INDEX `event_session_idx` ON `campaignEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `campaign_status_idx` ON `campaigns` (`status`);--> statement-breakpoint
CREATE INDEX `campaign_type_idx` ON `campaigns` (`type`);--> statement-breakpoint
CREATE INDEX `quiz_status_idx` ON `quizConfigs` (`status`);--> statement-breakpoint
CREATE INDEX `quiz_created_by_idx` ON `quizConfigs` (`createdBy`);--> statement-breakpoint
CREATE INDEX `response_quiz_idx` ON `quizResponses` (`quizId`);--> statement-breakpoint
CREATE INDEX `response_completed_idx` ON `quizResponses` (`completedAt`);--> statement-breakpoint
CREATE INDEX `result_response_idx` ON `quizResults` (`responseId`);--> statement-breakpoint
CREATE INDEX `result_quiz_idx` ON `quizResults` (`quizId`);