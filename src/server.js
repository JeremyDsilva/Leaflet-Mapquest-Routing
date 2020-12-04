const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();

app.use(cookieParser());

app.use(session({
    name: 'beeUserSession',
    secret: 'we all love coe457',
    resave: true, // have to do with saving session under various conditions
    saveUninitialized: true, // just leave them as is
}));

// middleware for security, session and cookie handling
app.use(function (req, res, next) {

    if (req.session.email == undefined && req.url == '/map.html') // redirect if user is not logged in
        res.redirect('/login.html')
    else if (req.session.email) {
        if (req.url == '/login.html' || req.url == '/register.html') // if they have logged in redirect to map
            res.redirect('/map.html');
        else {
            // set cookie to last time user visited and update to latest date 
            User.findOne({
                email: req.session.email
            }, function (err, foundUser) {

                currentDate = new Date();

                if (foundUser.date != null && (currentDate - foundUser.date) / 1000 > 5) // not the first time and weird error handling case 
                {
                    res.cookie('date', foundUser.date.toDateString()) // set cookie of last time visted, if its thier first time
                }

                // add temporary cookies for mqtt and user message to work
                res.cookie('useremail', foundUser.email)
                res.cookie('username', foundUser.username)

                // update with the current time 
                foundUser.date = currentDate;
                foundUser.save();
                next();
            });

        }
    } else
        next(); // call next middleware
});

app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost:27017/mapdb', { useNewUrlParser: true, useUnifiedTopology: true });

// we create a scheme first 
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    date: Date, // last visited
    cookieconsent: Boolean // has agreed to the cookies
});

const User = mongoose.model("User", userSchema);

app.post('/login', urlencodedParser, (req, res) => {

    var response = {
        email: req.body.email,
        password: req.body.password,
        remember: req.body.remember != undefined,
        cookieconsent: req.body.cookieconsent != undefined
    };

    User.findOne({ email: response.email, password: response.password }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else if (!foundUser) { // couldnt find user with given username and password redirect to login with error param
            res.redirect('/login.html?error');
        }
        else {

            if (response.remember && response.cookieconsent) { // if they choose to remember them and consented to using permentant cookies
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
            }

            req.session.email = foundUser.email;
            res.redirect('/map.html');
        }
    });

});

app.post('/register', urlencodedParser, function (req, res) {
    var response = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        Date: null
    };

    User.findOne({ email: response.email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else if (!foundUser) { // save user details
            new User(response).save();
            res.redirect('/login.html');
        }
        else {
            res.redirect('/register.html?error=' + encodeURIComponent('User with email already exist'));
        }
    });


});

app.get('/logout', function (req, res) {
    res.clearCookie('useremail')
    res.clearCookie('username')
    res.clearCookie('date')
    res.clearCookie('beeUserSession');
    req.session.destroy();
    res.redirect('/login.html');
});

app.get('/', function (req, res) {
    res.redirect('/login.html');
})

/**
 *  Start Server
 */

const port = 3000
app.set('port', process.env.PORT || port);
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

