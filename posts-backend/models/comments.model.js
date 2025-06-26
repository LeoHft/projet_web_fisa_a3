const { Model } = require('objection');
const Post = require('./posts.model');

class Comment extends Model {
  static get tableName() {
    return 'comments';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'content'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        postId: { type: 'integer' },
        parentId: { type: ['integer', 'null'] },
        content: { type: 'string', minLength: 1, maxLength: 280 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
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
          from: 'comments.postId',
          to: 'posts.id'
        }
      },
      parentComment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Comment,
        join: {
          from: 'comments.parentId',
          to: 'comments.id'
        }
      }
    };
  }
}

module.exports = Comment;
