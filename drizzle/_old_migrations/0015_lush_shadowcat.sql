CREATE TABLE `neurodivergentProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileType` enum('none','adhd','autism','vampire','dyslexia','anxiety') NOT NULL DEFAULT 'none',
	`customSettings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `neurodivergentProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `neurodivergentProfiles` (`userId`);