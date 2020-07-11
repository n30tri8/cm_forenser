var mongoose = require('mongoose');
const config = require('../config.json');
 
var User = require('./user');

const createAdmin = async () => {
  await User.findOne( {username: config.adminUser.username}, async function (err, result) {
    if (err) { 
      console.log('error while quering for admin');
    }
    if (!result) {
      let adminUser = new User();
      adminUser.username = config.adminUser.username;
      adminUser.email = config.adminUser.email;
      adminUser.setPassword(config.adminUser.password);
      await adminUser.save();
    }
  });
};

const connectDb = () => {
  return mongoose.connect(config.mongodb_url).then(createAdmin);
};

const models = { User };
 
module.exports = { 
  connectDb: connectDb,
  models: models
};