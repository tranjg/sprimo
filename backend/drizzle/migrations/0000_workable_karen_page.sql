CREATE TABLE "users" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(256) NOT NULL,
	"created_at" date DEFAULT now()
);
