function uploadSong(){
    let html = `
        <div id="uploadSong">
            <nav>
                <button class="close">
                    <img src="assets/icons/close_white_24dp.svg" alt="Close">
                </button>
            </nav>
            <form>
                <div class="inputBlock">
                    <label for="songToUpload">Only .mp3</label>
                    <input type="file" name="songToUpload" id="songToUpload">
                </div>
                <input type="submit" value="Done">
            </form>
        </div>
        `;
    const windowContainer = document.getElementById("windowContainer_1");
    windowContainer.innerHTML = html;
    document.querySelector('#uploadSong > nav > .close').addEventListener("click", ()=>{
        windowContainer.style.display = "none";
    });
    windowContainer.style.display = "flex";
}