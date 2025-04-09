import { elements } from './domElements.js';
import { appState } from './appState.js';
import { toLowerCaseAll, replaceCharacter } from './utils.js';
import { moveWordToLearnedForThisSection, fetchRandomWordFromDatabase, loadUploadJsonFileIntoDB } from './database/mainDatabase.js';
import { loadLearnedWordsFromDatabase } from './database/secondaryDatabase.js';
import { handleDefaultMode, replaceWordDefaultMode } from './modes/DefaultMode.js';
import { handleReverseMode, replaceWordReverseMode } from './modes/ReverseMode.js';
import { handleMixedMode, replaceWordMixedMode } from './modes/MixedMode.js';
import { handlePhoneticMode, replaceWordPhoneticMode } from './modes/PhoneticMode.js';
import { handleTimeChallengeMode, replaceWordTimeChallengeMode } from './modes/TimeChallengeMode.js';
import { handleMissingLettersMode, replaceWordMissingLettersMode } from './modes/MissingLetters.js';

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
        
        getSecondaryResultAchievement(databaseLearned);
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
    let countOnStart = {
        'All Words': 6882,
        'Human': 115,
        'Food': 113,
        'House': 31,
        'Sport': 86,
        'Profession': 49,
        'Money': 124,
        'Cinema': 140,
        'Nature': 206,
        'Traveling': 123,
        'IT': 42,
        'Idioms': 81
    }
    
    let countWordsOfThemeByList = Object.fromEntries(
        Object.keys(countOnStart).map(key => [key, 0])
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
            console.log('COUNT SECOND', countOnStart[i]);
            let temp = ((countWordsOfThemeByList[i] / countOnStart[i]) * 100).toFixed(1);
            console.log("TEMP: ", temp);
            percentLearnedWords[i] = temp;
        }

        updateProgressBar(percentLearnedWords);
    
        console.log("PERCENT WORDS: ", percentLearnedWords);
    }

    getAllRequest.onerror = (event) => {
        console.error("Error opening database 'learned'", event.target.error);    }
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
            uploadWindow
          } = elements;
    
    uploadButton.addEventListener('click', () => {
        uploadWindow.click();
    });

    uploadWindow.addEventListener('change', (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            const file = files[0];
            console.log('File Name: ', file.name);

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    console.log('Parsed JSON:', jsonData);

                    const themeName = Object.keys(jsonData);
                    themeName.forEach(theme => {
                        console.log('Name of theme: ', theme);
                    });

                    loadUploadJsonFileIntoDB(databaseWords, jsonData);
                } catch (err) {
                    console.error('Wrong parse JSON file:', err);
                }
            };
            reader.readAsText(file);
        }
    });
}