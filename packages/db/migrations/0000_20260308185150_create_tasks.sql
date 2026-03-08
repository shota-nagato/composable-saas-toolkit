CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`state_id` text NOT NULL,
	FOREIGN KEY (`state_id`) REFERENCES `workflow_states`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workflow_states` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text,
	`position` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "type_check" CHECK("workflow_states"."type" IN ('backlog', 'unstarted', 'started', 'completed', 'canceled'))
);
