const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const indexRouter = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
