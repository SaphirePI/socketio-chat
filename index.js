const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

app.use(require('express').static('public'));

io.on('connection', socket => {
    console.log('A new client connected')
    socket.on('chat', message => {
        if(message.length) io.emit('chat', {
            message,
            username: socket.username
        })
    })

    socket.on('join', name => {
        io.emit('join',name)
        socket.username = name;
    })

    socket.on('disconnect', () => {
        if(socket.username) io.emit('leave', socket.username)
    })
});

server.listen(3000);
