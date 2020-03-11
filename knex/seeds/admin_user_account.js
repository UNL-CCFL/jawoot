const {LoggedInUser} = require('../../server/LoggedInUser');
const prompts = require('prompts');

exports.seed = async function(knex) {
  console.log('Creating Admin Account:');

  const response = await prompts([
      {
        type: 'text',
        name: 'full_name',
        message: 'What\'s your name?',
        validate: value => value.length === 0 ? "Your name can't be empty, sorry" : true,
      },
      {
        type: 'text',
        name: 'username',
        message: 'What would you like your username to be?',
        validate: value => value.length < 2 ? "Your username must be at least 3 characters long" :
          /^[a-zA-Z0-9\-\_]+$/.test(value) ? true : "Your username can only contain letters, numbers, dashes, and underscores",
      },
      {
        type: 'password',
        name: 'password',
        message: 'How about your password? (Needs to be at least 8 characters long)',
        validate: value => value.length < 8 ? "Your password must be at least 8 characters long" : true,
      },
    ]
  );

  let newUser = new LoggedInUser();
  newUser.full_name = response.full_name;
  newUser.username = response.username;

  newUser.setPassword(response.password);

  return knex('users').insert([
      {
        username: newUser.username,
        salt: newUser.salt,
        password_hash: newUser.password_hash,
        full_name: newUser.full_name,
      },
    ]).then(() => {
      console.log("Admin account created!")
    });
};
