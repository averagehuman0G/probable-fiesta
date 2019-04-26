const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const saveToDB = require('./models/post').saveToDB;
const findAllChanges = require('./models/post').findAllChanges;
const getString = require('./models/post').getString;
const setString = require('./models/post').setString; 

app.get('/', (req, res) => {
    res.redirect('/sesh/' + getId());
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function getId() {
  let id = parseInt(Math.random() * (1e9 + 5));
  return id.toString(16);
}


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('change', (id, change) => {
        saveToDB(id, change);
    });    

    socket.on('replay', (id) => {
        findAllChanges(id, (changes) => {
            socket.emit('replayChanges', changes);
        });
    });

    socket.on('getData', (id) => {
        getString(id, (str) => {
            socket.emit('initEditor', str);
        });
    });

    socket.on('setData', (id, str) => {
        setString(id, str); 
    });
    
});


app.get('/sesh/:id', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/replay/:id', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/replay.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, function() {
    console.log('on port 3000');
});

module.exports = app;
