const config = require("./config.json");
const xssCleaner = require('xss');
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, options);
app.use(require('express').static('public'));

let newID = { messages: 0 };
let banned = new Set();
let messagesPerSec = {};
const link = new RegExp(
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm
);

io.on("connection", (socket) => {
    console.log("A new client connected :tada:");

    if(config.falseTheFlood == true) setInterval(() => {
        if(banned.has(socket.username) == true) return;
        if(messagesPerSec[socket.username] && messagesPerSec[socket.username].length >= 3) {
            for (const message of messagesPerSec[socket.username]) {
                io.emit("delete", message.id);
            }

            banned.add(socket.username);
            io.emit("chat", {
                message: `<span style="color: black; background-color: gold;">${socket.username} был заблокирован в чате за флуд.</span>`,
                username: "Авто-модератор"
            });
        }
        messagesPerSec[socket.username] = [];
    }, 1500);

    socket.on("checkBan", (username) => socket.emit("checkBanValid", banned.has(username)));
    socket.on("chat", (message) => {
        if(banned.has(socket.username) == true) return;
        newID["messages"]++;

        if(!messagesPerSec[socket.username]) messagesPerSec[socket.username] = [{ id: newID["messages"], message: xssCleaner(message) }];
        else messagesPerSec[socket.username].push({ id: newID["messages"], message: xssCleaner(message) });

        if(link.test(message) == true && config.falseLinkSending == true) return;
        if(message.length) io.emit("chat", {
            id: newID["messages"],
            message: xssCleaner(message),
            username: socket.username
        });
    });

    socket.on("join", (name) => {
        if(banned.has(socket.username) == true) return;
        io.emit("join", name);
        socket.username = name;
    });

    socket.on("disconnect", () => {
        if(banned.has(socket.username) == true) return;
        if(socket.username) io.emit("leave", socket.username);
    });
});

server.listen(config.port, () => console.log("Server started!"));