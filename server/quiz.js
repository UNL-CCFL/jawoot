const db = require('./db');
const knex = require('../knex/knex.js');
//const Question = require('./question.js');
const MultipleChoice = require('./Questions/MultipleChoice.js');

module.exports = {
  questionTypes: [
    'MultipleChoice',
  ],
  fetchObject: async (id) => {
    const Quizzes = knex('quizzes')
      .select('*', 'quizzes.quiz_id as quiz_id', 'questions.question_id as question_id')
      .leftJoin('questions', 'quizzes.quiz_id', '=', 'questions.quiz_id')
      .leftJoin('answers', 'questions.question_id', '=', 'answers.question_id')
      .where('quizzes.deleted_at', null)
      .orderBy('question_order', 'asc')
      .orderBy('answer_order', 'asc');

    if (Array.isArray(id)) {
      Quizzes.whereIn('quizzes.quiz_id', id);
    }
    else {
      Quizzes.where('quizzes.quiz_id', id);
    }

    return Quizzes.then((rows) => {
      if (rows.length == 0) {
        throw "Could not find quiz";
        return;
      }
      let quiz = {
        'quiz_id': rows[0].quiz_id,
        'title': rows[0].title,
        'quiz_attempts': rows[0].quiz_attempts,
        'created_at': rows[0].created_at,
        'deleted_at': rows[0].deleted_at,
        'questions': {},
      };

      for (let row of rows) {
        if (quiz.questions[row.question_id] == undefined) {
          let answer_id = row.answer_id;
          if (row.question_id == null || row.answer_id == null) {
            continue;
          }

          quiz.questions[row.question_id] = {
            'question_id': row.question_id,
            'question': row.question,
            'question_order': row.question_order,
            'question_type': 'MultipleChoice',
            'time_limit': row.time_limit,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
            'answers': {},
          };
          quiz.questions[row.question_id].answers[row.answer_id] = {
            'answer_id': row.answer_id,
            'answer': row.answer,
            'answer_order': row.answer_order,
            'selected_count': row.selected_count,
            'is_correct': row.is_correct,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
          };
        }
        else {
          quiz.questions[row.question_id].answers[row.answer_id] = {
            'answer_id': row.answer_id,
            'answer': row.answer,
            'answer_order': row.answer_order,
            'selected_count': row.selected_count,
            'is_correct': row.is_correct,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
          };
        }
      }
      return quiz;
    });
  },
  fetchArray: (id) => {

    const Quizzes = knex('quizzes')
      .select('*', 'quizzes.quiz_id as quiz_id', 'questions.question_id as question_id')
      .where('quizzes.deleted_at', null)
      .leftJoin('questions', 'quizzes.quiz_id', '=', 'questions.quiz_id')
      .leftJoin('answers', 'questions.question_id', '=', 'answers.question_id')
      .orderBy('question_order', 'asc')
      .orderBy('answer_order', 'asc');

    if (Array.isArray(id)) {
      Quizzes.whereIn('quizzes.quiz_id', id);
    }
    else {
      Quizzes.where('quizzes.quiz_id', id);
    }

    return Quizzes.then((rows) => {
      if (rows.length == 0) {
        throw "Could not find quiz";
        return;
      }
      let quiz = {
        'quiz_id': rows[0].quiz_id,
        'title': rows[0].title,
        'quiz_attempts': rows[0].quiz_attempts,
        'created_at': rows[0].created_at,
        'deleted_at': rows[0].deleted_at,
        'questions': [],
      };

      let i = -1,
        lastID = 0;
      for (let row of rows) {
        if (lastID !== row.question_id) {
          lastID = row.question_id;
          i++;
        }
        if (quiz.questions[i] == undefined) {
          let answer_id = row.answer_id;
          if (row.question_id == null || row.answer_id == null) {
            continue;
          }

          quiz.questions.push({
            'question_id': row.question_id,
            'question': row.question,
            'question_order': row.question_order,
            'question_type': row.question_type,
            'time_limit': row.time_limit,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
            'total_attempts': row.total_attempts,
            'correct_attempts': row.correct_attempts,
            'answers': [],
          });
          quiz.questions[i].answers.push({
            'answer_id': row.answer_id,
            'answer': row.answer,
            'answer_order': row.answer_order,
            'selected_count': row.selected_count,
            'is_correct': row.is_correct,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
          });
        }
        else {
          quiz.questions[i].answers.push({
            'answer_id': row.answer_id,
            'answer': row.answer,
            'answer_order': row.answer_order,
            'selected_count': row.selected_count,
            'is_correct': row.is_correct,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
          });
        }
      }
      return quiz;
    });
  },
  get: (request, response, next) => {
    let quiz = module.exports.fetchArray(request.params.id);
    quiz.then((quiz) => {
      return response.status(200).json({quiz: quiz});
    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  getList: (request, response, next) => {
    const Quizzes = () => knex('quizzes')
      .select('*', 'quizzes.quiz_id as quiz_id', 'questions.question_id as question_id')
      .leftJoin('questions', 'quizzes.quiz_id', '=', 'questions.quiz_id')
      .where('quizzes.deleted_at', null)
      .orderBy('quizzes.created_at', 'desc');

    Quizzes().then((rows) => {
      let quizzes = {};
      for (let row of rows) {
        if (quizzes[row.quiz_id] == undefined) {
          quizzes[row.quiz_id] = {
            'quiz_id': row.quiz_id,
            'title': row.title,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
            'quiz_attempts': row.quiz_attempts,
            'questions': [],
          };
          if (row.question_id !== null) {
            quizzes[row.quiz_id].questions.push({
              'question_id': row.question_id,
              'question': row.question,
              'question_order': row.question_order,
              'question_type': 'MultipleChoice',
              'time_limit': row.time_limit,
              'created_at': row.created_at,
              'deleted_at': row.deleted_at,
              'total_attempts': row.total_attempts,
              'correct_attempts': row.correct_attempts,
              'question_type': row.question_type,
            });
          }
        }
        else {
          quizzes[row.quiz_id].questions.push({
            'question_id': row.question_id,
            'question': row.question,
            'question_order': row.question_order,
            'question_type': 'MultipleChoice',
            'time_limit': row.time_limit,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
            'total_attempts': row.total_attempts,
            'correct_attempts': row.correct_attempts,
            'question_type': row.question_type,
          });
        }
      }
      return response.status(200).json({quizzes: quizzes});
    }).catch((error) => {
      response.status(400).json({error: true, message: error});
      throw error;
    });
  },
  update: async (request, response, next) => {
    let quiz = await module.exports.fetchObject(request.params.id).then((quiz) => {
        return quiz;
      })
      .catch(function(error) {
        return response.status(500).json({'message': 'Error fetching quiz'});
      });

    if (quiz) {
      const Quiz = (knex('quizzes')).where({'quizzes.quiz_id': request.params.id});
        Quiz.update({
          title: request.body.title,
        }).then();

        for (let i in request.body.questions) {
          let question = request.body.questions[i],
            questionTypeIndex = module.exports.questionTypes.indexOf(question.question_type),
            questionType = null;
          question.question_order = i;

          try {
            if (questionTypeIndex >= 0) {
              questionType = module.exports.questionTypes[questionTypeIndex];

              let Question = eval(questionType);

              if (question.question_id > 0) {
                quiz.questions[question.question_id] = await Question.update(question);
              }
              else {
                let tempQ = await Question.create(question, quiz.quiz_id);
                delete quiz.questions[i];
                quiz.questions[tempQ.question_id] = tempQ;
              }
            }
            else {
              throw "Invalid question type";
            }
          }
          catch(error) {
            console.log("question error", error)
            console.log("question", quiz.questions[i])
          }
        }

        if (request.body.removedQuestions.length) {
          knex('questions')
            .whereIn('question_id', request.body.removedQuestions)
            .del().then();
        }
        //delete all unmatched answers
        knex.raw("delete from answers where question_id not in (select question_id from questions)").then();

        if (request.body.removedAnswers.length) {
          knex('answers')
            .whereIn('answer_id', request.body.removedAnswers)
            .del().then();
        }

        await module.exports.fetchArray(quiz.id).then((quiz) => {
          return response.status(200).send({success: true, quiz: quiz})
        })
        .catch(function(error) {
          return response.status(500).json({'message': 'Error saving and fetching quiz'});
        });
    }
    else {
      return response.status(404).json({'message': 'Quiz not found'});
    }
  },
  create: async (request, response, next) => {
    db.query('INSERT INTO quizzes (title) VALUES ($1) RETURNING *', [request.body.title], async (error, result) =>  {
      if (error) {
        return next(error)
      }
      let quiz = result.rows[0];
      quiz.questions = {};

      for (let i in request.body.questions) {
        let question = request.body.questions[i],
          questionTypeIndex = module.exports.questionTypes.indexOf(question.question_type),
          questionType = null;
        question.question_order = i;

        try {
          if (questionTypeIndex >= 0) {
            questionType = module.exports.questionTypes[questionTypeIndex];

            let Question = eval(questionType);

            if (question.question_id > 0) {
              quiz.questions[question.question_id] = await Question.update(question);
            }
            else {
              let tempQ = await Question.create(question, quiz.quiz_id);
              delete quiz.questions[i];
              quiz.questions[tempQ.question_id] = tempQ;
            }
          }
          else {
            throw "Invalid question type";
          }
        }
        catch(error) {
          console.log("question error", error)
          console.log("question", quiz.questions[i])
        }
      }
      await module.exports.fetchArray(quiz.quiz_id).then((quiz) => {
        return response.status(200).send({success: true, quiz: quiz})
      })
      .catch(function(error) {
        return response.status(500).json({'message': 'Error saving and fetching quiz'});
      });
    });
  },
  delete: (request, response, next) => {
    let quiz = module.exports.fetchObject(request.params.id);
    quiz.then((quiz) => {
      knex('quizzes')
        .where({ quiz_id: quiz.quiz_id })
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
}
