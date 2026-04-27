/* 
 *  popup.js
 *  this script catches button inputs and sends to service_worker.js
 */

//Saving button elements in constants to use later
const btnCreateRoom = document.getElementById("btn-create-room");
const btnJoinRoom = document.getElementById("btn-join-room");

const inputRoomCode = document.getElementById("input-room-code");

//Adding event listener 'onclick' to the buttons
btnCreateRoom.addEventListener('click', () => {
    console.log("Creating Room!");
});

btnJoinRoom.addEventListener('click', () => {
    if(inputRoomCode.value.length != 7) {
        console.log("Please enter valid room code");
    } else {
        console.log("Joining Room!");
    }
});
