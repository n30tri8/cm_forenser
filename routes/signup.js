var express = require('express');
var router = express.Router();
var User = require('../models/db').models.User;


router.post('/', async function (req, res, next) {
    try {
        let newUser = new User();
        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.setPassword(req.body.password);
        await newUser.save();
        req.session.user = newUser;
        res.redirect('/detect');
    } catch (error) {
        console.log(error);
        res.status(500).end('Server Error');
    }
});

router.get('/', function (req, res, next) {
    res.render('users/signup', {
        title: 'Sign up',
        session: req.session
      });
});

module.exports = router;
