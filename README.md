# web-music-controller
## Description
This is a web application to play music from one device but control it from many others. It could be used in a bar, where people can select the song to play.
Currently its functionality is no more than this, but I plan to add more to it.
For the development I used Node JS, Express and WebSockets.

## For install this web application in your computer
### Clone the repository
~~~
git clone https://github.com/gonzalo90fa/gma-chat.git
~~~
### Navigate to cloned repository folder.
~~~
cd gma-chat
~~~
### Go to ./public/config.js and change const developmentMode to "true";
~~~
1 const developmentMode = false; // Line number 1
~~~
### In the same file, change the value after "ws://" to your local ip in const localServer.
~~~
2 const localServer = "ws://192.168.1.23:3000/"; // Line number 2
~~~
## Put your songs in ./public/assets/songs/
## Start the server.
~~~
npm start
~~~
## Go to http://localhost/player for use the player.
## Go to http://youLocalIP/ for use the controller (You can use the controller from any device connected to your network using the IP of your computer assigned by the router).
