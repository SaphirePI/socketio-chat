var application = new Vue({
    el: "#app",
    data: {
        io: null,
        user: {
            connected: false,
            nickname: null
        }
    },
    methods: {
        join_chat(username) {
            if(!username || username.length < 3) return alert("Введите ник длиною > 3");
            this.io.emit("checkBan", username);
            this.io.on("checkBanValid", (banned) => {
                if(banned == true) return alert("Никнейм, под которым вы пытаетесь войти в чат, был заблокирован системой.");
                this.user.connected = true;
                this.user.nickname = username;
                this.io.emit('join', username);
            });
        },
        send_message() {
            const message = $("#send");

            this.io.emit('chat', message.val());
            message.val("");
        }
    },
    mounted() {
        this.io = io();

        this.io.on('chat', message => {
            $(".messages").append(`<div class="media message" id="${message.id}">
            <div class="media-body">
                <h5 class="mt-0 mb-1">${message.username} <small class="text-muted">${new Date().toLocaleString()}</small></h5>
                ${message.message}
            </div>
        </div>`);
        });

        this.io.on('join', username => {
            $(".messages").append(`<div class="media message">
            <b>${username}<b><span style="margin-left: 1px;"> подключился.</span>
        </div>`);
        });

        this.io.on('leave', username => {
            $(".messages").append(`<div class="media message">
            <b>${username}<b><span style="margin-left: 1px;"> покидает чат.</span>
        </div>`);
        });

        this.io.on('delete', id => {
            $("#" + id)[0].hidden = true;
        });
    }
});

$("form").submit(function(e){
    e.preventDefault();

    const username = $('#name').val();
    application.join_chat(username);
});
