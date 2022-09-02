const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const { Server } = require('socket.io');
const Storage = require('./backend');

const PORT = 80;

const app = express();
const server = http.createServer(app);
const ws = new Server(server);
const storage = new Storage();

app.use(bodyParser.urlencoded());
app.set('views','./views');
app.set('view engine','jade');

function getCookie(req,key) {
    return cookie.parse(req.headers.cookie)[key];
}

app.use('/lib',express.static('./node_modules'));
app.use('/', express.static('./public'));

app.get('/', (req, res) => {
    res.render("index");
});

app.post('/', (req, res) => {
    let uname = req.body.uname;
    if (!storage.isUsernameInUse(uname)) {
        storage.registerUser(uname);
    }
    res.cookie('uname', uname);
    res.redirect('/chat');
});

app.get('/chat/:roomname?', (req, res) => {
    let roomname = req.params.roomname;
    let uname = getCookie(req,'uname');
    let rooms = storage.getAllMyRooms(uname);
    let room = undefined;
    if (roomname) {
        room = storage.getRoom(roomname);
        res.cookie('roomname',roomname);
    }
    else {
        res.clearCookie('roomname');
    }
    res.render('chat', {uname,rooms,room});
});

app.get('/createroom', (req,res) => {
    let currentuser = getCookie(req,'uname');
    let users = storage.getAllUser().filter((e) => e != currentuser);
    res.render('createroom',{uname: getCookie(req,'uname'), users});
});

app.post('/createroom', (req,res) => {
    let currentuser = getCookie(req,'uname');
    let roomname = req.body.room_name;
    let participants = req.body.participants;
    if (undefined == participants ||storage.isRoomExists(roomname)) {
        res.redirect('/createroom');
    }
    else {
        participants.push(currentuser);
        storage.createRoom(roomname,currentuser,participants);
        participants.forEach(p =>  {
            if (p!=currentuser) {
                let client = storage.getClient(p);
                if (client) client.socket.emit('createroom',{roomname});
            }
        })
        res.redirect('/chat');
    }
});

app.get('/logout', (req,res) => {
    res.clearCookie('uname');
    res.clearCookie('roomname');
    res.redirect('/');
})

/** WebSocket */
ws.on('connection', (socket) => {

    let uname = getCookie(socket.handshake,'uname');
    let client = { socket, uname };

    console.log("connected: " + uname);
    storage.addClient(uname, client);

    socket.on('send',(chat) => {
        let room = storage.addChat(chat.room,chat);
        if (null != room) {
            room.participants.forEach(p => {
                if (p==chat.sender) return;
                let client = storage.getClient(p);
                if (client) {
                    client.socket.emit('receive',chat);
                }
            })
        }
    });

    socket.on('disconnect', () => {
        console.log('diconnected: ' + uname);
        storage.removeClient(client);
    });
});

server.listen(PORT, () => {
    console.log("listening on: *:"+PORT);
})