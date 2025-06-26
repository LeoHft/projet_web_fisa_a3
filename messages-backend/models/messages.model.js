const { Model } = require('objection');

class Message extends Model {
  static get tableName() {
    return 'messages';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['senderId', 'receiverId', 'text', 'isSharing', 'sharedId'],

      properties: {
        id: { type: 'integer' },
        senderId: { type: 'integer' },
        receiverId: { type: 'integer' },
        text: { type: 'string' },
        isSharing: { type: 'boolean' },
        sharedId: { type: ['integer', 'null'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
    };
  }
}

module.exports = Message;
