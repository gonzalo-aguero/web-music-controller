"use strict";
var socket;
var connectButton;
var disconnectButton;
var globalData;
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
        console.log("Trying to connect...");
        connect();
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
 * Change the current song and send the change to the server.
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
/**
 * Add a song to the play queue and send the data to the server.
 * @param {Number} songId 
 */
function addToQueue(songId){
    const data = JSON.stringify({
        operation: "addToQueue",
        data: {
            song: {
                id: songId,
            }
        }
    });
    socket.send(data);
}
/**
 * Remove a song from the play queue and send the data to the server.
 * @param {Number} songId 
 */
function removeFromQueue(songId){
    const data = JSON.stringify({
        operation: "removeFromQueue",
        data: {
            song: {
                id: songId,
            }
        }
    });
    socket.send(data);
}
/**
 * Update the data when the server sends it.
 * @param {JSON} data 
 */
function newData(data){
    globalData = data;
    updateSongsList();
    updateCurrentSong();
    updateQueue();
}
/**
 * Update the list of the songs in HTML.
 */
function updateSongsList(){
    let html = "";
    globalData.songs.forEach( song => {
        html += `
            <li class="song ${song.id == globalData.song.id ? "reproducing" : ""}">
                <button onclick="">${song.title}</button>
                <button onclick="addToQueue('${song.id}')">Add to queue</button>
            </li>`;
    });
    document.getElementById("songs").innerHTML = html;
    document.getElementById("songsCounter").innerText = globalData.songs.length + ' songs';
}
/**
 * Update the current song title in the header in HTML.
 */
function updateCurrentSong(){
    const currentSong = globalData.song.title;
    document.getElementById("currentSong").innerText = 
        currentSong.length <= 30 
        ? currentSong 
        : currentSong.slice(0,27) + '...';   
}
/**
 * Update the play queue with the new data and print it.
 **/   
function updateQueue(){
    let html = `
        <div id="playQueue">
            <nav>
                <button id="clearPlayQueue" onclick="clearPlayQueue()">
                    <img src="assets/icons/delete_white_24dp.svg" alt="Clear play queue">
                </button>
                <button class="close">
                    <img src="assets/icons/close_white_24dp.svg" alt="Close">
                </button>
            </nav>
        `;
    const windowContainer = document.getElementById("windowContainer_0");
    if(globalData.queue.length > 0){
       globalData.queue.forEach( song => {
            html += `
                <li class="song ${song.id == globalData.song.id ? "reproducing" : ""}">
                    <button>${song.title}</button>
                    <button onclick="removeFromQueue('${song.id}')">Remove</button>
                </li>`;
        });
    }else{
        html += `
            <span>No songs added to the queue.</span>
        `;
    }
    html += `</div>`; 

    windowContainer.innerHTML = html;
    document.querySelector('#playQueue > nav > .close').addEventListener("click", ()=>{
        windowContainer.style.display = "none";
    });
}
/**
 * Finalize the current song and then restart the play queue. 
 */
function restartQueue(){
    if(globalData.queue.length < 1){
        alert("The play queue is empty.");
        return;
    }
    const msg = "It will restart the play queue.\nAre you sure?";
    if(confirm(msg)){
        const data = JSON.stringify({
            operation: "restartQueue"
        });
        socket.send(data);
    }
}
function clearPlayQueue(){
    if(globalData.queue.length < 1){
        alert("The play queue is empty.");
        return;
    }
    const msg = "It will clear the play queue.\nAre you sure?";
    if(confirm(msg)){
        const data = JSON.stringify({
            operation: "clearPlayQueue"
        });
        socket.send(data);
    }
}