const express = require('express');
const router = require('./router');
const app = express();

app.use(express.json());
app.use('/', router);

// start the server
app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});