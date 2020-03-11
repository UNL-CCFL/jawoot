const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  generateJWT: (authDetails) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60 * 60 * 24);
    authDetails.exp = parseInt(expirationDate.getTime() / 1000, 10);
    return jwt.sign(authDetails, process.env.JWTSECRET);
  },
  validateJWT: (token) => {
    try {
      let isValid = jwt.verify(token, process.env.JWTSECRET)
      return isValid;
    }
    catch (error) {
      return false;
    }
  }
}
