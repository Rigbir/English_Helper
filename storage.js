import { initializeMainDatabase } from './database/mainDatabase.js';
import { initializeThemeAndTimeSettings } from './theme.js';
import { initializeInputFieldAndHintButton, generateNewRandomWord, saveNotificationTime } from './ui.js';

export function setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.themeIndex || changes.timeIndex) {
            initializeThemeAndTimeSettings();
    
            if (changes.themeIndex)
                console.log("theme changed: ", changes.themeIndex.newValue);
            else 
                console.log("time changed: ", changes.timeIndex);
        }
    
        if (changes.themeIndex) {
            const newThemeIndex = changes.themeIndex.newValue;
            const jsonThemes = ['All Words', 'Human', 'Food', 'House', 'Sport', 
                                'Profession', 'Money', 'Cinema', 'Nature', 'Traveling'];
    
            const newTheme = jsonThemes[newThemeIndex];
            console.log("newTheme: ", newTheme);
    
            initializeMainDatabase();
    
            const request = indexedDB.open("words", 1);
            request.onsuccess = (event) => {
                const database = event.target.result;
                console.log("database opened", database);
                initializeInputFieldAndHintButton(database);
                generateNewRandomWord(database);
            };
            request.onerror = () => {
                console.error("Error opened new databse: ", error)
            };
        }
    
        if (changes.mode) {
            initializeMainDatabase();
        }
    
        if (changes.timeIndex) {
            saveNotificationTime();
        }
    });    
}