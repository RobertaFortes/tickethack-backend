require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./models/connection');

const indexRouter = require('./routes/index');
const tripsRouter = require('./routes/trips');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/', indexRouter);
app.use('/trips', tripsRouter);

module.exports = app;
