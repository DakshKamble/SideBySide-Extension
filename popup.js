/* 
 *  popup.js
 *  this script catches button inputs and sends to service_worker.js
 */

//Saving button elements in constants to use later
const btnCreateRoom = document.getElementById("btn-create-room");
const btnJoinRoom = document.getElementById("btn-join-room");

const inputRoomCode = document.getElementById("input-room-code");

const connectStatus = document.getElementById("connect-status");

const roomId = document.getElementById("room-id");

//Adding event listener 'onclick' to the buttons
btnCreateRoom.addEventListener('click', createRoom);
btnJoinRoom.addEventListener('click', joinRoom);

//This funcion contacs the service and tells content.js to open the side panel
function createRoom() {
    console.log("Creating Room!");
    chrome.runtime.sendMessage({"popup-action" : "create-room"});
}

function joinRoom() {
    if(inputRoomCode.value.length != 7) {
        console.log("Please enter valid room code");
    } else {
        console.log("Joining Room!");
        chrome.runtime.sendMessage({"popup-action" : "join-room", roomId: inputRoomCode.value}); //this sends the room-action to background.js along with room code
    }
}

chrome.runtime.onMessage.addListener(background_Handler);


function background_Handler(message) {
    if(message["background-action"] == "connected") {
        connectStatus.innerText = "Connected";
        roomId.innerText = message.roomId;
        
    }

    if(message["background-action"] == "failed") {
        connectStatus.innerText = "invalid";
    }
}