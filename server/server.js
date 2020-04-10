const express = require('express');
const router = require('express').Router();
const Cors = require('cors');
const util = require('util');
const socket = require('socket.io');
const BodyParser = require("body-parser");
const session = require("express-session");
const knex = require('../knex/knex.js');
const KnexSessionStore = require("connect-session-knex")(session);
const JWTHandler = require('./JWTHandler');
const dotenv = require('dotenv');
dotenv.config();

const quizSession = require('./quizSession');
const quiz = require('./quiz');
const {ActiveSession} = require('./ActiveSession');
const {Player} = require('./Player');

let app = express();

let clientCount = 0;
let ActiveSessions = {};
let ActiveQuizzes = {};
let Players = {};

quizSession.fetchArray().then((sessions) => {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].completed_at == null) {
      quiz.fetchArray(sessions[i].quiz_id).then((quiz) => {
        ActiveSessions[sessions[i].code] = new ActiveSession(sessions[i].code, quiz);
      });
    }
  }
});

function nextQuestion(session_code) {
  let q = ActiveSessions[session_code].getCurrentQuestion();
  if (q.time_limit == 0) {
    q.time_limit = false;
  }
  io.to(session_code).emit('questionCountdown', q);
  ActiveSessions[session_code].gameStatusQuestionCountdown();
  setTimeout(function() {
    let q = ActiveSessions[session_code].getCurrentQuestion();
    io.to(session_code).emit('selectAnswer');
    ActiveSessions[session_code].gameStatusSelectAnswer();
    if (q.time_limit) {
      ActiveSessions[session_code].questionStartTime = Date.now();
      ActiveSessions[session_code].timeout = setTimeout(function() {
        let results = ActiveSessions[session_code].generateResultsForQuestion(q.question_order);
        ActiveSessions[session_code].gameStatusCurrentResult();
        for (let socket_id in ActiveSessions[session_code].players) {
          let result = ActiveSessions[session_code].players[socket_id].answers[ActiveSessions[session_code].currentQuestion];
          //players: Question Result - their answer result
          io.to(socket_id).emit('currentResult', result);
        }
        //host: Question results and correct answer
        //store host's socket it in activesssion, and send this direct instead of to channel?
        io.to(ActiveSessions[session_code].host.socket_id).emit('currentResult', ActiveSessions[session_code].results);
      }, q.time_limit*1000+100);
    }

  }, 5000);
}

io = socket(app.listen(process.env.SOCKETIOPORT, () => { console.log(`Socket.IO listening on port ${process.env.SOCKETIOPORT}`)}));

io.on('connection', function(socket){

  if (JWTHandler.validateJWT(socket.handshake.query.token)) {
    socket.on('sessionStarted', function(session_code, quiz_id) {
      if (ActiveSessions[session_code] == undefined) {
        quiz.fetchArray(quiz_id).then((new_session_quiz) => {
          ActiveSessions[session_code] = new ActiveSession(session_code,new_session_quiz);
        });
      }
    });

    socket.on('startGame', function(params) {
      if (ActiveSessions[params.session_code] != undefined) {
        ActiveSessions[params.session_code].startGame();
        io.to(params.session_code).emit('getReady');
        socket.emit('gameStarted');
        setTimeout(function() {
          nextQuestion(params.session_code);
        }, 4500);
        knex.raw("update quizzes set quiz_attempts = quiz_attempts + 1 where quiz_id = "+ActiveSessions[params.session_code].quiz.quiz_id).then();
      }
      else {
        socket.emit('gameStartError', "Game's session is not active.");
      }
    });

    socket.on('finishGame', function(params) {
      if (ActiveSessions[params.session_code] != undefined) {
        clearTimeout(ActiveSessions[params.session_code].timeout);
        ActiveSessions[params.session_code].endGame();
        ActiveSessions[params.session_code].gameStatusOverallResults();
        io.to(params.session_code).emit('gameFinished');
        io.to(params.session_code).emit('overallResults', ActiveSessions[params.session_code].scoreboard());
        knex.raw("update quiz_sessions set completed_at = NOW() where code = "+ActiveSessions[params.session_code].session_code).then();

        quizSession.session_code = ActiveSessions[params.session_code].session_code;
        quizSession.saveResults(ActiveSessions[params.session_code].getAllQuestionResults());
        quizSession.saveAnswerCounts(ActiveSessions[params.session_code].getAnswerCounts());

        const Session = (knex('quiz_sessions')).where({'code': ActiveSessions[params.session_code].session_code});
        Session.update({
          player_count: Object.keys(ActiveSessions[params.session_code].players).length,
        }).then();

        delete ActiveSessions[params.session_code];
      }
    });

    socket.on('nextQuestion', function(params) {
      if (ActiveSessions[params.session_code] != undefined) {
        ActiveSessions[params.session_code].nextQuestion();
        nextQuestion(params.session_code);
      }
    });

    socket.on('scoreboard', function(params) {
      if (ActiveSessions[params.session_code] != undefined) {
        socket.emit('scoreboard', ActiveSessions[params.session_code].scoreboard());
      }
    });

    socket.on('hostJoin', function(params) {
      if (ActiveSessions[params.session_code] != undefined) {
        socket.join(params.session_code);
        ActiveSessions[params.session_code].host = {socket_id: socket.id};
        io.to(params.session_code).emit('players', ActiveSessions[params.session_code].players);
        socket.emit('quiz', ActiveSessions[params.session_code].quiz);
        if (ActiveSessions[params.session_code].gameStarted && !ActiveSessions[params.session_code].gameFinished) {
          socket.emit('gameStarted');
          let q = ActiveSessions[params.session_code].quiz.questions[ActiveSessions[params.session_code].currentQuestion];
          socket.emit('nextQuestion', q);

          if (ActiveSessions[params.session_code].gameStatus == 'currentResult') {
            let results = ActiveSessions[params.session_code].generateResultsForQuestion(ActiveSessions[params.session_code].currentQuestionIndex());
            socket.emit('currentResult', ActiveSessions[params.session_code].results);
          }
          else if (ActiveSessions[params.session_code].gameStatus == 'getReady') {
            socket.emit('getReady');
          }
          else if (ActiveSessions[params.session_code].gameStatus == 'questionCountdown') {
            socket.emit('questionCountdown', q);
          }
          else if (ActiveSessions[params.session_code].gameStatus == 'selectAnswer') {
            socket.emit('selectAnswer');
          }
          else if (ActiveSessions[params.session_code].gameStatus == 'scoreboard') {
            socket.emit('scoreboard', ActiveSessions[params.session_code].scoreboard());
          }
        }
        if (ActiveSessions[params.session_code].gameFinished) {
          socket.emit('gameFinished');
          socket.emit('overallResults', ActiveSessions[params.session_code].scoreboard());
        }
      }
      else {
        socket.emit('joinError');
      }
    });
  }

  clientConnected(this);
  socket.on('disconnect', function() {
    clientDisconnected(this);
    if (Players[socket.id] != undefined) {
      let player = Players[socket.id];
      if (ActiveSessions[player.session_code] != undefined) {
        ActiveSessions[player.session_code].playerLeft(socket.id);
        io.to(player.session_code).emit('players', ActiveSessions[player.session_code].players)
      }
    }
  });

  socket.on('playerLeave', function(params) {
    if (ActiveSessions[params.session_code] != undefined) {
      ActiveSessions[params.session_code].playerLeft(socket.id);
      io.to(params.session_code).emit('players', ActiveSessions[params.session_code].players)
    }
  });

  socket.on('playerAnswered', function(params) {
    let player = Players[socket.id],
      activeSession = ActiveSessions[player.session_code],
      currentQuestion = activeSession.getCurrentQuestion();
    if (currentQuestion != undefined) {
      let answer;
      for (let i = 0; i < currentQuestion.answers.length; i++) {
        if (currentQuestion.answers[i].answer_id == params.answer_id) {
          answer = currentQuestion.answers[i];
          break;
        }
      }
      ActiveSessions[player.session_code].playerAnswered(socket.id,answer);
      socket.emit('waitingOnAnswers');
      if (ActiveSessions[player.session_code].allPlayersAnswered(currentQuestion.question_order)) {
        clearTimeout(ActiveSessions[player.session_code].timeout);
        let results = ActiveSessions[player.session_code].generateResultsForQuestion(currentQuestion.question_order);

        for (let socket_id in ActiveSessions[player.session_code].players) {
          let result = ActiveSessions[player.session_code].players[socket_id].answers[ActiveSessions[player.session_code].currentQuestion];
          //players: Question Result - their answer result
          io.to(socket_id).emit('currentResult', result);
        }

        ActiveSessions[player.session_code].gameStatusCurrentResult();

        io.to(ActiveSessions[player.session_code].host.socket_id).emit('currentResult', ActiveSessions[player.session_code].results);
      }
    }
  });

  socket.on('playerJoin', function(params) {
    let session = quizSession.fetchArrayByCode(params.session_code);
    session.then((session) => {
      if (ActiveSessions[params.session_code] != undefined) {
        if (1==1 || ActiveSessions[params.session_code].gameStarted == false) {
          if (params.socket_id != undefined) {
            //rejoin a player who is reconnecting only to the same session
            if (Players[params.socket_id] !== undefined && params.session_code == Players[params.socket_id].session_code) {
              Players[socket.id] = JSON.parse(JSON.stringify(Players[params.socket_id]));
              Players[socket.id].socket_id = socket.id;
              console.log(Players[socket.id]);
              if (params.session_name !== undefined && params.session_name != '') {
                Players[socket.id].name = params.session_name;
              }
              delete Players[params.socket_id];
            }
            ActiveSessions[params.session_code].removePlayer(params.socket_id);
          }
          if (Players[socket.id] === undefined) {
            Players[socket.id] = new Player({socket_id: socket.id, name: params.session_name, session_code: params.session_code});
          }
          ActiveSessions[params.session_code].addPlayer(Players[socket.id]);


          socket.emit('joinSuccess', {session: session, playerName: params.session_name, socket_id: socket.id});
          socket.join(params.session_code);
          io.to(params.session_code).emit('players', ActiveSessions[params.session_code].players)
          if (ActiveSessions[params.session_code].gameStarted && !ActiveSessions[params.session_code].gameFinished) {
            socket.emit('gameStarted');
            let q = ActiveSessions[params.session_code].quiz.questions[ActiveSessions[params.session_code].currentQuestion];
            socket.emit('nextQuestion', q);

            if (ActiveSessions[params.session_code].gameStatus == 'currentResult') {
              let results = ActiveSessions[params.session_code].generateResultsForQuestion(ActiveSessions[params.session_code].currentQuestionIndex());

              for (let i = 0; i < ActiveSessions[params.session_code].quiz.questions.length; i++) {
                if (ActiveSessions[params.session_code].players[socket.id].answers[i] !== false) {
                  socket.emit('currentResult', ActiveSessions[params.session_code].players[socket.id].answers[i]);
                }
              }
            }
            else if (ActiveSessions[params.session_code].gameStatus == 'getReady') {
              socket.emit('getReady');
            }
            else if (ActiveSessions[params.session_code].gameStatus == 'questionCountdown') {
              socket.emit('questionCountdown', q);
            }
            else if (ActiveSessions[params.session_code].gameStatus == 'selectAnswer') {
              socket.emit('selectAnswer');
            }
            else if (ActiveSessions[params.session_code].gameStatus == 'scoreboard') {
              socket.emit('scoreboard', ActiveSessions[params.session_code].scoreboard());
            }
            else if (ActiveSessions[params.session_code].gameFinished) {
              socket.emit('overallResults', ActiveSessions[params.session_code].scoreboard());
            }

          }
          else if (ActiveSessions[params.session_code].gameFinished) {
            socket.emit('gameStartedAndFinished');
          }
        }
        else {
          socket.emit('joinError', "Sorry, the game has already started and you can no longer join");
        }
      }
      else {
        socket.emit('joinError', "Sorry, we couldn't find that session.");
      }
    }).catch((error) => {
      socket.emit('gameNotFound');
      throw error;
    });
  });

});

function clientConnected(io) {
  clientCount++;
  console.log('Client connected, count: '+clientCount);
  io.emit('activeClients', clientCount);
  io.emit('connected', clientCount);
}

function clientDisconnected(io) {
  clientCount--;
  io.emit('activeClients', clientCount);
  console.log('Client disconnected, count: '+clientCount);
}

app = express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

const store = new KnexSessionStore({
  knex: knex,
});

app.use(Cors({ origin: [`${process.env.PROTOCOL}://${process.env.HOST}`], credentials: true }));
app.use(session({
  secret: process.env.SESSIONSECRET,
  cookie: {
    secure: false,
    maxAge: 60*60*24*1000,
  },
  saveUninitialized: true,
  resave: true,
  store: store,
}));

app.use(require('./routes'));

app.listen(process.env.APIPORT, function(){
  console.log(`API listening on port ${process.env.APIPORT}`);
});
