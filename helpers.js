const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (id.email === email){
      return database[id];
    } else {
    return undefined;
    }
  } 
}

module.exports = {getUserByEmail}