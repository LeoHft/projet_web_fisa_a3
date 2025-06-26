const { Model } = require('objection');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'password', 'email'],

            properties: {
                id: { type: 'integer' },
                username: { type: 'string', minLength: 1, maxLength: 255 },
                bio: { type: 'string', maxLength: 280, default: '' },
                password: { type: 'string', minLength: 6, maxLength: 255 },
                email: { type: 'string', format: 'email', maxLength: 255 },
                roleId: { type: 'integer' },
                createdAt: { type: 'string', format: 'date-time', default: new Date().toISOString() },
                updatedAt: { type: 'string', format: 'date-time', default: new Date().toISOString() },
                lastLogin: { type: 'string', format: 'date-time', default: new Date().toISOString() },
                completed: { type: 'boolean', default: false },
            }
        };
    }

}


module.exports = User;
