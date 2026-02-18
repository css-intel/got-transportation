const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  dialectOptions: {
    ssl: config.nodeEnv === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
