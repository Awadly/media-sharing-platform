/* eslint-disable import/no-unused-modules */
import { type Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('media', table => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('file_url', 255).notNullable();
    table.enu('type', ['image', 'video']).notNullable();
    table.integer('likes').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('media');
}
