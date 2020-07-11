var express = require('express');
var router = express.Router();
var User = require('../models/db').models.User;


router.post('/', async function (req, res, next) {
    try {
        await User.findOne( {username: req.body.username}, function (err, foundUser) {
            if (err) { 
                console.log('error while quering for login user');
                throw err;
            }
            if (!foundUser) {
                res.render('users/login', {
                    title: 'Log in',
                    session: req.session,
                    message: 'Username does not exist'
                  });
            }
            else if (foundUser.validPassword(req.body.password)){
                req.session.user = foundUser;
                res.redirect('/detect');
            }
            else{
                res.render('users/login', {
                    title: 'Log in',
                    session: req.session,
                    message: 'Password is incorrect'
                  });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).end('Server Error');
    }
});

router.get('/', function (req, res, next) {
    res.render('users/login', {
        title: 'Log in',
        session: req.session,
        message: ""
      });
});

module.exports = router;
