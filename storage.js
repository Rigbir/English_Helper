import { initializeMainDatabase } from './database/mainDatabase.js';
import { initializeThemeAndTimeSettings } from './theme.js';
import { initializeInputFieldAndHintButton, generateNewRandomWord, saveNotificationTime, selectedThemePopup } from './ui.js';

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

        if (changes.selectedTheme) {
            const currentTheme = changes.selectedTheme.newValue;
            const allThemeSelections = document.querySelectorAll('.popup .theme');
            allThemeSelections.forEach(themeSelected => {
                if (themeSelected.textContent === currentTheme) {
                    themeSelected.classList.add('selected-theme');
                }
            })
        }
    }); 
    
    chrome.storage.local.get('selectedTheme', (data) => {
        const selectedTheme = data.selectedTheme;
        const allThemeSelections = document.querySelectorAll('.popup .theme');
        allThemeSelections.forEach(themeSelected => {
            if (themeSelected.textContent === selectedTheme) {
                themeSelected.classList.add('selected-theme');
            }
        });
    });
}