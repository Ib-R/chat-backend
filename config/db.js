const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://root:@localhost/chat');
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.exports = sequelize;