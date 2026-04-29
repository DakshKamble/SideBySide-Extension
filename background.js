// background.js

let socket = null;

function getSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    }

    socket = new WebSocket("ws://localhost:8888");

    socket.addEventListener('open', () => {
        chrome.storage.local.get(['roomId'], (result) => {
            if (result.roomId) {
                socket.send(JSON.stringify({ "server-action": "join-room", roomId: result.roomId }));
            }
        });
    });

    socket.addEventListener('message', handleServerMessage);

    socket.addEventListener('close', () => {
        socket = null;
    });

    return socket;
}

function safeSend(data) {
    const s = getSocket();
    if (s.readyState === WebSocket.OPEN) {
        s.send(JSON.stringify(data));
    } else {
        s.addEventListener('open', () => {
            s.send(JSON.stringify(data));
        }, { once: true });
    }
}

function sendToVideoTabs(data) {
    chrome.tabs.query({ url: ["*://*.netflix.com/*", "*://*.youtube.com/*"] }, (tabs) => {
        for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, data).catch(() => {});
        }
    });
}

function handleServerMessage(event) {
    const data = JSON.parse(event.data);

    if (data["server-action"] === "new-room-code") {
        safeSend({ "server-action": "join-room", roomId: data.roomId });
    }

    if (data["auth"] === "success") {
        // -------------------------------------------------------------------
        // FIX (BUG 5): background.js is the single source of truth for
        // storage. Removed the duplicate write from popup.js — only do it
        // here. Popup listener now only updates the UI, not storage.
        // -------------------------------------------------------------------
        chrome.storage.local.set({ status: "Connected", roomId: data.roomId });

        chrome.runtime.sendMessage({ "background-action": "connected", roomId: data.roomId })
            .catch(() => {});

        sendToVideoTabs({ "background-action": "connected", roomId: data.roomId });
    }

    if (data["auth"] === "failed") {
        chrome.runtime.sendMessage({ "background-action": "failed" }).catch(() => {});
        chrome.storage.local.remove(['status', 'roomId']);
    }

    if (data["video-action"]) {
        sendToVideoTabs(data);
    }
}

getSocket();

chrome.alarms.create('keepAlive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        getSocket();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message["popup-action"] === "create-room") {
        safeSend({ "server-action": "new-room-code" });

    } else if (message["popup-action"] === "join-room") {
        safeSend({ "server-action": "join-room", roomId: message.roomId });

    } else if (message["video-action"]) {
        safeSend(message);
    }
});