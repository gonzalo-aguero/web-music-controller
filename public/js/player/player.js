"use strict";
var socket;
var globalData = {};
var currentSongIndex = -1;//Current song index in queue.
var playOn = false;
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
        playOn = true;
    }
    socket.onmessage = (evt)=>{
        const response = JSON.parse(evt.data);
        console.log("Message from server:", response);
        switch (response.operation) {
            case 'newData':
                newData(response.data);
                break;
            case 'removedFromQueue':
                const removedSongIndex = response.data.song.index;
                if(removedSongIndex <= currentSongIndex){
                    currentSongIndex--;
                }
                break;
            case 'restartQueue':
                currentSongIndex = -1;
                break;
            case 'clearPlayQueue':
                currentSongIndex = -1;
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    }
    socket.onclose = (evt)=>{
        console.log("Disconnected");
        console.log("Trying to connect...");
        connect();
    }
    socket.onerror = (evt)=>{
        console.error("An error has occurred",evt);
    }
}
function newData(data){
    globalData = data;
    play();
}
function play(){
    const defaultPath = "./assets/songs/";//default path of songs.
    const songTitle = document.getElementById("songTitle");
    const audio = document.querySelector("audio");
    setInterval(()=>{
        if(playOn){
            //Only if play is on.
            if(audio.ended || audio.getAttribute("src") === ""){
                //If the last song has finished or there is no last song.
                if(currentSongIndex < globalData.queue.length -1){
                    currentSongIndex++;
                    const song = globalData.queue[currentSongIndex];
                    songTitle.innerHTML = song.title;
                    audio.setAttribute("src", defaultPath + song.src);
                    audio.play();
                    changeSong(song.id);
                }
            }
        }
    }, 200);
}
/**
 * Send the current song to the server.
 * @param {Number} songId 
 */
 function changeSong(songId) {
    const data = JSON.stringify({
        operation: "changeSong",
        data: {
            song: {
                id: songId,
            }
        }
    });
    socket.send(data);
}