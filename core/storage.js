import { initializeMainDatabase } from "../database/mainDatabase.js";
import { elements } from "../utils/domElements.js";
import { initializeThemeAndTimeSettings } from "../core/theme.js";
import { initializeInputFieldAndHintButton, generateNewRandomWord, saveNotificationTime } from "../ui/ui.js";
import { appState } from "../core/appState.js";

export function updateSelection(changes, key, selector, className) {
    const { themeOverlay,
            themePopup,
            timePopup,
            timeOverlay,
            changeModePopup,
            changeModeOverlay,
          } = elements;

    if (changes[key]) {
        const currentValue = changes[key].newValue;
        console.log('KEY: ', changes[key]);
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

    if (key === 'selectedTheme') {
        themePopup.style.display = 'none';
        themeOverlay.style.display = 'none';
    } else if (key === 'selectedTime') {
        timePopup.style.display = 'none';
        timeOverlay.style.display = 'none';
    } else if (key === 'selectedMode') {
        changeModePopup.style.display = 'none';
        changeModeOverlay.style.display = 'none';
    }
}

export function loadInitialSelection(key, defaultValue, selector, className) {
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
    chrome.storage.local.get(['selectedTheme', 'selectedTime', 'selectedMode', 'selectedLanguage'], (data) => {
        if (!data.selectedTheme) {
            chrome.storage.local.set({ selectedTheme: 'All Words' });
        }
        if (!data.selectedTime) {
            chrome.storage.local.set({ selectedTime: '10 minutes' });
        }
        if (!data.selectedMode) {
            chrome.storage.local.set({ selectedMode: 'Default' });
        }
        if (!data.selectedLanguage) {
            chrome.storage.local.set({ selectedLanguage: 'ru' });
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

        if (changes.selectedLanguage) {
            const initialRequest = indexedDB.open('words');
            initialRequest.onsuccess = (event) => {
                const tempDb = event.target.result;
                const currentVersion = tempDb.version;
                tempDb.close();

                const requestWords = indexedDB.open('words', currentVersion);
                requestWords.onsuccess = (event) => {
                    const database = event.target.result;
                    appState.countVoiceoverButtonPressed = true;

                    try {
                        const { wordContainer, inputField } = elements;
                        if (wordContainer) {
                            wordContainer.classList.remove('show-translate');
                        }
                        if (inputField) {
                            inputField.value = '';
                            inputField.classList.remove('error');
                            inputField.style.display = 'block';
                            inputField.style.visibility = 'visible';
                        }
                        appState.countHelpButtonPressed = 0;
                    } catch (e) {
                        console.warn('Hint reset on language change failed silently:', e);
                    }
                    import('../database/mainDatabase.js').then(({ reloadDatabaseForLanguage, initializeMainDatabase }) => {
                        reloadDatabaseForLanguage(database).then(() => {
                            initializeMainDatabase(database);
                        });
                    });
                };
                requestWords.onerror = () => {
                    console.error('Error opened new databse');
                };
            };
        }

        if (changes.themeIndex) {
            const newThemeIndex = changes.themeIndex.newValue;
            const jsonThemes = ['All Words', 'Human', 'Food', 'House', 'Sport', 
                                'Profession', 'Money', 'Cinema', 'Nature', 'Traveling', 'IT', 'Idioms'];
    
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
