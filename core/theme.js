import { elements } from "../utils/domElements.js";
import { appState } from "../core/appState.js";
import { toLowerCaseAll } from "../utils/utils.js";
import { initializeNotificationSettings } from "../ui/ui.js";

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
            footerButtons,
            listButton,
            uploadButton,
            returnFromList,
            allPopupButton,
            resetColorButton,
            historyColorButton,
          } = elements;

    const applyTheme = (isDark) => {        
        listHeadWord.style.color = isDark ? 'white' : 'black';
        listHeadTranslate.style.color = isDark ? 'white' : 'black';

        const key = isDark ? 'baseThemeDark' : 'baseThemeLight';
        chrome.storage.local.get(key, (data) => {
            const color = data[key] || 'default';
         

            console.log("COLOR: ", color);
            if (color === 'default') {
                const isDark = themeToggleState.checked;
                console.log('MODE WITH RESET: ', isDark);
        
                document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
                themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #777, #3a3a3a)`);
                themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #ffcc89, #e09017)`);
        
                [...iconButtons, ...arrowButtons, ...footerButtons, ...allPopupButton].forEach(btn => {
                    btn.style.backgroundColor = '#dcc788';
                });

                returnFromList.style.backgroundColor = '#dcc788';
                [listButton, uploadButton, returnFromList].forEach(btn => {
                    btn.style.setProperty('--before-color', '#cab063');
                });
        
                mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
                listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        
                activeWord.style.color = isDark ? 'white' : 'black';
                translateWord.style.color = isDark ? '#1DB954' : '#1DB954'
                listHeadWord.style.color = isDark ? 'white' : 'black';
                listHeadTranslate.style.color = isDark ? 'white' : 'black';

                return;
            } else if (color === 'custom') {
                chrome.storage.local.get('paletteColors', (data) => {
                    const colorMap = data.paletteColors;
                    const customBaseThemeBackground = document.getElementById('customBaseColor');

                    console.log("COLOR MAP: ", colorMap);

                    if (colorMap['overlay']) {
                        document.body.style.backgroundColor = colorMap['overlay'];
                        customBaseThemeBackground.style.backgroundColor = toLowerCaseAll(colorMap['overlay']);
                        localStorage.setItem('customColorBackground', toLowerCaseAll(colorMap['overlay']));

                        const baseColor = colorMap['overlay'];
                        const darkerColor = shadeColor(baseColor, -20);
                        const accentColor = colorMap['image'] ? colorMap['image'] : '#b1b4b6';

                        console.log("TOGGLE NEW: ");
                        themeToggleBackground.style.backgroundColor = darkerColor;
                        onOffToggleBackground.style.backgroundColor = darkerColor;

                        const isDarkKey = key === 'baseThemeDark';
                        const gradient = `linear-gradient(180deg, ${accentColor}, ${darkerColor})`;
                        const toggleBgProp = isDarkKey ? '--toggle-bgm' : '--toggle-bg';
                        themeToggleBackground.style.setProperty(toggleBgProp, gradient);
                    } 
                    else {
                        document.body.style.backgroundColor = '#8e7e8e';
                        const baseColor = '#8e7e8e';
                        const accentColor = '#b1b4b6';
                        const darkerColor = shadeColor(baseColor, -20);

                        themeToggleBackground.style.backgroundColor = darkerColor;
                        onOffToggleBackground.style.backgroundColor = darkerColor;

                        const isDarkKey = key === 'baseThemeDark';
                        const gradient = `linear-gradient(180deg, ${accentColor}, ${darkerColor})`;
                        const toggleBgProp = isDarkKey ? '--toggle-bgm' : '--toggle-bg';
                        themeToggleBackground.style.setProperty(toggleBgProp, gradient);
                    }

                    if (colorMap['word']) {
                        activeWord.style.color = colorMap['word'];
                        console.log("ACTIVE WORD COLOR: ", activeWord);
                    } else {
                        activeWord.style.color = 'white';
                    }
                    if (colorMap['translate']) {
                        translateWord.style.color = colorMap['translate'];
                        console.log("TRANSLATE WORD COLOR: ", translateWord);
                    } else {
                        translateWord.style.color = isDark ? '#1DB954' : '#1DB954';
                    }

                    if (colorMap['image']) {
                        [...iconButtons, ...arrowButtons].forEach(btn => {btn.style.backgroundColor = colorMap['image']});
                        [resetColorButton, historyColorButton].forEach(btn => {btn.style.backgroundColor = colorMap['image']});
                        [...footerButtons, ...allPopupButton].forEach(btn => {btn.style.backgroundColor = colorMap['image']});
                        returnFromList.style.backgroundColor = colorMap['image'];

                        const baseBgColor = colorMap['overlay'] ? colorMap['overlay'] : '#8e7e8e';
                        const darkerBdColor = shadeColor(baseBgColor, -20);

                        const isDarkKey = key === 'baseThemeDark';
                        const gradient = `linear-gradient(180deg, ${colorMap['image']}, ${darkerBdColor})`;
                        const toggleBgProp = isDarkKey ? '--toggle-bgm' : '--toggle-bg';
                        themeToggleBackground.style.setProperty(toggleBgProp, gradient);

                        const baseColor = colorMap['image'];
                        const darkerColor = shadeColor(baseColor, -20);

                        [listButton, uploadButton, returnFromList].forEach(btn => {
                            btn.style.setProperty('--before-color', darkerColor);
                        });
                    } else {
                        [...iconButtons, ...arrowButtons].forEach(btn => {btn.style.backgroundColor = '#b1b4b6'});
                        [resetColorButton, historyColorButton].forEach(btn => {btn.style.backgroundColor = '#b1b4b6'});
                        [...footerButtons, ...allPopupButton].forEach(btn => {btn.style.backgroundColor = '#b1b4b6'});
                        returnFromList.style.backgroundColor = '#b1b4b6';

                        const baseColor = '#b1b4b6';
                        const darkerColor = shadeColor(baseColor, -20);

                        [listButton, uploadButton, returnFromList].forEach(btn => {
                            btn.style.setProperty('--before-color', darkerColor);
                        });  
                    }

                    if (colorMap['line']) {
                        [...mainHorizontalLines, ...listHorizontalLines].forEach(line => {line.style.backgroundColor = colorMap['line']})
                    } else {
                        [...mainHorizontalLines, ...listHorizontalLines].forEach(line => {line.style.backgroundColor = '#b6d6df'})  
                    }
                });
            } else if (color === 'resetCustom') {
                chrome.storage.local.set({ paletteColors: {} }, () => {
                    console.log('paletteColors reset.');
                });
                applyBaseTheme('#8e7e8e', '#b1b4b6', '#b6d6df');
            } else {
                chrome.storage.local.get('paletteColors', (data) => {
                    const colorMap = data.paletteColors || {};
               
                    let customTheme = colorMap['overlay'] ? toLowerCaseAll(colorMap['overlay']) : '#8e7e8e';
                    if (color === '#8e7e8e') customTheme = color;
                    console.log("CUSTOM THEME: ", customTheme);

                    const themes = {
                        '#263a47': { accent: '#728495', liner: '#98a9be' },
                        '#44334a': { accent: '#8d77a8', liner: '#c4addd' },
                        '#375647': { accent: '#729e7e', liner: '#91aaa8' },
                        '#4c3d19': { accent: '#889063', liner: '#cfbb99' },
                        '#5b8094': { accent: '#aad0e2', liner: '#87b1c8' },
                        '#1a1836': { accent: '#e99856', liner: '#e0b4b2' },
                        '#2e2e38': { accent: '#904040', liner: '#cdd8eb' },
                        '#2c2824': { accent: '#76736c', liner: '#c3b9a6' },
                        [customTheme]: {
                            accent: colorMap['image'] ? colorMap['image'] : '#b1b4b6', 
                            liner:  colorMap['line']  ? colorMap['line']  : '#b6d6df' 
                        },
                    };

                    const theme = themes[color];
                    console.log("THEME: ", theme);

                    if (theme) {
                        applyBaseTheme(color, theme.accent, theme.liner);
                    }
        
                    console.log("COLOR: ", color);
                });
            }

            function applyBaseTheme(base, accent, liner) {
                const darkerColor = shadeColor(base, -20);
                const deeperDarker = shadeColor(accent, -20);

                document.body.style.backgroundColor = base;
                themeToggleBackground.style.backgroundColor = darkerColor;
                onOffToggleBackground.style.backgroundColor = darkerColor;

                const isDarkKey = key === 'baseThemeDark';
                const gradient = `linear-gradient(180deg, ${accent}, ${darkerColor})`;
                const toggleBgProp = isDarkKey ? '--toggle-bgm' : '--toggle-bg';
                themeToggleBackground.style.setProperty(toggleBgProp, gradient);

                [...iconButtons, ...arrowButtons, ...footerButtons, ...allPopupButton].forEach(btn => {
                    btn.style.backgroundColor = accent;
                });

                returnFromList.style.backgroundColor = accent;
                [listButton, uploadButton, returnFromList].forEach(btn => {
                    btn.style.setProperty('--before-color', deeperDarker);
                });

                mainHorizontalLines.forEach(line => {line.style.backgroundColor = liner});
                listHorizontalLines.forEach(line => {line.style.backgroundColor = liner});

                activeWord.style.color = 'white';
                translateWord.style.color = '#1DB954';
                listHeadWord.style.color = 'white';
                listHeadTranslate.style.color = 'white';
            }
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

export function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
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