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
            footerButtons,
            listButton,
            uploadButton,
            returnFromList,
            allPopupButton,
            resetColorButton,
            historyColorButton,
          } = elements;

    const applyTheme = (isDark) => {        
        activeWord.style.color = isDark ? 'white' : 'black';
        translateWord.style.color = isDark ? '#1DB954' : '#1DB954';
        listHeadWord.style.color = isDark ? 'white' : 'black';
        listHeadTranslate.style.color = isDark ? 'white' : 'black';

        // chrome.storage.local.get('paletteColors', (data) => {
        //     const colorMap = data.paletteColors;

        //     if (colorMap._reset) {
        //         const isDark = themeToggleState.checked;
        //         console.log('MODE WITH RESET: ', isDark);
        
        //         document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
        //         themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
        //         onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
        
        //         iconButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         arrowButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         footerButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         allPopupButton.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         returnFromList.style.backgroundColor = '#dcc788';
        //         [listButton, uploadButton, returnFromList].forEach(btn => {
        //             btn.style.setProperty('--before-color', '#cab063');
        //         });
        
        //         mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        //         listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        
        //         activeWord.style.color = isDark ? 'white' : 'black';
        //         translateWord.style.color = isDark ? '#1DB954' : '#1DB954'
        //         listHeadWord.style.color = isDark ? 'white' : 'black';
        //         listHeadTranslate.style.color = isDark ? 'white' : 'black';
        //     } else {
        //         if (colorMap['overlay']) {
        //             document.body.style.backgroundColor = isDark ? colorMap['overlay'] : '#f5f4f4';
    
        //             const baseColor = colorMap['overlay'];
        //             const darkerColor = shadeColor(baseColor, -20);
    
        //             console.log("TOGGLE NEW: ");
        //             themeToggleBackground.style.backgroundColor = isDark ? darkerColor : '#f5f4f4';
        //             onOffToggleBackground.style.backgroundColor = isDark ? darkerColor : '#f5f4f4';
        //         } else {
        //             document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
        //             themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
        //             onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
        //             themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #ffcc89, #e09017)`);
        //         }
                
        //         if (colorMap['image']) {
        //             iconButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image'] : '#dcc788'});
        //             [resetColorButton, historyColorButton].forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image'] : '#dcc788'});
        //         } else {
        //             iconButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         }
    
        //         if (colorMap['image-arrow']) {
        //             arrowButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image-arrow'] : '#dcc788'});
        //         } else {
        //             arrowButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //         }
    
        //         if (colorMap['footer-btn']) {
        //             footerButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788'});
        //             allPopupButton.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788'});
        //             returnFromList.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788';
    
        //             const baseColor = colorMap['footer-btn'];
        //             const darkerColor = shadeColor(baseColor, -20);
    
        //             [listButton, uploadButton, returnFromList].forEach(btn => {
        //                 btn.style.setProperty('--before-color', isDark ? darkerColor : '#cab063');
        //             });
        //         } else {
        //             footerButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //             allPopupButton.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
        //             returnFromList.style.backgroundColor = '#dcc788';
    
        //             [listButton, uploadButton, returnFromList].forEach(btn => {
        //                 btn.style.setProperty('--before-color', '#cab063');
        //             });
        //         }
    
        //         if (colorMap['line']) {
        //             mainHorizontalLines.forEach(mainLine => {mainLine.style.backgroundColor = isDark ? colorMap['line'] : '#afaf41'});
        //             listHorizontalLines.forEach(listLine => {listLine.style.backgroundColor = isDark ? colorMap['line'] : '#afaf41'});
        //         } else {
        //             mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        //             listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
        //         }
                
        //         console.log("IN CRHOME: ", colorMap); 
        //     }
        // });

        const key = isDark ? 'baseThemeDark' : 'baseThemeLight';
        chrome.storage.local.get(key, (data) => {
            const color = data[key];
            if (!color) return;

            console.log("COLOR: ", color);
            if (color === 'default') {
                const isDark = themeToggleState.checked;
                console.log('MODE WITH RESET: ', isDark);
        
                document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
                themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #777, #3a3a3a)`);
                themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #ffcc89, #e09017)`);
        
                iconButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                arrowButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                footerButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                allPopupButton.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
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
            } else {
                console.log("COLOR: ", color);
                if (color === '#263a47' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #728495, ${darkerColor})`);
                    applyBaseTheme('#263a47', '#728495', '#98a9be');
                } else if (color === '#263a47' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #728495, ${darkerColor})`);
                    applyBaseTheme('#263a47', '#728495', '#98a9be');
                }

                if (color === '#44334a' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #8d77a8, ${darkerColor})`);
                    applyBaseTheme('#44334a', '#8d77a8', '#c4addd');
                } else if (color === '#44334a' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#44334a', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #8d77a8, ${darkerColor})`);
                    applyBaseTheme('#44334a', '#8d77a8', '#c4addd');
                }

                if (color === '#375647' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #729e7e, ${darkerColor})`);
                    applyBaseTheme('#375647', '#729e7e', '#91aaa8');
                } else if (color === '#375647' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#375647', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #729e7e, ${darkerColor})`);
                    applyBaseTheme('#375647', '#729e7e', '#91aaa8');
                }

                if (color === '#4c3d19' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #889063, ${darkerColor})`);
                    applyBaseTheme('#4c3d19', '#889063', '#cfbb99');
                } else if (color === '#4c3d19' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#4c3d19', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #889063, ${darkerColor})`);
                    applyBaseTheme('#4c3d19', '#889063', '#cfbb99');
                }

                if (color === '#5b8094' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #aad0e2, ${darkerColor})`);
                    applyBaseTheme('#5b8094', '#aad0e2', '#87b1c8');
                } else if (color === '#5b8094' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#5b8094', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #aad0e2, ${darkerColor})`);
                    applyBaseTheme('#5b8094', '#aad0e2', '#87b1c8');
                }

                if (color === '#1a1836' && key === 'baseThemeDark') {
                    const darkerColor = shadeColor('#263a47', -20);
                    themeToggleBackground.style.setProperty('--toggle-bgm', `linear-gradient(180deg, #e99856, ${darkerColor})`);
                    applyBaseTheme('#1a1836', '#e99856', '#e0b4b2');
                } else if (color === '#1a1836' && key === 'baseThemeLight') {
                    const darkerColor = shadeColor('#1a1836', -20);
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #e99856, ${darkerColor})`);
                    applyBaseTheme('#1a1836', '#e99856', '#e0b4b2');
                }

                function applyBaseTheme(base, accent, liner) {
                    const darkerColor = shadeColor(base, -20);
                    const deeperDarker = shadeColor(accent, -20);

                    document.body.style.backgroundColor = base;
                    themeToggleBackground.style.backgroundColor = darkerColor;
                    onOffToggleBackground.style.backgroundColor = darkerColor;

                    iconButtons.forEach(btn => {btn.style.backgroundColor = accent});
                    arrowButtons.forEach(btn => {btn.style.backgroundColor = accent});
                    footerButtons.forEach(btn => {btn.style.backgroundColor = accent});
                    allPopupButton.forEach(btn => {btn.style.backgroundColor = accent});
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

export function initializeCustomThemeSettings() {
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
        chrome.storage.local.get('paletteColors', (data) => {
            const colorMap = data.paletteColors;

            if (colorMap._reset) {
                const isDark = themeToggleState.checked;
                console.log('MODE WITH RESET: ', isDark);
        
                document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
                themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
        
                iconButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                arrowButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                footerButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                allPopupButton.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
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
            } else {
                if (colorMap['overlay']) {
                    document.body.style.backgroundColor = isDark ? colorMap['overlay'] : '#f5f4f4';

                    const baseColor = colorMap['overlay'];
                    const darkerColor = shadeColor(baseColor, -20);

                    console.log("TOGGLE NEW: ");
                    themeToggleBackground.style.backgroundColor = isDark ? darkerColor : '#f5f4f4';
                    onOffToggleBackground.style.backgroundColor = isDark ? darkerColor : '#f5f4f4';
                } else {
                    document.body.style.backgroundColor = isDark ? '#313030' : '#f5f4f4';
                    themeToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                    onOffToggleBackground.style.backgroundColor = isDark ? '#242424' : '#f5f4f4';
                    themeToggleBackground.style.setProperty('--toggle-bg', `linear-gradient(180deg, #ffcc89, #e09017)`);
                }
                
                if (colorMap['image']) {
                    iconButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image'] : '#dcc788'});
                    [resetColorButton, historyColorButton].forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image'] : '#dcc788'});
                } else {
                    iconButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                }

                if (colorMap['image-arrow']) {
                    arrowButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['image-arrow'] : '#dcc788'});
                } else {
                    arrowButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                }

                if (colorMap['footer-btn']) {
                    footerButtons.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788'});
                    allPopupButton.forEach(btn => {btn.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788'});
                    returnFromList.style.backgroundColor = isDark ? colorMap['footer-btn'] : '#dcc788';

                    const baseColor = colorMap['footer-btn'];
                    const darkerColor = shadeColor(baseColor, -20);

                    [listButton, uploadButton, returnFromList].forEach(btn => {
                        btn.style.setProperty('--before-color', isDark ? darkerColor : '#cab063');
                    });
                } else {
                    footerButtons.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                    allPopupButton.forEach(btn => {btn.style.backgroundColor = '#dcc788'});
                    returnFromList.style.backgroundColor = '#dcc788';

                    [listButton, uploadButton, returnFromList].forEach(btn => {
                        btn.style.setProperty('--before-color', '#cab063');
                    });
                }

                if (colorMap['line']) {
                    mainHorizontalLines.forEach(mainLine => {mainLine.style.backgroundColor = isDark ? colorMap['line'] : '#afaf41'});
                    listHorizontalLines.forEach(listLine => {listLine.style.backgroundColor = isDark ? colorMap['line'] : '#afaf41'});
                } else {
                    mainHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
                    listHorizontalLines.forEach(line => {line.style.backgroundColor = isDark ? '#afaf41' : 'black'});
                }
                
                console.log("IN CRHOME: ", colorMap); 
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

function shadeColor(color, percent) {
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