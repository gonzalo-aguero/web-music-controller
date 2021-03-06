const { Router } = require('express');
const router = Router();

router.get('/', (req, res)=>{
    res.render('index.ejs');
});
router.get('/player', (req, res)=>{
    res.render('player.ejs');
});
router.get('/uploadSongForm', (req, res)=>{
    res.render('uploadSongForm.ejs');
});
router.post('/add-song', (req, res)=>{
    require('./addSongHandler').upload(req, (responseMessage)=>{
        res.render('uploadSongForm.ejs', { 
            responseMessage
        });
        res.end(); 
    });
});

router.use((req, res, next)=>{
    // 404 not found
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});

module.exports = router;