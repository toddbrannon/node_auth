const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// database connection
const dbURI = process.env.MONGODB_CONN
mongoose.connect(dbURI)
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err)
);

app.get("*", checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/protected', requireAuth, (req, res) => res.render('protected'));
app.use(authRoutes);app.use(authRoutes);


app.listen(port, () => {
    console.log(`The server is running on port ${port}...`)
});