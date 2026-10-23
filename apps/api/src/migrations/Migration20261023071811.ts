import { Migration } from '@mikro-orm/migrations';

export class Migration20261023071811 extends Migration {

  override name = 'Migration20261023071811';

  override up(): void | Promise<void> {
    this.addSql(`create table "item" ("id" serial primary key, "title" varchar(255) not null, "done" boolean not null default false, "created_at" timestamptz not null);`);
  }

}
