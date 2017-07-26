var connection = {
    isOnline: false, 
    sendMessage: function(message){
        if(window.username){
            var data = {sender: window.username, message: message};
            this.sendCommand("sendMessage", data);
            log.append("sent", data);
        }
    },
    sendCommand: function(command, data){
        socket.sendJson({command: command, data: data});
    },
    close: function(){
        socket.close();
        this.isOnline = false;
    },
    reconnect: function(){
        if(this.isOnline) this.close();
        location.reload();
    },
    user: {
        set: function(user){
            sessionStorage.setItem("username", user);
            window.username = user;
            this.send(user);
        },
        send: function(user){
            connection.sendCommand("username", {sender: user, message: ""});
        }
    },
    getTimestamp: function(){
        var time = new Date();
        var h = JSON.stringify(time.getHours());
        var m = JSON.stringify(time.getMinutes());
        var s = JSON.stringify(time.getSeconds());
        return (h.length % 2 === 0 ? h : "0"+h) + ":" + (m.length % 2 === 0 ? m : "0"+m) + ":" + (s.length % 2 === 0 ? s : "0"+s);
    }
};

var element = {
    disable: function(elems){
        elems.forEach(function(elem){
            document.getElementById(elem).setAttribute("disabled", "");
        });
    },
    enable: function(elems){
        elems.forEach(function(elem){
            document.getElementById(elem).removeAttribute("disabled");
        });
    },
    getById: function(id){
        return document.getElementById(id);
    },
    remove: function(what, fromWhat){
        fromWhat.removeChild(what);
    }
};

var log = {
    elem: element.getById("messages"),
    retrieve: function(){
        return this.elem.innerText;
    },
    append: function(type, data){
        if(data){
            switch(type){
                case "sent":
                    type = "sent";
                    break;
                case "received":
                    type = "received";
                    break;
                default:
                    type = null;
                    break;
            }
            if(type != null){
                var message = document.createElement("message");
                var text = document.createElement("text");
                var br = document.createElement("br");
                var sender = document.createElement("sender");
                var timestamp = document.createElement("timestamp");

                message.setAttribute("was", type);
                text.innerText = data.message;
                sender.innerText = data.sender;
                timestamp.innerText = connection.getTimestamp();

                message.appendChild(text);
                message.appendChild(br);
                message.appendChild(sender);
                message.appendChild(timestamp);

                //this.elem.insertBefore(message, this.elem.firstChild);
                this.elem.appendChild(message);

                //if(true) this.elem.scrollTop = this.elem.scrollHeight;
            }
        }
    }
};

//####################################################\\

if(sessionStorage.getItem("username") != null){
    window.username = sessionStorage.getItem("username");
    var usernamehasnotbeensent = true;
}else{
    var username = prompt("You don't have a username set. Please provide one now:");
    while(username == "" || username == null){
        var username = prompt("You don't have a username set. Please provide one now:");
    }
    var usernamehasnotbeenset = username;
}

//####################################################\\

var socket,
    address = window.host+":"+window.port,
    socket = new WebSocket("wss://"+address);
//####################################################\\
socket.onopen = function(){
    if(usernamehasnotbeensent)connection.user.send(window.username);
    if(usernamehasnotbeenset)connection.user.set(usernamehasnotbeenset);
    connection.isOnline = true;
    element.enable(["message"]);
    log.append("received", {sender: "Client", message: "Connected!"});
};
socket.onclose = function(){
    if(log.retrieve() == ""){
        log.append("received", {sender: "Client", message: "Couldn't Connect To "+address+"!"});
        return;
    }
    log.append("received", {sender: "Client", message: "Disconnected From: "+address+"!"});
    element.disable(["message", "send"]);
};
socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if(data["command"] == "broadcast"){
        if(data.data["sender"] != window.username) log.append("received", data.data);
    }
};
socket.sendJson = function(data){
    this.send(JSON.stringify(data));
};
