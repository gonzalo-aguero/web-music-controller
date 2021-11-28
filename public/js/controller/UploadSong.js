function uploadSong(){
    let html = `
        <div id="uploadSong">
            <nav>
                <button class="close">
                    <img src="assets/icons/close_white_24dp.svg" alt="Close">
                </button>
            </nav>
            <form method="post">
                <div class="inputBlock">
                    <label for="songName">Song Name</label>
                    <input type="text" name="songName" id="songName"/>
                </div>
                <div class="inputBlock">
                    <label for="songToUpload">Put the URL</label>
                    <input type="text" name="songToUpload" id="songToUpload"/>
                </div>
                <input type="submit" value="Done">
            </form>
        </div>
        `;
    const windowContainer = document.getElementById("windowContainer_1");

    windowContainer.innerHTML = html;

    const closeButton = document.querySelector('#uploadSong > nav > .close');
    const submitButton = document.querySelector('#uploadSong > form > input[type="submit"]');

    closeButton.addEventListener("click", ()=>{
        windowContainer.style.display = "none";
    });
    submitButton.addEventListener("click", (evt)=>{
        evt.preventDefault();
        const songUrl = document.getElementById("songToUpload").value;
        const songName = document.getElementById("songName").value;
        sendNewSong(songUrl, songName)
    });
    windowContainer.style.display = "flex";
}
async function sendNewSong(url, name){
    const r = await fetch('./add-song',{ 
        method: 'POST',
        body: JSON.stringify({
            filename: name,
            uri: url
        }),
        headers: {
            "Content-Type": 'application/json'
        }
    });
    const formattedResponse = await r.json();
    if(r.status !== 200)
        throw Error("Error in UploadSong.sendNewSong()\nResponse status: " + r.status);
    else
        console.log("New song sent successfully")
}