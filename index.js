const express = require('express');
const app = express();
const path = require("path");
const cors = require('cors');
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const functions = require('./modules/functions');

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var connections = [];
var globalData = {
    song: {
        title: "-"
    }
};
var player = null;
wsServer.on('request', (req)=>{
    const _connection = req.accept(null, req.origin);
    const _remoteAddress = _connection.remoteAddress;
    connections.push(_connection);
    console.log(`New client connected at ${functions.useDate()} ---> ${_remoteAddress}`);
    
    //Event when receiving a new message.
    _connection.on("message", (message)=>{
        const msg = JSON.parse(message.utf8Data);
        switch (msg.operation) {
            case 'playerConnected':
                player = _connection;
                break;
            case 'changeSong':
                changeSong(msg.data);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    });

    //Event when connection is closed.
    _connection.on("close", (reasonCode, description)=>{
        console.log(`Client ${_remoteAddress} disconnected at ${functions.useDate()}.`);
        //Close and delete all websocket connections with that remote address.
        connections.forEach( (connection, i) => {
            if(connection.remoteAddress === _remoteAddress){
                connection.close();
                connections.splice(i, 1);
            }
        });
    });
});


app.get('/', (req, res)=>{
    res.render('index.ejs');
});
app.get('/player', (req, res)=>{
    res.render('player.ejs');
});
app.use((req, res, next)=>{
    // 404 not found
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});
server.listen(app.get('port'), ()=>{
    console.log("Listening in port",app.get('port'));
})



function changeSong(data){
    globalData = data;
    let msg = {
        operation: 'newSong',
        data: globalData
    }
    msg = JSON.stringify(msg);
    connections.forEach( connection => {
        connection.sendUTF(msg);
        console.log(msg);
    });
    try {
        player.sendUTF(msg);
    } catch (error) {
        console.warn(error);
    }
}