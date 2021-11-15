require('dotenv').config();
const express = require('express');
const app = express();
const path = require("path");
const cors = require('cors');
const server = require('http').Server(app);

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

//Web Sockets Handler
const ws = require('./modules/wsHandler');
new ws.wsHandler(server);

//Routes
app.use(require('./modules/routes'));
server.listen(app.get('port'), ()=>{
    console.log(`Listening in port ${app.get('port')}\nGo to http://localhost:${app.get('port')} to use the controller\nand go to http://localhost:${app.get('port')}/player to use the player.`);
})