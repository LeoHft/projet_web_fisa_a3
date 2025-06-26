const { Model } = require('objection');

class Role extends Model {
    static get tableName() {
        return 'roles';
    }

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',

            properties: {
                id: { type: 'integer' },
                name: { type: 'string', minLength: 1, maxLength: 255 },
                description: { type: 'string', minLength: 1, maxLength: 255 },
                createdAt: { type: 'string', format: 'date-time', default: new Date().toISOString() }
            }
        };
    }

}


module.exports = Role;
