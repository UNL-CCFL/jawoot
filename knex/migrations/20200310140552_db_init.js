
exports.up = function(knex) {
  console.log("Initializing Database");

  knex.schema.createTable('answers', table => {
    table.increments('answer_id')
    table.integer('question_id').notNullable()
    table.text('answer').notNullable()
    table.boolean('is_correct').defaultTo(false).notNullable()
    table.integer('answer_order').notNullable()
    table.integer('selected_count').notNullable().defaultTo(0)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  }).then();

  knex.schema.createTable('questions', table => {
    table.increments('question_id')
    table.integer('quiz_id').notNullable()
    table.string('question_type', 24).notNullable()
    table.text('question').notNullable()
    table.integer('question_order').notNullable()
    table.integer('time_limit').notNullable().defaultTo(0)
    table.integer('total_attempts').notNullable().defaultTo(0)
    table.integer('correct_attempts').notNullable().defaultTo(0)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  }).then();

  knex.schema.createTable('quiz_sessions', table => {
    table.increments('session_id')
    table.integer('quiz_id').notNullable()
    table.integer('code').notNullable()
    table.timestamp('completed_at')
    table.integer('player_count').notNullable().defaultTo(0)
    table.integer('average_score').notNullable().defaultTo(0)
    table.text('question_results')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  }).then();

  knex.schema.createTable('quizzes', table => {
    table.increments('quiz_id')
    table.string('title').notNullable()
    table.integer('quiz_attempts').notNullable().default(0)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  }).then();

  return knex.schema.createTable('users', table => {
    table.increments('user_id')
    table.string('username', 20).notNullable()
    table.string('salt', 32).notNullable()
    table.text('password_hash').notNullable()
    table.string('full_name', 100).notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  }).then();

};

exports.down = function(knex) {
  console.log("Deleting All Tables In Database");
  return knex.schema
    .dropTable('answers')
    .dropTable('questions')
};
