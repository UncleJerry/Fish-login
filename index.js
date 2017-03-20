var express = require('express');
var app = express();
//var cookieParser = require('cookie-parser'); temporary disable
var bodyParser = require('body-parser');
var session = require('express-session');
var https = require('https');
var fs = require('fs');
var hash = require('./hash');
var query = require('./query');

app.use(express.static('public'));
//app.use(cookieParser()); temporary disable
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Set a month life to Session
app.use(session({secret: 'suggest to have a random secret', cookie: {maxAge: 43200000}, resave: true, saveUninitialized: true}));


app.post('/login.html', function (req, res){

  // Get the username and passwd from request.
  const username = req.body['username'];
  const password = req.body['password'];

  query.queryInfo(username, function(err, result){

    if (!err) {

      if (result.rows[0] == undefined) {
        // if the user isn't exist return false
        res.redirect(401, '/');
      }else{
        const hashpass = hash.hashWithSalt(password, result.rows[0].salt);
        if (hashpass.localeCompare(result.rows[0].hashpass) == 0) {
          req.session.user = result.rows[0].uid;// To mark the user id to further action.
          res.redirect('/verify');
        }else{
          // if the hashed password not match, return false
          res.redirect(401, '/');
        }
      }

    }else{
      res.send('Error in server.');
    }
  });


});

/**
 * Verify the login session.
 * If the device never login or the session is expired, redirect to the login page
 */
app.get('/verify', function (req, res){
  if (req.session && req.session.user) {

  }else{
    res.redirect(401, '/login.html');
  }
});


var secureServer = https.createServer({
    key: fs.readFileSync('keys/private.key'),
    cert: fs.readFileSync('keys/certificate.pem')
}, app);

secureServer.listen(3000, function(){
  console.log('Established the https server at port 3000');
});
