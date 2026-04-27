//When msg is recieved call this function
chrome.runtime.onMessage.addListener(createRoom_server);
chrome.runtime.onMessage.addListener(joinRoom_server);

function createRoom_server(message) {
    //only activate if create-room command sent 
    if(message["room-action"] == "create-room") {
        console.log("creating room");
    }
}

function joinRoom_server(message) {
    if(message["room-action"] == "join-room") {
        console.log("Joining room");
    }
}
