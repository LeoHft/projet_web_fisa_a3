const { Model } = require('objection');
const User = require('./users.model');


class Follows extends Model {
    static get tableName() {
        return 'follows';
    } 

    static get idColumn() {
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['followerId', 'followedId'],

            properties: {
                id: {type: 'integer'},
                followerId: {type: 'integer'},
                followedId: {type: 'integer'},
                createdAt: { type: 'string', format: 'date-time', default: new Date().toISOString() }
            }
        };
    }


  static get relationMappings() {
    return {
      follower: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'follows.followerId',
        to: 'users.id',
      },
      modify: (query) => {
        query.select('username', 'email');
      },
      },

      followed: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'follows.followedId',
        to: 'users.id',
      },
      modify: (query) => {
        query.select('username', 'email');
      },
      },
    };
  }
}


module.exports = Follows;
