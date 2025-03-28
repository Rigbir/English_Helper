import { elements } from './domElements.js';
import { appState } from './appState.js';
import { toLowerCaseAll, replaceCharacter } from './utils.js';
import { moveWordToLearnedForThisSection, fetchRandomWordFromDatabase } from './database/mainDatabase.js';
import { loadLearnedWordsFromDatabase } from './database/secondaryDatabase.js';
import { handleDefaultMode } from './modes/DefaultMode.js';
import { handleReverseMode } from './modes/ReverseMode.js';

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
            allModeSelections
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
        
        // Send message to background.js
        chrome.runtime.sendMessage({ action: 'toggleBackground', state: isState });
    });
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
            const wordText = document.querySelector('.word').textContent.trim().toLowerCase();
            const foundWord = data.find(item => {
                if (appState.mode === 'Default') {
                    return item.word.trim().toLowerCase() === wordText
                } else {
                    if (Array.isArray(item.translation)) {
                        return item.translation.some(tr => tr.trim().toLowerCase() === wordText);
                    } else {
                        return item.translation.trim().toLowerCase() === wordText;  
                    }
                }
            });

            if (!foundWord) {
                console.error('Error: No translation found for:', wordText);
            }

            if (appState.countHelpButtonPressed === 0) {
                translateWord.style.color = '#1DB954';
                
                if (appState.mode === 'Default') {
                    handleDefaultMode(foundWord);
                    // if (Array.isArray(foundWord.translation)) {
                    //     translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)]);
                    // } else {
                    //     translateWord.textContent = toLowerCaseAll(foundWord.translation);
                    //     console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
                    // }
                } else {
                    handleReverseMode(foundWord);
                    // if (Array.isArray(foundWord.word)) {
                    //     translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.translation.length)]);
                    // } else {
                    //     translateWord.textContent = toLowerCaseAll(foundWord.word);
                    //     console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
                    // }
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

                const activeWordText = activeWord?.textContent?.trim();
                console.log('ACTIVE WORD: ', activeWord);

                let foundWord = data.find(item => {
                    if (appState.mode === 'Default') { 
                        return toLowerCaseAll(item.word) === toLowerCaseAll(activeWordText);
                    } else {
                        if (Array.isArray(item.translation)) {
                            return item.translation.some(translation => toLowerCaseAll(translation) === toLowerCaseAll(activeWordText));
                        } else {
                            return toLowerCaseAll(item.translation) === toLowerCaseAll(activeWordText);
                        }                    
                    }
                });
            
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
                    const correctAnswer = appState.mode === 'Default' ? foundWord.translation : [foundWord.word];

                    console.log('Input:', replaceCharacter(inputField.value));
                    console.log('Translation:', correctAnswer.map(tr => replaceCharacter(toLowerCaseAll(tr))).join(', '));
                    console.log('Comparison:', correctAnswer.some(tr => replaceCharacter(inputField.value) === replaceCharacter(tr)));

                    if (correctAnswer.some(tr => replaceCharacter(inputField.value) === toLowerCaseAll(replaceCharacter(tr)))) {
                        sound.pause();
                        sound.currentTime = 0;
                        sound.play();

                        replaceCurrentWord(data);
                        moveWordToLearnedForThisSection(database, selectedTheme, 'Correct', foundWord.word);
                        
                        if (data.length === 1) {
                            activeWordText.textContent = 'No words available';
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

    const filteredData = data.filter(item => item.word !== activeWord.textContent);
    const randomWord = filteredData[Math.floor(Math.random() * filteredData.length)];

    if (randomWord) {
        if (appState.mode === 'Default') {
            activeWord.textContent = toLowerCaseAll(randomWord.word);
        } else {
            if (Array.isArray(randomWord.translation)) {
                activeWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)]);
            } else {
                activeWord.textContent = toLowerCaseAll(randomWord.translation);
            }
        }        
        translateWord.textContent = ''; 
        inputField.value = ''; 
        console.log('New word:', randomWord.word);
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
        const selectedTheme = document.getElementById('text-field-theme').value;

        const transaction = database.transaction(selectedTheme, 'readonly');
        const store = transaction.objectStore(selectedTheme);
        const getAllRequest = store.getAll();
    
        if (inputField.style.display === 'none') { 
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
            utterance.lang = appState.mode === 'Default' ? 'en' : 'ru';
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
            listWordsContainer
          } = elements;

    if (!listButton) {
        console.error('Not found button list')
        return;
    }
    if (!returnFromList) {
        console.error('Not found button back');
        return;
    }
    
    listButton.addEventListener('click', () => {
        loadLearnedWordsFromDatabase(databaseWords, databaseLearned, listWordsContainer);
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
        fetchRandomWordFromDatabase(databaseWords, selectedTheme);
    });
}