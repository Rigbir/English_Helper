import { elements } from "./domElements.js";
import { appState } from "./appState.js";
import { initializeNotificationSettings } from "./ui.js";

export function initializeThemeSettings() {
    const { themeToggleState, 
            themeToggleBackground,
            onOffToggleBackground,
            activeWord, 
            translateWord, 
            mainHorizontalLines, 
            listHorizontalLines, 
            listHeadWord, 
            listHeadTranslate,
            iconButtons,
            arrowButtons,
            footerButtons
          } = elements;

    const applyTheme = (isDark) => {        
        document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
        mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        activeWord.style.color = isDark ? 'white' : 'black';
        translateWord.style.color = isDark ? '#1DB954' : '#1DB954'
        listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        listHeadWord.style.color = isDark ? 'white' : 'black';
        listHeadTranslate.style.color = isDark ? 'white' : 'black';

        chrome.storage.local.get('paletteColors', (data) => {
            const colorMap = data.paletteColors;
            
            if (colorMap['image']) {
                iconButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image'] : '#dcc788'});
            }
            if (colorMap['image-arrow']) {
                arrowButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image-arrow'] : '#dcc788'});
            }
            if (colorMap['footer-btn']) {
                footerButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788'});
            }
            
            console.log("IN CRHOME: ", colorMap); 
        });
    }

    chrome.storage.local.get('theme', (data) => {
        appState.theme = data.theme || 'dark';
        const isDarkMode = appState.theme === 'dark';
        themeToggleState.checked = isDarkMode;
        applyTheme(isDarkMode);

        themeToggleBackground.classList.add('no-transition');
        onOffToggleBackground.classList.add('no-transition');
        document.body.classList.add('no-transition');
        setTimeout(() => {
            document.body.classList.remove('no-transition');
            themeToggleBackground.classList.remove('no-transition');
            onOffToggleBackground.classList.remove('no-transition');
        }, 50);
    });
    
    themeToggleState.addEventListener('change', () => {
        const isDark = themeToggleState.checked;
        appState.theme = isDark ? 'dark' : 'light';
        applyTheme(isDark);
        chrome.storage.local.set({ theme: appState.theme });
        initializeNotificationSettings();
    });
}

export function initializeThemeAndTimeSettings() {
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

    function changeThemesAndTimes(previousButton, nextButton, textField, array, nameIndex, storageKey) {        
        let currentIndex = 0;

        const updateTextField = () => {
            textField.value = array[currentIndex];
        }

        function resetState() {
            wordContainer.classList.remove('show-translate');
            inputField.value = "";
            updateTextField();
        }

        chrome.storage.local.get([nameIndex, storageKey], (data) => {
            if (data[storageKey] && array.includes(data[storageKey])) {
                currentIndex = array.indexOf(data[storageKey]);
            } else if (data[nameIndex] !== undefined) {
                currentIndex = data[nameIndex];
            } else {
                chrome.storage.local.set({ [nameIndex]: currentIndex });
            }
            updateTextField();
        });

        previousButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + array.length) % array.length;
            chrome.storage.local.set({ [nameIndex]: currentIndex, [storageKey]: array[currentIndex] });
            resetState();
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % array.length;
            chrome.storage.local.set({ [nameIndex]: currentIndex, [storageKey]: array[currentIndex] });
        });

        chrome.storage.onChanged.addListener((changes) => {
            if (changes[storageKey]) {
                const currentValue = changes[storageKey].newValue;
                if (array.includes(currentValue)) {
                    currentIndex = array.indexOf(currentValue);
                    chrome.storage.local.set({ [nameIndex]: currentIndex, [storageKey]: array[currentIndex] });
                    resetState();
                }
            }
        });  
    }

    changeThemesAndTimes(
        previousThemeButton,
        nextThemeButton,
        textFieldTheme,
        appState.themeArray,
        'themeIndex',
        'selectedTheme'
    );

    changeThemesAndTimes(
        previousTimeButton,
        nextTimeButton,
        textFieldTime,
        appState.timeArray,
        'timeIndex',
        'selectedTime'
    );
}