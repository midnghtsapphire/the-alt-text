CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`qaItemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qaItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qaItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `qaItems_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `relatedQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`qaItemId` int NOT NULL,
	`relatedQaItemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatedQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('training','certification','government','free_learning','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`url` varchar(500),
	`tags` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`citation` text NOT NULL,
	`url` varchar(500),
	`type` varchar(50),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('salary','growth','shortage','training') NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` varchar(100) NOT NULL,
	`metadata` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topics_id` PRIMARY KEY(`id`),
	CONSTRAINT `topics_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `qa_item_bookmark_idx` ON `bookmarks` (`qaItemId`);--> statement-breakpoint
CREATE INDEX `unique_bookmark` ON `bookmarks` (`userId`,`qaItemId`);--> statement-breakpoint
CREATE INDEX `topic_idx` ON `qaItems` (`topicId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `qaItems` (`slug`);--> statement-breakpoint
CREATE INDEX `qa_item_idx` ON `relatedQuestions` (`qaItemId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `resources` (`category`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `statistics` (`type`);