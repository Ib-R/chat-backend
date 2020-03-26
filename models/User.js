const Sequelize = require('sequelize');
sequelize = require('../config/db');

const User = sequelize.define("users", {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Remove password from response
User.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());
  
    delete values.password;
    return values;
  }

module.exports = User;