import { elements } from "./domElements.js";
import { appState } from "./appState.js";

document.addEventListener('DOMContentLoaded', () => {
    setupDatebase();
    setupDatabaseList();

    setupThemeToggle();
    getAppInformation();
    setupOnOffToggle();

    const requestWords = indexedDB.open("words", 1);
    requestWords.onsuccess = (event) => {
        const databaseWords = event.target.result;
        console.log("Database 'words' successfully opened", databaseWords);

        generateRandomWord(databaseWords);
        changeModeWord(databaseWords);
        inputFieldAndHelpButton(databaseWords);
        
        const requestList = indexedDB.open('learned_words', 1);
        requestList.onsuccess = (event) => {
            const databaseLearned = event.target.result;
            console.log("Database 'learned_words' successfully opened", databaseLearned);

            addWordToList(databaseWords, databaseLearned);
            openListPopup(databaseWords, databaseLearned);
        };
        
        requestList.onerror = (error) => {
            console.error("Error opening database 'learned_words'", error);
        };
    };

    requestWords.onerror = (error) => {
        console.error("Error opening database 'words'", error);
    };

    wordVoiceover();
    setupChangeThemesAndTimes();
    saveUserTime();
});

function setupThemeToggle() {
    const { themeToggleState, 
            activeWord, 
            translateWord, 
            mainHorizontalLines, 
            listHorizontalLines, 
            listHeadWord, 
            listHeadTranslate 
          } = elements;

    const applyTheme = (isDark) => {        
        document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
        mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        activeWord.style.color = isDark ? 'white' : 'black';
        translateWord.style.color = isDark ? '#1DB954' : '#1DB954'
        listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        listHeadWord.style.color = isDark ? 'white' : 'black';
        listHeadTranslate.style.color = isDark ? 'white' : 'black';
    }

    chrome.storage.local.get('theme', (data) => {
        appState.theme = data.theme || 'dark';
        const isDarkMode = appState.theme === 'dark';
        themeToggleState.checked = isDarkMode;
        applyTheme(isDarkMode);
    });
    
    themeToggleState.addEventListener('change', () => {
        const isDark = themeToggleState.checked;
        appState.theme = isDark ? 'dark' : 'light';
        applyTheme(isDark);
        chrome.storage.local.set({ theme: appState.theme });
        setupOnOffToggle();
    });
}

function getAppInformation() {
    const { infoButton,
            infoPopup,
            infoOverlay,
            infoCloseOverlayButton
          } = elements;

    infoButton.addEventListener("click", () => {
        infoPopup.style.display = "block";
        infoOverlay.style.display = "block";
    });

    infoCloseOverlayButton.addEventListener("click", () => {
        infoPopup.style.display = "none";
        infoOverlay.style.display = "none";
    });

    infoOverlay.addEventListener("click", () => {
        infoPopup.style.display = "none";
        infoOverlay.style.display = "none";
    });
}

function setupOnOffToggle() {
    const { onOffToggleState,
            onOffToggleBackground
          } = elements;

    chrome.storage.local.get(['extensionState', 'theme'], function (data) {
        const isOnMode = data.extensionState !== undefined ? data.extensionState : true;
        appState.theme = data.theme || 'dark';

        onOffToggleState.checked = isOnMode;
        console.log(`State on load: ${isOnMode ? "Enabled" : "Disabled"}`);

        console.log("THEME: ", appState.theme);
        if (appState.theme === 'light') {
            onOffToggleBackground.style.backgroundColor = "#ebebeb";
        } else if (appState.theme === 'dark') {
            onOffToggleBackground.style.backgroundColor = "#242424";
        }

        if (data.extensionState === undefined) {
            chrome.storage.local.set({ extensionState: true });
        }
    });

    onOffToggleState.addEventListener('change', () => {
        const isState = onOffToggleState.checked;
        console.log(`State changed: ${isState ? "Enabled" : "Disabled"}`);
        chrome.storage.local.set({ extensionState: isState });
        
        // Send message to background.js
        chrome.runtime.sendMessage({ action: "toggleBackground", state: isState });
    });
}

function inputFieldAndHelpButton(database) {
    const { wordContainer,
            helpButton,
            activeWord
          } = elements;

    let { textFieldTheme,
          selectedTheme,
          translateWord,
          inputField
        } = elements;

    const sound = new Audio('sound/CorrectWord.mp3');

    if (appState.helpButtonClickHandler) {
        helpButton.removeEventListener('click', appState.helpButtonClickHandler);
    }

    appState.helpButtonClickHandler = (event) => {
        selectedTheme = textFieldTheme.value;
        console.log("Listener added!");

        console.log("BEFORE CLICK - COUNT:", appState.countHelpButtonPressed);

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;
            const wordText = document.querySelector('.word').textContent.trim().toLowerCase();
            const foundWord = data.find(item => {
                if (appState.mode === 'eng-to-rus') {
                    return item.word.trim().toLowerCase() === wordText
                } else {
                    return item.translation.trim().toLowerCase() === wordText;
                }
            });

            if (!foundWord) {
                console.error("Error: No translation found for:", wordText);
            }

            if (appState.countHelpButtonPressed === 0) {
                translateWord.style.color = "#1DB954";
                translateWord.textContent = appState.mode === 'eng-to-rus' ? foundWord.translation : foundWord.word;
                
                // if (appState.mode === 'eng-to-rus'){
                //     if (Array.isArray(foundWord.translation)) {
                //         translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)]);
                //     }else {
                //         translateWord.textContent = [foundWord.translation];
                //         console.log("TRANSLATE ELEMENT: ", translateWord.textContent);
                //     }
                // }
                // else {
                //     foundWord.translation = [foundWord.word.trim()];
                // }

                translateWord.textContent = toLowerCaseAll(translateWord.textContent);
                console.log("help-btn click");
                wordContainer.classList.add('show-translate');
                console.log("Class added:", wordContainer.classList);
                appState.countHelpButtonPressed = 1;
            } else if (appState.countHelpButtonPressed === 1) {
                console.log("help-btn click");
                wordContainer.classList.remove('show-translate');
                console.log("Class removed:", wordContainer.classList);
                appState.countHelpButtonPressed = 0;
            } 

            console.log("AFTER CLICK - COUNT:", appState.countHelpButtonPressed);
        };

        event.stopPropagation();
    };

    helpButton.addEventListener('click', appState.helpButtonClickHandler);

    if (appState.inputFieldClickHandler) {
        inputField.removeEventListener('keydown', appState.inputFieldClickHandler);
    }

    appState.inputFieldClickHandler = (event) => {
        console.log("Event listener added");
        selectedTheme = textFieldTheme.value;

        if (event.key === 'Enter'){
            inputField.value = toLowerCaseAll(inputField.value);
            inputField.value = inputField.value.trim();
            console.log("enter press");
            console.log(inputField.value);

            const transaction = database.transaction(selectedTheme, 'readonly');
            const store = transaction.objectStore(selectedTheme);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const data = getAllRequest.result;

                const activeWordText = activeWord?.textContent?.trim();
                console.log("ACTIVE WORD: ", activeWord);

                let foundWord = data.find(item => {
                    if (appState.mode === 'eng-to-rus') { 
                        return toLowerCaseAll(item.word) === toLowerCaseAll(activeWordText);
                    } else {
                        return toLowerCaseAll(item.translation) === toLowerCaseAll(activeWordText);
                    }
                });
            
                if (foundWord && foundWord.translation) {

                /* 
                    if (appState.mode === 'eng-to-rus'){
                        if (foundWord.translation.length > 1) {
                            foundWord.translation = Array.isArray(foundWord.translation)
                                ? foundWord.translation.map(tr => toLowerCaseAll(tr).trim())
                                : [toLowerCaseAll(foundWord.translation).trim()];
                            toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)]);
                        }else {
                            foundWord.translation = [foundWord.translation];
                            console.log("TRANSLATE ELEMENT: ", foundWord.translation);
                        }
                    }
                    else {
                        foundWord.translation = [foundWord.translation.trim()];
                    } 
                */

                    foundWord.translation = toLowerCaseAll(foundWord.translation);
                    foundWord.translation = foundWord.translation.trim();
                } else {
                    console.warn("Word or translation not found:", activeWordText);
                    translateWord.textContent = "Translation not available";  
                }

                if (foundWord) {
                    const correctAnswer = appState.mode === 'eng-to-rus' ? foundWord.translation : foundWord.word;
                    
                    /* const correctAnswer = appState.mode === 'eng-to-rus' 
                        ? (Array.isArray(foundWord.translation) ? foundWord.translation : [foundWord.translation]) 
                        : [foundWord.word]; */

                    console.log("Input:", normalizeWord(inputField.value));
                    console.log("Translation:", normalizeWord(toLowerCaseAll(correctAnswer)));
                    console.log("Comparison:", normalizeWord(inputField.value) === normalizeWord(foundWord.translation));
                    //console.log("Translation:", correctAnswer.map(tr => normalizeWord(toLowerCaseAll(tr))).join(", "));

                    //if (correctAnswer.some(tr => normalizeWord(inputField.value) === normalizeWord(tr))) {
                    if (normalizeWord(inputField.value) == normalizeWord(toLowerCaseAll(correctAnswer))){
                        sound.pause();
                        sound.currentTime = 0;
                        sound.play();

                        changeWord(data);
                        moveWordToLearnedForThisSection(database, selectedTheme, 'Correct', foundWord.word);
                        
                        if (data.length === 1) {
                            activeWordText.textContent = "No words available";
                            inputField.style.display = "none";
                            inputField.value = "";
                            console.log("END OF WORDS IN THEME");
                            return;
                        }
                    } else {
                        inputField.classList.add('error');
                        inputField.value = "";
                        console.log("ERROR INPUT");

                        setTimeout(() => {
                            inputField.classList.remove('error');
                        }, 300);
                    }
                }
            };
            getAllRequest.onerror = (event) => {
                console.error("Error reading data:", event.target.error);
            };            
        }
    }

    inputField.addEventListener('keydown', appState.inputFieldClickHandler);

    wordContainer.addEventListener('click', (event) => {
        if (event.target !== helpButton && event.target !== inputField) {
            wordContainer.classList.remove('show-translate');
            appState.countHelpButtonPressed = 0;
            inputField.value = "";
            console.log("Class remove:", wordContainer.classList);
        }
    });
}

function changeWord(data) {
    const { activeWord } = elements;
    let { translateWord,
          inputField
     } = elements;

    const filteredData = data.filter(item => item.word !== activeWord.textContent);
    const randomWord = filteredData[Math.floor(Math.random() * filteredData.length)];

    if (randomWord) {
        activeWord.textContent = appState.mode === 'eng-to-rus' ? toLowerCaseAll(randomWord.word) : toLowerCaseAll(randomWord.translation); 
        translateWord.textContent = ""; 
        inputField.value = ""; 
        console.log("New word:", randomWord.word);
    }
}

function normalizeWord(word) {
    return word.replace(/ё/g, 'е');
}

function generateRandomWord(database) {
    const { randomButton,
            wordContainer,
            inputField,
            activeWord
          } = elements;

    if (appState.generateRandomWordButtonClickHandler) {
        console.log("Removing old event listener");
        randomButton.removeEventListener('click', appState.generateRandomWordButtonClickHandler);
    }

    appState.generateRandomWordButtonClickHandler = (event) => {
        const selectedTheme = document.getElementById('text-field-theme').value;

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();
    
        if (inputField.style.display === "none") { 
            inputField.style.display = "block";
        }

        if (!selectedTheme || !database.objectStoreNames.contains(selectedTheme)) {
            console.error("Error: The specified theme is missing in IndexedDB:", selectedTheme);
            return;
        }

        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;

            if (!data || data.length === 0) {
                console.warn("No words available in theme:", selectedTheme);
                activeWord.textContent = "No words available";
                inputField.value = "";
                return;
            }

            console.log("WORD: ", activeWord.textContent);
            console.log("COUNT GENERATE: ", appState.count);
            ++appState.count;

            if (activeWord.textContent === "EnjoyandLearn!") {
                console.log("FIRST OPEN");
                fetchWordsFromDB(database, selectedTheme);
                return;
            }

            appState.countHelpButtonPressed = 0;
            appState.countVoiceoverButtonPressed = true;
            console.log("countHelpButtonPressed: ", appState.countHelpButtonPressed);

            activeWord.textContent = toLowerCaseAll(activeWord.textContent);

            console.log("WORD: ", activeWord.textContent);
            
            inputField.value = "";
            wordContainer.classList.remove('show-translate');
        };

        getAllRequest.onerror = (event) => {
            console.error("Error reading data:", event.target.error);
        };
    }

    randomButton.addEventListener('click', appState.generateRandomWordButtonClickHandler);
    console.log("Event listener added to replace-btn", appState.generateRandomWordButtonClickHandler);
}

function changeModeWord(database) {
    const { changeModeButton,
            wordContainer
          } = elements;

    if (appState.changeModeButtonClickHandler) {
        changeModeButton.removeEventListener('click', appState.changeModeButtonClickHandler);
    }

    appState.changeModeButtonClickHandler = (event) => {
        appState.mode = appState.mode === 'eng-to-rus' ? 'rus-to-eng' : 'eng-to-rus';
        wordContainer.classList.remove('show-translate');
        appState.countHelpButtonPressed = 0;
        appState.countVoiceoverButtonPressed = true;
        chrome.storage.local.set({ mode: appState.mode }, () => {});
    }

    changeModeButton.addEventListener('click', appState.changeModeButtonClickHandler);
    console.log("Event listener added to change-mode-btn", appState.generateRandomWordButtonClickHandler);
}

function wordVoiceover() {
    const { voiceButton } = elements;

    voiceButton.addEventListener('click', () => {
        if (window.speechSynthesis) {
            const wordElement = document.querySelector('.word');
            if (!wordElement || !wordElement.textContent.trim()){
                console.log("No word to pronounce");
                return;
            }
            const utterance = new SpeechSynthesisUtterance();
            utterance.text = wordElement.textContent;
            utterance.lang = appState.mode === 'eng-to-rus' ? 'en' : 'ru';
            utterance.rate = appState.countVoiceoverButtonPressed ? 1 : 0.1;
            appState.countVoiceoverButtonPressed = !appState.countVoiceoverButtonPressed;
            speechSynthesis.speak(utterance);
            console.log(wordElement);
        }
    })
}

function setupChangeThemesAndTimes() {
    const { inputField, 
            wordContainer,
            previousThemeButton,
            nextThemeButton,
            textFieldTheme,
            previousTimeButton,
            nextTimeButton,
            textFieldTime
          } = elements;

    appState.countHelpButtonPressed = 0;
    appState.countVoiceoverButtonPressed = true;

    function changeThemesAndTimes(previousButton, nextButton, textField, array, nameIndex) {        
        let currentIndex = 0;

        chrome.storage.local.get(nameIndex, (data) => {
            if (data[nameIndex] !== undefined) {
                currentIndex = data[nameIndex];
            }
            updateTextField();
        })

        const updateTextField = () => {
            textField.value = array[currentIndex];
        }

        previousButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + array.length) % array.length;
            updateTextField();
            wordContainer.classList.remove('show-translate');
            chrome.storage.local.set({ [nameIndex]: currentIndex });
            inputField.value = "";
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % array.length;
            updateTextField();
            wordContainer.classList.remove('show-translate');
            chrome.storage.local.set({ [nameIndex]: currentIndex });
            inputField.value = "";
        });
    }

    changeThemesAndTimes(
        previousThemeButton,
        nextThemeButton,
        textFieldTheme,
        ['All Words', 'Human', 'Food', 'House', 'Sport', 
         'Profession', 'Money', 'Cinema', 'Nature', 'Traveling', 'IT'],
        'themeIndex'
    );

    changeThemesAndTimes(
        previousTimeButton,
        nextTimeButton,
        textFieldTime,
        ['10 min', '20 min', '30 min', '60 min', '180 min'],
        'timeIndex'
    );
}

function setupDatebase(){
    /*open DateBase*/
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

                loadJsonIntoDB(database);
            } else {
                inputField.style.display = "block";
                console.log("IndexedDB already contains data");

                selectedTheme = textFieldTheme.value;
                console.log("selectedTheme: ", selectedTheme);
                fetchWordsFromDB(database, selectedTheme); 
            }
        });
    };
    
    request.onerror = (event) => {
        console.error("Error opening the database:", event.target.error);
    };    
}

function isDatabaseEmpty(database) {
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

function loadJsonIntoDB(database) {
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

async function fetchWordsFromDB(database, theme, autoSetWord = true) {
    await restoreWordsToOriginalStores(database);

    const { activeWord,
            translateWord,
            inputField,
            randomButton
          } = elements;

    if (appState.updateWordHandler) {
        randomButton.removeEventListener('click', appState.updateWordHandler);
    }

    chrome.storage.local.get({ mode: 'eng-to-rus' }, (data) => {
        appState.mode = data.mode || 'eng-to-rus';
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
    
                if (appState.mode === 'eng-to-rus') {
                    console.log("Word object:", word);
                    activeWord.textContent = toLowerCaseAll(word.word) || "No data";
                    translateWord.textContent = toLowerCaseAll(word.translation) || "No translation"; 

                /* 
                    if (Array.isArray(word.translation)) {
                        translateElement.textContent = word.translation 
                        ? toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)]) 
                        : toLowerCaseAll(word.translation || "No translation");
                    } else {
                        translateElement.textContent = word.translation;
                    } 
                */
                    
                    console.log("TRANSLATE ELEMENT: ", translateWord.textContent);
                    console.log("FIRST MODE");
                } else if (appState.mode === 'rus-to-eng') {

                /*     
                    if (Array.isArray(word.translation)) {
                        wordElement.textContent = word.translation
                        ? toLowerCaseAll(word.translation[Math.floor(Math.random() * word.translation.length)])
                        : toLowerCaseAll(word.translation);
                    } else {
                        wordElement.textContent = toLowerCaseAll(word.translation) || "No data";
                    }
                */

                    activeWord.textContent = toLowerCaseAll(word.translation) || "No data";
                    translateWord.textContent = toLowerCaseAll(word.word) || "No translation";  
                    console.log("SECOND MODE");
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

function moveWordToLearnedForThisSection(database, fromStoreName, toStoreName, word) {
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

async function restoreWordsToOriginalStores(database) {
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

function setupDatabaseList() {
    const requestList = indexedDB.open('learned_words', 1);

    requestList.onupgradeneeded = (event) => {
        const databaseLearned = event.target.result;
        if (!databaseLearned.objectStoreNames.contains('learned')) {
            databaseLearned.createObjectStore('learned', { keyPath: 'word' });
            console.log("Сreated object store 'learned'");
        }
    };
}

function addWordToList(databaseWords, databaseLearned) {
    const { addToListButton,
            inputField,
            activeWord
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
            const translationText = document.querySelector('.translate').textContent

            if (data.length === 0) {
                console.warn("No words available in theme:", selectedTheme);
                activeWord.textContent = "No words available";
                inputField.style.display = "none";
                return;
            }

            let foundWord = data.find(item => toLowerCaseAll(item.word) === toLowerCaseAll(wordText));
            if (foundWord) {
                deleteWordFromDB(databaseWords, selectedTheme, foundWord.word)
                    .then(() => {
                        moveWordToLearned(databaseLearned, foundWord, selectedTheme);
                        changeWord(data);
                    })
                    .catch(error => console.error("Error deleting word:", error));
                } else {
                console.log("Word not found");
            }
        };
    });
}

function deleteWordFromDB(database, theme, word) {
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

function moveWordToLearned(databaseLearned, word, theme) {
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }
    
    const transaction = databaseLearned.transaction('learned', 'readwrite');
    const store = transaction.objectStore('learned');
    
    word.word = toLowerCaseAll(word.word);
    word.translation = toLowerCaseAll(word.translation);
    word.theme = theme;
    
    const addRequest = store.put(word);
    
    addRequest.onsuccess = () => {
        console.log(`Word '${word.word}' successfully added to learned under theme '${theme}'.`);
    };
    
    addRequest.onerror = (event) => {
        console.error(`Error adding word '${word.word}':`, event.target.error);
    };    
}

function returnToMainDB(databaseWords, databaseLearned, word){
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }

    const inputField = document.getElementById('translateField');
    const originalTheme = word.theme;
    
    deleteWordFromDB(databaseLearned, 'learned', word.word)
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

function saveUserTime() {
    const timeField = document.getElementById('text-field-time').value.trim();
    const match = timeField.match(/^(\d+)/); // Extract number from the string

    if (match) {
        const interval = parseInt(match[1], 10); // Convert to number

        chrome.storage.local.set({ messageInterval: interval }, function() {
            console.log("✅ Interval saved:", interval, "minutes");
        });
    } else {
        console.warn("⚠ Error: Invalid time value!", timeField);
    }
}

function openListPopup(databaseWords, databaseLearned) {
    const { mainWindow,
            listWindow,
            wordContainer,
            listButton,
            returnFromList,
            listWordsContainer
          } = elements;

    if (!listButton) {
        console.error("Not found button list")
        return;
    }
    if (!returnFromList) {
        console.error("Not found button back");
        return;
    }
    
    listButton.addEventListener('click', () => {
        loadWordLearnedDB(databaseWords, databaseLearned, listWordsContainer);
        mainWindow.classList.add('hidden');
        listWindow.classList.remove('hidden');
    });

    returnFromList.addEventListener('click', () => {  
        const selectedTheme = document.getElementById('text-field-theme').value;
        listWindow.classList.add('hidden');
        mainWindow.classList.remove('hidden');
        console.log("Return to main menu")
        console.log('SELECTED THEME: ', selectedTheme);
        wordContainer.classList.remove('show-translate');
        appState.countHelpButtonPressed = 0;
        fetchWordsFromDB(databaseWords, selectedTheme);
    });
}

function loadWordLearnedDB(databaseWords, databaseLearned, listWordsContainer) {
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
                returnToMainDB(databaseWords, databaseLearned, item);
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

function toLowerCaseAll(text) {
    return text.toLowerCase();
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.themeIndex || changes.timeIndex) {
        setupChangeThemesAndTimes();

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

        setupDatebase();

        const request = indexedDB.open("words", 1);
        request.onsuccess = (event) => {
            const database = event.target.result;
            console.log("database opened", database);
            inputFieldAndHelpButton(database);
            generateRandomWord(database);
        };
        request.onerror = (event) => {
            console.error("Error opened new databse: ", error)
        };
    }

    if (changes.mode) {
        setupDatebase();
    }

    if (changes.timeIndex) {
        saveUserTime();
    }
});

