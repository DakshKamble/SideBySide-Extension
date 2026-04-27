/* 
 *  popup.js
 *  this script catches button inputs and sends to service_worker.js
 */

//Saving button elements in constants to use later
const btnCreateRoom = document.getElementById("btn-create-room");
const btnJoinRoom = document.getElementById("btn-join-room");

const inputRoomCode = document.getElementById("input-room-code");

//Adding event listener 'onclick' to the buttons
btnCreateRoom.addEventListener('click', createRoom);
btnJoinRoom.addEventListener('click', joinRoom);


//This funcion contacs the service and tells content.js to open the side panel
function createRoom() {
    console.log("Creating Room!");
    chrome.runtime.sendMessage({"room-action" : "create-room"});
}

function joinRoom() {
    if(inputRoomCode.value.length != 7) {
        console.log("Please enter valid room code");
    } else {
        console.log("Joining Room!");
        chrome.runtime.sendMessage({"room-action" : "join-room"});
    }
}
