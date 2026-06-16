import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1781584001491 implements MigrationInterface {
  name = 'InitialSchema1781584001491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "fullName" character varying(255), "points" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "description" text, "pointsCost" integer NOT NULL DEFAULT '0', "stock" integer NOT NULL DEFAULT '0', "imageUrl" character varying(500), CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d7ed66691090d50235bfd7582" ON "rewards"  ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "rewardId" uuid NOT NULL, "claimedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_86078010f64a891601beef7c54f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d538de4678c82491e5a8a8a583" ON "user_rewards"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2904b4fa623c996161687e47d" ON "user_rewards"  ("rewardId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_rewards" ADD CONSTRAINT "FK_d538de4678c82491e5a8a8a5834" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_rewards" ADD CONSTRAINT "FK_d2904b4fa623c996161687e47d1" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_rewards" DROP CONSTRAINT "FK_d2904b4fa623c996161687e47d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_rewards" DROP CONSTRAINT "FK_d538de4678c82491e5a8a8a5834"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2904b4fa623c996161687e47d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d538de4678c82491e5a8a8a583"`,
    );
    await queryRunner.query(`DROP TABLE "user_rewards"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d7ed66691090d50235bfd7582"`,
    );
    await queryRunner.query(`DROP TABLE "rewards"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
