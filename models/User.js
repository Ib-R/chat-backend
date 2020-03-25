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

module.exports = User;