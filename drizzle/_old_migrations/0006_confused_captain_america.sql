CREATE TABLE `featureSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255),
	`email` varchar(320),
	`suggestionType` enum('feature','bug','improvement','content') NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`status` enum('new','reviewing','planned','in_progress','completed','declined') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`upvotes` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featureSuggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `suggestion_user_idx` ON `featureSuggestions` (`userId`);--> statement-breakpoint
CREATE INDEX `suggestion_status_idx` ON `featureSuggestions` (`status`);--> statement-breakpoint
CREATE INDEX `suggestion_type_idx` ON `featureSuggestions` (`suggestionType`);