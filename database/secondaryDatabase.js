import { elements } from "../domElements.js";
import { appState } from "../appState.js";
import { toLowerCaseAll } from "../utils.js";
import { replaceCurrentWord, getFoundWordFromDatabase } from "../ui.js";
import { removeWordFromMainDatabase, restoreWordToMainDatabase } from "./mainDatabase.js";
import { shadeColor } from "../theme.js";


export function initializeSecondaryDatabase() {
    const requestList = indexedDB.open('learned_words', 1);

    requestList.onupgradeneeded = (event) => {
        const databaseLearned = event.target.result;
        if (!databaseLearned.objectStoreNames.contains('learned')) {
            databaseLearned.createObjectStore('learned', { keyPath: 'word' });
            console.log("Сreated object store 'learned'");
        }
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

            const phoneticVoiceButton = document.getElementById('Phonetic-voice-btn');
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
                        transferWordToLearnedList(databaseLearned, foundWord, selectedTheme);

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

export function transferWordToLearnedList(databaseLearned, word, theme) {
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }
    
    const transaction = databaseLearned.transaction('learned', 'readwrite');
    const store = transaction.objectStore('learned');
    
    word.word = toLowerCaseAll(word.word);

    Array.isArray(word.translation)
        ? word.translation = word.translation.map(tr => toLowerCaseAll(tr))
        : word.translation = toLowerCaseAll(word.translation)
    
    word.theme = theme;
    
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
    
        const transaction = databaseLearned.transaction('learned', 'readonly');
        const store = transaction.objectStore('learned');
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
            
                words.forEach((item, index) => {
                    const newContainer = document.createElement('div');
                    newContainer.classList.add('new-learned-word');
        
                    const newWord = document.createElement('p');
                    newWord.classList.add('learned-word');
                    newWord.textContent = item.word;
                
                    const newTranslation = document.createElement('p');
                    newTranslation.classList.add('learned-translate');
                    newTranslation.textContent = item.translation;
        
                    const newButton = document.createElement('button');
                    newButton.id = 'return-word-btn';
                    newButton.classList.add('icon-btn');

                    chrome.storage.local.get('paletteColors', (data) => {
                        const colorMap = data.paletteColors || {};
                        let customTheme = colorMap['overlay'] ? toLowerCaseAll(colorMap['overlay']) : '#8e7e8e';
                        if (color === '#8e7e8e') customTheme = color;

                        const themes = {
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
                        const theme = themes[color];

                        if (theme) {
                            applyTheme(theme.accent, theme.liner);
                        }

                        function applyTheme(accent, liner) {
                            const darkerColor = shadeColor(liner, 20);
                            newButton.style.backgroundColor = accent;
                            newContainer.style.setProperty('--before-color', liner);
                            newContainer.style.backgroundColor = index % 2 === 0 ? accent : darkerColor;
                        }
                    });
                    
                    const img = document.createElement('img');
                    img.src = 'image/return.png';
                    img.alt = '';
                    img.draggable = false;
                    img.style.display = 'block';
                    img.style.width = '100%';
                    img.style.height = 'auto';
        
                    newButton.appendChild(img);
        
                    newButton.addEventListener('click', () => {
                        restoreWordToMainDatabase(databaseWords, databaseLearned, item);
                        newContainer.remove();
                        console.log('click return-btn', newButton);
        
                        requestAnimationFrame(updateVerticalCenterLineHeight);
                    });
                
                    newContainer.appendChild(newWord);
                    newContainer.appendChild(newTranslation);
                    newContainer.appendChild(newButton);
                
                    listWordsContainer.appendChild(newContainer);
                    console.log('final', newContainer);
        
                    requestAnimationFrame(updateVerticalCenterLineHeight);
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
}