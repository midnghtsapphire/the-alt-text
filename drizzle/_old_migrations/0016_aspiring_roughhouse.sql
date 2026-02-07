CREATE TABLE `orders` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`items` text NOT NULL,
	`shippingAddress` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pendingOrders` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`items` text NOT NULL,
	`total` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`instructions` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pendingOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`image` varchar(500),
	`category` varchar(100),
	`tags` text,
	`active` boolean NOT NULL DEFAULT true,
	`stripePriceId` varchar(255),
	`stripeProductId` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `securityHabits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPayments` int NOT NULL DEFAULT 0,
	`safePayments` int NOT NULL DEFAULT 0,
	`digitalWalletUses` int NOT NULL DEFAULT 0,
	`publicPlaceProtections` int NOT NULL DEFAULT 0,
	`focusedCheckouts` int NOT NULL DEFAULT 0,
	`silentTyping` int NOT NULL DEFAULT 0,
	`cardPutAway` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastPaymentAt` timestamp,
	`badges` text NOT NULL DEFAULT ('[]'),
	`enableHabitTracking` boolean NOT NULL DEFAULT true,
	`enableWeeklyReports` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `securityHabits_id` PRIMARY KEY(`id`),
	CONSTRAINT `securityHabits_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','unpaid','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`canceledAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `payment_intent_idx` ON `orders` (`stripePaymentIntentId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `pendingOrders` (`userId`);--> statement-breakpoint
CREATE INDEX `expires_idx` ON `pendingOrders` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `products` (`active`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `securityHabits` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `stripe_sub_idx` ON `subscriptions` (`stripeSubscriptionId`);