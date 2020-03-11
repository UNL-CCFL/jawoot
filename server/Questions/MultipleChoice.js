let MultipleChoiceQuestion = require("../question.js");
const Answer = require('../answer.js');

MultipleChoiceQuestion.saveAnswers = async function(answers, question_id) {
  if (answers.length >= 2 && answers.length <= 4) {
    let validAnswers = 0;
    for (let i in answers) {
      let answer = answers[i];
      answer.answer = answer.answer.trim();

      if (answer.answer !== '') {
        answer.question_id = question_id;
        answer.answer_id = parseInt(answer.answer_id);
        answer.answer_order = parseInt(answer.answer_order);
        if (answer.answer_id > 0) {
          answers[i] = await Answer.update(answer);
        }
        else {
          answers[i] = await Answer.create(answer, question_id);
        }
        validAnswers++;
      }
      else {
        let questionNumber = parseInt(i)+1;
        throw("Answer for question #"+questionNumber+" cannot be empty")
      }
    }

    return answers;
  }
  else {
    throw("A multiplechoice question needs at least 2 answers and no more than 4")
  }

};


module.exports = MultipleChoiceQuestion;
