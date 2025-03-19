import { initializeMainDatabase } from './database/mainDatabase.js';
import { initializeThemeAndTimeSettings } from './theme.js';
import { initializeInputFieldAndHintButton, generateNewRandomWord, saveNotificationTime } from './ui.js';

function updateSelection(changes, key, selector, className) {
    if (changes[key]) {
        const currentValue = changes[key].newValue;
        const allSelections = document.querySelectorAll(selector);
        allSelections.forEach(selection => {
            if (selection.textContent === currentValue) {
                allSelections.forEach(item => {
                    item.classList.remove(className);
                }); 
                console.log("SELECTED-MODE: ", selection);
                selection.classList.add(className);
            }
        });
    }
}

function loadInitialSelection(key, selector, className) {
    chrome.storage.local.get(key, (data) => {
        const currentValue = data[key];
        const allSelections = document.querySelectorAll(selector);
        allSelections.forEach(selection => {
            if (selection.textContent === currentValue) {
                console.log("SELECTED-MODE: ", selection);
                selection.classList.add(className);
            }
        });
    });
}

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
    
        if (changes.selectedMode) {
            initializeMainDatabase();
        }
    
        if (changes.timeIndex) {
            saveNotificationTime();
        }

        updateSelection(changes, 'selectedTheme', '.popup .theme', 'selected-theme');
        updateSelection(changes, 'selectedTime', '.popup .time', 'selected-time');
        updateSelection(changes, 'selectedMode', '.popup .mode', 'selected-mode');
    }); 

    loadInitialSelection('selectedTheme', '.popup .theme', 'selected-theme');
    loadInitialSelection('selectedTime', '.popup .time', 'selected-time');
    loadInitialSelection('selectedMode', '.popup .mode', 'selected-mode');
}
