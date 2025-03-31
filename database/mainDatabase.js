import { elements } from "../domElements.js";
import { appState } from "../appState.js";
import { toLowerCaseAll } from "../utils.js";

export function initializeMainDatabase(){
    const { inputField,
            activeWord,
          } = elements;
    let { textFieldTheme,
          selectedTheme
        } = elements;

    const request = indexedDB.open("words", 1);

    request.onupgradeneeded = (event) => {
        const database = event.target.result;
        const jsonThemes = ['All Words', 'Human', 'Food', 'House', 'Sport', 
                            'Profession', 'Money', 'Cinema', 'Nature', 'Traveling', 'IT', 'Correct'];

        jsonThemes.forEach(theme => {
            if (!database.objectStoreNames.contains(theme)) {
                database.createObjectStore(theme, { keyPath: "word" });
            }
        });
    };
    
    request.onsuccess = (event) => {
        const database = event.target.result;

        isDatabaseEmpty(database).then(isEmpty => {
            if (isEmpty) {
                console.log("IndexedDB is empty, loading JSON");
                activeWord.innerHTML = "Enjoy<br>and<br>Learn!";
                inputField.style.display = "none"; 

                loadJsonFileIntoDB(database);
            } else {
                inputField.style.display = "block";
                console.log("IndexedDB already contains data");

                selectedTheme = textFieldTheme.value;
                console.log("selectedTheme: ", selectedTheme);
                fetchRandomWordFromDatabase(database, selectedTheme); 
            }
        });
    };
    
    request.onerror = (event) => {
        console.error("Error opening the database:", event.target.error);
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

    chrome.storage.local.get({ selectedMode: 'Default' }, (data) => {
        appState.mode = data.selectedMode || 'Default';
        console.log("NOW MODE APP", appState.mode);

        appState.updateWordHandler = () => {
            const transaction = database.transaction(theme, "readonly");
            const store = transaction.objectStore(theme);
            const getAllRequest = store.getAll();
    
            getAllRequest.onsuccess = () => {
                const data = getAllRequest.result;
    
                if (!data || data.length === 0) {
                    activeWord.textContent = "No words available";
                    inputField.style.display = "none";
                    console.warn("No data in IndexedDB!");
                    return;
                }
    
                const word = data[Math.floor(Math.random() * data.length)];

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
                        inputField.style.display = "block";
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