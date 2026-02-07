CREATE TABLE `relocationPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`locationId` int NOT NULL,
	`targetMoveDate` timestamp,
	`currentStatus` enum('planning','preparing','relocating','settled','cancelled') NOT NULL DEFAULT 'planning',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `relocationPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stepDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stepProgressId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stepDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stepProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`relocationPlanId` int NOT NULL,
	`stepId` int NOT NULL,
	`isCompleted` tinyint NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`dueDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stepProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `relocation_user_idx` ON `relocationPlans` (`userId`);--> statement-breakpoint
CREATE INDEX `relocation_location_idx` ON `relocationPlans` (`locationId`);--> statement-breakpoint
CREATE INDEX `document_progress_idx` ON `stepDocuments` (`stepProgressId`);--> statement-breakpoint
CREATE INDEX `step_progress_plan_idx` ON `stepProgress` (`relocationPlanId`);--> statement-breakpoint
CREATE INDEX `step_progress_step_idx` ON `stepProgress` (`stepId`);--> statement-breakpoint
CREATE INDEX `unique_step_progress` ON `stepProgress` (`relocationPlanId`,`stepId`);