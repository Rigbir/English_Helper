import { initializeMainDatabase } from './database/mainDatabase.js';
import { initializeThemeAndTimeSettings } from './theme.js';
import { initializeInputFieldAndHintButton, generateNewRandomWord, saveNotificationTime } from './ui.js';

function updateSelection(changes, key, selector, className) {
    if (changes[key]) {
        const currentValue = changes[key].newValue;
        console.log("NOW LOAD UPDATE SELECTION: ", currentValue);
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

function loadInitialSelection(key, defaultValue, selector, className) {
    chrome.storage.local.get(key, (data) => {
        const currentValue = data[key] || defaultValue;
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
    chrome.storage.local.get(['selectedTheme', 'selectedTime', 'selectedMode'], (data) => {
        if (!data.selectedTheme) {
            chrome.storage.local.set({ selectedTheme: 'All Words' });
        }
        if (!data.selectedTime) {
            chrome.storage.local.set({ selectedTime: '10 minutes' });
        }
        if (!data.selectedMode) {
            chrome.storage.local.set({ selectedMode: 'Default' });
        }
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.themeIndex || changes.timeIndex) {
            initializeThemeAndTimeSettings();
    
            if (changes.themeIndex)
                console.log("theme changed: ", changes.themeIndex.newValue);
            else 
                console.log("time changed: ", changes.timeIndex);
        }
    
        if (changes.selectedMode) {
            const initialRequest = indexedDB.open('words');

            initialRequest.onsuccess = (event) => {
                const tempDb = event.target.result;
                const currentVersion = tempDb.version;
                tempDb.close(); 
        
                const requestWords = indexedDB.open('words', currentVersion);

                requestWords.onsuccess = (event) => {
                    const database = event.target.result;
                    initializeMainDatabase(database);
                };
                requestWords.onerror = () => {
                    console.error("Error opened new databse: ", error)
                };
            }
        }

        if (changes.themeIndex) {
            const newThemeIndex = changes.themeIndex.newValue;
            const jsonThemes = ['All Words', 'Human', 'Food', 'House', 'Sport', 
                                'Profession', 'Money', 'Cinema', 'Nature', 'Traveling'];
    
            const newTheme = jsonThemes[newThemeIndex];
            console.log("newTheme: ", newTheme);

            const initialRequest = indexedDB.open('words');

            initialRequest.onsuccess = (event) => {
                const tempDb = event.target.result;
                const currentVersion = tempDb.version;
                tempDb.close(); 
        
                const requestWords = indexedDB.open('words', currentVersion);

                requestWords.onsuccess = (event) => {
                    const database = event.target.result;
                    initializeMainDatabase(database);

                    initializeInputFieldAndHintButton(database);
                    generateNewRandomWord(database);
                };
                requestWords.onerror = () => {
                    console.error("Error opened new databse: ", error)
                };
            }
        }
    
        if (changes.timeIndex) {
            saveNotificationTime();
        }

        updateSelection(changes, 'selectedTheme', '.popup .theme', 'selected-theme');
        updateSelection(changes, 'selectedTime', '.popup .time', 'selected-time');
        updateSelection(changes, 'selectedMode', '.popup .mode', 'selected-mode');
    }); 

    loadInitialSelection('selectedTheme', 'Default', '.popup .theme', 'selected-theme');
    loadInitialSelection('selectedTime', 'All Words', '.popup .time', 'selected-time');
    loadInitialSelection('selectedMode', '10 minutes', '.popup .mode', 'selected-mode');
}
