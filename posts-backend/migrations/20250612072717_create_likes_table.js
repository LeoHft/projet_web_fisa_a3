/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('likes', (table) => {
    table.increments('id').primary();
    table.integer('userId').unsigned().notNullable();
    table.integer('postId').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    
    // Contrainte unique pour éviter les doublons
    table.unique(['userId', 'postId']);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('likes');
};
