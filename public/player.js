"use strict";
var socket;
window.onload = ()=>{
    connect();
}
/**
 * Connect to the server.
 */
function connect(){
    const server = developmentMode ? localServer : onlineServer;
    socket = new WebSocket(server);
    socket.onopen = async (evt)=>{
        console.log("Connected");
        const data = JSON.stringify({
            operation: "playerConnected"
        });
        socket.send(data);
    }
    socket.onmessage = (evt)=>{
        const response = JSON.parse(evt.data);
        console.log("Message from server:", response);
        switch (response.operation) {
            case 'newSong':
                newSong(response.data);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    }
    socket.onclose = (evt)=>{
        console.log("Disconnected");
    }
    socket.onerror = (evt)=>{
        alert("An error has occurred");
        console.error(evt);
    }
}
/**
 * Update the current song.
 * @param {JSON} data 
 */
function newSong(data) {
    document.getElementById("songTitle").innerHTML = data.song.title;
    document.getElementById("iframe").setAttribute("src", 
    "https://www.youtube.com/embed/"
    + data.song.src);
}
