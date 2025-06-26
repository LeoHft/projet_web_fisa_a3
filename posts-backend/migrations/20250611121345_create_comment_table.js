/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.integer('userId').unsigned().notNullable();
    table.integer('postId').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.integer('parentId').unsigned().nullable().references('id').inTable('comments').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('comments');
};