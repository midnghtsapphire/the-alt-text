CREATE TABLE `deductions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`deductionType` varchar(100) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`calculationMethod` varchar(100),
	`calculationDetails` text,
	`supportingDocuments` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deductions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`vendor` varchar(255),
	`description` text,
	`receiptId` int,
	`paymentMethod` varchar(50),
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurringFrequency` enum('monthly','quarterly','annually'),
	`taxDeductible` boolean NOT NULL DEFAULT true,
	`deductiblePercentage` int NOT NULL DEFAULT 100,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`approvedBy` int,
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form1099s` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`recipientId` int NOT NULL,
	`taxYear` int NOT NULL,
	`formType` enum('1099-NEC','1099-MISC','1099-K','1099-INT','1099-DIV') NOT NULL,
	`box1Amount` decimal(10,2),
	`box2Amount` decimal(10,2),
	`box3Amount` decimal(10,2),
	`box4Amount` decimal(10,2),
	`box5Amount` decimal(10,2),
	`box6Amount` decimal(10,2),
	`box7Amount` decimal(10,2),
	`totalAmount` decimal(10,2) NOT NULL,
	`filingStatus` enum('draft','ready','filed','corrected') NOT NULL DEFAULT 'draft',
	`filedDate` timestamp,
	`correctionOf` int,
	`pdfUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `form1099s_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quarterlyEstimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`quarter` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`estimatedIncome` decimal(10,2) NOT NULL,
	`estimatedDeductions` decimal(10,2) NOT NULL,
	`estimatedTaxableIncome` decimal(10,2) NOT NULL,
	`federalTaxOwed` decimal(10,2) NOT NULL,
	`stateTaxOwed` decimal(10,2) NOT NULL,
	`selfEmploymentTaxOwed` decimal(10,2) NOT NULL,
	`totalTaxOwed` decimal(10,2) NOT NULL,
	`amountPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
	`paidDate` timestamp,
	`paymentMethod` varchar(50),
	`confirmationNumber` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quarterlyEstimates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`ocrText` text,
	`ocrDate` timestamp,
	`ocrVendor` varchar(255),
	`ocrAmount` decimal(10,2),
	`ocrCategory` varchar(100),
	`ocrConfidence` decimal(5,2),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`linkedToExpenseId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`recordId` int NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`oldValues` text,
	`newValues` text,
	`changedBy` int NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taxAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxEntities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`entityType` enum('contractor','client','business','self') NOT NULL,
	`name` varchar(255) NOT NULL,
	`tin` varchar(20),
	`tinType` enum('ssn','ein'),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`email` varchar(320),
	`phone` varchar(20),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxEntities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxLiabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxYear` int NOT NULL,
	`totalIncome` decimal(10,2) NOT NULL,
	`totalDeductions` decimal(10,2) NOT NULL,
	`taxableIncome` decimal(10,2) NOT NULL,
	`federalTaxOwed` decimal(10,2) NOT NULL,
	`federalTaxPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
	`federalTaxRefund` decimal(10,2) NOT NULL DEFAULT '0.00',
	`stateTaxOwed` decimal(10,2) NOT NULL,
	`stateTaxPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
	`stateTaxRefund` decimal(10,2) NOT NULL DEFAULT '0.00',
	`selfEmploymentTaxOwed` decimal(10,2) NOT NULL,
	`selfEmploymentTaxPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
	`penaltiesOwed` decimal(10,2) NOT NULL DEFAULT '0.00',
	`interestOwed` decimal(10,2) NOT NULL DEFAULT '0.00',
	`filingStatus` enum('not_filed','filed','amended') NOT NULL DEFAULT 'not_filed',
	`filedDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxLiabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `deduction_user_idx` ON `deductions` (`userId`);--> statement-breakpoint
CREATE INDEX `deduction_year_idx` ON `deductions` (`taxYear`);--> statement-breakpoint
CREATE INDEX `deduction_type_idx` ON `deductions` (`deductionType`);--> statement-breakpoint
CREATE INDEX `expense_user_idx` ON `expenses` (`userId`);--> statement-breakpoint
CREATE INDEX `expense_date_idx` ON `expenses` (`date`);--> statement-breakpoint
CREATE INDEX `expense_category_idx` ON `expenses` (`category`);--> statement-breakpoint
CREATE INDEX `expense_vendor_idx` ON `expenses` (`vendor`);--> statement-breakpoint
CREATE INDEX `form1099_user_idx` ON `form1099s` (`userId`);--> statement-breakpoint
CREATE INDEX `form1099_recipient_idx` ON `form1099s` (`recipientId`);--> statement-breakpoint
CREATE INDEX `form1099_year_idx` ON `form1099s` (`taxYear`);--> statement-breakpoint
CREATE INDEX `form1099_status_idx` ON `form1099s` (`filingStatus`);--> statement-breakpoint
CREATE INDEX `quarterly_user_idx` ON `quarterlyEstimates` (`userId`);--> statement-breakpoint
CREATE INDEX `quarterly_year_idx` ON `quarterlyEstimates` (`taxYear`);--> statement-breakpoint
CREATE INDEX `quarterly_quarter_idx` ON `quarterlyEstimates` (`quarter`);--> statement-breakpoint
CREATE INDEX `quarterly_due_idx` ON `quarterlyEstimates` (`dueDate`);--> statement-breakpoint
CREATE INDEX `receipt_user_idx` ON `receipts` (`userId`);--> statement-breakpoint
CREATE INDEX `receipt_date_idx` ON `receipts` (`ocrDate`);--> statement-breakpoint
CREATE INDEX `receipt_vendor_idx` ON `receipts` (`ocrVendor`);--> statement-breakpoint
CREATE INDEX `receipt_expense_idx` ON `receipts` (`linkedToExpenseId`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `taxAuditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_table_idx` ON `taxAuditLog` (`tableName`);--> statement-breakpoint
CREATE INDEX `audit_record_idx` ON `taxAuditLog` (`recordId`);--> statement-breakpoint
CREATE INDEX `audit_timestamp_idx` ON `taxAuditLog` (`timestamp`);--> statement-breakpoint
CREATE INDEX `tax_entity_user_idx` ON `taxEntities` (`userId`);--> statement-breakpoint
CREATE INDEX `tax_entity_type_idx` ON `taxEntities` (`entityType`);--> statement-breakpoint
CREATE INDEX `tax_entity_tin_idx` ON `taxEntities` (`tin`);--> statement-breakpoint
CREATE INDEX `liability_user_idx` ON `taxLiabilities` (`userId`);--> statement-breakpoint
CREATE INDEX `liability_year_idx` ON `taxLiabilities` (`taxYear`);--> statement-breakpoint
CREATE INDEX `liability_status_idx` ON `taxLiabilities` (`filingStatus`);