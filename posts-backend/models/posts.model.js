const { Model } = require('objection');

class Post extends Model {
    static get tableName() {
        return 'posts';
    }

    static get idColumn(){
        return 'id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['userId', 'content'],

            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                content: { type: 'string', minLength: 1, maxLength: 500 },
                likeCount: { type: 'integer', default: 0 },
                commentCount: { type: 'integer', default: 0 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const Like = require('./likes.model');
        return {
            likes: {
                relation: Model.HasManyRelation,
                modelClass: Like,
                join: {
                    from: 'posts.id',
                    to: 'likes.postId'
                }
            }
        };
    }

}

module.exports = Post;