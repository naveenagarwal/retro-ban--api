if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null

  if (process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.HEROKU_POSTGRESQL_BRONZE_URL, {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     match[4],
      host:     match[3],
      logging:  true, //false
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      define: {
        timestamps: true // true by default
      }
    })
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize('retroboard', 'postgres', null, { host: "localhost", port: 5432, dialect:  'postgres' });
  }

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Board:     sequelize.import(__dirname + '/board'),
    Section:   sequelize.import(__dirname + '/section'),
    Item:      sequelize.import(__dirname + '/item'),
    User:      sequelize.import(__dirname + '/user')
    // add your other models here
  }

  /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */

  global.db.User.hasMany(global.db.Board);
  global.db.Board.hasMany(global.db.Section);
  global.db.Section.hasMany(global.db.Item);

  global.db.Board.belongsTo(global.db.User);
  global.db.Section.belongsTo(global.db.Board);
  global.db.Item.belongsTo(global.db.Section);


}

module.exports = global.db