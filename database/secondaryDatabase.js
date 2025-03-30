import { elements } from "../domElements.js";
import { appState } from "../appState.js";
import { toLowerCaseAll } from "../utils.js";
import { replaceCurrentWord } from "../ui.js";
import { removeWordFromMainDatabase, restoreWordToMainDatabase } from "./mainDatabase.js";

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

            const wordText = document.querySelector('.word').textContent;
            wordContainer.classList.remove('show-translate');
            appState.countHelpButtonPressed = 0;

            if (data.length === 0) {
                console.warn("No words available in theme:", selectedTheme);
                activeWord.textContent = "No words available";
                inputField.style.display = "none";
                return;
            }

            let foundWord = data.find(item => {
                if (appState.mode === 'Default') { 
                    return toLowerCaseAll(item.word) === toLowerCaseAll(wordText);
                } else if (appState.mode === 'Reverse') {
                    if (Array.isArray(item.translation)) {
                        return item.translation.some(translation => toLowerCaseAll(translation) === toLowerCaseAll(wordText));
                    } else {
                        return toLowerCaseAll(item.translation) === toLowerCaseAll(wordText);
                    }                 
                }
            });
            
            if (foundWord) {
                removeWordFromMainDatabase(databaseWords, selectedTheme, foundWord.word)
                    .then(() => {
                        transferWordToLearnedList(databaseLearned, foundWord, selectedTheme);
                        replaceCurrentWord(data);
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

    if (Array.isArray(word.translation)) {
        word.translation = word.translation.map(tr => toLowerCaseAll(tr));
    } else {
        word.translation = toLowerCaseAll(word.translation);
    }
    
    word.theme = theme;
    
    const addRequest = store.put(word);
    
    addRequest.onsuccess = () => {
        console.log(`Word '${word.word}' successfully added to learned under theme '${theme}'.`);
    };
    
    addRequest.onerror = (event) => {
        console.error(`Error adding word '${word.word}':`, event.target.error);
    };    
}

export function loadLearnedWordsFromDatabase(databaseWords, databaseLearned, listWordsContainer) {
    if (!databaseLearned) {
        console.log('DB Learned not found');
        return;
    }

    listWordsContainer.innerHTML = '';

    const transaction = databaseLearned.transaction('learned', 'readonly');
    const store = transaction.objectStore('learned');
    const getAllRequest = store.getAll();

    chrome.storage.local.get('theme', (data) => {
        appState.theme = data.theme;
        console.log('current theme: ', appState.theme);
    });

    getAllRequest.onsuccess = () => {
        const heightAllWordsContainer = listWordsContainer.clientHeight;
        const heightVerticalCenterLine = document.querySelector('.vertical-center-line');
    
        if (heightAllWordsContainer > 0) {
            heightVerticalCenterLine.style.height = (heightAllWordsContainer + 40) + 'px';
        } else {
            heightVerticalCenterLine.style.height = '40px'; 
        }

        const words = getAllRequest.result;
        console.log('Words loaded from Learned: ', words);
        console.log('get-main-cont', listWordsContainer);
    
        words.forEach((item, index) => {
            const newContainer = document.createElement('div');
            newContainer.classList.add('new-learned-word');
            
            if (appState.theme === 'dark') {
                newContainer.style.backgroundColor = index % 2 === 0 ? '#9a9a9a' : '#8fa3b0';
                console.log("STYLE SET FOR DARK");
            }
            else if (appState.theme === 'light') {
                newContainer.style.backgroundColor = index % 2 === 0 ? '#f0e8e4' : '#d6c7c3';
                console.log("STYLE SET FOR LIGHT");
            }

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

                const heightAllWordsContainer = listWordsContainer.clientHeight;
                let heightVerticalCenterLine = document.querySelector('.vertical-center-line');
                heightVerticalCenterLine.style.height = (heightAllWordsContainer + 40) + 'px';
            });
        
            newContainer.appendChild(newWord);
            newContainer.appendChild(newTranslation);
            newContainer.appendChild(newButton);
        
            listWordsContainer.appendChild(newContainer);
            console.log('final', newContainer);

            const heightAllWordsContainer = listWordsContainer.clientHeight;
            let heightVerticalCenterLine = document.querySelector('.vertical-center-line');
            
            heightVerticalCenterLine.style.height = (heightAllWordsContainer + 40) + 'px';
        });
    }
}