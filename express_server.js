const express = require ("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const {getUserByEmail, emailCheck} = require("./helpers")
const cookieSession = require("cookie-session");
const req = require("express/lib/request");

app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
app.set("view engine", "ejs");

// object to save users and user info
const users = { 
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
  shortURL: {
    longURL: "http://bing.com",
    userID: "user2RandomID"
  },
  shortURL2: {
    longURL: "http://google.com",
    userID: "user2RandomID"
  }
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
};

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  // Cookies that have not been signed
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect("/login");
  } else {
    const userUrls = {};
    for (const [key, value] of Object.entries(urlDatabase)) {
      if (req.session.user_id === value.userID){
        userUrls[key] = value;
      }
    }
    const templateVars = {
    urls: userUrls,
    users: users[req.session.user_id],
  };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users: users[req.session["user_id"]]
  }
  if (users[req.session["user_id"]]) {
  res.render("urls_new", templateVars);
  } else{
  res.redirect("/login")
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //What would happen if a client requests a non-existent shortURL?
  if (!urlDatabase[req.params.shortURL]) {
    res.send("<html><body>Url does not exist.</body></html>\n");
    return;
  }
   const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    users: users[req.session["user_id"]]
  };
  if(urlDatabase[shortURL].userID !== req.session["user_id"]){
    
    res.send("<html><body>Error: you must be logged in.</body></html>\n");
  }else {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  if (!req.session.user_id) {
    res.status(403).send("Error: You must be logged in to creat a short URL");
    return;
  }
  urlDatabase[newID] = {longURL: req.body.longURL, userID: req.session["user_id"]}
  res.redirect(`/urls/${newID}`);         // Respond redirect
});
//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if(urlDatabase[shortURL].userID === req.session["user_id"]){
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);         // Respond redirect to index page
  } else {
    res.status(403).send("Error: You must be logged in to delete");
  }
});
//edit url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  longURL = req.body.longURL;

  if(urlDatabase[id].userID === req.session["user_id"]){
    urlDatabase[id] = {userID: req.session["user_id"], longURL}
    res.redirect("/urls");         // Respond redirect to index page
  } else {
    res.status(404).send("Error: Please login to continue");
  }
});

app.get('/register', (req, res) => {
  res.render("register");

});
//save new user to users object and generate a user ID
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let password = req.body.password;

  //If the e-mail or password are empty strings, send back a response with the 400 status code
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send("Please enter a valid email and password");
  }
  if (emailCheck(req.body.email, users)){
    res.status(403).send("This email is already being used. Please enter a different one.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
    
    users[userID] = { 
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };

  req.session.user_id = userID;
  res.redirect("/urls");
});
//Login
app.get('/login', (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  for (const [key, value] of Object.entries(users)) {
    if (req.body.email === value.email){
      if(bcrypt.compareSync(req.body.password, value.password)){
        req.session.user_id = key;
        res.redirect("/urls");                  // Respond redirect to urls page
        return;
      }     
    }
  }
  res.status(403).send("Please enter a valid email and password");
});
//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");         
});

app.listen(PORT, () => {
});