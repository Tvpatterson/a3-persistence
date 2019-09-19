// server.js
// where your node app starts

// init project
const express = require('express'),
      app = express(),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      low = require('lowdb'),
      FileSync = require('lowdb/adapters/FileSync'),
      userAdapter = new FileSync('./users.json'),
      dbAdapter = new FileSync('./db.json'),
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

db.defaults({ posts: [
  {"username":"admin", "body":"Admin post", "date":"9/18/2019", "time":"23:41"},
  {"username":"admin", "body":"Post 2", "date":"9/19/2019", "time":"8:16"}
]}).write();


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('./'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(helmet());
app.post('/save', timeout('5s'), bodyParser.json(), haltOnTimedout, function (req, res, next) {
  savePost(req.body, function (err, id) {
    if (err) return next(err)
    if (req.timedout) return
    res.send('saved as id ' + id)
  })
})

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

function savePost (post, cb) {
  setTimeout(function () {
    cb(null, ((Math.random() * 40000) >>> 0))
  }, (Math.random() * 7000) >>> 0)
}
// app.use(timeout('5s'));
// app.use(haltOnTimeOut);
// app.use(haltOnTimeOut);

// function haltOnTimeOut(request, response, next) {
//   if(!request.timedout) next();
// }
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
  let user = userdb.get('users').find({username:username}).value();
  if (user !== undefined) return done(null, user);
});

let logged = {}
let i = 0;

app.post('/login', function(request, response, next) {
  passport.authenticate('local', function(err, user, info) {
    if(!user) { 
      logged = {}
      return response.redirect('/login.html') 
    }
    request.logIn(user, function(err) {
      logged = user;
      return response.redirect('/home.html');
    });
  })(request, response, next);
});

app.post('/register', function(request, response) {
  let dataString = '';
  request.on('data', function(data) {
    dataString += data;
  });
  let user = JSON.parse(dataString);
  let name = user.username;
  let pass = user.password;
  userdb.get('users')
    .push({username:name, password:pass})
    .write();
  response.writeHead(200, "OK", {'Content-Type': 'application/json'});
  response.end();
});

app.post('/submit', function(request, response) {
  let dte = moment().format('L');
  let tme = moment().format('LTS');
  db.get('posts')
    .push({username:logged.username, body:request.body.message, date:dte, time:tme})
    .write();
  edit = false;
  response.redirect('/home.html');
});

app.post('/delete', function(request, response) {
  db.get('posts').remove({date:request.body.date, time:request.body.time}).write();
  response.redirect('/home.html');
})

let edit = false;
let editMessage = "";
let editTime = "";
let editDate = "";

app.post('/edit', function(request, response) {
  edit = true;
  editMessage = request.body.message;
  editTime = request.body.time;
  editDate = request.body.date;
  
  response.redirect('/submit.html');
})

app.post('/isedit', function(request, response) {
  response.json({edit:edit, message:editMessage, time:editTime, date:editDate})
})

app.post('/completeedit', function(request, response) {
  db.get('posts').find({time:request.body.time, date:request.body.date}).assign({body:request.body.message}).write();
  edit = false;
  response.redirect('/home.html');
})

app.post('/home', function(request, response) {
  let posts =  db.get('posts').filter({username:logged.username}).take(db.get('posts').size().value()).value()
  response.json({posts:posts})
})

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  if(Object.entries(logged).length === 0 && logged.constructor === Object) response.redirect('/login.html');
  else response.sendFile(__dirname + '/views/login.html');
});

app.get('/login.html', function(request, response) {
  if(Object.entries(logged).length === 0 && logged.constructor === Object) response.sendFile(__dirname + '/views/login.html')
  else {
    response.redirect('/home.html')
  }
});

app.get('/home.html', function(request, response) {
  if(Object.entries(logged).length === 0 && logged.constructor === Object) response.redirect('/login.html');
  else response.sendFile(__dirname + '/views/home.html');
})

app.get('/signup.html', function(request, response) {
  response.sendFile(__dirname + '/views/signup.html');
});

app.get('/submit.html', function(request, response) {
  if(Object.entries(logged).length === 0 && logged.constructor === Object) response.redirect('/login.html');
  else response.sendFile(__dirname + '/views/submit.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
