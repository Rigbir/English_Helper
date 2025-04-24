import { elements } from './domElements.js';
import { appState } from './appState.js';
import { toLowerCaseAll, replaceCharacter } from './utils.js';
import { moveWordToLearnedForThisSection, fetchRandomWordFromDatabase } from './database/mainDatabase.js';
import { addWordToSecondaryDatabase, loadLearnedWordsFromDatabase } from './database/secondaryDatabase.js';
import { handleDefaultMode, replaceWordDefaultMode } from './modes/DefaultMode.js';
import { handleReverseMode, replaceWordReverseMode } from './modes/ReverseMode.js';
import { handleMixedMode, replaceWordMixedMode } from './modes/MixedMode.js';
import { handlePhoneticMode, replaceWordPhoneticMode } from './modes/PhoneticMode.js';
import { handleTimeChallengeMode, replaceWordTimeChallengeMode } from './modes/TimeChallengeMode.js';
import { handleMissingLettersMode, replaceWordMissingLettersMode } from './modes/MissingLetters.js';
import { updateSelection, loadInitialSelection } from './storage.js';
import { initializeThemeSettings } from './theme.js';

export function displayAppInfoPopup() {
    const { infoButton,
            infoPopup,
            infoOverlay,
            infoCloseOverlayButton
          } = elements;

    infoButton.addEventListener('click', () => {
        infoPopup.style.display = 'block';
        infoOverlay.style.display = 'block';
    });

    infoCloseOverlayButton.addEventListener('click', () => {
        infoPopup.style.display = 'none';
        infoOverlay.style.display = 'none';
    });

    infoOverlay.addEventListener('click', () => {
        infoPopup.style.display = 'none';
        infoOverlay.style.display = 'none';
    });
}

export function selectedThemePopup() {
    const { themeField,
            themePopup,
            themeOverlay,
            themeCloseOverlayButton,
            allThemeSelections
          } = elements;
    
    themeField.addEventListener('click', () => {
        themePopup.style.display = 'block';
        themeOverlay.style.display = 'block';
    });

    allThemeSelections.forEach(themeSelected => {
        themeSelected.addEventListener('click', () => {
            allThemeSelections.forEach(item => item.classList.remove('selected-theme'));

            themeSelected.classList.add('selected-theme');
            chrome.storage.local.set({ selectedTheme: themeSelected.textContent });
        });
    });

    themeCloseOverlayButton.addEventListener('click', () => {
        themePopup.style.display = 'none';
        themeOverlay.style.display = 'none';
    });

    themeOverlay.addEventListener('click', () => {
        themePopup.style.display = 'none';
        themeOverlay.style.display = 'none';
    });
}

export function selectedTimePopup() {
    const { timeField,
            timePopup,
            timeOverlay,
            timeCloseOverlayButton,
            allTimeSelections,
            textFieldTime
          } = elements;
    
    timeField.addEventListener('click', () => {
        timePopup.style.display = 'block';
        timeOverlay.style.display = 'block';
    });

    allTimeSelections.forEach(timeSelected => {
        timeSelected.addEventListener('click', () => {
            allTimeSelections.forEach(item => {item.classList.remove('selected-time')});

            timeSelected.classList.add('selected-time');
            textFieldTime.value = timeSelected.textContent;
            chrome.storage.local.set({ selectedTime: timeSelected.textContent });
        });
    });

    timeCloseOverlayButton.addEventListener('click', () => {
        timePopup.style.display = 'none';
        timeOverlay.style.display = 'none';
    });

    timeOverlay.addEventListener('click', () => {
        timePopup.style.display = 'none';
        timeOverlay.style.display = 'none';
    });
}

export function selectedModePopup() {
    const { changeModeButton, 
            changeModePopup,
            changeModeOverlay,
            changeModeCloseButtonOverlay,
            allModeSelections,
            wordContainer,
            inputField
          } = elements;
        
    changeModeButton.addEventListener('click', () => {
        console.log("CHANGHE MODE BUTTON CLICK");
        changeModePopup.style.display = 'block';
        changeModeOverlay.style.display = 'block';
    });

    allModeSelections.forEach(modeSelected => {
        modeSelected.addEventListener('click', () => {
            allModeSelections.forEach(item => {item.classList.remove('selected-mode')});

            modeSelected.classList.add('selected-mode');
            appState.mode = modeSelected.textContent;
            appState.countHelpButtonPressed = 0;
            appState.countVoiceoverButtonPressed = true;
            appState.soundTimeChallenge.pause();
            inputField.value = '';
            wordContainer.classList.remove('show-translate');

            chrome.storage.local.set({ selectedMode: modeSelected.textContent });
            console.log("SAVE MODE SELECTED: ", appState.mode);
        });
    });

    changeModeCloseButtonOverlay.addEventListener('click', () => {
        changeModePopup.style.display = 'none';
        changeModeOverlay.style.display = 'none';
    });

    changeModeOverlay.addEventListener('click', () => {
        changeModePopup.style.display = 'none';
        changeModeOverlay.style.display = 'none';
    });
}

export function selectedAchievementPopup(databaseLearned) {
    const { achievementButton,
            achievementPopup,
            achievementOverlay,
            achievementCloseButtonOverlay,
          } = elements;

    achievementButton.addEventListener('click', () => {
        const progressFills = document.querySelectorAll('.progress-fill');
        progressFills.forEach(bar => {
            bar.dataset.progress = 0; 
            bar.style.width = `${0}%`;
        });
        
        loadCustomThemesIntoAchievements();
        getSecondaryResultAchievement(databaseLearned);
        themeDivSelection();
        getAndSetCustomImage();
        achievementPopup.style.display = 'block';
        achievementOverlay.style.display = 'block';
    });

    achievementCloseButtonOverlay.addEventListener('click', () => {
        const progressFills = document.querySelectorAll('.progress-fill');
        progressFills.forEach(bar => {
            bar.dataset.progress = 0; 
            bar.style.width = `${0}%`;
        });

        achievementPopup.style.display = 'none';
        achievementOverlay.style.display = 'none';
    });

    achievementOverlay.addEventListener('click', () => {
        const progressFills = document.querySelectorAll('.progress-fill');
        progressFills.forEach(bar => {
            bar.dataset.progress = 0; 
            bar.style.width = `${0}%`;
        });

        achievementPopup.style.display = 'none';
        achievementOverlay.style.display = 'none';
    });
}

export function initializeNotificationSettings() {
    const { onOffToggleState,
            onOffToggleBackground
          } = elements;

    chrome.storage.local.get(['extensionState', 'theme'], function (data) {
        const isOnMode = data.extensionState !== undefined ? data.extensionState : true;
        appState.theme = data.theme || 'dark';

        onOffToggleState.checked = isOnMode;
        console.log(`State on load: ${isOnMode ? 'Enabled' : 'Disabled'}`);

        console.log('THEME: ', appState.theme);
        if (appState.theme === 'light') {
            onOffToggleBackground.style.backgroundColor = '#f5f4f4';
        } else if (appState.theme === 'dark') {
            onOffToggleBackground.style.backgroundColor = '#242424';
        }

        if (data.extensionState === undefined) {
            chrome.storage.local.set({ extensionState: true });
        }
    });

    onOffToggleState.addEventListener('change', () => {
        const isState = onOffToggleState.checked;
        console.log(`State changed: ${isState ? 'Enabled' : 'Disabled'}`);
        chrome.storage.local.set({ extensionState: isState });
        
        chrome.runtime.sendMessage({ action: 'toggleBackground', state: isState });
    });
}

export function getFoundWordFromDatabase(data, activeWordText) {
    switch (appState.mode) {
        case 'Default':
            return data.find(item => item.word?.trim().toLowerCase() === activeWordText);
        case 'Reverse':
            return data.find(item => 
                Array.isArray(item.translation) 
                    ? item.translation.some(tr => tr?.trim().toLowerCase() === activeWordText)
                    : item.translation?.trim().toLowerCase() === activeWordText
            );
        case 'Mixed':
            if (!appState.handlerForMixedMode) {
                const foundWord = data.find(item => 
                    Array.isArray(item.translation) 
                        ? item.translation.some(tr => tr?.trim().toLowerCase() === activeWordText)
                        : item.translation?.trim().toLowerCase() === activeWordText
                );
                console.log('TRANSLATION + REVERSE:', foundWord);
                return foundWord;
            } else {
                const foundWord = data.find(item => item.word?.trim().toLowerCase() === activeWordText);
                console.log('TRANSLATION + DEFAULT:', foundWord);
                return foundWord;
            }
        case 'Phonetic':
            return data.find(item => item.word?.trim().toLowerCase() === activeWordText);
        case 'Time Challenge':
            return data.find(item => item.word?.trim().toLowerCase() === activeWordText);
        case 'Missing Letters':
            return data.find(item => item.word?.trim().toLowerCase() === activeWordText);
    }
    return null;
}

export function initializeInputFieldAndHintButton(database) {
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
        console.log('Listener added!');
        console.log('BEFORE CLICK - COUNT:', appState.countHelpButtonPressed);

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;
            
            let activeWordText = '';
        
            appState.mode === 'Missing Letters'
                ? activeWordText = appState.originalWord.trim().toLowerCase()
                : activeWordText = activeWord?.textContent?.trim().toLowerCase()
            
            console.log('ACTIVE WORD:', activeWordText);
            

            let foundWord = getFoundWordFromDatabase(data, activeWordText);

            if (!foundWord) {
                console.error('Error: No translation found for:', activeWordText);
            }

            console.log('FOUND WORD:', foundWord);

            if (appState.countHelpButtonPressed === 0) {
                translateWord.style.color = '#1DB954';
                
                switch(appState.mode) {
                    case 'Default': handleDefaultMode(foundWord); break;
                    case 'Reverse': handleReverseMode(foundWord); break;
                    case 'Mixed': handleMixedMode(foundWord); break;
                    case 'Phonetic': handlePhoneticMode(foundWord); break;
                    case 'Time Challenge': handleTimeChallengeMode(foundWord); break;
                    case 'Missing Letters': handleMissingLettersMode(foundWord); break;
                }
           
                console.log('help-btn click');
                wordContainer.classList.add('show-translate');
                console.log('Class added:', wordContainer.classList);
                appState.countHelpButtonPressed = 1;
            } else if (appState.countHelpButtonPressed === 1) {
                console.log('help-btn click');
                wordContainer.classList.remove('show-translate');
                console.log('Class removed:', wordContainer.classList);
                appState.countHelpButtonPressed = 0;
            } 

            console.log('AFTER CLICK - COUNT:', appState.countHelpButtonPressed);
        };

        event.stopPropagation();
    };

    helpButton.addEventListener('click', appState.helpButtonClickHandler);

    if (appState.inputFieldClickHandler) {
        inputField.removeEventListener('keydown', appState.inputFieldClickHandler);
    }

    appState.inputFieldClickHandler = (event) => {
        console.log('Event listener added');
        selectedTheme = textFieldTheme.value;
        const phoneticVoiceButton = document.getElementById('Phonetic-voice-btn');

        if (event.key === 'Enter'){
            inputField.value = toLowerCaseAll(inputField.value);
            inputField.value = inputField.value.trim();
            console.log('enter press');
            console.log(inputField.value);

            const transaction = database.transaction(selectedTheme, 'readonly');
            const store = transaction.objectStore(selectedTheme);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const data = getAllRequest.result;
                let activeWordText = '';

                appState.mode === 'Missing Letters'
                    ? activeWordText = appState.originalWord
                    : activeWordText = activeWord?.textContent?.trim()
                console.log('ACTIVE WORD: ', activeWord);

                let foundWord = getFoundWordFromDatabase(data, activeWordText);

                if (foundWord && foundWord.translation) {
                    if (Array.isArray(foundWord.translation)) {
                        foundWord.translation = foundWord.translation.map(tr => toLowerCaseAll(tr).trim());
                    } else {
                        foundWord.translation = [toLowerCaseAll(foundWord.translation.trim())];
                        console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
                    }
                } else {
                    console.warn('Word or translation not found:', activeWordText);
                    translateWord.textContent = 'Translation not available';  
                }

                if (foundWord) {
                    var correctAnswer = '';
                    
                    switch(appState.mode) {
                        case 'Default': correctAnswer = foundWord.translation; break;
                        case 'Reverse': correctAnswer = [foundWord.word]; break;
                        case 'Mixed': correctAnswer = appState.handlerForMixedMode ? foundWord.translation : [foundWord.word]; break;
                        case 'Phonetic': correctAnswer = foundWord.translation; break;
                        case 'Time Challenge': correctAnswer = foundWord.translation; break;
                        case 'Missing Letters': correctAnswer = [foundWord.word]; break;
                    }

                    console.log('Input:', replaceCharacter(inputField.value));
                    console.log('Translation:', correctAnswer.map(tr => replaceCharacter(toLowerCaseAll(tr))).join(', '));
                    console.log('Comparison:', correctAnswer.some(tr => replaceCharacter(inputField.value) === replaceCharacter(tr)));

                    if (correctAnswer.some(tr => replaceCharacter(inputField.value) === toLowerCaseAll(replaceCharacter(tr)))) {

                        if (appState.mode === 'Time Challenge') {
                            appState.soundTimeChallenge.pause();
                            appState.soundTimeChallenge.currentTime = 0;
                            appState.soundTimeChallenge.play();
                        } else {
                            sound.pause();
                            sound.currentTime = 0;
                            sound.play();
                        }

                        if (appState.mode === 'Phonetic') {
                            phoneticVoiceButton.classList.add('pulse-animation');
                            setTimeout(() => {
                                phoneticVoiceButton.classList.remove('pulse-animation');
                            }, 1000);
                        }

                        replaceCurrentWord(data);
                        moveWordToLearnedForThisSection(database, selectedTheme, 'Correct', foundWord.word);
                        
                        if (data.length === 1) {
                            activeWord.textContent = 'No words available';
                            inputField.style.display = 'none';
                            inputField.value = '';
                            console.log('END OF WORDS IN THEME');
                            return;
                        }
                    } else {
                        inputField.classList.add('error');
                        inputField.value = '';
                        console.log('ERROR INPUT');

                        setTimeout(() => {
                            inputField.classList.remove('error');
                        }, 300);
                    }
                }
            };
            getAllRequest.onerror = (event) => {
                console.error('Error reading data:', event.target.error);
            };            
        }
    }

    inputField.addEventListener('keydown', appState.inputFieldClickHandler);

    wordContainer.addEventListener('click', (event) => {
        if (event.target !== helpButton && event.target !== inputField) {
            wordContainer.classList.remove('show-translate');
            appState.countHelpButtonPressed = 0;
            inputField.value = '';
            console.log('Class remove:', wordContainer.classList);
        }
    });
}

export function replaceCurrentWord(data) {
    const { activeWord } = elements;
    let { translateWord,
          inputField
     } = elements;

     const activeWordText = activeWord.textContent.trim().toLowerCase();
     const originalWordText = appState.originalWord?.trim().toLowerCase();
 
     const filteredData = data.filter(item => 
         item.word.trim().toLowerCase() !== activeWordText &&
         item.word.trim().toLowerCase() !== originalWordText
     );
    
    const randomWord = filteredData[Math.floor(Math.random() * filteredData.length)];

    if (randomWord) {
        
        switch(appState.mode) {
            case 'Default': replaceWordDefaultMode(randomWord); break;
            case 'Reverse': replaceWordReverseMode(randomWord); break;
            case 'Mixed': replaceWordMixedMode(randomWord); break;
            case 'Phonetic': replaceWordPhoneticMode(randomWord); break;
            case 'Time Challenge': replaceWordTimeChallengeMode(randomWord); break;
            case 'Missing Letters': replaceWordMissingLettersMode(randomWord); break;
        }

        inputField.value = ''; 
        Array.isArray(randomWord.translation)
            ? translateWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)])
            : translateWord.textContent = toLowerCaseAll(randomWord.translation);

        appState.countVoiceoverButtonPressed = true;

        console.log('New word:', randomWord.word);
        console.log('New translation: ', randomWord.translation);
    }
}

export function generateNewRandomWord(database) {
    const { randomButton,
            wordContainer,
            inputField,
            activeWord
          } = elements;

    if (appState.generateRandomWordButtonClickHandler) {
        console.log('Removing old event listener');
        randomButton.removeEventListener('click', appState.generateRandomWordButtonClickHandler);
    }

    appState.generateRandomWordButtonClickHandler = (event) => {
        if (activeWord.style.fontSize != '40px') {
            activeWord.style.fontSize = '40px';
        }

        const selectedTheme = document.getElementById('text-field-theme').value;

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();
    
        if (inputField.style.display === 'none') {
            inputField.style.visibility = 'hidden'; 
            inputField.style.display = 'block';
        }

        if (!selectedTheme || !database.objectStoreNames.contains(selectedTheme)) {
            console.error('Error: The specified theme is missing in IndexedDB:', selectedTheme);
            return;
        }

        getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;

            if (!data || data.length === 0) {
                console.warn('No words available in theme:', selectedTheme);
                activeWord.textContent = 'No words available';
                inputField.value = '';
                return;
            }

            console.log('WORD: ', activeWord.textContent);
            console.log('COUNT GENERATE: ', appState.count);
            ++appState.count;

            if (activeWord.textContent === 'EnjoyandLearn!') {
                console.log('FIRST OPEN');
                fetchRandomWordFromDatabase(database, selectedTheme);
                return;
            }

            appState.countHelpButtonPressed = 0;
            appState.countVoiceoverButtonPressed = true;
            console.log('countHelpButtonPressed: ', appState.countHelpButtonPressed);
            console.log('HANDLE-MIXED-MODE: ', appState.handlerForMixedMode);

            activeWord.textContent = toLowerCaseAll(activeWord.textContent);
            console.log('WORD: ', activeWord.textContent);
            
            inputField.value = '';
            wordContainer.classList.remove('show-translate');
        };

        getAllRequest.onerror = (event) => {
            console.error('Error reading data:', event.target.error);
        };
    }

    randomButton.addEventListener('click', appState.generateRandomWordButtonClickHandler);
    console.log('Event listener added to replace-btn', appState.generateRandomWordButtonClickHandler);
}

export function playWordPronunciation() {
    const { voiceButton } = elements;

    voiceButton.addEventListener('click', () => {
        if (window.speechSynthesis) {
            const wordElement = document.querySelector('.word');
            if (!wordElement || !wordElement.textContent.trim()){
                console.log('No word to pronounce');
                return;
            }
            const utterance = new SpeechSynthesisUtterance();
            utterance.text = wordElement.textContent;
            switch(appState.mode) {
                case 'Default': utterance.lang = 'en'; break;
                case 'Reverse': utterance.lang = 'ru'; break;
                case 'Mixed': utterance.lang = appState.handlerForMixedMode ? 'en' : 'ru'; break;
                case 'Phonetic': utterance.lang = 'en'; break;
                case 'Time Challenge': utterance.lang = 'en'; break;
                case 'Missing Letters': utterance.lang = 'en'; break;
            }
            utterance.rate = appState.countVoiceoverButtonPressed ? 1 : 0.1;
            appState.countVoiceoverButtonPressed = !appState.countVoiceoverButtonPressed;
            speechSynthesis.speak(utterance);
            console.log(wordElement);
        }
    })
}

export function saveNotificationTime() {
    const timeField = document.getElementById('text-field-time').value.trim();
    const match = timeField.match(/^(\d+)/); // Extract number from the string

    if (match) {
        const interval = parseInt(match[1], 10); // Convert to number

        chrome.storage.local.set({ messageInterval: interval }, function() {
            console.log('✅ Interval saved:', interval, 'minutes');
        });
    } else {
        console.warn('⚠ Error: Invalid time value!', timeField);
    }
}

export function openSecondaryListWindow(databaseWords, databaseLearned) {
    const { mainWindow,
            listWindow,
            wordContainer,
            listButton,
            returnFromList,
            listWordsContainer,
            activeWord
          } = elements;

    if (!listButton) {
        console.error('Not found button list')
        return;
    }
    if (!returnFromList) {
        console.error('Not found button back');
        return;
    }
    
    listButton.addEventListener('click', async () => {
        await loadLearnedWordsFromDatabase(databaseWords, databaseLearned, listWordsContainer);
        mainWindow.classList.add('hidden');
        listWindow.classList.remove('hidden');
    });

    returnFromList.addEventListener('click', () => {  
        const selectedTheme = document.getElementById('text-field-theme').value;
        listWindow.classList.add('hidden');
        mainWindow.classList.remove('hidden');
        console.log('Return to main menu')
        console.log('SELECTED THEME: ', selectedTheme);
        wordContainer.classList.remove('show-translate');
        appState.countHelpButtonPressed = 0;
        if (activeWord.textContent === 'No words available') {
            fetchRandomWordFromDatabase(databaseWords, selectedTheme);
        }
    });
}

export function getSecondaryResultAchievement(databaseLearned) {
    const savedCountOnStart = localStorage.getItem('countOnStart');
    console.log('SAVED COUNT ON LOCAL STORAGE', savedCountOnStart);
    if (savedCountOnStart) {
        appState.countOnStart = JSON.parse(savedCountOnStart);
        console.log("NOW countOnStart LIST: ", appState.countOnStart);
    }

    let countWordsOfThemeByList = Object.fromEntries(
        Object.keys(appState.countOnStart).map(key => [key, 0])
    );

    const transaction = databaseLearned.transaction('learned', 'readonly');
    const store = transaction.objectStore('learned');
    const getAllRequest = store.getAll();
    console.log('WORD IN LIST: ', getAllRequest);

    getAllRequest.onsuccess = () => {
        const data = getAllRequest.result;

        data.forEach(item => {
            if (countWordsOfThemeByList.hasOwnProperty(item.theme)) {
                ++countWordsOfThemeByList[item.theme];
            }
            console.log('ITEM IN LEARNED: ', item.theme);
        });

        let percentLearnedWords = {};
    
        for (let i in countWordsOfThemeByList){
            console.log('COUNT FIRST', countWordsOfThemeByList[i]);
            console.log('COUNT SECOND', appState.countOnStart[i]);
            let temp = ((countWordsOfThemeByList[i] / appState.countOnStart[i]) * 100).toFixed(1);
            console.log("TEMP: ", temp);
            percentLearnedWords[i] = temp;
        }

        updateProgressBar(percentLearnedWords);
    
        console.log("PERCENT WORDS: ", percentLearnedWords);
    }

    getAllRequest.onerror = (event) => {
        console.error("Error opening database 'learned'", event.target.error);    
    }
}

function updateProgressBar(percentLearnedWords) {
    for (let theme in percentLearnedWords) {
        const container = document.querySelector(`.theme-progress[data-theme="${theme}"]`);
        if (container) {
            const progressFills = container.querySelectorAll('.progress-fill');
            const progressText = container.querySelector('.progress-text-current');
            const progressValue = percentLearnedWords[theme];

            if (progressFills.length > 0 && progressText) {
                progressFills.forEach(bar => {
                    setTimeout(() => {
                        bar.dataset.progress = progressValue; 
                        bar.style.width = `${progressValue}%`;
                    }, 100);
                });

                progressText.textContent = `${progressValue}%`;  
            } else {
                console.error('Elements not found: progressFills or progressText is null');
            }
        }
    }
}

export function uploadFile(databaseWords) {
    const { uploadButton,
            uploadWindow,
            uploadOverlay,
            uploadPopup,
            uploadCloseOverlayButton,
            dragAndDropZone,
            dragAndDropPopup,
            dragAndDropOverlay,
            dragAndDropUploadFileButton,
            dragAndDropCloseOverlayButton
          } = elements;

    const closeAllPopups = () => {
        uploadOverlay.style.display = 'none';
        uploadPopup.style.display = 'none';
        dragAndDropOverlay.style.display = 'none';
        dragAndDropPopup.style.display = 'none';
        dragAndDropOverlay.classList.remove('dragging');
    };
    
    uploadButton.addEventListener('click', () => {
        uploadOverlay.style.display = 'block';
        uploadPopup.style.display = 'block';
    });

    uploadCloseOverlayButton.addEventListener('click', () => {
        uploadOverlay.style.display = 'none';
        uploadPopup.style.display = 'none';

        dragAndDropOverlay.style.display = 'block';
        dragAndDropPopup.style.display = 'block';
    });

    uploadOverlay.addEventListener('click', () => {
        uploadOverlay.style.display = 'none';
        uploadPopup.style.display = 'none';
    });

    dragAndDropOverlay.addEventListener('click', () => {
        dragAndDropOverlay.style.display = 'none';
        dragAndDropPopup.style.display = 'none';
    });

    dragAndDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragAndDropZone.classList.add('dragover');
    });

    dragAndDropZone.addEventListener('dragleave', () => {
        dragAndDropZone.classList.remove('dragover');
    });

    dragAndDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragAndDropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 1) {
            alert("Пожалуйста, перетащите только один файл.");
            return;
        }

        if (files.length > 0) {
            handleFile(files[0]);
        }

        setTimeout(() => {
            closeAllPopups();
        }, 100);
    });

    dragAndDropUploadFileButton.addEventListener('click', () => {
        uploadWindow.click();
    });

    dragAndDropCloseOverlayButton.addEventListener('click', () => {
        dragAndDropOverlay.style.display = 'none';
        dragAndDropPopup.style.display = 'none';
    });

    uploadWindow.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }

        setTimeout(() => {
            closeAllPopups();
        }, 100);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log('Parsed JSON:', jsonData);

                const themeName = Object.keys(jsonData);
                themeName.forEach(theme => {
                    console.log('Name of theme: ', theme);
                });

                Object.keys(jsonData).forEach((themeName) => {
                    const words = jsonData[themeName];

                    appState.countOnStart[themeName] = words.length;
                    localStorage.setItem('countOnStart', JSON.stringify(appState.countOnStart));
                    console.log("NOW countOnStart LIST: ", appState.countOnStart);

                    addThemeToDatabase(databaseWords, themeName, words);
                });
            } catch (err) {
                console.error('Wrong parse JSON file:', err);
            }
        };
        reader.readAsText(file);
    }   
}

function addThemeToDatabase(database, themeName, words) {
    if (!database.objectStoreNames.contains(themeName)) {
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
            addWordsToStore(db, themeName, words);
            updateThemePopup(themeName);
        };

        request.onerror = (event) => {
            console.error('Error during database upgrade:', event.target.error);
        };
        request.onblocked = () => {
            console.warn('Database upgrade is blocked. Please close other tabs or connections.');
            const activeWord = document.querySelector('.word');
            activeWord.style.fontSize = '33px';
            activeWord.textContent = 'Restart the extension and Retry uploading the file';
        };
    } else {
        console.log(`Object Store "${themeName}" already exists. Adding words.`);

        const activeWord = document.querySelector('.word');
        activeWord.style.fontSize = '30px';
        activeWord.textContent = 'This theme has already been uploaded. Choose another one.';
    }
}

function addWordsToStore(database, themeName, words) {
    const transaction = database.transaction(themeName, 'readwrite');
    const store = transaction.objectStore(themeName);

    words.forEach((word) => {
        store.add(word);
    });

    transaction.oncomplete = () => {
        console.log(`Theme "${themeName}" successfully added to the database.`);
    };

    transaction.onerror = (event) => {
        console.error(`Error adding theme "${themeName}":`, event.target.error);
    };
}

function updateThemePopup(themeName) {
    const { themePopup } = elements;
    appState.themeArray.push(themeName);

    localStorage.setItem('themeArray', JSON.stringify(appState.themeArray));
    console.log("NOW THEME LIST: ", appState.themeArray);

    chrome.storage.local.set({ selectedTheme: themeName});
    console.log("IN STORE NOW SAVE: ", themeName);

    const existingThemes = themePopup.querySelectorAll('.theme');
    existingThemes.forEach(theme => theme.remove());

    appState.themeArray.forEach(themeName => {
        const themeList = document.createElement('p');
        themeList.classList.add('theme');
        themeList.textContent = themeName;

        themePopup.insertBefore(themeList, document.getElementById('close-theme-popup'));
        
        themeList.addEventListener('click', () => {
            const themeField = document.getElementById('text-field-theme');
            themeField.value = themeName;  
            chrome.storage.local.set({ selectedTheme: themeName }); 
        });
    });

    refreshDatabase();
}

export function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('themeArray');
    if (savedTheme) {
        appState.themeArray = JSON.parse(savedTheme);
        console.log('Themes loaded from localStorage:', appState.themeArray);
    
        refreshThemePopup();
    }
}

function refreshThemePopup() {
    const { themePopup } = elements;

    const existingThemes = themePopup.querySelectorAll('.theme');
    existingThemes.forEach(theme => theme.remove());

    appState.themeArray.forEach(themeName => {
        const themeList = document.createElement('p');
        themeList.classList.add('theme');
        themeList.textContent = themeName;

        themePopup.insertBefore(themeList, document.getElementById('close-theme-popup'));
        
        themeList.addEventListener('click', () => {
            const themeField = document.getElementById('text-field-theme');
            themeField.value = themeName;  
            chrome.storage.local.set({ selectedTheme: themeName }); 
        });
    });

    chrome.storage.onChanged.addListener((changes) => {
        updateSelection(changes, 'selectedTheme', '.popup .theme', 'selected-theme');
        updateSelection(changes, 'selectedTime', '.popup .time', 'selected-time');
        updateSelection(changes, 'selectedMode', '.popup .mode', 'selected-mode');
    });

    loadInitialSelection('selectedTheme', 'Default', '.popup .theme', 'selected-theme');
    loadInitialSelection('selectedTime', 'All Words', '.popup .time', 'selected-time');
    loadInitialSelection('selectedMode', '10 minutes', '.popup .mode', 'selected-mode');
}

function openDatabase(name) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function refreshDatabase() {
    try {
        const databaseWords = await openDatabase('words');
        console.log("Database 'words' successfully opened", databaseWords);

        const databaseLearned = await openDatabase('learned_words');
        console.log("Database 'learned_words' successfully opened", databaseLearned);

        addWordToSecondaryDatabase(databaseWords, databaseLearned);
    } catch (error) {
        console.error("Error opening databases:", error);
    }
}

function createThemeProgressElement(themeName) {
    const container = document.createElement('div');
    container.className = 'theme-progress';
    container.dataset.theme = themeName;

    const savedImages = localStorage.getItem('imagesForUserTheme');
    if (savedImages) {
        appState.imagesForUserTheme = JSON.parse(savedImages);
    }

    const savedThemeToImage = localStorage.getItem('themeToImage');
    if (savedThemeToImage) {
        appState.themeToImage = JSON.parse(savedThemeToImage);
    } else {
        appState.themeToImage = {};
    }

    let imageLink;

    if (appState.themeToImage[themeName]) {
        imageLink = appState.themeToImage[themeName];
    }else {
        const arrayLink = Object.entries(appState.imagesForUserTheme)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);

        imageLink = arrayLink[Math.floor(Math.random() * arrayLink.length)];

        appState.imagesForUserTheme[imageLink] = false;
        appState.themeToImage[themeName] = imageLink;

        localStorage.setItem('imagesForUserTheme', JSON.stringify(appState.imagesForUserTheme));
        localStorage.setItem('themeToImage', JSON.stringify(appState.themeToImage));
    }

    container.innerHTML = `
        <div class="theme-row">
            <img src="${imageLink}" alt="${themeName} Icon" draggable="false"  class="theme-icon">
            <strong>${themeName}</strong>
        </div>
        <div class="progress-bar-container">
            <div class="progress-fill" data-progress="0"></div>
            <div class="progress-text-current">0%</div>
            <div class="progress-text-end"></div>
        </div>
    `;

    return container;
}

function loadCustomThemesIntoAchievements() {
    const { achievementPopup } = elements;

    for (let i = 0; i < appState.themeArray.length; ++i) {
        const tempName = appState.themeArray[i];
        console.log('TEMP NAME: ', tempName);

        const alreadyExists = achievementPopup.querySelector(`.theme-progress[data-theme="${tempName}"]`);
        if (!alreadyExists) {
            const newContainer = createThemeProgressElement(tempName);
            achievementPopup.insertBefore(newContainer, document.getElementById('close-achievement-popup'));
            console.log("CREATE NEW DIV");
        }
    }
}

function themeDivSelection() {
    const { allImagesForThemesOverlay,
            allImagesForThemesPopup,
            allImagesForThemesPopupCloseButton,
            achievementPopup,
            achievementOverlay
          } = elements;

    const themeProgressLine = document.querySelectorAll('.theme-progress');
    let themeImage = document.querySelector('.theme-icon');

    themeProgressLine.forEach(theme => {   
        theme.addEventListener('click', () => {
            console.log('themeProgressLine CLICK', theme);
            achievementPopup.style.display = 'none';
            achievementOverlay.style.display = 'none';

            allImagesForThemesOverlay.style.display = 'block';
            allImagesForThemesPopup.style.display = 'grid';

            themeImage = theme.querySelector('.theme-icon');
            console.log("THEME IMAGE", themeImage);

            handleCustomImageSelection(themeImage);
        });
    });

    allImagesForThemesOverlay.addEventListener('click', () => {
        allImagesForThemesOverlay.style.display = 'none';
        allImagesForThemesPopup.style.display = 'none';
    });

    allImagesForThemesPopupCloseButton.addEventListener('click', () => {
        allImagesForThemesPopup.style.display = 'none';
        allImagesForThemesOverlay.style.display = 'none';

        achievementPopup.style.display = 'block';
        achievementOverlay.style.display = 'block';
    });
}

function handleCustomImageSelection(themeImage) {
    const { allImagesForThemesOverlay,
            allImagesForThemesPopup,
            achievementPopup,
            achievementOverlay
      } = elements;

    const customImages = document.querySelectorAll('.customImage');

    customImages.forEach(image => {
        const newImage = image.cloneNode(true);
        image.parentNode.replaceChild(newImage, image);
    });    

    const updateCutsomImages = document.querySelectorAll('.customImage');
    updateCutsomImages.forEach(image => {
        image.addEventListener('click', () => {
            if (themeImage.alt) {
                console.log("IMAGE TURN", image);

                themeImage.src = image.src;
                console.log("THEME IMAGE ALT: ", themeImage.alt);

                const themeImageData = {
                    src: themeImage.src,
                    alt: themeImage.alt,
                }

                let storedImages = JSON.parse(localStorage.getItem('customThemeImages')) || [];
                storedImages.push(themeImageData);
                localStorage.setItem('customThemeImages', JSON.stringify(storedImages));
    
                allImagesForThemesPopup.style.display = 'none';
                allImagesForThemesOverlay.style.display = 'none';
                achievementPopup.style.display = 'block';
                achievementOverlay.style.display = 'block';
            }
        });
    });
}

function getAndSetCustomImage() {
    const getCustomThemeImage = localStorage.getItem('customThemeImages');
    console.log('IN LOCAL STORAGE IMAGES: ', getCustomThemeImage);

    if (getCustomThemeImage) {
        const parseData = JSON.parse(getCustomThemeImage);

        parseData.forEach(item => {
            let themeImage = document.querySelector(`.theme-icon[alt="${item.alt}"]`);
            if (themeImage) {
                themeImage.src = item.src;
            }
        })
    }
}

const handleMap = new WeakMap();
const clickMap = new WeakMap();

export function settingsPopup() {
    const { mainWindow,
            paletteButton,
            paletteOverlay,
            firstPaletteOverlay,
            palettePopup,
            paletteOverlayCloseButton,
            iconButtons,
            arrowButtons,
            mainHorizontalLines,
            footerButtons,
            allIconImage,
            allArrowImage,
            footerText
          } = elements;

    // const handleMap = new WeakMap();
    // const clickMap = new WeakMap();

    paletteButton.addEventListener('click', () => {
        firstPaletteOverlay.style.display = 'block';

        document.querySelectorAll('.information-btn, .main, .horizontal-line, .icon-btn, .arrow-btn, .upload-btn, .list-check-btn').forEach(el => {
            el.classList.add('highlight-target');
            el.disabled = true;
        });
        
        document.getElementById('main-window').classList.add('highlight-body');

        [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroup);
        [allIconImage, allArrowImage, footerText].forEach(getClickOnButton);
    });

    function growHighlightGroup(element) {
        element.forEach(el => { 
            const mouseEnterHandler = () => {
                element.forEach(item => item.classList.add('highlight-group'));
                document.getElementById('main-window').classList.remove('highlight-body');
            }
            const mouseLeaveHandler = () => {
                element.forEach(item => item.classList.remove('highlight-group'));
                document.getElementById('main-window').classList.add('highlight-body');
            }

            el.addEventListener('mouseenter', mouseEnterHandler);
            el.addEventListener('mouseleave', mouseLeaveHandler);

            handleMap.set(el, { mouseEnterHandler, mouseLeaveHandler });
        });
    }

    // function growHighlightGroupDisable(element) {
    //     element.forEach(el => {
    //         const currentHandle = handleMap.get(el);
    //         if (currentHandle) {
    //             el.removeEventListener('mouseenter', currentHandle.mouseEnterHandler);
    //             el.removeEventListener('mouseleave', currentHandle.mouseLeaveHandler);
    //             handleMap.delete(el);
    //         }

    //         el.classList.remove('highlight-group');
    //         el.classList.remove('highlight-target');
    //     });

    //     document.querySelectorAll('.information-btn, .main, .horizontal-line, .icon-btn, .arrow-btn, .upload-btn, .list-check-btn').forEach(el => {
    //         el.disabled = false;
    //     });
    //     document.getElementById('main-window').classList.remove('highlight-body');
    // }

    function getClickOnButton(element) {
        element.forEach(el => {
            const handler = () => {
                console.log('click on element: ', el)
                appState.arraySelectedElementPalette = [el];
                console.log("ELEMENT IN ARRAY: ", appState.arraySelectedElementPalette);

                firstPaletteOverlay.style.display = 'none';
                paletteOverlay.style.display = 'block';
                palettePopup.style.display = 'block';
                document.getElementById('main-window').classList.remove('highlight-body');
    
                toggleNew();
                [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroupDisable);
            };
    
            el.addEventListener('click', handler);
            clickMap.set(el, handler);
        });
    }
    
    // function removeClickHandler(element) {
    //     element.forEach(el => {
    //         const oldHandler = clickMap.get(el);

    //         if (oldHandler) {
    //             el.removeEventListener('click', oldHandler);
    //             clickMap.delete(el);
    //         }
    //     });
    // }

    firstPaletteOverlay.addEventListener('click', () => {
        firstPaletteOverlay.style.display = 'none';
        paletteOverlay.style.display = 'block';
        palettePopup.style.display = 'block';
        document.getElementById('main-window').classList.remove('highlight-body');
        
        toggleNew();
        [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroupDisable);
    })

    paletteOverlay.addEventListener('click', () => {
        paletteOverlay.style.display = 'none';
        palettePopup.style.display = 'none';

        [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroupDisable);
        [allIconImage, allArrowImage, footerText].forEach(removeClickHandler);
    });

    paletteOverlayCloseButton.addEventListener('click', () => {
        paletteOverlay.style.display = 'none';
        palettePopup.style.display = 'none';

        [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroupDisable);
        [allIconImage, allArrowImage, footerText].forEach(removeClickHandler);
    });

    return {
        growHighlightGroupDisable,
        removeClickHandler
    }
}

function growHighlightGroupDisable(element) {
    element.forEach(el => {
        const currentHandle = handleMap.get(el);
        if (currentHandle) {
            el.removeEventListener('mouseenter', currentHandle.mouseEnterHandler);
            el.removeEventListener('mouseleave', currentHandle.mouseLeaveHandler);
            handleMap.delete(el);
        }

        el.classList.remove('highlight-group');
        el.classList.remove('highlight-target');
    });

    document.querySelectorAll('.information-btn, .main, .horizontal-line, .icon-btn, .arrow-btn, .upload-btn, .list-check-btn').forEach(el => {
        el.disabled = false;
    });
    document.getElementById('main-window').classList.remove('highlight-body');
}

function removeClickHandler(element) {
    element.forEach(el => {
        const oldHandler = clickMap.get(el);

        if (oldHandler) {
            el.removeEventListener('click', oldHandler);
            clickMap.delete(el);
        }
    });
}

function toggleNew() {
    const preview = document.getElementById('color-previews');
    const applyButton = document.getElementById('apply-btn');

    const { paletteOverlay,
            palettePopup,
            iconButtons,
            arrowButtons,
            mainHorizontalLines,
            footerButtons,
            allIconImage,
            allArrowImage,
            footerText
          } = elements;
    
    const sliders = {
        hue: document.getElementById('hue'),
        saturation: document.getElementById('saturation'),
        lightness: document.getElementById('lightness'),
    };

    const fields = {
        hue: document.getElementById('input-hue'),
        saturation: document.getElementById('input-color-saturation'),
        lightness: document.getElementById('input-lightness'),
    }

    let color = "";

    function getValue(source) {
        return {
            h : source.hue.value,
            s : source.saturation.value,
            l : source.lightness.value
        }
    }
    
    function updateColorFrom(source) {
        const { h, s, l } = getValue(source);

        color = hslToHex(h, s, l);
        console.log("COLOR IN HEX VALUE: ", color);
        preview.value = color;
        //preview.style.backgroundColor = color;
    }

    restrictInput(document.getElementById('input-hue'), 0, 360);
    restrictInput(document.getElementById('input-color-saturation'), 0, 100);
    restrictInput(document.getElementById('input-lightness'), 0, 100);
    
    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', () => updateColorFrom(sliders));
    });

    Object.values(fields).forEach(field => {
        field.addEventListener('input', () => updateColorFrom(fields));
    })
    
    const handler = () => {
        console.log("COLOR APPLY CLICK");       
        console.log('COLOR: ', color);

        const getElement = appState.arraySelectedElementPalette;

        chrome.storage.local.get('paletteColors', (result) => {
            const palette = result.paletteColors || {};

            getElement.forEach(el => {
                const name = el.className;
                console.log("NAME: ", name);

                if (name.includes('upload-btn-text') || name.includes('list-check-btn-text')) {
                    palette['footer-btn'] = color; 
                } else {
                    palette[name] = color;
                }
            });

            chrome.storage.local.set({ paletteColors: palette });
        });

        paletteOverlay.style.display = 'none';
        palettePopup.style.display = 'none';

        [iconButtons, arrowButtons, footerButtons, mainHorizontalLines].forEach(growHighlightGroupDisable);
        [allIconImage, allArrowImage, footerText].forEach(removeClickHandler);

        initializeThemeSettings();
    }
    applyButton.addEventListener('click', handler);

    updateColorFrom(sliders);
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    const toHex = (v) => {
        return Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase();
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function restrictInput(input, min, max) {
    input.addEventListener('input', () => {
        let value = input.value.replace(/[^\d.]/g, ''); 
        if (value !== '') {
            value = Math.min(Math.max(+value, min), max);
        }
        input.value = value;
    });
}

