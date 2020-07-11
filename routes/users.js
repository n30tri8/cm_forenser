var express = require('express');
var router = express.Router();
var User = require('../models/db').models.User;
const config = require('../config.json');

router.post('/', async function (req, res, next) {
    try {
      let message = ''
      if (req.body.username == config.adminUser.username) {
        //showing this instead of 'can not delete admin user'; so we will not reveal information of admin
        message = 'Username does not exist';
      }
      else {
        await User.deleteOne( {username: req.body.username}, function (err, foundUser) {
          if (err) { 
              console.log('error while deleting user');
              throw err;
          }
          if (!foundUser) {
              message = 'Username does not exist';
          }
          else{
              message = 'deleted user: ' + req.body.username;
          }
        });
      }

      let allUsersExceptAdmin = await User.find( {username : {$ne : config.adminUser.username}} );
      res.render('user-management/users', {
        title: 'users list',
        message: message,
        users: allUsersExceptAdmin,
        session: req.session,
        isAdminUser: req.session.user.username == config.adminUser.username
      });

    } catch (error) {
        console.log(error);
        res.status(500).end('Server Error');
    }
});

router.get('/', async function (req, res) {
  try {
    let allUsersExceptAdmin = await User.find( {username : {$ne : config.adminUser.username}} );
    res.render('user-management/users', {
      title: 'users list',
      message: '',
      users: allUsersExceptAdmin,
      session: req.session,
      isAdminUser: req.session.user.username == config.adminUser.username
    });
  } catch (error) {
    res.status(500).end('Server Error');
  }
});

module.exports = router;
