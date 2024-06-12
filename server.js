require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect(process.env.DATABASE_URL);



const corsOptions = {
    origin: 'http://127.0.0.1:5500', // lub '*' dla zezwolenia na wszystkie domeny
    optionsSuccessStatus: 200
};

const db = mongoose.connection

db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));


app.use(cors(corsOptions));
app.use(express.json())

const usersRouter = require('./routes/users');
const servicesRouter = require('./routes/services');
const workersRouter = require('./routes/workers');
const visitsRouter = require('./routes/visits');
app.use('/users', usersRouter);
app.use('/services',servicesRouter);
app.use('/workers', workersRouter);
app.use('/visits', visitsRouter);

app.listen(3000, ()=>{
    console.log('Server started');
})