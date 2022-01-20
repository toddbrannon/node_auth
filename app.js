const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// database connection
const dbURI = 'mongodb+srv://todd_node_auth:NodeAuth470dd!@clusternodeauth.md59l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
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