import { elements } from "../utils/domElements.js";
import { appState } from "../core/appState.js";
import { toLowerCaseAll } from "../utils/utils.js";

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
        
            loadJsonFileIntoDB(database).then(() => {
                chrome.storage.session.set({ hasLoadedOnce: true });
            });
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

function addNewThemeToDatabase(database, themeName) {
    const newVersion = (appState.currentDatabaseVersion ?? database.version) + 1;
    database.close();
    console.log(`Closing current database to upgrade to version: ${newVersion}`);

    const request = indexedDB.open('words', newVersion); 

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`Creating Object Store for theme: ${themeName}`);
        db.createObjectStore(themeName, { keyPath: "word" });
    };
    request.onsuccess = (event) => {
        const db = event.target.result;
        appState.currentDatabaseVersion = db.version;
        console.log(`Object Store "${themeName}" created successfully.`);
        loadJsonFileIntoDB(db);
    };

    request.onerror = (event) => {
        console.error("Error upgrading database:", event.target.error);
    };

    request.onblocked = () => {
        console.warn("Database upgrade is blocked. Please close other tabs or connections.");
    }; 
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

        let missingStores = appState.jsonThemes.filter(theme => !database.objectStoreNames.contains(theme));
        if (missingStores.length > 0) {
            console.log("Missing themes: ", missingStores);
            addNewThemeToDatabase(database, missingStores[0]);
            resolve(true);
            return;
        }

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
    return new Promise((resolve) => {
    chrome.storage.local.get({ selectedLanguage: 'ru' }, ({ selectedLanguage }) => {
        let file = '../WordsLang/words.json';
        switch (selectedLanguage) {
            case 'de': file = '../WordsLang/words_de.json'; break;
            case 'it': file = '../WordsLang/words_it.json'; break;
            case 'fr': file = '../WordsLang/words_fr.json'; break;
            case 'es': file = '../WordsLang/words_es.json'; break;
            case 'da': file = '../WordsLang/words_da.json'; break;
            case 'ru': default: file = '../WordsLang/words.json'; break;
        }

        fetch(file)
        .then(response => response.json())
        .then(data => {
        if (!database || !database.objectStoreNames) {
            console.error("Database not properly initialized.");
            resolve();
            return;
        }
    
        try {
            const newCounts = {};
            Object.keys(data).forEach(theme => {
                newCounts[theme] = Array.isArray(data[theme]) ? data[theme].length : 0;
            });
            chrome.storage.local.set({ countOnStart: newCounts });
            localStorage.setItem('countOnStart', JSON.stringify(newCounts));
        } catch (e) {
            console.warn('Failed to update countOnStart for language', e);
        }

        const themes = Object.keys(data).filter(theme => database.objectStoreNames.contains(theme));
        if (themes.length === 0) {
            resolve();
            return;
        }

        let completed = 0;
        themes.forEach(theme => {
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
                completed++;
                if (completed === themes.length) {
                    resolve();
                }
            };

            transaction.onerror = (event) => {
                console.error(`Transaction error in theme '${theme}':`, event.target.error);
            };
        });
        })
        .catch(error => {
            console.error('Failed to load JSON', error);
            resolve();
        });
    });
    });
}

export function reloadDatabaseForLanguage(database) {
    return new Promise((resolve) => {
       
        const storeNames = Array.from(database.objectStoreNames);
        if (storeNames.length === 0) {
            loadJsonFileIntoDB(database);
            resolve();
            return;
        }

        const transaction = database.transaction(storeNames, 'readwrite');
        let cleared = 0;
        storeNames.forEach((name) => {
            const store = transaction.objectStore(name);
            const req = store.clear();
            req.onsuccess = () => {
                cleared++;
            };
        });

        transaction.oncomplete = () => {
            console.log('All stores cleared for language reload');
            loadJsonFileIntoDB(database).then(() => resolve());
        };
        transaction.onerror = () => {
            console.error('Failed to clear stores during language reload');
            resolve();
        };
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
            phoneticVoiceButton,
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

                phoneticVoiceButton.style.display = 'none'; 
                activeWord.style.display = 'block';

                if (appState.mode === 'Default') {
                    Array.isArray(word.translation)
                        ? activeWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No data"
                        : activeWord.textContent = toLowerCaseAll(word.translation) || "No data"

                    translateWord.textContent = toLowerCaseAll(word.word) || "No translation";  
                    console.log("FIRST MODE");
                } else if (appState.mode === 'Reverse') {
                    console.log("Word object:", word);
                    activeWord.textContent = toLowerCaseAll(word.word) || "No data";

                    Array.isArray(word.translation)
                        ? translateWord.textContent = toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) || "No translation"
                        : translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"
                    
                    console.log("TRANSLATE ELEMENT: ", translateWord.textContent);
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
                    activeWord.style.display = 'none';
                    phoneticVoiceButton.style.visibility = 'visible';
                    phoneticVoiceButton.style.display = 'block'; 

                    phoneticVoiceButton.classList.remove('pulse-animation');
                    void phoneticVoiceButton.offsetWidth; 
                    phoneticVoiceButton.classList.add('pulse-animation');
                    setTimeout(() => {
                        phoneticVoiceButton.classList.remove('pulse-animation');
                    }, 1000);

                    if (!phoneticVoiceButton.dataset.listenerAttached) {
                        phoneticVoiceButton.addEventListener('click', () => {
                            const wordElement = document.querySelector('.word');
                            if (!wordElement || !wordElement.textContent.trim()) {
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
                        });
                        phoneticVoiceButton.dataset.listenerAttached = 'true';
                    }

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
    
    const listStore = `learned_${word.lang || 'ru'}`;
    removeWordFromMainDatabase(databaseLearned, listStore, word.word)
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