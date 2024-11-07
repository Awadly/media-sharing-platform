/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('media', (table) => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.string('file_url', 255).notNullable();
        table.enu('type', ['image', 'video']).notNullable();
        table.integer('likes').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
     });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('media');
};
