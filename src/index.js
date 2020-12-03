const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var print = console.log;

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(function (req, res, next) {
    var data = "";
    req.on('data', function (chunk) { data += chunk })
    req.on('end', function () {
        req.rawBody = data;
        next();
    })
});
app.use(session({
    name : 'goofycookie',
    secret : 'we all love coe457',
    resave :true, // have to do with saving session under various conditions
    saveUninitialized: true, // just leave them as is
    cookie : {
            maxAge:(1000 * 60 * 100)
    }      
}));

var locations = null;

app.post('/map', (req, res) => {

    locations = JSON.parse('{"' + decodeURI(req.rawBody).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    console.log(locations);
});

app.get("/direction", (req, res) => {
    res.send(JSON.stringify(locations));
})

/**
 *  Start Server
 */

const port = 3000
app.set('port', process.env.PORT || port);
app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

