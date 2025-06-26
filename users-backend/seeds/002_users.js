const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('users').del()
  const passwordHash = await bcrypt.hash('password', 10);

  const roles = await knex('roles').select('*');

  await knex('users').insert([
    {
      id: 1,
      username: 'admin',
      bio: 'Administrateur du système',
      password: passwordHash,
      email: 'administrateur@example.com',
      roleId: roles.find(r => r.name === 'administrateur').id,
      completed: true,
    },
    {
      id: 2,
      username: 'user',
      bio: 'Utilisateur standard',
      password: passwordHash,
      email: 'utilisateur@example.com',
      roleId: roles.find(r => r.name === 'utilisateur').id,
    },
    {
      id: 3,
      username: 'moderator',
      bio: 'Modérateur du contenu',
      password: passwordHash,
      email: 'moderateur@example.com',
      roleId: roles.find(r => r.name === 'moderateur').id
    },
    {
      id: 4,
      username: 'guest',
      bio: 'Visiteur du site',
      password: passwordHash,
      email: 'visiteur@example.com',
      roleId: roles.find(r => r.name === 'visiteur').id
    }
  ]);
  await knex.raw(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
};
