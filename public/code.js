(function(){

    const app = document.querySelector(".app");
    const socket = io();

    let uname;  

    let img; //agregue esto

//
    document.getElementById('img').onchange=function(e) {
        let reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = function() {
            let preview = document.getElementById('preview');
            imagen = document.createElement('img');
            imagen.src = reader.result;
            imagen.style.width = "200px";
            preview.append(imagen);
        }
    };

    
//

    app.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = app.querySelector(".join-screen #username").value;
        let file = app.querySelector(".join-screen #img").value; // agregue esto
        if (username.length == 0) {
            return;
        }
        socket.emit("newUser", username, file); // agregue file
        uname = username;
        img = file; // agregue esto
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function() {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        };
        renderMessage("my", {
            username:uname,
            text:message,
            file: img
        });
        socket.emit("chat", {
            username:uname,
            text:message,
            file: img
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {
        socket.emit("exitUser", uname);
        window.location.href = window.location.href;
    });

    socket.on("update", function(update) {
        renderMessage("update", update);
    });

    socket.on("chat", function(message) {
        renderMessage("other", message);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");

        var today = new Date();
        var now = today.toLocaleTimeString('en-US');

        if (type == "my") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You | ${now}</div>
                    <div id="preview" class ="styleImage">${message.file}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username} | ${now}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }

        // Scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

})();