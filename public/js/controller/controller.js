"use strict";
var socket;
var connectButton;
var disconnectButton;
window.onload = ()=>{
    connect();
    connectButton = document.getElementById("connect");
    disconnectButton = document.getElementById("disconnect");

    connectButton.addEventListener("click", connect);
    disconnectButton.addEventListener("click", disconnect);

    //init animations
    coloredBackground(document.getElementById("chatNavigation"));    
    setTimeout(()=>{
        coloredBackground(document.getElementById("songs"));
    },750);
    setTimeout(()=>{
        coloredBackground(document.getElementById("footer"));
    },1500);
}
/**
 * Connect to the server.
 */
function connect(){
    const server = developmentMode ? localServer : onlineServer;
    socket = new WebSocket(server);
    socket.onopen = async (evt)=>{
        connectedStatus();
        console.log("Connected");
        const data = JSON.stringify({
            operation: "controllerConnected"
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
            case 'newSong':
                newData(response.data);
                break;
            default:
                console.error("Undefined operation");
                break;
        }
    }
    socket.onclose = (evt)=>{
        disconnectedStatus();
        console.log("Disconnected");
    }
    socket.onerror = (evt)=>{
        alert("An error has occurred");
        console.error(evt);
    }
}
function disconnect() {
    socket.close();
}
/**
 * Set the DOM status when the client is connected.
 */
function connectedStatus(){
    const connectionStatusHTML = document.getElementById("connectionStatus");
    connectionStatusHTML.classList.replace("disconnected", "connected");
    connectButton.disabled = true;
    disconnectButton.disabled = false;
}
/**
 * Set the DOM status when the client is disconnected.
 */
function disconnectedStatus(){
    const connectionStatusHTML = document.getElementById("connectionStatus");
    connectionStatusHTML.classList.replace("connected", "disconnected");
    connectButton.disabled = false;
    disconnectButton.disabled = true;
}
/**
 * Change the current song.
 * @param {JSON} songId 
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
/**
 * Update the data.
 * @param {JSON} data 
 */
function newData(data){
    let html = "";
    data.songs.forEach( song => {
        html += `<button onclick="changeSong('${song.id}')"
            class="${song.reproducing ? "reproducing" : ""}"
        >${song.title}</button>`;
    });
    document.getElementById("songs").innerHTML = html;
    document.getElementById("songsCounter").innerText = data.songs.length + ' songs';
    const currentSong = data.song.title;
    document.getElementById("currentSong").innerText = 
        currentSong.length <= 30 
        ? currentSong 
        : currentSong.slice(0,27) + '...';
}