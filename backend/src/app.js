const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
