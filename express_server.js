const express = require ('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// object to save users and user info
let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    return Math.random().toString(20).substr(2, 6)
};

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)
 
});

app.get("/", (req, res,) => {
  res.send("Welcome to Tinyapp");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
});

app.get('/urls', (req,res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users[req.cookies["user_id"]]
}
console.log({templateVars});
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users: users[req.cookies["user_id"]]
}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //What would happen if a client requests a non-existent shortURL?
  if (!urlDatabase[shortURL]) {
    res.send('<html><body>Error</body></html>\n');
    return;
  }
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    users: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;

  const templateVars = { 
    users: users[req.cookies["user_id"]]
}
  res.redirect(`/urls/${newID}`, templateVars);         // Respond redirect
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);         // Respond redirect to index page
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;

  res.redirect(`/urls`);         // Respond redirect to index page
});

app.get('/register', (req, res) => {
  res.render("register");
});
//save new user to users object and generate a user ID
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  
  //If the e-mail or password are empty strings, send back a response with the 400 status code
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send("400");
  }
  for (const [key, value] of Object.entries(users)) {
    if (value.email === req.body.email){
      return res.status(400).send("400");
    }
  }
  console.log(users);
  users[userID] = { 
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");

});
//Login
app.get('/login', (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  for (const [userID, value] of Object.entries(users)) {
    console.log(req.body.email, req.body.password)
    if (req.body.email === value.email){
      if(req.body.password === value.password){
  res.cookie("user_id", userID);
  return res.redirect(`/urls`);   
    }      // Respond redirect to urls page
  }
  }
  res.status(403).send("403");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`);         
});

app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}.`);
});