export const elements = {
    mainWindow : document.getElementById('main-window'),
    listWindow : document.getElementById('list-window'),

    //Header Button/Toggle
    themeToggleState : document.getElementById('theme-toggle'),
    themeToggleBackground : document.querySelector('.toggle_label'),

    infoButton : document.querySelector('.information-btn'),
    infoPopup : document.getElementById('info-popup'),
    infoOverlay : document.getElementById('overlay'),
    infoCloseOverlayButton : document.getElementById('close-popup'),

    onOffToggleState : document.getElementById('on-off-toggle'),
    onOffToggleBackground : document.querySelector('.on-off_label'),

    //Main Buttons/Word place 
    wordContainer : document.querySelector('.word-container'),
    activeWord : document.querySelector('.word'),
    translateWord : document.querySelector('.translate'),
    inputField : document.getElementById('translateField'),
    mainHorizontalLines : document.querySelectorAll('.horizontal-line'),

    iconButtons : document.querySelectorAll('.icon-btn'),
    helpButton : document.getElementById('help-btn'),
    randomButton : document.getElementById('replace-btn'),

    changeModeButton : document.getElementById('change-mode'),
    changeModePopup : document.getElementById('mode-popup'),
    changeModeOverlay : document.getElementById('overlay'),
    changeModeCloseButtonOverlay : document.getElementById('close-mode-popup'),
    allModeSelections : document.querySelectorAll('.popup .mode'),

    voiceButton : document.getElementById('sound-btn'),

    achievementButton : document.getElementById('achievement-btn'),
    achievementPopup : document.getElementById('achievement-popup'),
    achievementOverlay : document.getElementById('overlay'),
    achievementCloseButtonOverlay : document.getElementById('close-achievement-popup'),

    addToListButton : document.getElementById('plus-btn'),

    //Theme Buttons
    arrowButtons : document.querySelectorAll('.arrow-btn'),
    previousThemeButton : document.getElementById('prev-btn-theme'),
    nextThemeButton : document.getElementById('next-btn-theme'),
    textFieldTheme : document.getElementById('text-field-theme'),

    themeField : document.querySelector('.theme-input'),
    themePopup : document.getElementById('theme-popup'),
    themeOverlay : document.getElementById('overlay'),
    themeCloseOverlayButton : document.getElementById('close-theme-popup'),
    allThemeSelections : document.querySelectorAll('.popup .theme'),

    selectedTheme : document.getElementById('text-field-theme').value,

    //Time Buttons
    previousTimeButton : document.getElementById('prev-btn-time'),
    nextTimeButton : document.getElementById('next-btn-time'),
    textFieldTime : document.getElementById('text-field-time'),

    timeField : document.querySelector('.time-input'),
    timePopup : document.getElementById('time-popup'),
    timeOverlay : document.getElementById('overlay'),
    timeCloseOverlayButton : document.getElementById('close-time-popup'),
    allTimeSelections : document.querySelectorAll('.popup .time'),

    //Footer Button
    uploadButton : document.querySelector('.upload-btn'),
    uploadWindow : document.querySelector('.upload-file-window'),
    listButton : document.querySelector('.list-check-btn'),
    returnFromList : document.querySelector('.return-btn'),
    listHorizontalLines : document.querySelectorAll('.list-line'),
    listHeadWord : document.querySelector('.head-word'),
    listHeadTranslate : document.querySelector('.head-translate'),
    listWordsContainer : document.querySelector('.all-words')
};