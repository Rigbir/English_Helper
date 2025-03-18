import { elements } from "./domElements.js";
import { appState } from "./appState.js";
import { initializeNotificationSettings } from "./ui.js";

export function initializeThemeSettings() {
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
            textFieldTime,
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
        });

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