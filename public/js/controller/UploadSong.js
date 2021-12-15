function uploadSong(){
    let html = `
        <div id="uploadSong">
            <nav>
                <button class="close">
                    <img src="assets/icons/close_white_24dp.svg" alt="Close">
                </button>
            </nav>
            <iframe src="./uploadSongForm"></iframe>
        </div>
        `;
    const windowContainer = document.getElementById("windowContainer_1");

    windowContainer.innerHTML = html;

    const closeButton = document.querySelector('#uploadSong > nav > .close');

    closeButton.addEventListener("click", ()=>{
        windowContainer.style.display = "none";
    });
    windowContainer.style.display = "flex";
}