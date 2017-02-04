var bcrypt = require('bcrypt');

var User = function(sequelize, DataTypes) {
  return sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_digest: DataTypes.STRING,
    password: {
      type: DataTypes.VIRTUAL,
       validate: {
          isLongEnough: function (val) {
            if (val.length < 8) {
              throw new Error("Please choose a longer password")
           }
        }
      }
    }
  },


  {
    // freezeTableName: true,
    indexes: [{unique: true, fields: ['email']}],
    instanceMethods: {
      authenticate: function(value) {
        if (bcrypt.compareSync(value, this.password_digest))
          return this;
        else
          return false;
      }
    },
    hooks: {
      beforeCreate: function(user, options, callback) {
        user.email = user.email.toLowerCase();
        if (user.password)
          hasSecurePassword(user, options, callback);
        else
          return callback(null, options);
      },
      beforeUpdate: function(user, options, callback) {
        user.email = user.email.toLowerCase();
        if (user.password)
          hasSecurePassword(user, options, callback);
        else
          return callback(null, options);
      }
    }
  });
}

var hasSecurePassword = function(user, options, callback) {
  bcrypt.hash(user.get('password'), 10, function(err, hash) {
    if (err) return callback(err);
    user.set('password_digest', hash);
    return callback(null, options);
  });
};


module.exports = User;