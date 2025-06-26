/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('follows', (table) => {
    table.increments('id').primary();
    table.string('followerId').notNullable();
    table.string('followedId').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('follows');
};
