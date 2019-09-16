// server.js
// where your node app starts

// init project
const express = require('express'),
      app = express(),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      low = require('lowdb'),
      FileSync = require('lowdb/adapters/FileSync'),
      userAdapter = new FileSync('users.json'),
      dbAdapter = new FileSync('db.json'),
      userdb = low(userAdapter),
      db = low(dbAdapter),
      bodyParser = require('body-parser'),
      moment = require('moment'),
      favicon = require('serve-favicon'),
      path = require('path'),
      helmet = require('helmet'),
      timeout = require('connect-timeout');

userdb.defaults({ users: [
  {"username":"admin", "password":"admin"}
]}).write();

db.defaults({ posts: []});


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('./'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(helmet);
app.use(timeout('30s'));
app.use(haltOnTimeOut);

function haltOnTimeOut(request, response, next) {
  if(!request.timedout) next();
  response.redirect('/');
}
passport.use(new LocalStrategy(
  function(username, password, done) {
    let user = userdb.get('users')
                      .find({username:username})
                      .value();
    if(!user) return done(null, false);
    if(user.password != password) return done(null, false);
    return done(null, user);
  }));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  let users = db.get('users').value();
  const user = users.find(function(user) {
    if(username === user.username) return user;
  });
  if (user !== undefined) return done(null, user);
});

let logged = {}

app.post('/login',
        passport.authenticate('local', {successRedirect: '/home.html', failureRedirect: '/login.html' }),
        function(req, res) {
  console.log("HERE")
          let users = db.get('users').value();
          logged = users.find(function(user) {
            if(user.username === req.user.username) return user;
          });
});

app.post('/register', function(request, response) {
  let dataString = '';
  request.on('data', function(data) {
    dataString += data;
  });
  request.on('end', function() {
    let user = JSON.parse(dataString);
    let name = user.username;
    let pass = user.password;
    userdb.get('users')
      .push({username:name, password:pass})
      .write();
  });
  response.writeHead(200, "OK", {'Content-Type': 'application/json'});
  response.end();
});

app.post('/submit', function(request, response) {
  let dataString = '';
  request.on('data', function(data) {
    dataString += data;
  });
  console.log("HERE")
  request.on('end', function() {
    let post = JSON.parse(dataString);
    let user = post.user;
    let bdy = post.body;
    let dte = moment().format('L');
    let tme = moment().format('LTS');
    db.get('posts')
      .push({username:user, body:bdy, date:dte, time:tme})
      .write();
  });
  response.redirect('/home.html');
});

app.post('/delete', function(request, response) {
  db.get('users').remove({username:logged.username}).write();
  response.writeHead(200, "OK", {'Content-Type':'application/json'});
  response.end();
})

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/login.html');
});

app.get('/login.html', function(request, response) {
  response.sendFile(__dirname + '/views/login.html');
});

app.get('/home.html', function(request, response) {
  response.sendFile(__dirname + '/views/home.html');
})

app.get('/signup.html', function(request, response) {
  response.sendFile(__dirname + '/views/signup.html');
});

app.get('/submit.html', function(request, response) {
  response.sendFile(__dirname + '/views/submit.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
