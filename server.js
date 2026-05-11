require('dotenv').config();
const express = require('express');
var path = require('path');
const connectDB = require('./src/config/db');

const app = express();

connectDB();

var indexRouter = require('./src/routes/index');
var tripsRouter = require('./src/routes/trips');

const cors = require('cors');
app.use(cors());

app.use(express.json());

app.use('/', indexRouter);
app.use('/trips', tripsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
