const knex = require('../knex/knex.js');
const quizSession = require('./quizSession.js');

class ActiveSession {
  constructor(session_code, quiz) {
    this.session_code = session_code;
    this.host = false;
    this.players = {};
    this.gameStarted = false;
    this.gameStatus = 'waitingOnGameToStart';
    // waitingOnGameToStart
    // getReady
    // questionCountdown
    // selectAnswer
    // currentResult
    // scoreboard
    // overallResults
    this.gameFinished = false;
    this.quiz = quiz;
    this.currentQuestion = 0;
    this.completedQuestions = {};
    this.questionStartTime = 0;
    this.results = {numberAnswered: 0};

    this.initializeResults();
  }

  addPlayer(player) {
    this.players[player.socket_id] = player;
    this.players[player.socket_id].active = true;
    if (this.players[player.socket_id].answers === undefined) {
      this.players[player.socket_id].answers = {};
    }
    for (let i = 0; i < this.quiz.questions.length; i++) {
      if (this.players[player.socket_id].answers[i] === undefined || this.players[player.socket_id].answers[i] === false) {
        this.players[player.socket_id].answers[i] = false;
      }
    }
    return true;
  }

  removePlayer(socket_id) {
    if (this.players[socket_id] !== undefined) {
      delete this.players[socket_id];
    }
  }

  playerLeft(socket_id) {
    if (this.players[socket_id] !== undefined) {
      this.players[socket_id].active = false;
    }
  }

  gameStatusWaitingOnGameToStart() {
    this.gameStatus = 'waitingOnGameToStart';
  }

  gameStatusGetReady() {
    this.gameStatus = 'getReady';
  }

  gameStatusQuestionCountdown() {
    this.gameStatus = 'questionCountdown';
  }

  gameStatusSelectAnswer() {
    this.gameStatus = 'selectAnswer';
  }

  gameStatusCurrentResult() {
    this.gameStatus = 'currentResult';
  }

  gameStatusScoreboard() {
    this.gameStatus = 'scoreboard';
  }

  gameStatusOverallResults() {
    this.gameStatus = 'overallResults';
  }

  startGame() {
    this.gameStarted = true;
    this.gameStatusGetReady();
  }

  endGame() {
    this.gameStarted = false;
    this.gameFinished = true;
  }

  nextQuestion() {
    this.completedQuestions[this.currentQuestion] = true;
    this.currentQuestion++;
    if (this.currentQuestion >= this.quiz.questions.length) {
      this.currentQuestion = this.quiz.questions.length - 1;
    }
  }

  allPlayersAnswered(question_order) {
    for (let session_id in this.players) {
      let player = this.players[session_id];
      if (player.active && (player.answers[question_order] == undefined || player.answers[question_order] == '')) {
        return false;
      }
    }
    return true;
  }

  currentQuestionID () {
    return this.quiz.questions[this.currentQuestion].question_id;
  }

  currentQuestionIndex () {
    return this.quiz.questions[this.currentQuestion].question_order;
  }

  currentQuestionIsComplete() {
    return this.completedQuestions[this.currentQuestionIndex()] != undefined;
  }

  getCurrentQuestion() {
    return this.quiz.questions[this.currentQuestion];
  }

  initializeResults() {
    for (let i = 0; i < this.quiz.questions.length; i++) {
      this.generateResultsForQuestion(i);
    }
  }

  getResultsForCurrentQuestion() {
    if (this.currentQuestion) {
      let question_id = this.quiz.questions[this.currentQuestion].question_id;
      return this.getResultsForQuestion(question_id);
    }
    return false;
  }

  getResultsForQuestion(question_id) {
    if (this.results[question_id] !== undefined) {
      return this.results[question_id];
    }
    return false;
  }

  generateResultsForQuestion(question_index) {
    let results = {
        answers: {},
        numberAnswered: 0,
      },
      question = this.quiz.questions[question_index];

    for (let i = 0; i < question.answers.length; i++) {
      let answer = question.answers[i];
      answer.numberAnswered = 0;
      results.answers[answer.answer_id] = answer;
    }

    for (let session_id in this.players) {
      let player = this.players[session_id];
      if (!player.active) {
        continue;
      }
      if (player.answers[question_index] == undefined) {
        this.players[session_id].answers[question_index] = false;
      }
      else {
        results.numberAnswered++;
        if (results.answers[player.answers[question_index].answer_id] != undefined) {
          results.answers[player.answers[question_index].answer_id].numberAnswered++;
        }
      }
    }
    this.results[question_index] = results;
    return results;
  }

  playerAnswered(player_socket_id, answer) {
    let pointsAvailable = 1000,
      questionTimeLimit = this.quiz.questions[this.currentQuestion].time_limit,
      pointsEarned = 0;

    if (!answer.is_correct) {
      pointsEarned = 0;
    }
    else if (questionTimeLimit) {
      let secondsToAnswer = (Date.now() - this.questionStartTime) / 1000,
        timeModifier = 1 - (secondsToAnswer / questionTimeLimit / 2);
      pointsEarned = Math.round(pointsAvailable * timeModifier);
    }
    else {
      if (this.results[this.currentQuestion].numberAnswered) {
        pointsEarned = Math.round(pointsAvailable / ((this.results[this.currentQuestion].numberAnswered / 6 ) + 1));
      }
      else {
        pointsEarned = pointsAvailable;
      }
    }

    this.players[player_socket_id].answers[this.currentQuestion] = {
      answer_id: answer.answer_id,
      is_correct: answer.is_correct,
      answered_at: Date.now(),
      points: pointsEarned,
    };
    this.players[player_socket_id].totalPoints += pointsEarned;
    this.results[this.currentQuestion].numberAnswered++;
  }

  scoreboard() {
    let util = require('util');
    let scoreboard = [];
    for (let player in this.players) {
      if (1==1 || this.players[player].active) {
        scoreboard.push({
          name: this.players[player].name,
          totalPoints: this.players[player].totalPoints,
          socket_id: this.players[player].socket_id,
          active: this.players[player].active,
        });
      }
    }

    scoreboard.sort(function(a, b) {
      return b.totalPoints - a.totalPoints;
    });
    return scoreboard;
  }

  getAnswerCounts() {
    let answerCounts = {};
    for (let player in this.players) {
      let answers = this.players[player].answers;
      for (let answer in answers) {
        if (answers[answer] == false) {
          //player didn't answer
          //ended early or they joined late
          continue;
        }
        else if (answerCounts[answers[answer].answer_id] == undefined) {
          answerCounts[answers[answer].answer_id] = 1;
        }
        else {
          answerCounts[answers[answer].answer_id]++;
        }
      }
    }
    return answerCounts;
  }

  getAllQuestionResults() {
    let player,
      question,
      answer,
      questionResults = {},
      total = 0,
      average_score,
      correct = 0;

    for (let question_index in this.quiz.questions) {
      question = this.quiz.questions[question_index];
      questionResults[question.question_id] = {
        total_attempts: 0,
        correct_attempts: 0,
        answers: {},
      };
      for (let answer_index in this.quiz.questions[question_index].answers) {
        answer = this.quiz.questions[question_index].answers[answer_index];
        questionResults[question.question_id].answers[answer.answer_id] = {};
        questionResults[question.question_id].answers[answer.answer_id].selected_count = 0;
      }
    }
    for (let socket_id in this.players) {
      player = this.players[socket_id];
      if (!player.active) {
        //continue;
      }
      for (let question_index in player.answers) {
        answer = player.answers[question_index];
        if (answer == false) {
          continue;
        }
        question = this.quiz.questions[question_index];
        questionResults[question.question_id].total_attempts++;
        total++;
        if (answer.is_correct) {
          questionResults[question.question_id].correct_attempts++;
          correct++;
        }
        questionResults[question.question_id].answers[answer.answer_id].selected_count++
      }
    }

    if (total != 0) {
      average_score = Math.round(correct / total * 10000);
    }
    else {
      average_score = 0;
    }

    knex('quiz_sessions').where({'code': this.session_code}).update({
      question_results: JSON.stringify(questionResults),
      average_score: average_score,
    }).then();
    return questionResults;
  }
}
module.exports = {ActiveSession};
