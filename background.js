//When msg is recieved call this function
chrome.runtime.onMessage.addListener(roomHandler);

const socket = new WebSocket("ws://localhost:8888"); //conect to teh websocket
//This function manages connection with server

//handle server responses
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data); //parse to be abel to read
    
    if (data["server-action"] == "new-room-code") {
        socket.send(JSON.stringify({"server-action" : "join-room", roomId: data.roomId}));
    }

    if(data["auth"] == "success") {
        chrome.runtime.sendMessage({"background-action" : "connected", roomId : data.roomId});
    }

    if(data["auth"] == "failed") {
        chrome.runtime.sendMessage({"background-action" : "failed"});
    }
});

//send to server
function roomHandler(message) {
    //only activate if create-room command sent 
    if(message["popup-action"] == "create-room") {
        console.log("creating room");

        socket.send(JSON.stringify({"server-action" : "new-room-code"})) //ask server for roomcode new

    } else if(message["popup-action"] == "join-room") {
        console.log("Joining room");
        socket.send(JSON.stringify({"server-action" : "join-room", roomId: message.roomId})); // send connect request to server

    }
}