import { elements } from "../utils/domElements.js";
import { appState } from "../core/appState.js";
import { toLowerCaseAll } from "../utils/utils.js";
import { replaceCurrentWord, getFoundWordFromDatabase } from "../ui/ui.js";
import { removeWordFromMainDatabase, restoreWordToMainDatabase } from "./mainDatabase.js";
import { shadeColor } from "../core/theme.js";


export function initializeSecondaryDatabase() {
    const requestList = indexedDB.open('learned_words', 2);

    requestList.onupgradeneeded = (event) => {
        const databaseLearned = event.target.result;
        const stores = ['learned_ru','learned_de','learned_it','learned_fr','learned_es','learned_da'];
        stores.forEach(name => {
            if (!databaseLearned.objectStoreNames.contains(name)) {
                databaseLearned.createObjectStore(name, { keyPath: 'word' });
                console.log(`Created object store '${name}'`);
            }
        });
    };
}

export function addWordToSecondaryDatabase(databaseWords, databaseLearned) {
    const { addToListButton,
            inputField,
            activeWord,
            wordContainer
          } = elements;

    addToListButton.addEventListener('click', () => {

        if (!databaseWords) {
            console.error("main DB not initialization");
            return;
        }
        if (!databaseLearned){ 
            console.error("LIST DB not initialization");
            return;
        }

        const selectedTheme = document.getElementById('text-field-theme').value;
        const transaction = databaseWords.transaction(selectedTheme, 'readwrite');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();

        console.log('click plus');
        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;

            let wordText = document.querySelector('.word').textContent;
            wordText = wordText.trim().toLowerCase();
            console.log("WORD TEXT: ", wordText);

            const phoneticVoiceButton = document.getElementById('phonetic-voice-btn');
            wordContainer.classList.remove('show-translate');
            appState.countHelpButtonPressed = 0;
            
            if (data.length === 0) {
                console.warn('No words available in theme:', selectedTheme);
                activeWord.textContent = 'No words available';
                inputField.style.visibility = 'hidden';
                inputField.style.display = 'none';
                return;
            }
            if (data.length === 1) {
                activeWord.textContent = 'No words available';
                inputField.style.display = 'none';
                inputField.style.visibility = 'hidden';
                inputField.value = '';
                console.log('END OF WORDS IN THEME');
            }

            if (appState.mode === 'Time Challenge') {
                appState.soundTimeChallenge.pause();
                appState.soundTimeChallenge.currentTime = 0;
                appState.soundTimeChallenge.play();
            }
            if (appState.mode === 'Phonetic') {
                phoneticVoiceButton.classList.add('pulse-animation');
                setTimeout(() => {
                    phoneticVoiceButton.classList.remove('pulse-animation');
                }, 1000);
            }
            if (appState.mode === 'Missing Letters') {
                wordText = appState.originalWord;
            }

            console.log('active word: ', wordText);
            console.log('original word in store: ', appState.originalWord);

            let foundWord = getFoundWordFromDatabase(data, wordText);
            console.log('FOUND WORD: ', foundWord);
            
            if (foundWord) {
                removeWordFromMainDatabase(databaseWords, selectedTheme, foundWord.word)
                    .then(() => {
                        chrome.storage.local.get({ selectedLanguage: 'ru' }, ({ selectedLanguage }) => {
                            const storeName = `learned_${selectedLanguage}`;
                            transferWordToLearnedList(databaseLearned, foundWord, selectedTheme, storeName, selectedLanguage);
                        });

                        return new Promise((resolve, reject) => {
                            const transaction = databaseWords.transaction(selectedTheme, 'readonly');
                            const store = transaction.objectStore(selectedTheme);
                            const getAllRequest = store.getAll();

                            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
                            getAllRequest.onerror = () => reject('Failed to fetch updated words list');
                        });
                    })
                    .then(updateData => {
                        replaceCurrentWord(updateData);
                    })
                    .catch(error => console.error("Error deleting word:", error));
                } else {
                console.log("Word not found");
            }
        };
    });
}

export function transferWordToLearnedList(databaseLearned, word, theme, storeName, lang) {
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }
    if (!storeName) storeName = 'learned_ru';
    const transaction = databaseLearned.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    word.word = toLowerCaseAll(word.word);

    Array.isArray(word.translation)
        ? word.translation = word.translation.map(tr => toLowerCaseAll(tr))
        : word.translation = toLowerCaseAll(word.translation)
    
    word.theme = theme;
    word.lang = lang || 'ru';
    
    const addRequest = store.put(word);
    
    addRequest.onsuccess = () => {
        console.log(`Word '${word.word}' successfully added to learned under theme '${theme}'.`);
    };
    
    addRequest.onerror = (event) => {
        console.error(`Error adding word '${word.word}':`, event.target.error);
    };    
}

export async function loadLearnedWordsFromDatabase(databaseWords, databaseLearned, listWordsContainer) {
    return new Promise((resolve, reject) => {
        if (!databaseLearned) {
            console.log('DB Learned not found');
            return  reject();
        }

        const { themeToggleState } = elements;
    
        listWordsContainer.innerHTML = '';
    
        chrome.storage.local.get({ selectedLanguage: 'ru' }, ({ selectedLanguage }) => {
            const storeName = `learned_${selectedLanguage}`;
            const transaction = databaseLearned.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const getAllRequest = store.getAll();
    
        chrome.storage.local.get('theme', (data) => {
            appState.theme = data.theme || 'dark';
            console.log('current theme: ', appState.theme);
        });
    
        const isDark = themeToggleState.checked;
        const key = isDark ? 'baseThemeDark' : 'baseThemeLight';
        chrome.storage.local.get(key, (data) => {
            const color = data[key];

            getAllRequest.onsuccess = () => {
                const words = getAllRequest.result;

                let heightAllWordsContainer = listWordsContainer.clientHeight;
                let heightVerticalCenterLine = document.querySelector('.vertical-center-line');
            
                (heightAllWordsContainer > 0) 
                    ? heightVerticalCenterLine.style.height = (heightAllWordsContainer + 40) + 'px'
                    : heightVerticalCenterLine.style.height = '40px'
        
                console.log('Words loaded from Learned: ', words);
                console.log('get-main-cont', listWordsContainer);
            
                const themeToWords = words.reduce((acc, item) => {
                    const themeName = item.theme || 'Other';
                    if (!acc[themeName]) acc[themeName] = [];
                    acc[themeName].push(item);
                    return acc;
                }, {});

                const themes = Object.keys(themeToWords).sort((a, b) => a.localeCompare(b));

                const applyRowTheme = (container, button, index) => {
                    chrome.storage.local.get('paletteColors', (data) => {
                        const colorMap = data.paletteColors || {};
                        let customTheme = colorMap['overlay'] ? toLowerCaseAll(colorMap['overlay']) : '#8e7e8e';
                        if (color === '#8e7e8e') customTheme = color;

                        const themesMap = {
                            'default': { accent: '#dcc788', liner: '#afaf41' },
                            'resetCustom': { accent: '#b1b4b6', liner: '#b6d6df' },
                            'custom': { 
                                accent: colorMap['image'] ? colorMap['image'] : '#b1b4b6', 
                                liner: colorMap['line'] ? colorMap['line'] : '#b6d6df'
                            },
                            '#263a47': { accent: '#728495', liner: '#98a9be' },
                            '#44334a': { accent: '#8d77a8', liner: '#c4addd' },
                            '#375647': { accent: '#729e7e', liner: '#91aaa8' },
                            '#4c3d19': { accent: '#889063', liner: '#cfbb99' },
                            '#5b8094': { accent: '#aad0e2', liner: '#87b1c8' },
                            '#1a1836': { accent: '#e99856', liner: '#e0b4b2' },
                            '#2e2e38': { accent: '#904040', liner: '#cdd8eb' },
                            '#2c2824': { accent: '#76736c', liner: '#c3b9a6' },
                        };
                        const t = themesMap[color];

                        if (t) {
                            const darkerColor = shadeColor(t.liner, 20);
                            if (button) button.style.backgroundColor = t.accent;
                            container.style.setProperty('--before-color', t.liner);
                            container.style.backgroundColor = index % 2 === 0 ? t.accent : darkerColor;
                        }
                    });
                };

                const createWordRow = (item, index) => {
                    const row = document.createElement('div');
                    row.classList.add('new-learned-word');

                    const newWord = document.createElement('p');
                    newWord.classList.add('learned-word');
                    newWord.textContent = item.word;
                
                    const newTranslation = document.createElement('p');
                    newTranslation.classList.add('learned-translate');
                    newTranslation.textContent = item.translation;
    
                    const newButton = document.createElement('button');
                    newButton.id = 'return-word-btn';
                    newButton.classList.add('icon-btn');
                    
                    const img = document.createElement('img');
                    img.src = '../image/return.png';
                    img.alt = '';
                    img.draggable = false;
                    img.style.display = 'block';
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    newButton.appendChild(img);

                    newButton.addEventListener('click', () => {
                        restoreWordToMainDatabase(databaseWords, databaseLearned, item);
                        row.remove();
                        requestAnimationFrame(updateVerticalCenterLineHeight);
                    });

                    row.appendChild(newWord);
                    row.appendChild(newTranslation);
                    row.appendChild(newButton);

                    applyRowTheme(row, newButton, index);
                    return row;
                };

                const createThemeHeader = (themeName) => {
                    const header = document.createElement('div');
                    header.classList.add('list-section-header');
                    header.textContent = themeName;
                    header.style.padding = '8px 8px';
                    header.style.fontWeight = '750';
                    header.style.fontSize = '18px';
                    header.style.color = '#fff';
                    header.style.background = '#2e2e38';
                    header.style.letterSpacing = '0.3px';
                    return header;
                };

                let rowIndex = 0;
                themes.forEach(themeName => {
                    const header = createThemeHeader(themeName);
                    listWordsContainer.appendChild(header);

                    const items = themeToWords[themeName];
                    items.forEach(item => {
                        const row = createWordRow(item, rowIndex++);
                        listWordsContainer.appendChild(row);
                        requestAnimationFrame(updateVerticalCenterLineHeight);
                    });
                });

                resolve();
            }
        });

        function updateVerticalCenterLineHeight() {
            const heightAllWordsContainer = listWordsContainer.clientHeight;
            const heightVerticalCenterLine = document.querySelector('.vertical-center-line');

            (heightAllWordsContainer > 0) 
                ? heightVerticalCenterLine.style.height = (heightAllWordsContainer + 40) + 'px'
                : heightVerticalCenterLine.style.height = '40px'
        }
        });
    });
}