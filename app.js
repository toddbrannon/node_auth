const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const { configureSGMailKeys } = require('./external/sgMail.js');
require('dotenv').config();

// Configure keys
configureSGMailKeys();

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Set Cookie Parser, Sessions, and Flash
app.use(cookieParser('SecretStringForCookies'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {maxAge: 60000},
    saveUninitialized: true,
    resave: true
}));
app.use(flash());

// database connection
const dbURI = process.env.MONGODB_CONN
mongoose.connect(dbURI)
    .then(() => console.log(`connected to mongodb`))
    .catch(err => console.log(err)
);

app.get("*", checkUser);
app.get('/', (req, res) => res.render('home', {
    title: "TruSponse Node Auth",
  })
);
app.get('/protected', requireAuth, (req, res) => res.render('protected', {
    title: "TruSponse Node Auth"
  })
);
app.use(authRoutes);


app.listen(port, () => {
  console.log(`The server is running on port ${port}...`)
});