const fs = require('fs');
const request = require('request');

/**
 * Get and download a file by URL.
 * @param {*} uri 
 * @param {*} filename Name for the new file.
 * @param {*} callback Function to execute when the new file wull be closed.
 */
function downloadByUrl(uri, filename, callback = ()=>{}){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(`./public/assets/songs/${filename}.mp3`)).on('close', callback);
    });
};

module.exports = {
    downloadByUrl
};