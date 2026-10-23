import { Migration } from '@mikro-orm/migrations';

export class Migration20261023090500 extends Migration {

  override name = 'Migration20261023090500';

  override up(): void | Promise<void> {
    this.addSql(`create table "note" ("id" serial primary key, "title" varchar(255) not null, "body" varchar(255) not null, "created_at" timestamptz not null);`);
  }

}
