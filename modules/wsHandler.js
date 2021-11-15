const functions = require('./functions');
const WebSocketServer = require("websocket").server;
class wsHandler{
    constructor(server){
        this.server = server;
        this.wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });
        this.connections = [];
        this.player = null;
        this.globalData = {
            //current song
            song: {
                id: null,
                title: "None",
                src: null,
            },
            songs: [
                // {id: null,title: '',src: ''}
            ],
            queue: []
        };
        this.init();
    }
    init(){
        this.requestHandler();
        this.listenSongFolder();
    }
    requestHandler(){
        this.wsServer.on('request', (req)=>{
            const _connection = req.accept(null, req.origin);
            const _remoteAddress = _connection.remoteAddress;
            console.log(`New client connected at ${functions.useDate()} ---> ${_remoteAddress}`);
            //Event when receiving a new message.
            _connection.on("message", (message)=>{
                const msg = JSON.parse(message.utf8Data);
                switch (msg.operation) {
                    case 'controllerConnected':
                        this.connections.push({
                            instance: _connection,
                            isPlayer: false
                        });
                        this.newData(_connection);
                        break;
                    case 'playerConnected':
                        this.player = _connection;
                        this.connections.push({
                            instance: _connection,
                            isPlayer: true
                        });
                        this.newData(this.player);
                        break;
                    case 'changeSong':
                        this.changeSong(msg.data.song.id);
                        break;
                    case 'addToQueue':
                        this.addToQueue(msg.data.song.id);
                        break;
                    case 'removeFromQueue':
                        this.removeFromQueue(msg.data.song.id);
                        break;
                    case 'restartQueue':
                        this.restartQueue();
                        break;
                    case 'clearPlayQueue':
                        this.clearPlayQueue();
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
                this.connections.forEach( (connection, i) => {
                    if(connection.instance.remoteAddress === _remoteAddress && !connection.isPlayer){
                        connection.instance.close();
                        this.connections.splice(i, 1);
                    }
                });
            });
        });
    }
    getSongs(callback = (songs = [])=>{}){
        const songs = functions.listDirectory("./public/assets/songs/");
        callback(songs);
        return songs;
    }
    listenSongFolder(){
        setInterval(()=>{
            this.getSongs((songs)=>{
                this.globalData.songs = [];
                songs.forEach( (song, i) => {
                    this.globalData.songs.push({
                        id: i,
                        title: song.replace('.mp3', ''),
                        src: song
                    });
                });
                this.newData(false, false);
            });
        }, 2000);
    }
    /**
     * Send the updated globalData to clients.
     * @param {JSON} specificConnection To send the updated data only to a specific connection. It's false by default (disabled).
     * @param {Boolean} sendToPlayer If it's true, it will send the new data to player connection. Default: true.
     */
    newData(specificConnection = false, sendToPlayer = true){
        let msg = {
            operation: 'newData',
            data: this.globalData
        }
        msg = JSON.stringify(msg);
        if(!specificConnection){
            //Send new data to all the connections.
            this.connections.forEach( connection => {
                if(!connection.isPlayer){
                    connection.instance.sendUTF(msg);
                }
            });
            if(sendToPlayer){
                try {
                    this.player.sendUTF(msg);
                } catch (error) {
                    console.error(error);
                }
            }
        }else{
            //Send new data to a specific connection.
            specificConnection.sendUTF(msg);
        }
    }
    /**
     * Change the current song and send the new current song to clients.
     */
    changeSong(songId){
        // New song.
        const newSongIndex = songId;
        // globalData.songs[newSongIndex].reproducing = true;
        const newSong = this.globalData.songs[newSongIndex];
        this.globalData.song = newSong;

        // Send the new song.
        let msg = {
            operation: 'newData',
            data: this.globalData
        }
        msg = JSON.stringify(msg);
        this.connections.forEach( connection => {
            connection.instance.sendUTF(msg);
        });
        try {
            this.player.sendUTF(msg);
        } catch (error) {
            console.warn(error);
        }
    }
    /**
     * Add a song to the play queue and send the updated data to clients.
     * @param {Number} songId 
     */
    addToQueue(songId){
        const song = this.globalData.songs.find(song => song.id == songId);
        this.globalData.queue.push(song);
        this.newData();//send the updated data.
    }
    /**
     * Remove a song from the play queue and send the updated data to clients.
     * @param {Number} songId 
     */
    removeFromQueue(songId){
        const songIndex = this.globalData.queue.findIndex(song => song.id == songId);
        if(songIndex !== -1){
            this.globalData.queue.splice(songIndex, 1);
        }
        let msg = {
            operation: 'removedFromQueue',
            data: {
                song: {
                    index: songIndex,
                },
            }
        }
        msg = JSON.stringify(msg);
        this.player.sendUTF(msg);
        this.newData();//send the updated data.
    }
    /**
     * Restart the play queue.
     */
    restartQueue(){
        let msg = {
            operation: 'restartQueue'
        }
        msg = JSON.stringify(msg);
        this.player.sendUTF(msg);
    }
    /**
     * Clear the play queue.
     */
    clearPlayQueue(){
        this.globalData.queue = [];
        let msg = {
            operation: 'clearPlayQueue'
        }
        msg = JSON.stringify(msg);
        this.player.sendUTF(msg);
        this.newData();//send the updated data.
    }
}
module.exports.wsHandler = wsHandler;