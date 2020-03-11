const express = require('express');
const router = require('express').Router();
const fs = require('fs')

let app = express();

app.listen(80, function(){
  console.log(`API listening on port 80`);
});

app.get("/*", (request, response, next) => {
  let file = request.params[0] ? request.params[0] : 'index.html';
  if (fs.existsSync('./dist/www/'+file)) {
    return response.sendFile(file, {root: './dist/www'})
  }
  else {
    return response.sendFile('index.html', {root: './dist/www'})
  }
});
