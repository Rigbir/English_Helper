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
    /*Main items */
    const toggle = document.getElementById('theme-toggle');
    const words = document.querySelectorAll('.word');
    const translates = document.querySelectorAll('.translate');
    const lines = document.querySelectorAll('.horizontal-line');
    
    /*List items*/
    const listLines = document.querySelectorAll('.list-line');
    const listHeadWord = document.querySelector('.head-word');
    const listHeadTranslate = document.querySelector('.head-translate');

    const applyTheme = (isDark) => {
        document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
        lines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        words.forEach(word => {word.style.color = isDark ? 'white' : 'black'});
        translates.forEach(translate => {translate.style.color = isDark ? '#1DB954' : '#1DB954'});
        listLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        listHeadWord.style.color = isDark ? 'white' : 'black';
        listHeadTranslate.style.color = isDark ? 'white' : 'black';
    }

    chrome.storage.local.get('theme', (data) => {
        const savedTheme = data.theme;
        const isDarkMode = savedTheme === 'dark';
        toggle.checked = isDarkMode;
        applyTheme(isDarkMode);
    });
    
    toggle.addEventListener('change', () => {
        const isDark = toggle.checked;
        applyTheme(isDark);
        chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
        setupOnOffToggle();
    });
}

function getAppInformation() {
    const infoButton = document.getElementById("information");
    const popup = document.getElementById("info-popup");
    const overlay = document.getElementById("overlay");
    const closeButton = document.getElementById("close-popup");

    infoButton.addEventListener("click", () => {
        popup.style.display = "block";
        overlay.style.display = "block";
    });

    closeButton.addEventListener("click", () => {
        popup.style.display = "none";
        overlay.style.display = "none";
    });

    overlay.addEventListener("click", () => {
        popup.style.display = "none";
        overlay.style.display = "none";
    });
}

function setupOnOffToggle() {
    const toggle = document.getElementById("on-off-toggle");
    const toggleBackgroundColor = document.querySelector('.on-off_label'); 

    chrome.storage.local.get(['extensionState', 'theme'], function (data) {
        const isOnMode = data.extensionState !== undefined ? data.extensionState : true;
        const themeState = data.theme;

        toggle.checked = isOnMode;
        console.log(`State on load: ${isOnMode ? "Enabled" : "Disabled"}`);

        if (themeState === 'light') {
            toggleBackgroundColor.style.backgroundColor = "#ebebeb";
        } else if (themeState === 'dark') {
            toggleBackgroundColor.style.backgroundColor = "#242424";
        }

        if (data.extensionState === undefined) {
            chrome.storage.local.set({ extensionState: true });
        }
    });

    toggle.addEventListener('change', () => {
        const isState = toggle.checked;
        console.log(`State changed: ${isState ? "Enabled" : "Disabled"}`);
        chrome.storage.local.set({ extensionState: isState });
        
        // Send message to background.js
        chrome.runtime.sendMessage({ action: "toggleBackground", state: isState });
    });
}

let countHelpButtonPressed = 0;
function inputFieldAndHelpButton(database) {
    const wordContainer = document.querySelector('.word-container');
    let translateWord = document.querySelector('.translate');
    let inputField = document.getElementById('translateField');
    const helpButton = document.getElementById('help-btn');

    const selectedTheme = document.getElementById('text-field-theme').value;
    console.log("selected theme: ", selectedTheme);
    const sound = new Audio('sound/CorrectWord.mp3');

    let isHelpButtonLocked = false;
    helpButton.addEventListener('click', (event) => {
        if (isHelpButtonLocked) return;

        isHelpButtonLocked = true;

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;
            const wordText = document.querySelector('.word').textContent;
            const foundWord = data.find(item => item.word === wordText);

            if (countHelpButtonPressed === 0) {
                translateWord.style.color = "#1DB954";
                translateWord.textContent = foundWord.translation;
                translateWord.textContent = toLowerCaseAll(translateWord.textContent);
                console.log("help-btn click");
                wordContainer.classList.add('show-translate');
                console.log("Class added:", wordContainer.classList);
                ++countHelpButtonPressed;
            } else if (countHelpButtonPressed === 1){
                console.log("help-btn click");
                wordContainer.classList.remove('show-translate');
                console.log("Class removed:", wordContainer.classList);
                --countHelpButtonPressed;
            } 

            setTimeout(() => {
                isHelpButtonLocked = false;
            }, 200); 
        }
        event.stopPropagation();
    });

    inputField.addEventListener('keydown', (event) => {
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
                const wordText = document.querySelector('.word').textContent;

                let foundWord = data.find(item => toLowerCaseAll(item.word) === toLowerCaseAll(wordText));
            
                if (foundWord && foundWord.translation) {
                    foundWord.translation = toLowerCaseAll(foundWord.translation);
                    //foundWord.translation = foundWord.translation.trim();
                } else {
                    console.warn("Word or translation not found:", wordText);
                    translateWord.textContent = "Translation not available";  
                }

                if (foundWord) {
                    if (normalizeWord(inputField.value) == normalizeWord(foundWord.translation)){
                        sound.play();
                        changeWord(data);
                    } else {
                        inputField.classList.add('error');
                        inputField.value = "";

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
    });

    wordContainer.addEventListener('click', (event) => {
        if (event.target !== helpButton && event.target !== inputField) {
            wordContainer.classList.remove('show-translate');
            inputField.value = "";
            console.log("Class remove:", wordContainer.classList);
        }
    });
}

function changeWord(data) {
    const wordElement = document.querySelector('.word');
    let translateWord = document.querySelector('.translate');
    let inputField = document.getElementById('translateField');

    const filteredData = data.filter(item => item.word !== wordElement.textContent);

    // Select a random word
    const randomWord = filteredData[Math.floor(Math.random() * filteredData.length)];

    if (randomWord) {
        wordElement.textContent = randomWord.word; // Change the word
        translateWord.textContent = ""; // Clear the translation
        inputField.value = ""; // Clear the input field
        console.log("New word:", randomWord.word);
    }
}

function normalizeWord(word) {
    return word.replace(/ё/g, 'е');
}

function generateRandomWord(database) {
    const selectedTheme = document.getElementById('text-field-theme').value;
    const wordContainer = document.querySelector('.word-container');
    const inputField = document.getElementById('translateField');
    
    if (!selectedTheme || !database.objectStoreNames.contains(selectedTheme)) {
        console.error("Error: The specified theme is missing in IndexedDB:", selectedTheme);
        return;
    }

    const transaction = database.transaction(selectedTheme, 'readonly');
    const store = transaction.objectStore(selectedTheme);
    const getAllRequest = store.getAll();

    const randomButton = document.getElementById('replace-btn');
    const wordPlace = document.querySelector('.word');

    getAllRequest.onsuccess = () => {
        const data = getAllRequest.result;

        randomButton.addEventListener('click', () => {
            countVoiceoverButtonPressed = true;
            countHelpButtonPressed = 0;
            console.log("countHelpButtonPressed: ", countHelpButtonPressed); 
            const wordObj = data[Math.floor(Math.random() * data.length)];
            wordPlace.textContent = toLowerCaseAll(wordObj.word);
            inputField.value = "";
            wordContainer.classList.remove('show-translate');
        });
    };
    getAllRequest.onerror = (event) => {
        console.error("Error reading data:", event.target.error);    
    };
}

let countVoiceoverButtonPressed = true;
function wordVoiceover() {
    const voice = document.getElementById('sound-btn');

    voice.addEventListener('click', () => {
        if (window.speechSynthesis) {
            const wordElement = document.querySelector('.word');
            if (!wordElement || !wordElement.textContent.trim()){
                console.log("No word to pronounce");
                return;
            }
            const utterance = new SpeechSynthesisUtterance();
            utterance.text = wordElement.textContent;
            utterance.lang = "en";
            utterance.rate = countVoiceoverButtonPressed ? 1 : 0.1;
            countVoiceoverButtonPressed = !countVoiceoverButtonPressed;
            speechSynthesis.speak(utterance);
            console.log(wordElement);
        }
    })
}

function setupChangeThemesAndTimes() {
    if (countHelpButtonPressed === 1) {
        countHelpButtonPressed = 0;
        console.log("countHelpButtonPressed: ", countHelpButtonPressed); 
    }
    countVoiceoverButtonPressed = true;

    function changeThemesAndTimes(prevBtn, nextBtn, textField, arr, nameIndex) {        
        const wordContainer = document.querySelector('.word-container');
        let currentIndex = 0;

        chrome.storage.local.get(nameIndex, (data) => {
            if (data[nameIndex] !== undefined) {
                currentIndex = data[nameIndex];
            }
            updateTextField();
        })

        const updateTextField = () => {
            textField.value = arr[currentIndex];
        }

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + arr.length) % arr.length;
            updateTextField();
            wordContainer.classList.remove('show-translate');
            chrome.storage.local.set({ [nameIndex]: currentIndex });
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % arr.length;
            updateTextField();
            wordContainer.classList.remove('show-translate');
            chrome.storage.local.set({ [nameIndex]: currentIndex });
        });
    }

    changeThemesAndTimes(
        document.getElementById('prev-btn-theme'),
        document.getElementById('next-btn-theme'),
        document.getElementById('text-field-theme'),
        ['All Words', 'Human', 'Food', 'House', 'Sport', 
         'Profession', 'Money', 'Cinema', 'Nature', 'Traveling'],
        'themeIndex'
    );

    changeThemesAndTimes(
        document.getElementById('prev-btn-time'),
        document.getElementById('next-btn-time'),
        document.getElementById('text-field-time'),
        ['10 min', '20 min', '30 min', '60 min', '180 min'],
        'timeIndex'
    );
}

function setupDatebase(){
    /*open and use DateBase*/
    const request = indexedDB.open("words", 1);

    request.onupgradeneeded = (event) => {
        const database = event.target.result;
        const jsonThemes = ['All Words', 'Human', 'Food', 'House', 'Sport', 
                            'Profession', 'Money', 'Cinema', 'Nature', 'Traveling'];

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
                loadJsonIntoDB(database);
            } else {
                console.log("IndexedDB already contains data");
            }
        });
    
        const selectedTheme = document.getElementById('text-field-theme').value;
        console.log("selectedTheme: ", selectedTheme);
        if (selectedTheme && database.objectStoreNames.contains(selectedTheme)) {
            fetchWordsFromDB(database, selectedTheme);
        } else {
            console.warn("The theme does not exist in the database or is not selected!");
        }
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

function fetchWordsFromDB(database, theme) {
    const transaction = database.transaction(theme, "readonly");
    const store = transaction.objectStore(theme);
    const getAllRequest = store.getAll();

    /*get english word contain*/
    const wordElement = document.querySelector('.word');
    /*get translation word contain*/
    const translateElement = document.querySelector('.translate');

    getAllRequest.onsuccess = () => {
        const data = getAllRequest.result;
        console.log("Data from IndexedDB:", data);
    
        if (!data || data.length === 0) {
            console.warn("No data in IndexedDB!");
            return;  
        }
        
        const updateWord = () => {
            const word = data[Math.floor(Math.random() * data.length)];
            if (!word) return;
    
            wordElement.textContent = toLowerCaseAll(word.word) || "No data";
            translateElement.textContent = toLowerCaseAll(word.translation) || "No translation";
    
        };
    
        updateWord();
    };
    
    getAllRequest.onerror = (event) => {
        console.error("Error reading data:", event.target.error);
    };    
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
    const plusButton = document.getElementById('plus-btn');

    plusButton.addEventListener('click', () => {

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

            let foundWord = data.find(item => toLowerCaseAll(item.word) === toLowerCaseAll(wordText));
            if (foundWord) {
                deleteWordFromDB(databaseWords, selectedTheme, foundWord.word)
                    .then(() => moveWordToLearned(databaseLearned, foundWord))
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

function moveWordToLearned(databaseLearned, word) {
    if (!word || !word.word) {
        console.error("Invalid word format:", word);
        return;
    }
    
    const transaction = databaseLearned.transaction('learned', 'readwrite');
    const store = transaction.objectStore('learned');
    word.word = toLowerCaseAll(word.word);
    word.translation = toLowerCaseAll(word.translation);
    const addRequest = store.put(word);
    
    addRequest.onsuccess = () => {
        console.log(`Word '${word.word}' successfully added to learned.`);
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
    
    const selectedTheme = document.getElementById('text-field-theme').value;
    
    deleteWordFromDB(databaseLearned, 'learned', word.word)
        .then(() => {
            const transaction = databaseWords.transaction(selectedTheme, 'readwrite');
            const store = transaction.objectStore(selectedTheme);
            const addRequest = store.put(word);
    
            addRequest.onsuccess = () => {
                console.log(`Word '${word.word}' successfully returned to the main database.`);
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
    const mainWindow = document.getElementById('main-window');
    const listWindow = document.getElementById('list-window');
    const listButton = document.querySelector('.list-check-btn');
    const returnButton = document.querySelector('.return-btn');
    const allWordsContainer = document.querySelector('.all-words');

    if(!listButton){
        console.error("Not found button list")
        return;
    }
    if(!returnButton){
        console.error("Not found button back");
        return;
    }
    
    listButton.addEventListener('click', () => {
        loadWordLearnedDB(databaseWords, databaseLearned, allWordsContainer);
        mainWindow.classList.add('hidden');
        listWindow.classList.remove('hidden');
    });

    returnButton.addEventListener('click', () => {
        listWindow.classList.add('hidden');
        mainWindow.classList.remove('hidden');
    });
}

function loadWordLearnedDB(databaseWords, databaseLearned, allWordsContainer) {
    if (!databaseLearned) {
        console.log('DB Learned not found');
        return;
    }

    allWordsContainer.innerHTML = '';

    const transaction = databaseLearned.transaction('learned', 'readonly');
    const store = transaction.objectStore('learned');
    const getAllRequest = store.getAll();

    chrome.storage.local.get('theme', (data) => {
        savedTheme = data.theme;
        console.log('current theme: ', savedTheme);
    });

    getAllRequest.onsuccess = () => {
        const words = getAllRequest.result;
        console.log('Words loaded from Learned: ', words);
        console.log('get-main-cont', allWordsContainer);
    
        words.forEach((item, index) => {
            const newContainer = document.createElement('div');
            newContainer.classList.add('new-learned-word');
            
            if (savedTheme === 'dark') {
                newContainer.style.backgroundColor = index % 2 === 0 ? '#9a9a9a' : '#8fa3b0';
                console.log("STYLE SET FOR DARK");
            }
            else if (savedTheme === 'light') {
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
            img.style.display = 'block';
            img.style.width = '100%';
            img.style.height = 'auto';

            newButton.appendChild(img);

            newButton.addEventListener('click', () => {
                returnToMainDB(databaseWords, databaseLearned, item);
                console.log('click return-btn', newButton);
            });
        
            newContainer.appendChild(newWord);
            newContainer.appendChild(newTranslation);
            newContainer.appendChild(newButton);
        
            allWordsContainer.appendChild(newContainer);
            console.log('final', newContainer);

            const heightAllWordsContainer = allWordsContainer.clientHeight;
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

    if (changes.timeIndex) {
        saveUserTime();
    }
});