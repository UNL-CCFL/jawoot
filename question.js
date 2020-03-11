const db = require('./db');
const knex = require('../knex/knex.js');
const Answer = require('./answer.js');

module.exports = {
  get: (id) => {
  },
  saveAnswers(answers, question_id) {
    throw "Undefined saveAnswers method for question type";
  },
  update: async (question) => {
    return await knex.transaction(function(trx) {
      knex.update({
            question: question.question,
            time_limit: question.time_limit,
            question_order: question.question_order,
            question_type: question.question_type,
          })
        .table('questions')
        .where({'questions.question_id': question.question_id})
        .returning('*')
        .transacting(trx)
        .then(function(update) {
          question.question_id = update[0].question_id;
          question.title = update[0].title;
          return module.exports.saveAnswers(question.answers, update[0].question_id);
        })
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .then(function(answers) {
        question.answers = answers;
        return question;
      })
      .catch(function(error) {
        console.error('ugh2', error);
      });
  },
  create: async (question, quiz_id) => {
    return await knex.transaction(function(trx) {
      knex.insert({
            question: question.question,
            time_limit: question.time_limit,
            question_order: question.question_order,
            quiz_id: quiz_id,
            question_type: question.question_type,
          })
        .into('questions')
        .returning('*')
        .transacting(trx)
        .then(function(insert) {
          question.question_id = insert[0].question_id;
          question.title = insert[0].title;
          return module.exports.saveAnswers(question.answers, insert[0].question_id);
        })
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .then(function(answers) {
        question.answers = answers;
        return question;
      })
      .catch(function(error) {
        // no inserts
        console.error('ugh2', error);
      });
  },
}
