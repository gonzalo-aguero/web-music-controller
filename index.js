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
        id: null,
        title: "None",
        src: null,
        reproducing: true
    },
    songs: [
        // {id: null,title: '',src: '',reproducing: false}
    ]
};
var player = null;
const songs = functions.listDirectory("./public/assets/songs/");
songs.forEach( (song, i) => {
    globalData.songs.push({
        id: i,
        title: song.replace('.mp3', ''),
        src: song,
        reproducing: false
    });
});
wsServer.on('request', (req)=>{
    const _connection = req.accept(null, req.origin);
    const _remoteAddress = _connection.remoteAddress;
    console.log(`New client connected at ${functions.useDate()} ---> ${_remoteAddress}`);
    //Event when receiving a new message.
    _connection.on("message", (message)=>{
        const msg = JSON.parse(message.utf8Data);
        switch (msg.operation) {
            case 'controllerConnected':
                connections.push({
                    instance: _connection,
                    isPlayer: false
                });
                newData(_connection);
                break;
            case 'playerConnected':
                player = _connection;
                connections.push({
                    instance: _connection,
                    isPlayer: true
                });
                newData(player);
                break;
            case 'changeSong':
                changeSong(msg.data.song.id);
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
            if(connection.instance.remoteAddress === _remoteAddress && !connection.isPlayer){
                connection.instance.close();
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
    console.log(`Listening in port ${app.get('port')}\nGo to http://localhost:${app.get('port')}`);
})

/**
 * Send the updated data.
 * @param {JSON} specificConnection To send the updated data only to a specific connection.
 */
function newData(specificConnection = null){
    let msg = {
        operation: 'newData',
        data: globalData
    }
    msg = JSON.stringify(msg);
    if(specificConnection === null){
        connections.forEach( connection => {
            connection.instance.sendUTF(msg);
        });
        try {
            player.sendUTF(msg);
        } catch (error) {
            console.error(error);
        }
    }else{
        specificConnection.sendUTF(msg);
    }
}
/**
 * Send the new current song.
 */
function changeSong(songId){
    // Previous song.
    const currentSongIndex = globalData.song.id;
    if(currentSongIndex !== null){
        globalData.songs[currentSongIndex].reproducing = false;
    }

    // New song.
    const newSongIndex = songId;
    globalData.songs[newSongIndex].reproducing = true;
    const newSong = globalData.songs[newSongIndex];
    globalData.song = newSong;

    // Send the new song.
    let msg = {
        operation: 'newSong',
        data: globalData
    }
    msg = JSON.stringify(msg);
    connections.forEach( connection => {
        connection.instance.sendUTF(msg);
        console.log(msg);
    });
    try {
        player.sendUTF(msg);
    } catch (error) {
        console.warn(error);
    }
}