/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('roles').del()
  await knex('roles').insert([
    {name: 'administrateur', description: 'Administrateur de l\'application', id:1},
    {name: 'moderateur', description: 'Modérateur du contenu', id:2},
    {name: 'utilisateur', description: 'Utilisateur standard', id:3},
    {name: 'visiteur', description: 'Utilisateur invité avec accès limité', id:4},
  ]);
};
