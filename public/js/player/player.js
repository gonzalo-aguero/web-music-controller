"use strict";
var socket;
window.onload = ()=>{
    connect();
    document.getElementById("start").addEventListener("click", connect);
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
            case 'newData':
                newSong(response.data);
                break;
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
    const audio = document.querySelector("audio");
    audio.setAttribute("src", "./assets/songs/" + data.song.src);
    audio.play();
}
