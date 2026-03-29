PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workflow_states` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text,
	`position` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "type_check" CHECK("__new_workflow_states"."type" IN ('backlog', 'unstarted', 'started', 'in_review', 'completed', 'canceled'))
);
--> statement-breakpoint
INSERT INTO `__new_workflow_states`("id", "created_at", "updated_at", "name", "type", "color", "position") SELECT "id", "created_at", "updated_at", "name", "type", "color", "position" FROM `workflow_states`;--> statement-breakpoint
DROP TABLE `workflow_states`;--> statement-breakpoint
ALTER TABLE `__new_workflow_states` RENAME TO `workflow_states`;--> statement-breakpoint
PRAGMA foreign_keys=ON;