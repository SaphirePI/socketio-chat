const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);

app.use(require('express').static('public'));

io.on('connection', socket => {
    console.log('A new client connected')
    
    socket.on('chat', message => {
        io.emit('chat', {
            message,
            username: socket.username
        })
    })

    socket.on('join', name => {
        io.emit('join',name)
        socket.username = name;
    })
});

server.listen(3000);
