const db = require('./db');
const knex = require('../knex/knex.js');
const {LoggedInUser} = require('./LoggedInUser');

module.exports = {
  fetch: (id) => {
    const Users = () => knex('users')
      .select('*')
      .where('users.user_id', id);

    return Users().then((rows) => {
      if (rows.length == 0) {
        throw "Could not find user";
        return;
      }
      let user = {
        'user_id': rows[0].user_id,
        'full_name': rows[0].full_name,
        'username': rows[0].username,
        'created_at': rows[0].created_at,
        'deleted_at': rows[0].deleted_at,
      };
      return user;
    });
  },
  get: (request, response, next) => {
    let user = module.exports.fetch(request.params.id);
    user.then((user) => {
      return response.status(200).json({user: user});
    }).catch((error) => {
      return response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  getList: (request, response, next) => {
    const Users = () => knex('users')
      .select('*')
      .orderBy('username', 'asc');

    Users().then((rows) => {
      let users = {};
      for (let row of rows) {
        users[row.user_id] = {
            'user_id': row.user_id,
            'full_name': row.full_name,
            'username': row.username,
            'created_at': row.created_at,
            'deleted_at': row.deleted_at,
          };
      }
      return response.status(200).json({users: users});
    }).catch((error) => {
      response.status(400).json({error: true, message: error});
      throw error;
    });
  },
  update: (request, response, next) => {
    let user = module.exports.fetch(request.params.id);
    user.then((user) => {
      const User = (knex('users')).where({'users.user_id': request.params.id});
      let userUpdate = {
        full_name: request.body.full_name,
        username: request.body.username,
      };

      let updateUser = new LoggedInUser();

      if (request.body.password != undefined) {
        updateUser.setPassword(request.body.password);
        userUpdate.salt = updateUser.salt;
        userUpdate.password_hash = updateUser.password_hash;
      }
      User.update(userUpdate).then();
      userUpdate.user_id = request.params.id;
      updateUser.setUser(userUpdate);

      return response.status(200).json({user: updateUser.getObject()});

    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  delete: (request, response, next) => {
    let user = module.exports.fetch(request.params.id);
    user.then((user) => {
      knex('users')
        .where({ user_id: user.user_id })
        .del()
        .then();
      return response.status(200).json({success:true});
    }).catch((error) => {
      response.status(500).json({error: true, message: error});
      throw error;
    });
  },
  create: (request, response, next) => {
    let errors = module.exports.validate(request.body);
    if (errors.length == 0) {

      let newUser = new LoggedInUser();
      newUser.setPassword(request.body.password);

      db.query('INSERT INTO users (username, full_name, salt, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          request.body.username,
          request.body.full_name,
          newUser.salt,
          newUser.password_hash,
        ],
        (error, result) => {
        if (error) {
          return next(error)
        }
        let user = {
          user_id: result.rows[0].user_id,
          full_name: result.rows[0].full_name,
          username: result.rows[0].username,
        };
        return response.status(200).json({user: user});
      });
    }
    else {
      response.status(200).json({hasError: true, messages: errors});
    }
  },
  validate: (user) => {
    let errors = [];
    if (user === undefined) {
      errors.push("Invalid user");
    }
    else {
      if (user.username === undefined || user.username == "") {
        errors.push("Username cannot be empty");
      }
      else if (user.username.length < 4) {
        errors.push("Username must be at least four characters long");
      }

      if (user.full_name === undefined || user.full_name == "") {
        errors.push("User's full name cannot be empty");
      }

      if (user.password === undefined || user.password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }

      if (user.password_confirm === undefined || user.password_confirm == '') {
        errors.push("You must confirm your password");
      }
      else if (user.password !== user.password_confirm) {
        errors.push("Your passwords must match");
      }
    }

    return errors;
  },
}
