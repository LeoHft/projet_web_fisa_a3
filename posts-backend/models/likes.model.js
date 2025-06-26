const { Model } = require('objection');

class Like extends Model {
  static get tableName() {
    return 'likes';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'postId'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        postId: { type: 'integer' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Post = require('./posts.model');

    return {
      post: {
        relation: Model.BelongsToOneRelation,
        modelClass: Post,
        join: {
          from: 'likes.postId',
          to: 'posts.id'
        }
      },
    };
  }
}

module.exports = Like;
