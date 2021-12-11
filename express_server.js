const express = require ('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const {getUserByEmail} = require('./helpers')
const cookieSession = require('cookie-session');
//const { localsName } = require('ejs');
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));
app.set("view engine", "ejs");

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
};

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log("Cookies: ", req.session)
 
});

app.get("/", (req, res,) => {
  res.send("Welcome to Tinyapp");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
    urls: urlDatabase,
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
   const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users[req.session["user_id"]]
  };
  if (!urlDatabase[req.params.shortURL]) {
    res.send('<html><body>Error</body></html>\n');
    return;
  }
 
  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  console.log("00000", req.params);
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newID = generateRandomString();
  urlDatabase[newID] = {longURL: req.body.longURL, userID: req.session["user_id"]}
  res.redirect(`/urls/${newID}`);         // Respond redirect
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
console.log("iiiiiii",urlDatabase[shortURL].userID)
console.log("yyyyyyy", req.session["user_id"])
  if(urlDatabase[shortURL].userID === req.session["user_id"]){
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);         // Respond redirect to index page
  } else {
    console.log("status", res)
    res.status(403).send("Error: You must be logged in to delete");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  longURL = req.body.longURL;
  //urlDatabase[id] = req.body.longURL;
  console.log("------", req.session);
  console.log("********", urlDatabase);
  console.log("+++++", id);
  /*const templateVars = {s
      urls: urlDatabase,
      users: users[req.cookies["user_id"]],
    };*/

  if(urlDatabase[id].userID === req.session["user_id"]){
    console.log("It worked!!");
    urlDatabase[id] = {userID: req.session["user_id"], longURL}
    console.log("LLLLLLL", urlDatabase);
  console.log("141", urlDatabase[id])
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
    res.status(400).send("400");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("99999999999", hashedPassword);
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("400");
  }
  console.log(users);
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
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  for (const [key, value] of Object.entries(users)) {
    console.log(req.body.email, req.body.password)
    if (req.body.email === value.email){
      if(bcrypt.compareSync(hashedPassword, value.password)){
        res.session.user_id = key;
        return res.redirect("/urls");   
      }      // Respond redirect to urls page
    }
  }
  res.status(403).send("403");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");         
});

app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}.`);
});