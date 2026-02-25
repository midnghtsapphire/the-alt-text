CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`keyPrefix` varchar(12) NOT NULL,
	`rateLimit` int NOT NULL DEFAULT 60,
	`monthlyLimit` int NOT NULL DEFAULT 1000,
	`monthlyUsed` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `api_usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyId` int NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int NOT NULL,
	`responseTimeMs` int,
	`imageUrl` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`totalImages` int NOT NULL DEFAULT 0,
	`processedImages` int NOT NULL DEFAULT 0,
	`failedImages` int NOT NULL DEFAULT 0,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `image_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`imageFileName` varchar(500),
	`generatedAltText` text,
	`confidence` decimal(5,2),
	`imageType` enum('photo','illustration','icon','chart','screenshot','decorative','unknown') DEFAULT 'unknown',
	`wcagCompliance` enum('pass','fail','warning') DEFAULT 'warning',
	`pageContext` text,
	`surroundingText` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`processingTimeMs` int,
	`errorMessage` text,
	`modelUsed` varchar(100),
	`tokensUsed` int,
	`batchId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `image_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','past_due','trialing') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripePriceId` varchar(255),
	`imagesPerMonth` int NOT NULL DEFAULT 50,
	`imagesUsedThisMonth` int NOT NULL DEFAULT 0,
	`bulkUploadsPerMonth` int NOT NULL DEFAULT 0,
	`apiCallsPerMonth` int NOT NULL DEFAULT 0,
	`apiCallsUsedThisMonth` int NOT NULL DEFAULT 0,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
