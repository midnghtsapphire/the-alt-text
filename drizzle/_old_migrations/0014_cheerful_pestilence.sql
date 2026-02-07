CREATE TABLE `affiliateTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`moduleId` varchar(100) NOT NULL,
	`affiliateProgram` varchar(100) NOT NULL,
	`event` enum('click','signup','conversion') NOT NULL,
	`eventData` text,
	`commission` decimal(10,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliateTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiCustomers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`apiKey` varchar(64) NOT NULL,
	`type` enum('individual','agency','enterprise') NOT NULL DEFAULT 'individual',
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`clientCount` int NOT NULL DEFAULT 0,
	`affiliateId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiCustomers_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiCustomers_contactEmail_unique` UNIQUE(`contactEmail`),
	CONSTRAINT `apiCustomers_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `apiInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`billingPeriodStart` timestamp NOT NULL,
	`billingPeriodEnd` timestamp NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`overageCharges` decimal(10,2) NOT NULL DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`stripeInvoiceId` varchar(255),
	`paidAt` timestamp,
	`lineItems` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `apiModules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('core','business','industry','advanced','integration') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`callLimit` int NOT NULL,
	`overageCost` decimal(10,4) NOT NULL,
	`hasAffiliateLinks` boolean NOT NULL DEFAULT false,
	`affiliateCommission` varchar(100),
	`actions` text NOT NULL,
	`dependencies` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiModules_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiModules_moduleId_unique` UNIQUE(`moduleId`)
);
--> statement-breakpoint
CREATE TABLE `apiUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`moduleId` varchar(100) NOT NULL,
	`action` varchar(100) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`success` boolean NOT NULL,
	`responseTime` int NOT NULL,
	`cost` decimal(10,4) NOT NULL DEFAULT '0',
	`errorMessage` text,
	`metadata` text,
	CONSTRAINT `apiUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerModules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`moduleId` varchar(100) NOT NULL,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`activatedAt` timestamp NOT NULL DEFAULT (now()),
	`cancelledAt` timestamp,
	`callsThisMonth` int NOT NULL DEFAULT 0,
	`callLimit` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`overageAllowed` boolean NOT NULL DEFAULT true,
	`lastResetAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerModules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customer_idx` ON `affiliateTracking` (`customerId`);--> statement-breakpoint
CREATE INDEX `program_idx` ON `affiliateTracking` (`affiliateProgram`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `affiliateTracking` (`event`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `affiliateTracking` (`timestamp`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `apiCustomers` (`contactEmail`);--> statement-breakpoint
CREATE INDEX `api_key_idx` ON `apiCustomers` (`apiKey`);--> statement-breakpoint
CREATE INDEX `customer_idx` ON `apiInvoices` (`customerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `apiInvoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoice_number_idx` ON `apiInvoices` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `module_id_idx` ON `apiModules` (`moduleId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `apiModules` (`category`);--> statement-breakpoint
CREATE INDEX `customer_idx` ON `apiUsage` (`customerId`);--> statement-breakpoint
CREATE INDEX `module_idx` ON `apiUsage` (`moduleId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `apiUsage` (`timestamp`);--> statement-breakpoint
CREATE INDEX `customer_idx` ON `customerModules` (`customerId`);--> statement-breakpoint
CREATE INDEX `module_idx` ON `customerModules` (`moduleId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `customerModules` (`status`);