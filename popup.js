// popup.js

const btnCreateRoom = document.getElementById("btn-create-room");
const btnJoinRoom = document.getElementById("btn-join-room");
const inputRoomCode = document.getElementById("input-room-code");
const connectStatus = document.getElementById("connect-status");
const roomIdEl = document.getElementById("room-id");

chrome.storage.local.get(['status', 'roomId'], (result) => {
    if (result.status === "Connected") {
        connectStatus.innerText = "Connected";
        roomIdEl.innerText = result.roomId;
    }
});

btnCreateRoom.addEventListener('click', createRoom);
btnJoinRoom.addEventListener('click', joinRoom);

function createRoom() {
    chrome.runtime.sendMessage({ "popup-action": "create-room" });
}

function joinRoom() {
    if (inputRoomCode.value.length !== 7) {
        connectStatus.innerText = "Enter a valid 7-character code";
    } else {
        chrome.runtime.sendMessage({ "popup-action": "join-room", roomId: inputRoomCode.value.toUpperCase() });
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message["background-action"] === "connected") {
        connectStatus.innerText = "Connected";
        roomIdEl.innerText = message.roomId;
        // -------------------------------------------------------------------
        // FIX (BUG 5): Removed duplicate chrome.storage.local.set() here.
        // background.js already writes to storage on auth success — popup
        // only needs to update its own UI.
        // -------------------------------------------------------------------
    }

    if (message["background-action"] === "failed") {
        connectStatus.innerText = "Invalid room code";
    }
});