CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"jira_board_id" varchar,
	"github_repo_url" varchar
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;