CREATE TABLE `jobProbabilityFactors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`experienceLevel` enum('entry','mid','senior','expert') NOT NULL,
	`hasApprenticeship` tinyint NOT NULL DEFAULT 0,
	`hasCertification` tinyint NOT NULL DEFAULT 0,
	`hasDegree` tinyint NOT NULL DEFAULT 0,
	`baseProbability` int NOT NULL,
	`timeToHire` varchar(100),
	`expectedSalaryRange` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobProbabilityFactors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`region` varchar(50),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`population` int,
	`description` text,
	`opportunityScore` int NOT NULL DEFAULT 0,
	`demandLevel` enum('low','medium','high','very_high') NOT NULL DEFAULT 'medium',
	`averageSalary` int,
	`medianRent` int,
	`costOfLivingIndex` int NOT NULL DEFAULT 100,
	`jobOpenings` int NOT NULL DEFAULT 0,
	`majorEmployers` text,
	`industries` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `relocationSteps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int,
	`phase` enum('pre_departure','post_arrival') NOT NULL,
	`category` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`estimatedCost` int,
	`estimatedTime` varchar(100),
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`resources` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `relocationSteps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingPrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(255),
	`type` enum('certification','apprenticeship','degree','bootcamp','online_course') NOT NULL,
	`duration` varchar(100),
	`cost` int,
	`description` text,
	`skillsGained` text,
	`jobProbabilityBoost` int NOT NULL DEFAULT 0,
	`salaryImpact` int NOT NULL DEFAULT 0,
	`url` varchar(500),
	`availableOnline` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trainingPrograms_id` PRIMARY KEY(`id`)
);
