# Jawoot!

Jawoot! is a node, Socket.IO, webpack, Vue.js, Sass, and psql* based real-time online quiz web application.

Currently it only has one question type - multiple choice - but is setup to support more in the future.

This is my ([@jshrc](https://github.com/jshrc)) first fully fleshed out node web application so I'm sure a lot could be improved, and I welcome constructive criticism and examples to reference. 👍

  \* Should be able to use other DBs through knex.js as well.

## Installation Instructions

1. Clone this repo:
    `git clone https://github.com/UNL-CCFL/jawoot.git`

2. Install the node modules:
    `npm install`

3. Copy `.env.example` to `.env` and update the env variables accordingly.

    Tip: To generate your JWT and Session secrets run this command on a \*nix command line:

    `openssl rand -hex 32 `

    You should use different secrets!

4. Build the front end:

    `npm run dev`  -- For development and testing

    `npm run watch` -- Will watch for changes in `src/` and automagically build dev

    `npm run prod` -- For production - will minimize generated JS and CSS


5. Build the backend - there is migration to setup all all the necessary tables, and seeders to initialize your first admin account, and an example quiz.  

  * DB Install: `knex migrate:latest`

  * Seeders:
    * Admin account: the following seeder will walk you through creating an admin account
      `knex seed:run --specific=admin_user_account.js`  
    * Example quiz: This will create a basic quiz with two questions
      `knex seed:run --specific=example_quiz.js`  

6. Serving the app

    The main web directory is `dist/www` and you should set your http server to serve from there. Alternatively a basic node http setup has been provided in `server/httpServer.js` and can be run with the following command:

    `node server/httpServer.js`

    The API and Socket.IO side need to be served with:

    `node server/server.js`

7. Finalizing Install

    You should now be able to login at `/login` with the username and password you specified in the seeder. Once logged in you should see the example quiz if you ran the seeder for that or a generic no quizzes found message.


## Using Jawoot!

Administrators can login at `/login` and are able to manage quizzes, sessions, and all other admin accounts.

Players can join an active session with the session's code on the front page of the site `/index.html`


## Todo

In no particular order:

 * More question types
 * Flesh out documentation better
 * Responsive backend design
 * Full PWA Support
