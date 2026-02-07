CREATE TABLE `contentVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('qa','statistic','resource','location') NOT NULL,
	`contentId` int NOT NULL,
	`iterationColor` enum('red','blue','yellow','green') NOT NULL,
	`versionNumber` int NOT NULL,
	`changeDescription` text,
	`addedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `factVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('qa','statistic','resource','location') NOT NULL,
	`contentId` int NOT NULL,
	`verificationStatus` enum('pending','verified','needs_review','failed') NOT NULL DEFAULT 'pending',
	`verifiedBy` int,
	`verificationNotes` text,
	`sourceUrls` text,
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `factVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `linkHealthChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(1000) NOT NULL,
	`contentType` enum('qa','statistic','resource','location') NOT NULL,
	`contentId` int NOT NULL,
	`statusCode` int,
	`isWorking` tinyint NOT NULL DEFAULT 1,
	`errorMessage` text,
	`lastCheckedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `linkHealthChecks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `content_version_idx` ON `contentVersions` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `iteration_color_idx` ON `contentVersions` (`iterationColor`);--> statement-breakpoint
CREATE INDEX `fact_content_idx` ON `factVerifications` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `fact_status_idx` ON `factVerifications` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `link_url_idx` ON `linkHealthChecks` (`url`);--> statement-breakpoint
CREATE INDEX `link_content_idx` ON `linkHealthChecks` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `link_status_idx` ON `linkHealthChecks` (`isWorking`);