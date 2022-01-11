const express = require('express');
const mongoose = require('mongoose');

const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

const dbURI = 'mongodb+srv://todd_node_auth:NodeAuth470dd!@clusternodeauth.md59l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err)
);

app.get('/', (req, res) => res.send("Hello world"));

app.listen(port, () => {
    console.log(`The server is running on port ${port}...`)
});