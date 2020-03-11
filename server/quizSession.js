const db = require('./db');
const knex = require('../knex/knex.js');
const quiz = require('./quiz');

module.exports = {
  fetchArrayByCode: (code) => {
    return knex('quiz_sessions')
      .join('quizzes', 'quizzes.quiz_id', '=', 'quiz_sessions.quiz_id')
      .where('quiz_sessions.code', code)
      .where('quiz_sessions.deleted_at', null)
      .then((rows) => {
        if (rows.length == 0) {
          throw "Could not find session";
          return;
        }
        return rows[0];
      });
  },
  fetchArray: () => {
    return knex('quiz_sessions')
      .join('quizzes', 'quizzes.quiz_id', '=', 'quiz_sessions.quiz_id')
      .where('quiz_sessions.deleted_at', null)
      .orderBy('quiz_sessions.created_at', 'desc')
      .then((rows) => {
        return rows;
      });
  },
  get: (request, response, next) => {

    let session = module.exports.fetchArrayByCode(request.params.code);

    session.then((session) => {
      session.average_score /= 100;
      session.question_results = JSON.parse(session.question_results);
      if (session.question_results != null) {
        quiz.fetchArray(session.quiz_id).then((quiz) => {
          for (let index in quiz.questions) {
            let question_id = quiz.questions[index].question_id;
            if (session.question_results[question_id] != undefined) {
              quiz.questions[index].total_attempts = session.question_results[question_id].total_attempts;
              quiz.questions[index].correct_attempts = session.question_results[question_id].correct_attempts;
            }
            for (let answer_index in quiz.questions[index].answers) {
              let answer_id = quiz.questions[index].answers[answer_index].answer_id;
              if (session.question_results[question_id].answers[answer_id] != undefined) {
                quiz.questions[index].answers[answer_index].selected_count = session.question_results[question_id].answers[answer_id].selected_count;
              }
              else {
                quiz.questions[index].answers[answer_index].selected_count = 0;
              }
            }
          }
          session.quiz = quiz;
          return response.status(200).json({session: session});
        });
      }
      else {
        return response.status(200).json({session: session});
      }
    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  getList: (request, response, next) => {
    const Sessions =  knex('quiz_sessions')
      .join('quizzes', 'quizzes.quiz_id', '=', 'quiz_sessions.quiz_id')
      .where('quiz_sessions.deleted_at', null)
      .orderBy('quiz_sessions.created_at', 'desc');

    if (request.query.active == '1') {
      Sessions.where('completed_at', null);
    }
    else {
      Sessions.whereNot('completed_at', null);
    }

    Sessions.then((rows) => {
      return response.status(200).json({sessions: rows});
    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  create: (request, response, next) => {
    let quiz_id = parseInt(request.body.quiz_id);
    if (quiz_id != NaN && quiz_id != 0) {
      let quizForSession = quiz.fetchObject(quiz_id).then((rows) => {
        let code = Math.round(Math.random() * (999999 - 99999) + 99999);
        const QuizSessions = (knex('quiz_sessions'));
        return QuizSessions.insert({
          quiz_id: quiz_id,
          code: code,
        })
        .returning('*')
        .then((row) => {
          return response.status(200).json({quiz_session: row[0]});
        }).catch((error) => {
          response.status(500).json({error: true, message: error});
          throw error;
        });
      })
      .catch((error) => {
        response.status(500).json({error: true, message: error});
      });
      return;

    }
  },
  delete: (request, response, next) => {
    let session = module.exports.fetchArrayByCode(request.params.code);
    session.then((session) => {
      knex('quiz_sessions')
        .where({ session_id: session.session_id })
        .update({
            deleted_at: 'NOW()',
          })
        .then();
      return response.status(200).json({success:true});
    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  saveResults: (results) => {
    for (let question_id in results) {
      const Question = (knex('questions')).where({'question_id': question_id});
      Question.update({
        total_attempts: knex.raw("total_attempts + "+results[question_id].total_attempts),
        correct_attempts: knex.raw("correct_attempts + "+results[question_id].correct_attempts),
      }).then();
    }
  },
  saveAnswerCounts: (answerCounts) => {
    for (let answer_id in answerCounts) {
      const Answer = (knex('answers')).where({'answer_id': answer_id});
      Answer.update({
        selected_count: knex.raw("selected_count + "+answerCounts[answer_id]),
      }).then();
    }
  },
}
