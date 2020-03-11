const crypto = require('crypto');
const knex = require('../knex/knex.js');
const JWTHandler = require('./JWTHandler');

class LoggedInUser {
  
  constructor(username) {
    this.user_id = null;
    this.username = null;
    this.full_name = null;
    this.salt = null;
    this.password_hash = null;
  
    if (username) {
      this.getUser(username);
    }
  }
  
  hashPassword(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }
  
  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password_hash = this.hashPassword(password);
  }
  
  validatePassword(password) {
    const hash = this.hashPassword(password);
    return this.password_hash === hash;
  }
  
  authObject() {
    let user = this.getObject();
    user.token = JWTHandler.generateJWT(user);
    return user;
  }
  
  setUser(user) {
    this.user_id = user.user_id;
    this.username = user.username;
    this.full_name = user.full_name;
    this.salt = user.salt;
    this.password_hash = user.password_hash;
  }
  
  getObject() {
    return {
      'user_id': this.user_id,
      'username': this.username,
      'full_name': this.full_name,
    };
  }
  
  getUser(username) {
    return knex('users').select('*').where('username', username).first();
  }
}

module.exports = {LoggedInUser};
