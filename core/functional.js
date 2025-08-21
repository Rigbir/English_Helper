import { initializeMainDatabase } from "../database/mainDatabase.js";
import { initializeSecondaryDatabase, addWordToSecondaryDatabase } from "../database/secondaryDatabase.js";
import { initializeThemeSettings, initializeThemeAndTimeSettings } from "../core/theme.js";
import { displayAppInfoPopup, 
         displayLanguagesPopup,
         displayBaseThemePopup,
         selectedBaseThemeColor,
         initializeNotificationSettings, 
         initializeInputFieldAndHintButton, 
         generateNewRandomWord, 
         playWordPronunciation, 
         saveNotificationTime, 
         openSecondaryListWindow,
         getSecondaryResultAchievement,
         selectedThemePopup,
         selectedTimePopup,
         selectedModePopup,
         selectedAchievementPopup,
         uploadFile,
         loadThemeFromStorage,
         settingsPopup
} from "../ui/ui.js";
import { setupStorageListeners } from "../core/storage.js";
import { appState } from "../core/appState.js";

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');
    const hideSplash = () => { if (splash) splash.style.display = 'none'; };

    initializeSecondaryDatabase();

    loadThemeFromStorage();
    selectedThemePopup();
    selectedTimePopup();
    selectedModePopup();
    settingsPopup();

    initializeThemeSettings();
    displayAppInfoPopup();
    displayLanguagesPopup();
    displayBaseThemePopup();
    selectedBaseThemeColor();
    initializeNotificationSettings();

    const initialRequest = indexedDB.open('words');
    console.log("Opening database 'words' version: ", initialRequest.version);

    initialRequest.onupgradeneeded = (event) => {   
        const db = event.target.result;
        console.log('db', db);
        appState.jsonThemes.forEach(theme => {
            if (!db.objectStoreNames.contains(theme)) {
                db.createObjectStore(theme, { keyPath: "word" });
            }
        });
    };

    initialRequest.onsuccess = (event) => {
        const tempDb = event.target.result;
        const currentVersion = tempDb.version || 1;
        console.log("current version: ", currentVersion);
        tempDb.close(); 

        const requestWords = indexedDB.open('words', currentVersion);

        requestWords.onsuccess = (event) => {
            const databaseWords = event.target.result;
            console.log("Database 'words' successfully opened", databaseWords);

            initializeMainDatabase(databaseWords);
            generateNewRandomWord(databaseWords);
            initializeInputFieldAndHintButton(databaseWords);
            uploadFile(databaseWords); 

            const requestList = indexedDB.open('learned_words', 2);
            requestList.onsuccess = (event) => {
                const databaseLearned = event.target.result;
                console.log("Database 'learned_words' successfully opened", databaseLearned);

                selectedAchievementPopup(databaseLearned); 
                addWordToSecondaryDatabase(databaseWords, databaseLearned);
                openSecondaryListWindow(databaseWords, databaseLearned);
                getSecondaryResultAchievement(databaseLearned);
                hideSplash();
            };
            requestList.onerror = (error) => {
                console.error("Error opening database 'learned_words'", error);
                hideSplash();
            };
        };

        requestWords.onerror = (error) => {
            console.error("Error opening database 'words'", error);
            hideSplash();
        };
    };

    playWordPronunciation();
    initializeThemeAndTimeSettings();
    saveNotificationTime();
    setupStorageListeners();
    setTimeout(hideSplash, 3000);
});
