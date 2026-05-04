require('dotenv').config();

module.exports = {
  url: process.env.MONGO_URL || 'mongodb://mongodb:27017/access_sys_db',
  options: {}
};