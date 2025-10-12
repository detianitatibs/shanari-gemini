import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1760233465837 implements MigrationInterface {
    name = 'InitialSetup1760233465837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "google_uid" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_dcd0c8a4b10af9c986e510b9ecc" UNIQUE ("email"), CONSTRAINT "UQ_139f9308d97fa4bdcb5a277cca8" UNIQUE ("google_uid"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "file_path" text NOT NULL, "status" text NOT NULL DEFAULT ('draft'), "published_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "author_id" integer NOT NULL, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "post_categories" ("post_id" integer NOT NULL, "category_id" integer NOT NULL, PRIMARY KEY ("post_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_becbe37977577e3eeb089b69fe" ON "post_categories" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f6e2655c798334198182db6399" ON "post_categories" ("category_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "file_path" text NOT NULL, "status" text NOT NULL DEFAULT ('draft'), "published_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "author_id" integer NOT NULL, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "admin_users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "title", "slug", "file_path", "status", "published_at", "created_at", "updated_at", "author_id") SELECT "id", "title", "slug", "file_path", "status", "published_at", "created_at", "updated_at", "author_id" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_becbe37977577e3eeb089b69fe"`);
        await queryRunner.query(`DROP INDEX "IDX_f6e2655c798334198182db6399"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_categories" ("post_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "FK_becbe37977577e3eeb089b69fe1" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_f6e2655c798334198182db6399b" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("post_id", "category_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_post_categories"("post_id", "category_id") SELECT "post_id", "category_id" FROM "post_categories"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_categories" RENAME TO "post_categories"`);
        await queryRunner.query(`CREATE INDEX "IDX_becbe37977577e3eeb089b69fe" ON "post_categories" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f6e2655c798334198182db6399" ON "post_categories" ("category_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_f6e2655c798334198182db6399"`);
        await queryRunner.query(`DROP INDEX "IDX_becbe37977577e3eeb089b69fe"`);
        await queryRunner.query(`ALTER TABLE "post_categories" RENAME TO "temporary_post_categories"`);
        await queryRunner.query(`CREATE TABLE "post_categories" ("post_id" integer NOT NULL, "category_id" integer NOT NULL, PRIMARY KEY ("post_id", "category_id"))`);
        await queryRunner.query(`INSERT INTO "post_categories"("post_id", "category_id") SELECT "post_id", "category_id" FROM "temporary_post_categories"`);
        await queryRunner.query(`DROP TABLE "temporary_post_categories"`);
        await queryRunner.query(`CREATE INDEX "IDX_f6e2655c798334198182db6399" ON "post_categories" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_becbe37977577e3eeb089b69fe" ON "post_categories" ("post_id") `);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "file_path" text NOT NULL, "status" text NOT NULL DEFAULT ('draft'), "published_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "author_id" integer NOT NULL, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"))`);
        await queryRunner.query(`INSERT INTO "posts"("id", "title", "slug", "file_path", "status", "published_at", "created_at", "updated_at", "author_id") SELECT "id", "title", "slug", "file_path", "status", "published_at", "created_at", "updated_at", "author_id" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`DROP INDEX "IDX_f6e2655c798334198182db6399"`);
        await queryRunner.query(`DROP INDEX "IDX_becbe37977577e3eeb089b69fe"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "admin_users"`);
    }

}
