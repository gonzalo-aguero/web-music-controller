"use strict";
var socket;
var connectButton;
window.onload = ()=>{
    connect();
    connectButton = document.getElementById("connect")
    connectButton.addEventListener("click", connect);
    //Event to send message with the new song.
    document.getElementById("message").addEventListener("keypress", e =>{
        if(e.key === 'Enter'){
            e.preventDefault();
            changeSong();
        }
    });
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
        disconnectedStatus();
        console.log("Disconnected");
    }
    socket.onerror = (evt)=>{
        alert("An error has occurred");
        console.error(evt);
    }
}
/**
 * Set the DOM status when the client is connected.
 */
function connectedStatus(){
    const connectionStatusHTML = document.getElementById("connectionStatus");
    connectionStatusHTML.classList.replace("disconnected", "connected");
    connectButton.disabled = true;
}
/**
 * Set the DOM status when the client is disconnected.
 */
function disconnectedStatus(){
    const connectionStatusHTML = document.getElementById("connectionStatus");
    connectionStatusHTML.classList.replace("connected", "disconnected");
    connectButton.disabled = false;
}
/**
 * Change the current song.
 * @param {JSON} data 
 */
function changeSong() {
    const newSong = document.getElementById("message").value;
    const data = JSON.stringify({
        operation: "changeSong",
        data: {
            song: {
                title: newSong,
                src: newSong,
            }
        }
    });
    socket.send(data);
}
/**
 * Update the current song.
 * @param {JSON} data 
 */
function newSong(data){

}