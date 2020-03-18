const router = require('express').Router();
const UUID = require("uuid");
const quiz = require('./quiz');
const user = require('./user');
const quizSession = require('./quizSession');
const {LoggedInUser} = require('./LoggedInUser');
const session = require("express-session");
const Token = require('csrf');
const CSRF = new Token();
const dotenv = require('dotenv');
dotenv.config();

function requireCSRF(request, response, next) {
  if (CSRF.verify(request.session.csrf_secret, request.headers['x-csrf-token'])) {
    return next();
  }
  return response.status(401).json({ message: "Bad CSRF Token"});
}

function requireAuth(request, response, next) {
  if (request.session.session_id && request.session.user != undefined) {
    return next();
  }
  else {
    return response.status(401).json({ message: "Unauthorized"});
  }
}

router.get("/session", (request, response, next) => {
  if (request.session.session_id == undefined) {
    request.session.session_id = UUID.v4();
    request.session.csrf_secret = CSRF.secretSync();
    request.session.csrf_token = CSRF.create(request.session.csrf_secret);
    request.session.save();
  }
  response.send({ session_id: request.session.session_id, csrf_token: request.session.csrf_token});
});

router.post("/session", (request, response, next) => {
  if(request.session.session_id != undefined && request.session.user != undefined) {
    return response.send({ message: "Success!!", user: request.session.user != undefined ? request.session.user : false});
  }
  return response.status(401).send({ message: "The data in the session does not match!" });
});

router.post("/login", (request, response, next) => {

  let username = request.body.username,
    password = request.body.password,
    authedUser = new LoggedInUser(username);

  authedUser.getUser(username).then((userRow) => {
    if (userRow !== undefined) {
      authedUser.setUser(userRow);
      if (authedUser.validatePassword(password)) {
        request.session.session_id = UUID.v4();
        request.session.user = authedUser.authObject();
        request.session.csrf_secret = CSRF.secretSync();
        request.session.csrf_token = CSRF.create(request.session.csrf_secret);
        request.session.save();
        return response.status(200)
          .header("Access-Control-Allow-Origin", `${process.env.PROTOCOL}://${process.env.HOST}`)
          .json({
            message: "Success!",
            user: request.session.user,
            csrf_token: request.session.csrf_token
          });
      }
    }
    response.status(500).json({ message: "error!" });
  });
});

router.post('/api/quiz', requireAuth, requireCSRF, quiz.create);
router.get('/api/quiz/:id', requireAuth, quiz.get)
router.post('/api/quiz/:id', requireAuth, requireCSRF, quiz.update);
router.get('/api/quizzes', requireAuth, quiz.getList);
router.delete('/api/quiz/:id', requireAuth, requireCSRF, quiz.delete);


router.post('/api/user', requireAuth, requireCSRF, user.create);
router.get('/api/users', requireAuth, user.getList);
router.get('/api/user/:id', requireAuth, user.get);
router.post('/api/user/:id', requireAuth, requireCSRF, user.update);
router.delete('/api/user/:id', requireAuth, requireCSRF, user.delete);

router.get('/api/session/:code', requireAuth, quizSession.get);
router.get('/api/sessions', requireAuth, quizSession.getList);
router.post('/api/session/', requireAuth, requireCSRF, quizSession.create);
router.delete('/api/session/:code', requireAuth, requireCSRF, quizSession.delete);


module.exports = router;
