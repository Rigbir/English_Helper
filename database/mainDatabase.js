import { elements } from "../domElements.js";
import { appState } from "../appState.js";
import { replaceCharacter, toLowerCaseAll } from "../utils.js";

export function initializeMainDatabase(database) {
    const { inputField,
            activeWord,
          } = elements;

    let { textFieldTheme,
          selectedTheme
        } = elements;

    isDatabaseEmpty(database).then(isEmpty => {
        if (isEmpty) {
            console.log("IndexedDB is empty, loading JSON");
            activeWord.innerHTML = "Enjoy<br>and<br>Learn!";
            inputField.style.display = 'none';
            inputField.style.visibility = 'hidden'; 

            loadJsonFileIntoDB(database);
        } else {
            inputField.style.visibility = 'visible';
            console.log("IndexedDB already contains data");

            console.log('textfieldTheme: ',textFieldTheme.value);
            selectedTheme = textFieldTheme.value;
            console.log("selectedTheme: ", selectedTheme);
            fetchRandomWordFromDatabase(database, selectedTheme); 
        }
    });
}

export function isDatabaseEmpty(database) {
    return new Promise(resolve => {
        const storeNames = Array.from(database.objectStoreNames);
        if (storeNames.length === 0) {
            resolve(true); 
            return;
        }

        const transaction = database.transaction(storeNames, "readonly");
        let isEmpty = true;
        let checkedStores = 0;

        storeNames.forEach(theme => {
            const store = transaction.objectStore(theme);
            const request = store.count();

            request.onsuccess = () => {
                if (request.result > 0) {
                    isEmpty = false;
                }
                checkedStores++;
                if (checkedStores === storeNames.length) {
                    resolve(isEmpty);
                }
            };
        });

        transaction.onerror = () => {
            console.error("Error checking data in IndexedDB");
            resolve(true);
        };
    });
}

export function loadJsonFileIntoDB(database) {
    fetch("words.json")
    .then(response => response.json())
    .then(data => {
        if (!database || !database.objectStoreNames) {
            console.error("Database not properly initialized.");
            return;
        }
        Object.keys(data).forEach(theme => {
            if (database.objectStoreNames.contains(theme)) {
                const transaction = database.transaction(theme, "readwrite");
                const store = transaction.objectStore(theme);

                data[theme].forEach(item => {
                    if (!Array.isArray(item.translation)) {
                        item.translation = [item.translation];
                    }
                    store.put(item);
                });

                transaction.oncomplete = () => {
                    console.log(`Data for theme '${theme}' successfully added!`);
                };

                transaction.onerror = (event) => {
                    console.error(`Transaction error in theme '${theme}':`, event.target.error);
                };
            }
        });
    })
    .catch(error => {
        console.error('Failed to load JSON', error);
    });
}

export function hideLetters(word) {
    if (word.length <= 2) return word;

    word = word.trim().toLowerCase();
    let wordArray = word.split('');
    let hiddenCount = Math.max(1, Math.floor(word.length * 0.4));

    let indices = [...Array(word.length - 2).keys()].map(i => i + 1);
    indices = indices.filter(i => wordArray[i] !== ' ');

    indices = indices.sort(() => Math.random() - 0.5).slice(0, hiddenCount);
    indices.forEach(index => wordArray[index] = '_');

    return wordArray.join('');
}

export async function fetchRandomWordFromDatabase(database, theme, autoSetWord = true) {
    await restoreWordsToOriginalStores(database);

    const { activeWord,
            translateWord,
            inputField,
            randomButton
          } = elements;

    if (appState.updateWordHandler) {
        randomButton.removeEventListener('click', appState.updateWordHandler);
    }

    if (activeWord.style.fontSize !== '40px') {
        activeWord.style.fontSize = '40px';
    }

    chrome.storage.local.get({ selectedMode: 'Default' }, (data) => {
        appState.mode = data.selectedMode || 'Default';
        console.log("NOW MODE APP", appState.mode);

        appState.updateWordHandler = () => {
            const transaction = database.transaction(theme, "readonly");
            const store = transaction.objectStore(theme);
            const getAllRequest = store.getAll();
            console.log('database: ', getAllRequest);
    
            getAllRequest.onsuccess = () => {
                const data = getAllRequest.result;
    
                if (!data || data.length === 0) {
                    activeWord.textContent = "No words available";
                    inputField.style.display = 'none';
                    inputField.style.visibility = 'hidden';
                    console.warn("No data in IndexedDB!");
                    return;
                } else {
                    inputField.style.display = 'block';
                    inputField.style.visibility = 'visible';
                }
    
                const filtered = data.filter(item => item.word !== activeWord.textContent);
                const word = filtered[Math.floor(Math.random() * filtered.length)];

                const existingButton = document.getElementById('Phonetic-voice-btn');
                if (existingButton) {
                    existingButton.remove();
                    activeWord.style.visibility = 'visible';   
                } 

                if (appState.mode === 'Default') {
                    console.log("Word object:", word);
                    activeWord.textContent = toLowerCaseAll(word.word) || "No data";

                    Array.isArray(word.translation)
                        ? translateWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No translation"
                        : translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"
                    
                    console.log("TRANSLATE ELEMENT: ", translateWord.textContent);
                    console.log("FIRST MODE");
                } else if (appState.mode === 'Reverse') {
                    Array.isArray(word.translation)
                        ? activeWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No data"
                        : activeWord.textContent = toLowerCaseAll(word.translation) || "No data"

                    translateWord.textContent = toLowerCaseAll(word.word) || "No translation";  
                    console.log("SECOND MODE");
                } else if (appState.mode === 'Mixed') {
                    if (appState.handlerForMixedMode) {
                        Array.isArray(word.translation)
                            ? activeWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No data"
                            : activeWord.textContent = toLowerCaseAll(word.translation) || "No data"
    
                        translateWord.textContent = toLowerCaseAll(word.word) || "No translation";  
                        console.log("THIRD MODE + REVERSE");
                    } else {
                        console.log("Word object:", word);
                        activeWord.textContent = toLowerCaseAll(word.word) || "No data";
                        
                        Array.isArray(word.translation)
                            ? translateWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No translation"
                            : translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"

                        console.log("THIRD MODE + DEFAULT");
                    }

                    appState.handlerForMixedMode = !appState.handlerForMixedMode;
                    console.log('HANDLE-FOR-MIXED: ', appState.handlerForMixedMode);
                } else if (appState.mode === 'Phonetic') {
                    console.log("Word object:", word);
                    activeWord.textContent = toLowerCaseAll(word.word) || "No data";
                    activeWord.style.visibility = 'hidden';

                    const parantClassWord = document.querySelector('.word-in-container');

                    const phoneticVoiceButton = document.createElement('button');
                    phoneticVoiceButton.id = 'Phonetic-voice-btn';
                    phoneticVoiceButton.classList.add('icon-btn');

                    const img = document.createElement('img');
                    img.src = 'image/sound.png';
                    img.alt = '';
                    img.draggable = false;
                    img.style.display = 'block';
        
                    phoneticVoiceButton.appendChild(img);
                    parantClassWord.appendChild(phoneticVoiceButton);

                    phoneticVoiceButton.classList.add('pulse-animation');
                    setTimeout(() => {
                        phoneticVoiceButton.classList.remove('pulse-animation');
                    }, 1000);
                  
                    phoneticVoiceButton.addEventListener('click', () => {
                        if (window.speechSynthesis) {
                            const wordElement = document.querySelector('.word');
                            if (!wordElement || !wordElement.textContent.trim()){
                                console.log('No word to pronounce');
                                return;
                            }
                            const utterance = new SpeechSynthesisUtterance();
                            utterance.text = wordElement.textContent;
                            utterance.lang = 'en';
                            utterance.rate = appState.countVoiceoverButtonPressed ? 1 : 0.1;
                            appState.countVoiceoverButtonPressed = !appState.countVoiceoverButtonPressed;
                            speechSynthesis.speak(utterance);
                            console.log(wordElement);
                        }
                    })

                    Array.isArray(word.translation)
                        ? translateWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No translation"
                        : translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"
                    
                    console.log("TRANSLATE ELEMENT: ", translateWord.textContent);
                    console.log("FOURTH MODE");
                } else if (appState.mode === 'Time Challenge') {
                    const wordContainer = document.querySelector('.word-container');
                    activeWord.textContent = toLowerCaseAll(word.word) || "No data";

                    appState.soundTimeChallenge.pause();
                    appState.soundTimeChallenge.currentTime = 0;
                    appState.soundTimeChallenge.play();

                    Array.isArray(word.translation)
                        ? translateWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No translation"
                        : translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"
                  
                    appState.soundTimeChallenge.addEventListener('ended', () => {
                        console.log('SOUND ENDED');
                        console.log('ACTIVE WORD: ', activeWord);
                        console.log('TRANSLATE ELEMENT: ', translateWord.textContent);

                        wordContainer.classList.add('show-translate');
                        appState.countHelpButtonPressed = 1;
                    });
                    console.log("FIFTH MODE");
                } else if (appState.mode === 'Missing Letters') {
                    let originalWord = Array.isArray(word.word)
                        ? toLowerCaseAll(word.word[Math.floor(Math.random() * word.translation.length)]) || "No data"
                        : toLowerCaseAll(word.word) || "No data"

                    activeWord.textContent = hideLetters(originalWord);
                    translateWord.textContent = originalWord;
                    appState.originalWord = originalWord;
                    console.log("SIXTH MODE");
                } 
            };
    
            getAllRequest.onerror = (event) => {
                console.error("Error reading data:", event.target.error);
            };
        };

        randomButton.addEventListener('click', appState.updateWordHandler);
    
        if (autoSetWord) {
            appState.updateWordHandler(); 
        }
    });
}

export function moveWordToLearnedForThisSection(database, fromStoreName, toStoreName, word) {
    const transaction = database.transaction([fromStoreName, toStoreName], 'readwrite');
    const fromStore = transaction.objectStore(fromStoreName);
    const toStore = transaction.objectStore(toStoreName);

    const getRequest = fromStore.get(word);
    getRequest.onsuccess = (event) => {
        const wordData = event.target.result;
        if (!wordData) {
            console.error(`Word with key ${word} not found in ${fromStoreName}`);
            return;
        }

        chrome.storage.session.get({ movedWords: {} }, (data) => {
            const movedWords = data.movedWords;
            movedWords[word] = fromStoreName;

            chrome.storage.session.set({ movedWords }, () => {
                console.log(`Saved '${word}' original store: '${fromStoreName}'`);
            });
        });

        const addRequest = toStore.add(wordData);
        addRequest.onsuccess = () => {
            console.log(`Word '${word}' moved to '${toStoreName}'`);
            fromStore.delete(word);        
        };
    }
}

export async function restoreWordsToOriginalStores(database) {
    return new Promise((resolve) => {
        chrome.storage.session.get({ movedWords: {} }, (data) => {
            const movedWords = data.movedWords;
            if (Object.keys(movedWords).length === 0) {
                resolve();
                return;
            }

            const transaction = database.transaction(["Correct", ...new Set(Object.values(movedWords))], 'readwrite');
            const correctStore = transaction.objectStore("Correct");

            let restoreCount = Object.entries(movedWords).length;
            if (restoreCount === 0) {
                resolve();
                return;
            }

            Object.entries(movedWords).forEach(([word, originalStore]) => {
                const getRequest = correctStore.get(word);
                getRequest.onsuccess = (event) => {
                    const wordData = event.target.result;
                    if (!wordData) {
                        restoreCount--;
                        if (restoreCount === 0) resolve(); 
                        return;
                    }

                    const originalStoreObj = transaction.objectStore(originalStore);
                    const addRequest = originalStoreObj.add(wordData);

                    addRequest.onsuccess = () => {
                        correctStore.delete(word);
                        console.log(`Restored '${word}' to '${originalStore}'`);
                        restoreCount--;
                        if (restoreCount === 0) resolve(); 
                    };
                };
            });

            chrome.storage.session.set({ movedWords: {} });
        });
    });
}

export function removeWordFromMainDatabase(database, theme, word) {
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(theme, 'readwrite');
        const store = transaction.objectStore(theme);
        const deleteRequest = store.delete(word);
    
        deleteRequest.onsuccess = () => {
            console.log(`Word '${word}' successfully deleted from theme '${theme}'`);
            resolve();
        };
    
        deleteRequest.onerror = (event) => {
            console.error(`Error deleting word '${word}':`, event.target.error);
            reject(event.target.error);
        };
    });    
}

export function restoreWordToMainDatabase(databaseWords, databaseLearned, word){
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }

    const inputField = document.getElementById('translateField');
    const originalTheme = word.theme;
    
    removeWordFromMainDatabase(databaseLearned, 'learned', word.word)
        .then(() => {
            const transaction = databaseWords.transaction(originalTheme, 'readwrite');
            const store = transaction.objectStore(originalTheme);
            const addRequest = store.put(word);
    
            addRequest.onsuccess = () => {
                console.log(`Word '${word.word}' successfully returned to theme '${originalTheme}'.`);
                
                const checkTransaction = databaseWords.transaction(originalTheme, 'readonly');
                const checkStore = checkTransaction.objectStore(originalTheme);
                const checkRequest = checkStore.count();
            
                checkRequest.onsuccess = () => {
                    if (checkRequest.result > 0) {
                        inputField.style.visibility = 'visible';
                    }
                };
            };
    
            addRequest.onerror = (event) => {
                console.error(`Error returning word '${word.word}':`, event.target.error);
            };
        })
        .catch((error) => {
            console.log(error);
        });    
}