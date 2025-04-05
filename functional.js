import { initializeMainDatabase } from './database/mainDatabase.js';
import { initializeSecondaryDatabase, addWordToSecondaryDatabase } from './database/secondaryDatabase.js';
import { initializeThemeSettings, initializeThemeAndTimeSettings } from './theme.js';
import { displayAppInfoPopup, 
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
         selectedAchievementPopup
} from './ui.js';
import { setupStorageListeners } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeMainDatabase();
    initializeSecondaryDatabase();

    selectedThemePopup();
    selectedTimePopup();
    selectedModePopup();

    initializeThemeSettings();
    displayAppInfoPopup();
    initializeNotificationSettings();

    const requestWords = indexedDB.open('words', 1);
    requestWords.onsuccess = (event) => {
        const databaseWords = event.target.result;
        console.log("Database 'words' successfully opened", databaseWords);

        generateNewRandomWord(databaseWords);
        initializeInputFieldAndHintButton(databaseWords);
        
        const requestList = indexedDB.open('learned_words', 1);
        requestList.onsuccess = (event) => {
            const databaseLearned = event.target.result;
            console.log("Database 'learned_words' successfully opened", databaseLearned);

            selectedAchievementPopup(databaseLearned); 
            addWordToSecondaryDatabase(databaseWords, databaseLearned);
            openSecondaryListWindow(databaseWords, databaseLearned);
            getSecondaryResultAchievement(databaseLearned);
        };
        
        requestList.onerror = (error) => {
            console.error("Error opening database 'learned_words'", error);
        };
    };

    requestWords.onerror = (error) => {
        console.error("Error opening database 'words'", error);
    };

    playWordPronunciation();
    initializeThemeAndTimeSettings();
    saveNotificationTime();
    setupStorageListeners();
});