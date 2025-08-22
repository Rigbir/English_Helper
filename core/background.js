const notificationMessages = [
    "Your new words are waiting for you 📚",
    "A small step today means a big vocabulary tomorrow! ⚡",
    "You promised to learn the words, remember? 😉",
    "Open Wordly — gain new knowledge 🔑",
    "Take a minute to learn a new word ⏳",
    "Let's make your vocabulary richer. 💎",
    "Boost your brain: it's time for a new word 🧠",
    "Today's word can become a favorite 💖",
    "5 seconds — and you know more than yesterday ⏱️",
    "New day = new word ☀️"
];

let currentMessageIndex = 0;

chrome.storage.local.get(["messageIndex"], (data) => {
    currentMessageIndex = data.messageIndex || 0;
    console.log(`Loaded message index: ${currentMessageIndex}`);
});

function autoMessage() {
    console.log("⏰ Generating notification");
    
    const message = notificationMessages[currentMessageIndex];
    currentMessageIndex = (currentMessageIndex + 1) % notificationMessages.length;
    chrome.storage.local.set({ messageIndex: currentMessageIndex });
    
    const options = {
        type: "basic",
        iconUrl: "image/favicon.png",
        title: "Wordly",
        message: message
    };
    
    chrome.notifications.create(options, (id) => {
        if (chrome.runtime.lastError) {
            console.error("Error creating notification:", chrome.runtime.lastError);
        } else {
            console.log(`Notification created: ${id} with message: ${message}`);
        }
    });
}

function startAutoMessages(intervalMinutes) {
    console.log(`Attempting to start auto messages with interval: ${intervalMinutes} minutes`);
    chrome.storage.local.get(["extensionState"], (data) => {
        console.log(`Extension state in startAutoMessages: ${data.extensionState}`);
        if (data.extensionState === false) {
            console.log("Extension is off, alarm won't be created");
            return;
        }
        
        chrome.alarms.create("autoMessageAlarm", {
            delayInMinutes: intervalMinutes,
            periodInMinutes: intervalMinutes
        }, (wasCreated) => {
            if (wasCreated) {
                console.log(`Auto notifications started with an interval of ${intervalMinutes} minutes`);
            } else {
                console.log("Failed to create alarm");
            }
        });
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "autoMessageAlarm") {
        autoMessage();
    }
});

chrome.storage.local.get(["extensionState"], function (data) {
    console.log(`Extension state from storage: ${data.extensionState}`);
    
    if (data.extensionState === false) {
        console.log("⏸ Extension is off, background.js is not starting");
        return; 
    }

    chrome.storage.local.get(["messageInterval"], function (data) {
        let interval = parseInt(data.messageInterval) || 10;
        console.log(`Loaded interval from storage: ${interval} minutes`);
        startAutoMessages(interval);
    });
});

chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "toggleBackground") {
        if (message.state === false) {
            console.log("⏹ Stopping background.js");
            chrome.alarms.clear("autoMessageAlarm", (wasCleared) => {
                if (wasCleared) {
                    console.log("Auto notifications stopped");
                } else {
                    console.log("Auto notifications not found");
                }
            });
        } else {
            console.log("▶ Restarting background.js");
            chrome.storage.local.get(["messageInterval"], function (data) {
                let interval = parseInt(data.messageInterval) || 10;
                startAutoMessages(interval);
            });
        }
    }
});