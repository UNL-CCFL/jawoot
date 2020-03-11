const db = require('./db');
const knex = require('../knex/knex.js');

module.exports = {
  get: (id) => {
  },
  update: answer => {
    if (answer.answer != '' && answer.answer != null) {
      if (parseInt(answer.answer_id) == 0) {
        return module.exports.create(answer);
      }
      const Answer = (knex('answers')).where({'answers.answer_id': answer.answer_id});
      return Answer.update({
        answer: answer.answer,
        answer_order: answer.answer_order,
        question_id: answer.question_id,
        is_correct: answer.is_correct === 'true' || answer.is_correct === true ? true : false,
      })

      .returning('*')
      .then((rows) => {
        return rows[0];
      });
    }
  },
  create: (answer) => {
    if (answer.answer != '' && answer.answer != null) {
      const Answer = (knex('answers'));
      return Answer.insert({
        answer: answer.answer,
        answer_order: parseInt(answer.answer_order),
        question_id: answer.question_id,
        is_correct: answer.is_correct === 'true' || answer.is_correct === true ? true : false,
      })
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
    }
  },
}
