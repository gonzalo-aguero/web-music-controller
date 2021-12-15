"use strict";
var socket;
var globalData = {};
var currentSongIndex = -1;//Current song index in queue.
const defaultPath = "./assets/songs/";//default path of the songs.
var songTitle;
var audio;
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
                newData(response.data);
                break;
            case 'removedFromQueue':
                const removedSongIndex = response.data.song.index;
                if(removedSongIndex <= currentSongIndex){
                    currentSongIndex--;
                }
                break;
            case 'restartQueue':
                restartQueue();
                break;
            case 'clearPlayQueue':
                currentSongIndex = -1;
                break;
            case 'skipPrevious':
                skip('previous');
                break;
            case 'skipNext':
                skip('next');
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
    songTitle = document.getElementById("songTitle");
    audio = document.querySelector("audio");
    setInterval(()=>{
        if(audio.ended || audio.getAttribute("src") === ""){
            //If the last song has finished or there is no last song.
            if(currentSongIndex < (globalData.queue.length -1)){
                currentSongIndex++;
                const songToPlay = globalData.queue[currentSongIndex];
                songTitle.innerHTML = songToPlay.title;
                audio.setAttribute("src", defaultPath + songToPlay.src);
                audio.play();
                changeSong(songToPlay.id);
            }
        }
    }, 200);
}
function restartQueue(){
    currentSongIndex = 0;
    const songToPlay = globalData.queue[currentSongIndex];
    songTitle.innerHTML = songToPlay.title;
    audio.setAttribute("src", defaultPath + songToPlay.src);
    audio.play();
    changeSong(songToPlay.id);
}
function skip(direction = 'next'){
    const nextCondition = currentSongIndex < (globalData.queue.length -1);
    const previousCondition = currentSongIndex > 0;
    if(direction === 'next' && nextCondition){
        currentSongIndex++;
    }else if(direction === 'previous' && previousCondition){
        currentSongIndex--;
    }else{
        return;
    }

    const songToPlay = globalData.queue[currentSongIndex];
    songTitle.innerHTML = songToPlay.title;
    audio.setAttribute("src", defaultPath + songToPlay.src);
    audio.play();
    changeSong(songToPlay.id);
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