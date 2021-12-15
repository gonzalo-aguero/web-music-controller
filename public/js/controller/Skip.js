function skip(direction = 'next'){
    let data;
    if(direction === 'next'){
        data = {
            operation: "skipNext",
        }
    }else if(direction === 'previous'){
        data = {
            operation: 'skipPrevious'
        }
    }
    data = JSON.stringify(data);
    socket.send(data);
}