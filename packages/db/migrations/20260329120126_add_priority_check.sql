PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`state_id` text NOT NULL,
	`priority` text DEFAULT 'no_priority' NOT NULL,
	FOREIGN KEY (`state_id`) REFERENCES `workflow_states`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "priority_check" CHECK("__new_tasks"."priority" IN ('urgent', 'high', 'medium', 'low', 'no_priority'))
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "created_at", "updated_at", "title", "description", "state_id", "priority") SELECT "id", "created_at", "updated_at", "title", "description", "state_id", "priority" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;