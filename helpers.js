const { use } = require("chai");

const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (id.email === email){
      return database[id];
    } 
    return false;
  } 
}

const emailCheck = function(email, users) {
  const usersArr = Object.entries(users);
  const result = usersArr.find( (user) => user[1].email === email);
  if(!result){
    return false
  }
 return true;
}

module.exports = {emailCheck, getUserByEmail}