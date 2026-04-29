// content.js
chrome.runtime.onMessage.addListener(contentHandler);

let video = null;
let isEnabled = false;
let isSyncing = false;
let syncTimeout = null;
let currentSyncId = 0; // Tracks the latest message to prevent overlapping actions

chrome.storage.local.get(['status'], (result) => {
    if (result.status === 'Connected') {
        isEnabled = true;
    }
});

// 1. Debounce the unlock to absorb native trailing events (like a sudden pause from buffering)
function lockSync() {
    isSyncing = true;
    clearTimeout(syncTimeout);
}

function unlockSync() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
        isSyncing = false;
    }, 200); // 200ms grace period prevents the "echo" loops
}

// 2. Prevent redundant overlapping seeks
function seekTo(time) {
    return new Promise((resolve) => {
        // If we are already within 0.2 seconds of the target, don't force a seek.
        // This prevents the video from micro-stuttering and overlapping promises.
        if (Math.abs(video.currentTime - time) < 0.2) {
            resolve();
            return;
        }

        lockSync();
        video.currentTime = time;
        video.addEventListener('seeked', () => {
            unlockSync();
            resolve();
        }, { once: true });
    });
}

function attachVideoListeners(v) {
    video = v;

    v.addEventListener('play', () => {
        if (isSyncing || !isEnabled) return;
        chrome.runtime.sendMessage({ "video-action": "play", time: v.currentTime });
    });

    v.addEventListener('pause', () => {
        if (isSyncing || !isEnabled) return;
        chrome.runtime.sendMessage({ "video-action": "pause", time: v.currentTime });
    });

    v.addEventListener('seeked', () => {
        if (isSyncing || !isEnabled) return;
        chrome.runtime.sendMessage({ "video-action": "seeked", time: v.currentTime });
    });

    v.addEventListener('ratechange', () => {
        if (isSyncing || !isEnabled) return;
        chrome.runtime.sendMessage({ "video-action": "ratechange", speed: v.playbackRate });
    });
}

function waitForVideo() {
    const existing = document.querySelector('video');
    if (existing) {
        attachVideoListeners(existing);
        return;
    }

    const observer = new MutationObserver(() => {
        const v = document.querySelector('video');
        if (v) {
            observer.disconnect();
            attachVideoListeners(v);
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}

waitForVideo();

// Handle messages from background.js
function contentHandler(message) {
    if (message["background-action"] === "connected") {
        isEnabled = true;
        return;
    }

    if (!video) return;

    // 3. Track the current action so we can drop older, obsolete actions
    currentSyncId++;
    const syncId = currentSyncId;

    if (message["video-action"] === "play") {
        seekTo(message.time).then(() => {
            if (syncId !== currentSyncId) return; // Drop if a newer message arrived while seeking
            lockSync();
            return video.play();
        }).then(() => {
            unlockSync();
        }).catch(() => {
            unlockSync();
        });
    }

    if (message["video-action"] === "pause") {
        seekTo(message.time).then(() => {
            if (syncId !== currentSyncId) return; // Drop if a newer message arrived while seeking
            lockSync();
            video.pause();
            unlockSync();
        });
    }

    if (message["video-action"] === "seeked") {
        seekTo(message.time); // Lock/unlock is managed securely inside seekTo
    }

    if (message["video-action"] === "ratechange") {
        lockSync();
        video.playbackRate = message.speed;
        unlockSync();
    }
}