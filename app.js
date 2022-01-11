const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

const dbURI = 'mongodb+srv://todd_node_auth:NodeAuth470dd!@clusternodeauth.md59l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err)
);

app.get('/', (req, res) => res.render('home'));
app.use(authRoutes);app.use(authRoutes);

// cookies
app.get('/set-cookies', (req, res) => {

    res.cookie('newUser', false)
    res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true })
    res.send('you got the cookies');

})

app.get('/read-cookies', (req, res) => {

    const cookies = req.cookies;
    console.log(cookies);

    res.json(cookies); 

})

app.listen(port, () => {
    console.log(`The server is running on port ${port}...`)
});