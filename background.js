//When msg is recieved call this function
chrome.runtime.onMessage.addListener(roomHandler);

//This function manages connection with server
function roomHandler(message) {
    //only activate if create-room command sent 
    if(message["room-action"] == "create-room") {
        console.log("creating room");

    } else if(message["room-action"] == "join-room") {
        console.log("Joining room");
    }
}