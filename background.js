function autoMessage() {
    console.log("⏰ Generating notification");
    const options = {
        type: "basic",
        iconUrl: "image/favicon.png",
        title: "English",
        message: "Open Extension.\nTime for new Word!"
    };
    
    chrome.notifications.create(options, (id) => {
        console.log(`Notification created: ${id}`);
    });
}

function startAutoMessages(intervalMinutes) {
    chrome.storage.local.get(["extensionState"], (data) => {
        if (data.extensionState === false) {
            console.log("Extension is off, alarm won't be created");
            return;
        }
        
        chrome.alarms.create("autoMessageAlarm", {
            delayInMinutes: intervalMinutes,
            periodInMinutes: intervalMinutes
        });
        console.log(`Auto notifications started with an interval of ${intervalMinutes} minutes`);
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "autoMessageAlarm") {
        autoMessage();
    }
});

chrome.storage.local.get(["extensionState"], function (data) {
    if (data.extensionState === false) {
        console.log("⏸ Extension is off, background.js is not starting");
        return; // DO NOT START CODE if off
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