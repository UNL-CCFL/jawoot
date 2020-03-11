
exports.seed = function(knex) {
  return knex('quizzes').insert([
    {title: "Test Quiz From Seeder"},
  ])
  .returning('*')
  .then((quiz) => {
    quiz = quiz[0];

    return knex('questions').insert([
        {
          quiz_id: quiz.quiz_id,
          question_type: 'MultipleChoice',
          question: "How much wood would a wood chuck chuck if a wood chuck could chuck wood?",
          question_order: 0,
          time_limit: 20,
        },
        {
          quiz_id: quiz.quiz_id,
          question_type: 'MultipleChoice',
          question: "What runs around the whole yard without moving?",
          question_order: 1,
          time_limit: 20,
        },
      ])
      .returning('*')
      .then((question) => {
        let question1 = question[0],
          question2 = question[1];

        return knex('answers').insert([
            {
              question_id: question1.question_id,
              answer: "All of it",
              answer_order: 0,
              is_correct: true,
            },
            {
              question_id: question1.question_id,
              answer: "Most of it",
              answer_order: 1,
              is_correct: false,
            },
            {
              question_id: question1.question_id,
              answer: "Some of it",
              answer_order: 2,
              is_correct: false,
            },
            {
              question_id: question1.question_id,
              answer: "None of it",
              answer_order: 3,
              is_correct: false,
            },

            {
              question_id: question2.question_id,
              answer: "A snail",
              answer_order: 0,
              is_correct: false,
            },
            {
              question_id: question2.question_id,
              answer: "A tree",
              answer_order: 1,
              is_correct: false,
            },
            {
              question_id: question2.question_id,
              answer: "A fence",
              answer_order: 2,
              is_correct: true,
            },
          ]).then();
      });
  });
};
