CREATE TABLE `expenseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`scheduleCLine` varchar(50),
	`description` text,
	`deductiblePercentage` int NOT NULL DEFAULT 100,
	`requiresReceipt` boolean NOT NULL DEFAULT true,
	`exampleExpenses` text,
	`aiKeywords` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenseCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `expenseCategories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `spendingPatterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`avgMonthlyAmount` decimal(10,2) NOT NULL,
	`stdDeviation` decimal(10,2) NOT NULL,
	`minAmount` decimal(10,2) NOT NULL,
	`maxAmount` decimal(10,2) NOT NULL,
	`transactionCount` int NOT NULL,
	`lastCalculated` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spendingPatterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('anomaly','budget_threshold','duplicate','large_purchase','weekly_summary','tax_deadline','missing_receipt','deduction_opportunity') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`relatedExpenseId` int,
	`relatedData` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`actionTaken` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `category_name_idx` ON `expenseCategories` (`name`);--> statement-breakpoint
CREATE INDEX `category_active_idx` ON `expenseCategories` (`isActive`);--> statement-breakpoint
CREATE INDEX `pattern_user_idx` ON `spendingPatterns` (`userId`);--> statement-breakpoint
CREATE INDEX `pattern_category_idx` ON `spendingPatterns` (`category`);--> statement-breakpoint
CREATE INDEX `pattern_user_category_idx` ON `spendingPatterns` (`userId`,`category`);--> statement-breakpoint
CREATE INDEX `notification_user_idx` ON `taxNotifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notification_type_idx` ON `taxNotifications` (`type`);--> statement-breakpoint
CREATE INDEX `notification_read_idx` ON `taxNotifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `notification_created_idx` ON `taxNotifications` (`createdAt`);