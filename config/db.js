const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize(process.env.MYSQL_URI);
// const connectDB = () => {
//   return sequelize
//     .authenticate()
//     .then(() => {
//       console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//       setTimeout(() => {
//         connectDB();
//       }, 5000);
//       console.error('Unable to connect to the database:', err);
//   });
// }

module.exports = sequelize;
