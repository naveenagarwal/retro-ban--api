var express = require('express')
  , path    = require('path')
  , db      = require('./models')
  , bodyParser = require('body-parser')
  , logger = require('express-logger')
  , sequelize = require('sequelize');

var app = express();

app.use(bodyParser.json());
app.use(logger({path: __dirname + "/logs/server.log"}));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
})

app.get('/board/list/:userId', listBoard);
app.get('/board/:id', showBoard);
app.patch('/board/:id', updateBoard);
app.post('/board/:name', createBoard);
app.post('/item', createItem);
app.patch('/item/:id', editItem);
app.delete('/item/:id', removeItem);
app.post('/login', login);
app.post('/signup', signup);

var port = process.env.PORT || 5000;

// app.listen(port, function () {
//   console.log('Example app listening on port !', port);
// });

db.sequelize.sync().then(function() {
  app.listen(port, function () {
    console.log('Retroboard api app listening on port !', port);
  });
})

function createBoard(req, res) {
  console.log("request in");
  var name = req.params.name;
  var userId = req.body.userId;
  var defaultSections = getDefaultSections();

  db.Board.create(
    {
      name: name,
      Sections: defaultSections,
    },
    {
      include: [ { model: db.Section, include: [ { model: db.Item }] } ]
    }
  ).then(function(board){

    db.Board.find({
      where: { id: board.id },
      include: [
        {
          model: db.Section,
          include: [
            {
              model: db.Item
            }
          ]
        }
      ]
    }).then(function(board){
      db.User.findOne({where: { id: userId }}).then(function(user){
        board.setUser(user).then(function(){
          res.json(board.get({ plain: true }));
        })
      });
    });

  });
}

function showBoard(req, res) {
  db.Board.find({
    where: { id: req.params.id },
    include: [
      {
        model: db.Section,
        include: [
          {
            model: db.Item
          }
        ]
      }
    ]
  }).then(function(board){
    res.json(board.get({ plain: true }));
  });
}

function listBoard(req, res) {
  db.User.findOne({ where: { id: req.params.userId } }).then(function(user){
    // console.log("user id is ", user.id);
    db.Board.findAll({
      where: { UserId: user.id },
      include: [
        {
          model: db.Section,
          include: [
            {
              model: db.Item
            }
          ]
        }
      ]
    }).then(function(boards){
      res.json(boards);
    });
  });

}

function updateBoard(req, res) {
  var name = req.body.name; //JSON.parse(req.body.name);
  console.log("updating board withnew name", name);

  db.Board.update(
    { name: name },
    { where: {id: req.params.id } }
  ).then(function(board){
    res.json("Successfully updated");
  }).catch(function(error){
    res.json(error);
  });
}

function createItem(req, res) {
  var itemParams = JSON.parse(req.body.item);
  db.Item.create(itemParams).then(function(newItem){
    db.Item.find({where: { id: newItem.id }}).then(function(item){
      console.log(item.get({plain: true}));
      res.json(item.get({plain: true}));
    })

  })

}

function editItem(req, res) {
  // body...
}

function removeItem(req, res) {
  // body...
}

function getDefaultSections() {
  return [
    {
      name: 'What went Wrong',
      Items: []
    },
    {
      name: 'What went Well',
      Items: []
    },
    {
      name: 'Stop Doing',
      Items: []
    },
    {
      name: 'Start/Continue Doing',
      Items: []
    }
  ];
}

function signup(req, res) {
  var userParams = JSON.parse(req.body.user);
  db.User.create(userParams).then(function(newUser){
    db.User.find({where: { id: newUser.id }}).then(function(user){
      var response;
      if(user){
        response = {
          success: true,
          user: user.get({plain: true}),
          message: "Signup Successfull"
        };
      }else{
        response = {
          success: false,
          user: null,
          message: "Error in signup"
        };
      }
      res.json(response);
    })

  })

}

function login(req, res) {
  var userParams = JSON.parse(req.body.user);

  db.User.find({where: { email: userParams.email }}).then(function(user){
    var response;
    if(user && user.authenticate(userParams.password)){
      response = {
        success: true,
        user: user.get({plain: true}),
        message: "Login Successfull"
      };
    }else{
      response = {
        success: false,
        user: null,
        message: "Invalid username or password"
      };
    }

    res.json(response);

  });


}


