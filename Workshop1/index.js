require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const routes = require('./routes/routes');

// Middleware
app.use(express.json());

// Rutas
app.use('/api', routes);

// MongoDB
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Database Connected');
});

// Servidor
app.listen(3000, () => {
    console.log('Server Started at 3000');
});
