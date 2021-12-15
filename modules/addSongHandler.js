const formidable = require('formidable');
const fs = require('fs');
async function upload(req, callback = (responseMessage)=>{}){
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        const oldpath = files.songToUpload.filepath;
        const originalName = files.songToUpload.originalFilename;
        let newName = fields.songName;
        let finalName = "";

        if(!originalName.includes('.mp3', -4)){
            callback('The file must be .mp3!');//responseMessage
            return;
        }
        
        if(newName.length > 0){
            if(!newName.includes('.mp3', -4)){
                newName += '.mp3';
            }
            finalName = newName;
        }else{
            finalName = originalName;
        }
    
        const newpath = './public/assets/songs/' + finalName;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;

            callback('Song uploaded successfully!');
            return;
        });
    });
}

module.exports = {
    upload
};