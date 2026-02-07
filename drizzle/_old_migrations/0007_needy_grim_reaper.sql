CREATE TABLE `candidateStipends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`placementId` int NOT NULL,
	`milestoneId` int NOT NULL,
	`amount` int NOT NULL,
	`stipendType` enum('retention','relocation','training','bonus') NOT NULL DEFAULT 'retention',
	`paymentStatus` enum('pending','processing','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(100) NOT NULL DEFAULT 'ACH',
	`bankAccountLast4` varchar(4),
	`transactionId` varchar(255),
	`scheduledDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`failureReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidateStipends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`locationId` int,
	`resumeUrl` varchar(500),
	`resumeKey` varchar(500),
	`linkedinUrl` varchar(500),
	`currentRole` varchar(255),
	`experienceLevel` enum('entry','mid','senior','expert') NOT NULL DEFAULT 'entry',
	`certifications` text,
	`trainingCompleted` text,
	`skills` text,
	`salaryExpectation` int,
	`availableStartDate` timestamp,
	`willingToRelocate` tinyint NOT NULL DEFAULT 0,
	`status` enum('new','screening','training','ready','placed','inactive') NOT NULL DEFAULT 'new',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placementId` int NOT NULL,
	`milestoneId` int,
	`commissionType` enum('base_fee','retention_bonus') NOT NULL,
	`amount` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paymentStatus` enum('pending','invoiced','paid','overdue','waived') NOT NULL DEFAULT 'pending',
	`invoiceNumber` varchar(100),
	`invoiceDate` timestamp,
	`paidDate` timestamp,
	`paymentMethod` varchar(100),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerCommunications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`communicationType` enum('email','phone','meeting','contract','other') NOT NULL,
	`subject` varchar(500),
	`summary` text,
	`outcome` varchar(255),
	`nextFollowUpDate` timestamp,
	`attachments` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerCommunications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerType` enum('manufacturer','training_provider','grant_provider','certification_body','industry_org') NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`website` varchar(500),
	`address` varchar(500),
	`locationId` int,
	`description` text,
	`partnershipStatus` enum('prospect','contacted','negotiating','active','paused','inactive') NOT NULL DEFAULT 'prospect',
	`contractStartDate` timestamp,
	`contractEndDate` timestamp,
	`commissionRate` decimal(5,2),
	`retentionBonusStructure` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `placementInterviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`partnerId` int NOT NULL,
	`jobOpeningId` int,
	`interviewDate` timestamp NOT NULL,
	`interviewType` enum('phone_screen','technical','behavioral','panel','final') NOT NULL,
	`interviewerName` varchar(255),
	`interviewStatus` enum('scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
	`outcome` enum('pending','passed','failed','offer_extended','offer_accepted','offer_declined'),
	`feedback` text,
	`nextSteps` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `placementInterviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `placements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`partnerId` int NOT NULL,
	`jobOpeningId` int,
	`jobTitle` varchar(255) NOT NULL,
	`jobType` enum('full-time','part-time','contract','apprenticeship') NOT NULL DEFAULT 'full-time',
	`locationId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`annualSalary` int NOT NULL,
	`commissionRate` decimal(5,2) NOT NULL,
	`baseFee` int NOT NULL,
	`retentionBonusStructure` text,
	`placementStatus` enum('pending','confirmed','active','terminated','completed') NOT NULL DEFAULT 'pending',
	`terminationDate` timestamp,
	`terminationReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `placements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retentionMilestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placementId` int NOT NULL,
	`milestoneDays` int NOT NULL,
	`milestoneDate` timestamp NOT NULL,
	`bonusAmount` int NOT NULL,
	`milestoneStatus` enum('pending','achieved','missed','waived') NOT NULL DEFAULT 'pending',
	`achievedDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retentionMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `stipend_candidate_idx` ON `candidateStipends` (`candidateId`);--> statement-breakpoint
CREATE INDEX `stipend_placement_idx` ON `candidateStipends` (`placementId`);--> statement-breakpoint
CREATE INDEX `stipend_status_idx` ON `candidateStipends` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `stipend_scheduled_idx` ON `candidateStipends` (`scheduledDate`);--> statement-breakpoint
CREATE INDEX `candidate_email_idx` ON `candidates` (`email`);--> statement-breakpoint
CREATE INDEX `candidate_status_idx` ON `candidates` (`status`);--> statement-breakpoint
CREATE INDEX `candidate_location_idx` ON `candidates` (`locationId`);--> statement-breakpoint
CREATE INDEX `commission_placement_idx` ON `commissions` (`placementId`);--> statement-breakpoint
CREATE INDEX `commission_status_idx` ON `commissions` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `commission_due_date_idx` ON `commissions` (`dueDate`);--> statement-breakpoint
CREATE INDEX `commission_invoice_idx` ON `commissions` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `comm_partner_idx` ON `partnerCommunications` (`partnerId`);--> statement-breakpoint
CREATE INDEX `comm_type_idx` ON `partnerCommunications` (`communicationType`);--> statement-breakpoint
CREATE INDEX `comm_follow_up_idx` ON `partnerCommunications` (`nextFollowUpDate`);--> statement-breakpoint
CREATE INDEX `partner_type_idx` ON `partners` (`partnerType`);--> statement-breakpoint
CREATE INDEX `partner_status_idx` ON `partners` (`partnershipStatus`);--> statement-breakpoint
CREATE INDEX `partner_email_idx` ON `partners` (`contactEmail`);--> statement-breakpoint
CREATE INDEX `interview_candidate_idx` ON `placementInterviews` (`candidateId`);--> statement-breakpoint
CREATE INDEX `interview_partner_idx` ON `placementInterviews` (`partnerId`);--> statement-breakpoint
CREATE INDEX `interview_date_idx` ON `placementInterviews` (`interviewDate`);--> statement-breakpoint
CREATE INDEX `interview_status_idx` ON `placementInterviews` (`interviewStatus`);--> statement-breakpoint
CREATE INDEX `placement_candidate_idx` ON `placements` (`candidateId`);--> statement-breakpoint
CREATE INDEX `placement_partner_idx` ON `placements` (`partnerId`);--> statement-breakpoint
CREATE INDEX `placement_status_idx` ON `placements` (`placementStatus`);--> statement-breakpoint
CREATE INDEX `placement_start_date_idx` ON `placements` (`startDate`);--> statement-breakpoint
CREATE INDEX `milestone_placement_idx` ON `retentionMilestones` (`placementId`);--> statement-breakpoint
CREATE INDEX `milestone_status_idx` ON `retentionMilestones` (`milestoneStatus`);--> statement-breakpoint
CREATE INDEX `milestone_date_idx` ON `retentionMilestones` (`milestoneDate`);