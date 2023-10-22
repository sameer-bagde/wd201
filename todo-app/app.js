/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const { User, Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var csrf = require("tiny-csrf");

// ...
var cookieParser = require("cookie-parser");

app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const passport = require('passport');  // authentication
const connectEnsureLogin = require('connect-ensure-login'); //authorization
const session = require('express-session');  // session middleware for cookie support
const LocalStrategy = require('passport-local').Strategy

app.use(session({
  secret: 'my-super-secret-key-7218728182782818218782718hsjahsu8as8a8su88',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24* 60 * 60 * 1000 } // 24 hour
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ where: { email: username, password: password } }).then(function(user) {
      return done(null, user);
    }).catch((error) => {
      return done(error);
    });
  }
));

passport.serializeUser(function(user, done) {
  console.log("Serializing user in session: ", user.id)
  done(null, user.id); 
});

passport.deserializeUser(function(id, done) {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});


app.get('/todos', connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const todos = await Todo.findAll().catch((error) => {
    console.log(error)
  })
  response.render("todos");
})


app.get("/", async (request, response) => {

    response.render("index", {
      title: "Todo application",
      csrfToken: request.csrfToken(),
    });
});



app.get("/todo", async (request, response) => {
  const overdue = await Todo.overdue();
  const dueToday = await Todo.dueToday();
  const dueLater = await Todo.dueLater();
  const completedItems = await Todo.completedItems();
  if (request.accepts("html")) {
    response.render("todo", {
      title: "Todo application",
      overdue,
      dueToday,
      dueLater,
      completedItems,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      overdue,
      dueToday,
      dueLater,
      completedItems,
    });
  }
});

app.get("/signup", (request, response) => {
  response.render("signup", {title: "signup" ,  csrfToken: request.csrfToken()});
});

app.post('/users', async function (request, response) {
  const user = await User.create({ 
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email, 
    password: request.body.password 
  }).catch((error) => {
    console.log(error)
  });
  // Initialize session after successful signup
  request.login(user, function(err) {
    if (err) {
      console.log(err);
    }
    return response.redirect('/todos');
  });
  // response.redirect("/todos"); // Redirected to root path
})

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");

  try {
    const todos = await Todo.findAll();
    response.json(todos);
  } catch (error) {
    console.log("Error fetching todos:", error);
    return response.status(500).json({ error: "Unable to fetch todos" });
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  //Todo
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

// app.put("/todos/:id/markAsCompleted", async (request, response) => {
//   console.log("We have to update a todo with ID:", request.params.id);
//   const todo = await Todo.findByPk(request.params.id);
//   try {
//     const updatedTodo = await todo.markAsCompleted();
//     return response.json(updatedTodo);
//   } catch (error) {
//     console.log(error);
//     return response.status(422).json(error);
//   }
// });

app.put("/todos/:id", async (request, response) => {
  console.log("/n We have completed a todo with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const completion = await todo.setCompletionStatus(request.body.completed);
    return response.json(completion);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("delete a todo ID:",request.params.id);
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(422).json(error);
  }
});

module.exports = app;
