CREATE TABLE `employers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`industry` varchar(100),
	`companySize` varchar(50),
	`website` varchar(500),
	`description` text,
	`benefits` text,
	`logoUrl` varchar(500),
	`address` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobOpenings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerId` int NOT NULL,
	`locationId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`jobType` enum('full-time','part-time','contract','apprenticeship') NOT NULL DEFAULT 'full-time',
	`experienceLevel` enum('entry','mid','senior','expert') NOT NULL,
	`salaryMin` int,
	`salaryMax` int,
	`description` text,
	`requirements` text,
	`applyUrl` varchar(500),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`postedDate` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobOpenings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `employer_location_idx` ON `employers` (`locationId`);--> statement-breakpoint
CREATE INDEX `job_employer_idx` ON `jobOpenings` (`employerId`);--> statement-breakpoint
CREATE INDEX `job_location_idx` ON `jobOpenings` (`locationId`);--> statement-breakpoint
CREATE INDEX `job_active_idx` ON `jobOpenings` (`isActive`);